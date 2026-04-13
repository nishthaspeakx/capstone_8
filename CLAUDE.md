# Capstone 8 — Lowe's Store-Level Sales Target Model

## What This Project Is
An IIM Calcutta capstone (Group 8, APAL02) building an ML-powered store sales target system for Lowe's. The current process uses a "peanut butter spread" (3-year historical share) to set targets — we replace it with a supervised model that accounts for local market dynamics.

## Three Deliverables
1. **Working Python ML pipeline** — LightGBM model on 269,412 store-week records, 1,727 stores
2. **Interactive Streamlit demo app** — mirrors the HTML prototype in `reference/lowes_model_app.html`
3. **Capstone report** — to be done in Cowork (not here)

## Dataset
- **File:** `data/stores_sales_master_file_masked_final.csv`
- **Rows:** 269,412 (1,727 stores × 52 weeks × 3 years: FY2023–FY2025)
- **Columns:** 194 (14 identity/time/measures + 72 demographics + 108 competition)
- **Missing values:** 0 (dataset is fully clean)
- **Zero-sales rows:** 12 (exclude from training)
- **Target variable:** `Actual Sales USD`

## CRITICAL: Leakage Blacklist
**NEVER use these as model inputs** — they are same-period measures:
- `Plan Sales USD` (corr=0.986 with target)
- `Invoice Count` (corr=0.972)  
- `Avg Ticket` (corr=0.133, same-period decomposition)

## Phase 1 Feature Set (40 Features)
All features justified with data evidence. See `reference/section6_phase1_feature_justification.docx` for full rationale.

### Calendar (2)
- `Year` — macro drift; sales declined ~13% from 2023 to 2025
- `Fiscal Week` — weekly seasonality; 96% spread peak-to-trough

### Engineered Lag Features (6) — THE POWER FEATURES
All use `groupby('Store ID')['Actual Sales USD'].shift(n)` — minimum shift=1, no leakage.
- `lag_1` — shift(1), corr=0.982 (strongest single predictor)
- `lag_4` — shift(4), corr=0.964
- `lag_13` — shift(13), corr=0.913
- `lag_52` — shift(52), corr=0.953
- `roll_4` — shift(1).rolling(4).mean(), corr=0.981
- `roll_13` — shift(1).rolling(13).mean(), corr=0.964

### Store/Market (5 + 1 reserve)
- `Sales Floor Size` — continuous, 0% missing
- `Garden Ctr Size` — continuous, 468 zeros valid (no garden center)
- `Urbanicity` — 7 categories, LabelEncode (Metropolis=$1.63M vs Large City=$930K)
- `CBSA Type` — 3 categories, LabelEncode
- `CBSA Metro Size` — 4 categories, LabelEncode
- `Area Sq Mi` — RESERVE (only if validation shows lift)

### Demand/Housing (16 + 3 reserve)
Raw features:
- `CYE Total Households`, `CYE Household Density HH SqMi`, `CYE Median Household Income`
- `Compound Annual HH Growth Rate 2010 2020`
- `CYE Total Housing Units`, `CYE % Housing Units Owned`, `CYE Median Year Housing Unit Built`
- `CYE Average Mean Length of Residence Years`
- `CYE Total Population`, `CYE Median Age Total Pop`, `CYE Veteran Population`

Engineered features:
- `income_low_share` = `CYE % Household Income Less than 25k` + `CYE % Household Income 25k to 35k`
- `income_diy_core` = `CYE % Household Income 50k to 75k` + `CYE % Household Income 75k to 100K`
- `income_affluent` = `CYE % Household Income 150k to 250k` + `CYE % Household Income 250K Plus` (RESERVE)
- `housing_old_share` = sum of pre-1949 + 1950-59 + 1960-69 built percentages
- `housing_new_share` = `CYE % Housing Unit Built 2000   2009` + `CYE % Housing Unit Built 2009   2019` (corr=0.088, top static feature)

Reserve: `CYE % College Graduate Pop 25plus`, `CYE Per Capita Income Total Pop`

### Competition (6 + 2 reserve)
- `Sister Store Count in TradeArea` — self-cannibalization proxy
- `total_competitor_ta` — ENGINEERED: sum all 17 competitor TradeArea counts
- `Nut Cracker Tools Count in TradeArea`
- `Wallflowers Depot Count in TradeArea`
- `Iggy Pop Hardware Count in TradeArea`
- `Horn Ok Tools Count in TradeArea`
- Reserve: `Bo Jacks Hardware Count in TradeArea`, `Greek Baths Hardware Count in TradeArea`

## Model Configuration
- **Primary model:** LightGBM (n_estimators=500, learning_rate=0.05, max_depth=8, num_leaves=63, min_child_samples=50, subsample=0.8, colsample_bytree=0.8)
- **Secondary:** XGBoost (same hyperparams), Ridge Regression (baseline)
- **Holdout:** Rolling time split — latest ~15% of fiscal weeks as holdout
- **Early stopping:** 50 rounds on validation set

## Success Criteria
- Beat the naive baseline: lag-52 wAPE = 8.90% (FY2025) / 9.88% (FY2024)
- Overall WAPE < 8%, Bias within ±2%, R² > 0.88
- FY2025 plan miss rate to beat: 25.83% of store-weeks miss by >±10%

## The Store-Level Accuracy Loop (KEY DIFFERENTIATOR)
After global evaluation, compute per-store WAPE, Bias%, RMSE, and quarterly bias (Q1–Q4). Classify each store as:
- **Under-Targeted:** bias < -5% (model predicts less than actual)
- **Over-Targeted:** bias > +5%
- **Well-Calibrated:** within ±5%

This enables targeted planner overrides instead of chain-wide adjustments.

## Role of Store Clustering (Post-Prediction Overlay)
After the supervised model, derive 5 segments from model outputs:
- High Growth, Growth, Neutral, Maintain, Defend
- Based on predicted growth trajectory, store-level bias, CAGR HH, housing_new_share, total_competitor_ta

## Project Structure
```
Capstone 8/
├── CLAUDE.md                    ← you are here
├── data/
│   └── stores_sales_master_file_masked_final.csv
├── src/
│   ├── feature_engineering.py   ← build_phase1_features()
│   ├── store_accuracy_loop.py   ← run_store_accuracy_loop()
│   └── train_model.py           ← full pipeline: load → engineer → train → evaluate → loop
├── app/
│   └── streamlit_app.py         ← interactive demo app
├── reference/
│   ├── lowes_model_app.html     ← HTML prototype (UI spec for Streamlit)
│   └── section6_phase1_feature_justification.docx
├── outputs/                     ← model artifacts, CSVs, plots
└── requirements.txt
```

## Build Order
1. `src/feature_engineering.py` — get this right first, everything depends on it
2. `src/train_model.py` — train LightGBM, evaluate, compare with baseline
3. `src/store_accuracy_loop.py` — per-store metrics
4. `app/streamlit_app.py` — interactive demo
5. Come back to Cowork for report + presentation

## Competitor Column Names (exact, for reference)
TradeArea competitors (columns 87–103): Lumber Jax, Nut Cracker Tools, BB King Store, Thin Lizzy Hardware, JJ Cale Wholesale Wholesale, Eddie Vedder Store, Greek Baths Hardware, Mile One Store, Bo Jacks Hardware, Dave Gilmour Tools, Neil Youngs Club, Bobs Supplies, Iggy Pop Hardware, Mick Js Groceries, Janis Jay Store, Horn Ok Tools, Wallflowers Depot

All competitor columns follow pattern: `{Name} Count in TradeArea` and `{Name} Cnt {radius}`
