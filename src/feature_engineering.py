"""
Feature Engineering Module — Phase 1 (40 Features)
Lowe's Store-Level Sales Target Model | Capstone 8

Usage:
    from feature_engineering import build_phase1_features, PHASE1_FEATURES, TARGET
    df = build_phase1_features(df)
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder


TARGET = 'Actual Sales USD'

# Exact column names from the dataset (verified against 194-column master file)
PHASE1_FEATURES = [
    # Calendar (2)
    'Year', 'Fiscal Week',
    # Engineered lags (6)
    'lag_1', 'lag_4', 'lag_13', 'lag_52', 'roll_4', 'roll_13',
    # Store/market (5)
    'Sales Floor Size', 'Garden Ctr Size',
    'Urbanicity_enc', 'CBSA Type_enc', 'CBSA Metro Size_enc',
    # Demand — raw (11)
    'CYE Total Households', 'CYE Household Density HH SqMi',
    'CYE Median Household Income',
    'Compound Annual HH Growth Rate 2010 2020',
    'CYE Total Housing Units', 'CYE % Housing Units Owned',
    'CYE Median Year Housing Unit Built',
    'CYE Average Mean Length of Residence Years',
    'CYE Total Population', 'CYE Median Age Total Pop',
    'CYE Veteran Population',
    # Demand — engineered (5)
    'income_low_share', 'income_diy_core', 'income_affluent',
    'housing_old_share', 'housing_new_share',
    # Competition (6)
    'Sister Store Count in TradeArea', 'total_competitor_ta',
    'Nut Cracker Tools Count in TradeArea',
    'Wallflowers Depot Count in TradeArea',
    'Iggy Pop Hardware Count in TradeArea',
    'Horn Ok Tools Count in TradeArea',
]

# Leakage blacklist — NEVER add these to PHASE1_FEATURES
LEAKAGE_BLACKLIST = ['Plan Sales USD', 'Invoice Count', 'Avg Ticket']

# Reserve features — test in Phase 2 validation only
RESERVE_FEATURES = [
    'Area Sq Mi',
    'CYE % College Graduate Pop 25plus',
    'CYE Per Capita Income Total Pop',
    'Bo Jacks Hardware Count in TradeArea',
    'Greek Baths Hardware Count in TradeArea',
]

# TradeArea competitor columns (for engineering total_competitor_ta)
COMPETITOR_TA_COLUMNS = [
    'Lumber Jax Count in TradeArea',
    'Nut Cracker Tools Count in TradeArea',
    'BB King Store Count in TradeArea',
    'Thin Lizzy Hardware Count in TradeArea',
    'JJ Cale Wholesale Wholesale Count in TradeArea',
    'Eddie Vedder Store Count in TradeArea',
    'Greek Baths Hardware Count in TradeArea',
    'Mile One Store Count in TradeArea',
    'Bo Jacks Hardware Count in TradeArea',
    'Dave Gilmour Tools Count in TradeArea',
    'Neil Youngs Club Count in TradeArea',
    'Bobs Supplies Count in TradeArea',
    'Iggy Pop Hardware Count in TradeArea',
    'Mick Js Groceries Count in TradeArea',
    'Janis Jay Store Count in TradeArea',
    'Horn Ok Tools Count in TradeArea',
    'Wallflowers Depot Count in TradeArea',
]


def build_phase1_features(df: pd.DataFrame, verbose: bool = True) -> pd.DataFrame:
    """
    Engineer all Phase 1 features from the raw master dataset.

    Steps:
        1. Sort by Store ID → Year → Fiscal Week (critical for lag correctness)
        2. Engineer 6 lag/rolling features with minimum shift=1 (no leakage)
        3. Engineer 3 income mix features (replace 8 raw income-share bins)
        4. Engineer 2 housing age features (replace 9 raw decade columns)
        5. Engineer 1 total competitor count (replace 17 raw counts)
        6. LabelEncode 3 categorical features

    Args:
        df: Raw master DataFrame (269,412 rows × 194 columns)
        verbose: Print progress messages

    Returns:
        DataFrame with engineered features added. Rows with NaN in lag
        features are NOT dropped — caller decides how to handle them.
    """
    df = df.copy()

    # ── 0. Basic cleaning ─────────────────────────────────────────
    df.columns = df.columns.str.strip()
    df[TARGET] = pd.to_numeric(df[TARGET], errors='coerce')

    # Sort — absolutely critical for correct lag computation
    df = df.sort_values(['Store ID', 'Year', 'Fiscal Week']).reset_index(drop=True)
    if verbose:
        print(f"[Features] Sorted {len(df):,} rows by Store ID → Year → Fiscal Week")

    # ── 1. Lag features ───────────────────────────────────────────
    g = df.groupby('Store ID')[TARGET]
    df['lag_1']  = g.shift(1)    # corr = 0.982
    df['lag_4']  = g.shift(4)    # corr = 0.964
    df['lag_13'] = g.shift(13)   # corr = 0.913
    df['lag_52'] = g.shift(52)   # corr = 0.953
    df['roll_4']  = g.transform(lambda x: x.shift(1).rolling(4).mean())   # corr = 0.981
    df['roll_13'] = g.transform(lambda x: x.shift(1).rolling(13).mean())  # corr = 0.964
    if verbose:
        print("[Features] Engineered 6 lag/rolling features (shift >= 1, no leakage)")

    # ── 2. Income mix (3 features replace 8 raw bins) ─────────────
    df['income_low_share'] = (
        df['CYE % Household Income Less than 25k'].fillna(0) +
        df['CYE % Household Income 25k to 35k'].fillna(0)
    )
    df['income_diy_core'] = (
        df['CYE % Household Income 50k to 75k'].fillna(0) +
        df['CYE % Household Income 75k to 100K'].fillna(0)
    )
    df['income_affluent'] = (
        df['CYE % Household Income 150k to 250k'].fillna(0) +
        df['CYE % Household Income 250K Plus'].fillna(0)
    )
    if verbose:
        print("[Features] Engineered 3 income mix features")

    # ── 3. Housing age (2 features replace 9 raw decade bins) ─────
    df['housing_old_share'] = (
        df['CYE % Housing Unit Built before 1949'].fillna(0) +
        df['CYE % Housing Unit Built 1950   1959'].fillna(0) +
        df['CYE % Housing Unit Built 1960   1969'].fillna(0)
    )
    df['housing_new_share'] = (
        df['CYE % Housing Unit Built 2000   2009'].fillna(0) +
        df['CYE % Housing Unit Built 2009   2019'].fillna(0)
    )
    if verbose:
        print("[Features] Engineered 2 housing age features (old_share corr=-0.075, new_share corr=0.088)")

    # ── 4. Total competitor count (1 feature replaces 17 counts) ──
    comp_cols = [c for c in COMPETITOR_TA_COLUMNS if c in df.columns]
    df['total_competitor_ta'] = (
        df[comp_cols].apply(pd.to_numeric, errors='coerce').fillna(0).sum(axis=1)
    )
    if verbose:
        print(f"[Features] Engineered total_competitor_ta from {len(comp_cols)} competitor columns")

    # ── 5. Categorical encoding ───────────────────────────────────
    for cat_col in ['Urbanicity', 'CBSA Type', 'CBSA Metro Size']:
        if cat_col in df.columns:
            le = LabelEncoder()
            df[cat_col + '_enc'] = le.fit_transform(
                df[cat_col].fillna('Unknown').astype(str)
            )
            if verbose:
                print(f"[Features] LabelEncoded {cat_col} → {cat_col}_enc ({len(le.classes_)} levels)")

    # ── 6. Leakage guard ──────────────────────────────────────────
    for col in LEAKAGE_BLACKLIST:
        if col in PHASE1_FEATURES:
            raise ValueError(f"LEAKAGE DETECTED: {col} is in PHASE1_FEATURES! Remove it immediately.")

    # ── 7. Validate features exist ────────────────────────────────
    available = [f for f in PHASE1_FEATURES if f in df.columns]
    missing = [f for f in PHASE1_FEATURES if f not in df.columns]
    if missing and verbose:
        print(f"[Features] WARNING: {len(missing)} features not found in DataFrame: {missing}")
    if verbose:
        print(f"[Features] ✓ {len(available)}/{len(PHASE1_FEATURES)} Phase 1 features available")

    return df


def get_feature_matrix(df: pd.DataFrame, drop_na: bool = True):
    """
    Extract the feature matrix (X) and target vector (y) from engineered DataFrame.

    Args:
        df: DataFrame after build_phase1_features()
        drop_na: Drop rows where any Phase 1 feature or target is NaN

    Returns:
        (X, y, clean_df) — feature matrix, target vector, and the filtered DataFrame
    """
    available = [f for f in PHASE1_FEATURES if f in df.columns]
    subset = df[available + [TARGET]].copy()

    if drop_na:
        before = len(subset)
        subset = subset.dropna()
        print(f"[Features] Dropped {before - len(subset):,} rows with NaN → {len(subset):,} rows remain")

    X = subset[available].apply(pd.to_numeric, errors='coerce').fillna(0)
    y = subset[TARGET]

    return X, y, df.loc[subset.index]
