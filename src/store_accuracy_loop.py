"""
Store-Level Accuracy Loop
Lowe's Store-Level Sales Target Model | Capstone 8

Computes per-store WAPE, Bias%, RMSE, and quarterly bias breakdown.
Classifies stores as Under-Targeted / Over-Targeted / Well-Calibrated.

Usage:
    from store_accuracy_loop import run_store_accuracy_loop
    loop_df = run_store_accuracy_loop(test_df, target_col='Actual Sales USD', pred_col='predicted')
    loop_df.to_csv('outputs/store_accuracy_loop_results.csv', index=False)
"""

import pandas as pd
import numpy as np


def run_store_accuracy_loop(
    test_df: pd.DataFrame,
    target_col: str = 'Actual Sales USD',
    pred_col: str = 'predicted',
    under_threshold: float = -5.0,
    over_threshold: float = 5.0,
    verbose: bool = True,
) -> pd.DataFrame:
    """
    Compute store-level accuracy metrics on the holdout set.

    For each store, computes:
        - WAPE (Weighted Absolute Percentage Error)
        - Bias % (positive = over-predicted, negative = under-predicted)
        - RMSE
        - Quarterly bias breakdown (Q1–Q4)
        - Classification: Under-Targeted / Over-Targeted / Well-Calibrated

    Args:
        test_df: Holdout DataFrame with actual and predicted columns
        target_col: Name of the actual sales column
        pred_col: Name of the predicted sales column
        under_threshold: Bias % below which a store is "Under-Targeted" (default -5)
        over_threshold: Bias % above which a store is "Over-Targeted" (default +5)
        verbose: Print summary

    Returns:
        DataFrame with one row per store, sorted by absolute bias descending.
    """
    results = []

    for store_id, grp in test_df.groupby('Store ID'):
        actual = grp[target_col].values
        predicted = grp[pred_col].values

        # Skip stores with zero actual sales (avoid division by zero)
        if actual.sum() == 0:
            continue

        # Core metrics
        store_wape = np.abs(actual - predicted).sum() / actual.sum() * 100
        store_bias = (predicted.sum() - actual.sum()) / actual.sum() * 100
        store_rmse = np.sqrt(np.mean((actual - predicted) ** 2))

        # Quarterly bias breakdown
        quarterly_bias = {}
        if 'Fiscal Week' in grp.columns:
            grp2 = grp.copy()
            grp2['quarter'] = pd.cut(
                grp2['Fiscal Week'],
                bins=[0, 13, 26, 39, 52],
                labels=['Q1', 'Q2', 'Q3', 'Q4'],
            )
            for q, qgrp in grp2.groupby('quarter', observed=True):
                if qgrp[target_col].sum() > 0:
                    qbias = (qgrp[pred_col].sum() - qgrp[target_col].sum()) / qgrp[target_col].sum() * 100
                    quarterly_bias[q] = round(qbias, 1)

        # Store name (if available)
        store_name = ''
        if 'Store Name' in grp.columns:
            store_name = str(grp['Store Name'].iloc[0])[:30]

        # Division (if available)
        division = ''
        if 'Division' in grp.columns:
            division = str(grp['Division'].iloc[0])

        results.append({
            'Store ID': store_id,
            'Store Name': store_name,
            'Division': division,
            'n_weeks': len(grp),
            'Actual_Total': round(actual.sum(), 0),
            'Predicted_Total': round(predicted.sum(), 0),
            'WAPE_pct': round(store_wape, 2),
            'Bias_pct': round(store_bias, 2),
            'RMSE': round(store_rmse, 0),
            'Q1_Bias': quarterly_bias.get('Q1', None),
            'Q2_Bias': quarterly_bias.get('Q2', None),
            'Q3_Bias': quarterly_bias.get('Q3', None),
            'Q4_Bias': quarterly_bias.get('Q4', None),
        })

    loop_df = pd.DataFrame(results)
    loop_df['abs_bias'] = loop_df['Bias_pct'].abs()
    loop_df['target_status'] = loop_df['Bias_pct'].apply(
        lambda b: 'Under-Targeted' if b < under_threshold
        else ('Over-Targeted' if b > over_threshold else 'Well-Calibrated')
    )
    loop_df = loop_df.sort_values('abs_bias', ascending=False).reset_index(drop=True)

    if verbose:
        n = len(loop_df)
        n_under = (loop_df['Bias_pct'] < under_threshold).sum()
        n_over = (loop_df['Bias_pct'] > over_threshold).sum()
        n_ok = n - n_under - n_over

        print("\n" + "=" * 60)
        print("STORE-LEVEL ACCURACY LOOP SUMMARY")
        print("=" * 60)
        print(f"Total stores evaluated : {n}")
        print(f"Under-targeted (<{under_threshold}%) : {n_under}")
        print(f"Over-targeted  (>{over_threshold}%)  : {n_over}")
        print(f"Well-calibrated (±{abs(under_threshold)}%)  : {n_ok}")
        print(f"\nMedian store WAPE : {loop_df['WAPE_pct'].median():.1f}%")
        print(f"Median store Bias : {loop_df['Bias_pct'].median():.1f}%")
        print("\nTop 10 stores by absolute bias:")
        print(loop_df[['Store ID', 'Store Name', 'Actual_Total', 'Predicted_Total',
                        'WAPE_pct', 'Bias_pct', 'target_status']].head(10).to_string(index=False))

    return loop_df


def assign_role_of_store(
    loop_df: pd.DataFrame,
    df_full: pd.DataFrame,
    verbose: bool = True,
) -> pd.DataFrame:
    """
    Assign Role-of-Store segments based on model outputs and market features.

    Segments: High Growth, Growth, Neutral, Maintain, Defend

    Uses predicted growth trajectory, store-level bias, CAGR HH,
    housing_new_share, and total_competitor_ta as inputs.

    Args:
        loop_df: Output from run_store_accuracy_loop()
        df_full: Full engineered DataFrame (for market features per store)
        verbose: Print segment distribution

    Returns:
        loop_df with 'role_of_store' column added.
    """
    # Get latest market features per store
    market_cols = ['Store ID', 'Compound Annual HH Growth Rate 2010 2020',
                   'housing_new_share', 'total_competitor_ta']
    available_cols = [c for c in market_cols if c in df_full.columns]

    if len(available_cols) < 2:
        print("[RoS] Warning: Market features not available. Using bias-only segmentation.")
        loop_df['role_of_store'] = loop_df['Bias_pct'].apply(
            lambda b: 'High Growth' if b < -10
            else 'Growth' if b < -5
            else 'Defend' if b > 10
            else 'Maintain' if b > 5
            else 'Neutral'
        )
        return loop_df

    store_market = df_full[available_cols].groupby('Store ID').last().reset_index()
    merged = loop_df.merge(store_market, on='Store ID', how='left')

    # Compute composite scores
    cagr = merged.get('Compound Annual HH Growth Rate 2010 2020', pd.Series(0, index=merged.index)).fillna(0)
    new_housing = merged.get('housing_new_share', pd.Series(0, index=merged.index)).fillna(0)
    competitors = merged.get('total_competitor_ta', pd.Series(0, index=merged.index)).fillna(0)
    bias = merged['Bias_pct']

    # Growth signal: positive CAGR + new housing + model under-predicts (store outperforms)
    merged['growth_score'] = (cagr / 2) + (new_housing / 10) - (bias / 10)
    # Risk signal: high competition + model over-predicts (store underperforms)
    merged['risk_score'] = (competitors / 50) + (bias / 10)

    # Quantile-based segmentation for balanced distribution (~20% each)
    # Net score = growth_score - risk_score (high = growth opportunity, low = defensive)
    merged['net_score'] = merged['growth_score'] - merged['risk_score']

    q20 = merged['net_score'].quantile(0.20)
    q40 = merged['net_score'].quantile(0.40)
    q60 = merged['net_score'].quantile(0.60)
    q80 = merged['net_score'].quantile(0.80)

    def classify(net):
        if net >= q80:
            return 'High Growth'
        elif net >= q60:
            return 'Growth'
        elif net >= q40:
            return 'Neutral'
        elif net >= q20:
            return 'Maintain'
        else:
            return 'Defend'

    merged['role_of_store'] = merged['net_score'].apply(classify)
    loop_df['role_of_store'] = merged['role_of_store'].values

    if verbose:
        print("\n" + "=" * 60)
        print("ROLE OF STORE DISTRIBUTION")
        print("=" * 60)
        for role in ['High Growth', 'Growth', 'Neutral', 'Maintain', 'Defend']:
            count = (loop_df['role_of_store'] == role).sum()
            print(f"  {role:15s}: {count:4d} stores ({count / len(loop_df) * 100:.1f}%)")

    return loop_df
