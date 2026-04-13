"""
Full Model Training Pipeline
Lowe's Store-Level Sales Target Model | Capstone 8

Run this script end-to-end:
    python src/train_model.py

Steps:
    1. Load and validate the master dataset
    2. Engineer Phase 1 features (40 features)
    3. Create time-based train/holdout split
    4. Train LightGBM (primary) and baseline models
    5. Evaluate on holdout set (global metrics)
    6. Run store-level accuracy loop
    7. Assign Role-of-Store segments
    8. Export results
"""

import pandas as pd
import numpy as np
import pickle
import os
import warnings
warnings.filterwarnings('ignore')

from feature_engineering import (
    build_phase1_features, get_feature_matrix,
    PHASE1_FEATURES, TARGET, LEAKAGE_BLACKLIST
)
from store_accuracy_loop import run_store_accuracy_loop, assign_role_of_store

# LightGBM / XGBoost — install if missing
try:
    import lightgbm as lgb
    from lightgbm import LGBMRegressor
    HAS_LGBM = True
except ImportError:
    print("WARNING: lightgbm not installed. Run: pip install lightgbm")
    HAS_LGBM = False

try:
    from xgboost import XGBRegressor
    HAS_XGB = True
except ImportError:
    HAS_XGB = False

from sklearn.linear_model import Ridge
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error


# ============================================================
# CONFIGURATION
# ============================================================
DATA_PATH = 'data/stores_sales_master_file_masked_final.csv'
OUTPUT_DIR = 'outputs'
HOLDOUT_STRATEGY = 'rolling'  # 'rolling' or 'year'
HOLDOUT_QUANTILE = 0.85       # for rolling split
HOLDOUT_YEAR = 2025           # for year-based split


def load_and_validate(path: str) -> pd.DataFrame:
    """Step 1: Load and validate the master dataset."""
    print("\n" + "=" * 70)
    print("STEP 1: LOADING AND VALIDATING DATASET")
    print("=" * 70)

    df = pd.read_csv(path)
    df.columns = df.columns.str.strip()
    df[TARGET] = pd.to_numeric(df[TARGET], errors='coerce')

    print(f"  Rows          : {len(df):,}")
    print(f"  Columns       : {len(df.columns)}")
    print(f"  Unique stores : {df['Store ID'].nunique()}")
    print(f"  Years         : {sorted(df['Year'].unique())}")
    print(f"  Missing values: {df.isnull().sum().sum()}")
    print(f"  Zero-sales    : {(df[TARGET] == 0).sum()}")

    # Validate expectations
    assert len(df) == 269412, f"Expected 269,412 rows, got {len(df):,}"
    assert df['Store ID'].nunique() == 1727, f"Expected 1,727 stores"
    missing_total = df.isnull().sum().sum()
    if missing_total > 0:
        missing_by_col = df.isnull().sum()
        missing_cols = missing_by_col[missing_by_col > 0]
        print(f"  Missing values: {missing_total:,} across {len(missing_cols)} columns")
        for col, cnt in missing_cols.items():
            print(f"    {col}: {cnt:,} ({cnt/len(df)*100:.1f}%)")

    # Remove zero-sales rows
    zeros = (df[TARGET] == 0).sum()
    if zeros > 0:
        df = df[df[TARGET] > 0].copy()
        print(f"  Removed {zeros} zero-sales rows → {len(df):,} rows remain")

    # Leakage check
    print(f"\n  Leakage blacklist confirmed:")
    for col in LEAKAGE_BLACKLIST:
        if col in df.columns:
            corr = df[col].corr(df[TARGET])
            print(f"    ✗ {col} (corr={corr:.3f}) — will NOT be used as input")

    return df


def create_split(df: pd.DataFrame, strategy: str = 'rolling'):
    """Step 3: Create time-based train/holdout split."""
    print("\n" + "=" * 70)
    print("STEP 3: CREATING TRAIN/HOLDOUT SPLIT")
    print("=" * 70)

    if strategy == 'year':
        train_df = df[df['Year'] < HOLDOUT_YEAR].copy()
        test_df = df[df['Year'] >= HOLDOUT_YEAR].copy()
        print(f"  Strategy: Hold out FY{HOLDOUT_YEAR}")
    else:
        df['fw_date'] = pd.to_datetime(df['Fiscal Week Ending Date'], errors='coerce')
        cutoff = df['fw_date'].quantile(HOLDOUT_QUANTILE)
        train_df = df[df['fw_date'] < cutoff].copy()
        test_df = df[df['fw_date'] >= cutoff].copy()
        print(f"  Strategy: Rolling time split (cutoff at {HOLDOUT_QUANTILE:.0%} → {cutoff.date()})")

    print(f"  Training rows : {len(train_df):,}")
    print(f"  Holdout rows  : {len(test_df):,}")
    print(f"  Split ratio   : {len(train_df)/len(df):.1%} / {len(test_df)/len(df):.1%}")

    return train_df, test_df


def train_and_evaluate(train_df, test_df):
    """Steps 4–5: Train models and evaluate on holdout."""
    print("\n" + "=" * 70)
    print("STEP 4: TRAINING MODELS")
    print("=" * 70)

    # Prepare feature matrices
    available = [f for f in PHASE1_FEATURES if f in train_df.columns]
    print(f"  Features available: {len(available)}/{len(PHASE1_FEATURES)}")

    X_tr = train_df[available].apply(pd.to_numeric, errors='coerce').fillna(0)
    y_tr = train_df[TARGET]
    X_te = test_df[available].apply(pd.to_numeric, errors='coerce').fillna(0)
    y_te = test_df[TARGET]

    # Drop any remaining NaN rows
    train_mask = X_tr.notna().all(axis=1) & y_tr.notna()
    test_mask = X_te.notna().all(axis=1) & y_te.notna()
    X_tr, y_tr = X_tr[train_mask], y_tr[train_mask]
    X_te, y_te = X_te[test_mask], y_te[test_mask]

    print(f"  Training samples: {len(X_tr):,}")
    print(f"  Holdout samples : {len(X_te):,}")

    models = {}
    results = {}

    # ── LightGBM (Primary) ────────────────────────────────────
    if HAS_LGBM:
        print("\n  Training LightGBM (primary model)...")
        lgbm_model = LGBMRegressor(
            n_estimators=500,
            learning_rate=0.05,
            max_depth=8,
            num_leaves=63,
            min_child_samples=50,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            n_jobs=-1,
            verbose=-1,
        )
        lgbm_model.fit(
            X_tr, y_tr,
            eval_set=[(X_te, y_te)],
            callbacks=[
                lgb.early_stopping(50, verbose=False),
                lgb.log_evaluation(0),
            ],
        )
        models['LightGBM'] = lgbm_model
        preds = lgbm_model.predict(X_te)
        results['LightGBM'] = evaluate_predictions(y_te, preds, 'LightGBM')

    # ── XGBoost (Secondary) ───────────────────────────────────
    if HAS_XGB:
        print("  Training XGBoost (secondary)...")
        xgb_model = XGBRegressor(
            n_estimators=500,
            learning_rate=0.05,
            max_depth=7,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            n_jobs=-1,
            verbosity=0,
        )
        xgb_model.fit(X_tr, y_tr, eval_set=[(X_te, y_te)], verbose=False)
        models['XGBoost'] = xgb_model
        preds = xgb_model.predict(X_te)
        results['XGBoost'] = evaluate_predictions(y_te, preds, 'XGBoost')

    # ── Ridge Regression (Baseline) ───────────────────────────
    print("  Training Ridge Regression (baseline)...")
    ridge_model = Ridge(alpha=1.0)
    ridge_model.fit(X_tr, y_tr)
    models['Ridge'] = ridge_model
    preds = ridge_model.predict(X_te)
    results['Ridge'] = evaluate_predictions(y_te, preds, 'Ridge')

    # ── Naive Baseline (lag-52) ───────────────────────────────
    if 'lag_52' in test_df.columns:
        lag52_valid = test_df['lag_52'].notna()
        if lag52_valid.sum() > 0:
            lag_actual = test_df.loc[lag52_valid, TARGET].values
            lag_pred = test_df.loc[lag52_valid, 'lag_52'].values
            results['Naive (lag-52)'] = evaluate_predictions(
                pd.Series(lag_actual), lag_pred, 'Naive (lag-52)'
            )

    return models, results, X_te, y_te


def evaluate_predictions(y_true, y_pred, model_name: str) -> dict:
    """Compute standard evaluation metrics."""
    wape = np.abs(y_true.values - y_pred).sum() / y_true.values.sum() * 100
    bias = (y_pred.sum() - y_true.values.sum()) / y_true.values.sum() * 100
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    mae = mean_absolute_error(y_true, y_pred)

    print(f"\n  {model_name} Results:")
    print(f"    WAPE  : {wape:.2f}%")
    print(f"    Bias  : {bias:+.2f}%")
    print(f"    RMSE  : ${rmse:,.0f}")
    print(f"    MAE   : ${mae:,.0f}")
    print(f"    R²    : {r2:.4f}")

    return {'WAPE': wape, 'Bias': bias, 'RMSE': rmse, 'MAE': mae, 'R2': r2}


def get_feature_importance(model, feature_names: list) -> pd.DataFrame:
    """Extract feature importance from a trained model."""
    if hasattr(model, 'feature_importances_'):
        imp = pd.Series(model.feature_importances_, index=feature_names)
    elif hasattr(model, 'coef_'):
        imp = pd.Series(np.abs(model.coef_), index=feature_names)
    else:
        return pd.DataFrame()

    imp_pct = (imp / imp.sum() * 100).sort_values(ascending=False)
    df_imp = pd.DataFrame({'Feature': imp_pct.index, 'Importance_pct': imp_pct.values})
    return df_imp


# ============================================================
# MAIN PIPELINE
# ============================================================
def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Step 1: Load
    df = load_and_validate(DATA_PATH)

    # Step 2: Feature Engineering
    print("\n" + "=" * 70)
    print("STEP 2: FEATURE ENGINEERING")
    print("=" * 70)
    df = build_phase1_features(df)

    # Step 3: Split
    train_df, test_df = create_split(df, strategy=HOLDOUT_STRATEGY)

    # Drop NaN from lag features
    available = [f for f in PHASE1_FEATURES if f in df.columns]
    train_df = train_df.dropna(subset=available + [TARGET])
    test_df = test_df.dropna(subset=available + [TARGET])
    print(f"  After NaN drop — Train: {len(train_df):,}, Holdout: {len(test_df):,}")

    # Steps 4–5: Train and Evaluate
    models, results, X_te, y_te = train_and_evaluate(train_df, test_df)

    # Print comparison table
    print("\n" + "=" * 70)
    print("STEP 5: MODEL COMPARISON")
    print("=" * 70)
    comp_df = pd.DataFrame(results).T
    comp_df.index.name = 'Model'
    print(comp_df.round(2).to_string())

    # Step 6: Store Accuracy Loop (using best model)
    print("\n" + "=" * 70)
    print("STEP 6: STORE-LEVEL ACCURACY LOOP")
    print("=" * 70)
    best_model_name = min(results, key=lambda k: results[k]['WAPE'])
    best_model = models.get(best_model_name)
    if best_model is not None:
        test_df = test_df.copy()
        test_df['predicted'] = best_model.predict(
            test_df[available].apply(pd.to_numeric, errors='coerce').fillna(0)
        )
        loop_df = run_store_accuracy_loop(test_df)

        # Step 7: Role of Store
        loop_df = assign_role_of_store(loop_df, df)

        # Export
        loop_df.to_csv(os.path.join(OUTPUT_DIR, 'store_accuracy_loop_results.csv'), index=False)
        print(f"\n  Exported → {OUTPUT_DIR}/store_accuracy_loop_results.csv")

    # Feature importance
    if best_model is not None:
        imp_df = get_feature_importance(best_model, available)
        if len(imp_df) > 0:
            imp_df.to_csv(os.path.join(OUTPUT_DIR, 'feature_importance.csv'), index=False)
            print(f"\n  Top 10 Feature Importances ({best_model_name}):")
            print(imp_df.head(10).to_string(index=False))

    # Save model artifacts
    if best_model is not None:
        artifact_path = os.path.join(OUTPUT_DIR, f'model_{best_model_name.lower()}.pkl')
        with open(artifact_path, 'wb') as f:
            pickle.dump({
                'model': best_model,
                'features': available,
                'results': results,
            }, f)
        print(f"  Model saved → {artifact_path}")

    # Save comparison results
    comp_df.to_csv(os.path.join(OUTPUT_DIR, 'model_comparison.csv'))

    print("\n" + "=" * 70)
    print("PIPELINE COMPLETE")
    print("=" * 70)
    print(f"  Best model: {best_model_name} (WAPE={results[best_model_name]['WAPE']:.2f}%)")
    print(f"  All outputs saved to: {OUTPUT_DIR}/")


if __name__ == '__main__':
    main()
