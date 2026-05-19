# The Prompt That Built StoreWise Targets

**Context:** This is the exact prompt that, when given to Claude Code along with two input files, produced the entire system deployed at https://storewisetargets.streamlit.app/

**Input files provided:**
1. `stores_sales_master_file_masked_final.csv` — 269,412 rows × 194 columns, store-week sales data
2. `phase1_feature_list.md` — the 40-feature specification (included at the bottom of this prompt)

---

## THE PROMPT

---

I have a retail store-level sales dataset (CSV attached) and a curated feature list (attached). I need you to build a complete, deployable ML system that predicts weekly store sales and identifies which stores are being over-targeted or under-targeted by the current planning process.

### Background

This is for a capstone project (IIM Calcutta, Group 8). The retailer (Lowe's, ~1,727 stores) currently sets next-year store sales targets by spreading the company total using each store's 3-year historical sales share — a "peanut butter spread." This ignores local market dynamics. In FY2025, 25.83% of store-weeks missed plan by more than ±10%. We're replacing this with a supervised ML model.

### What to Build

Build these 4 Python modules and deploy them as a live Streamlit app:

**1. `src/feature_engineering.py`**

A reusable module that takes the raw CSV DataFrame and engineers all 40 Phase 1 features. Specifically:

- Sort by Store ID → Year → Fiscal Week (critical for lag correctness)
- Engineer 6 lag/rolling features from `Actual Sales USD`, all with minimum shift=1 to prevent leakage:
  - `lag_1` = groupby('Store ID')['Actual Sales USD'].shift(1)
  - `lag_4` = shift(4)
  - `lag_13` = shift(13)
  - `lag_52` = shift(52)
  - `roll_4` = shift(1).rolling(4).mean()
  - `roll_13` = shift(1).rolling(13).mean()
- Engineer 3 income mix features by summing raw income-share brackets:
  - `income_low_share` = % HH Income <25k + % HH Income 25k-35k
  - `income_diy_core` = % HH Income 50k-75k + % HH Income 75k-100K
  - `income_affluent` = % HH Income 150k-250k + % HH Income 250K+
- Engineer 2 housing age features by summing raw decade-built percentages:
  - `housing_old_share` = % Built before 1949 + % Built 1950-1959 + % Built 1960-1969
  - `housing_new_share` = % Built 2000-2009 + % Built 2009-2019
- Engineer 1 total competitor count:
  - `total_competitor_ta` = sum of all 17 individual competitor "Count in TradeArea" columns (exclude Sister Store Count)
- LabelEncode 3 categorical features: Urbanicity (7 levels), CBSA Type (3 levels), CBSA Metro Size (4 levels)
- Include a runtime leakage guard that raises an error if Plan Sales USD, Invoice Count, or Avg Ticket ever appear in the feature list

Export a `PHASE1_FEATURES` list and a `build_phase1_features(df)` function.

**2. `src/train_model.py`**

A full training pipeline that:

- Loads the CSV and validates: 269,412 rows, 1,727 stores, 0 missing values, 12 zero-sales rows (exclude these)
- Calls `build_phase1_features()` from the feature engineering module
- Creates a rolling time-based train/holdout split at the 85th percentile of `Fiscal Week Ending Date` — no random splitting (that would leak future data)
- Drops rows with NaN in lag features (the first ~52 weeks per store will have missing lag_52)
- Trains 3 models:
  - XGBoost: n_estimators=500, learning_rate=0.05, max_depth=7, subsample=0.8, colsample_bytree=0.8, early stopping at 50 rounds
  - LightGBM: same params but max_depth=8, num_leaves=63, min_child_samples=50
  - Ridge Regression: alpha=1.0 as a linear baseline
- Also computes a naive baseline: lag_52 (last year same week) as the prediction
- Evaluates all 4 on holdout using: WAPE (weighted absolute percentage error), Bias % (systematic over/under), RMSE, MAE, R²
- Prints a comparison table and identifies the best model by WAPE
- Uses the best model to generate predictions on the holdout set
- Saves to `outputs/`: model pickle, model_comparison.csv, feature_importance.csv

Success criteria to validate:
- WAPE should be below 8% (naive baseline is ~8.9%)
- Bias should be within ±2%
- R² should be above 0.88

**3. `src/store_accuracy_loop.py`**

This is the project's key differentiator. After global evaluation, compute per-store accuracy:

- Group holdout predictions by Store ID
- For each store compute: WAPE, Bias %, RMSE, and quarterly bias (Q1 = weeks 1-13, Q2 = 14-26, Q3 = 27-39, Q4 = 40-52)
- Classify each store:
  - Under-Targeted: Bias < -5% (model predicts less than actual — store outperforms)
  - Over-Targeted: Bias > +5% (model predicts more than actual — store underperforms)
  - Well-Calibrated: within ±5%
- Sort by absolute bias descending (worst stores first)
- Print summary: total stores, count per category, median WAPE and Bias, top 10 worst stores
- Export to `outputs/store_accuracy_loop_results.csv`

Also build a Role-of-Store segmentation function that assigns each store to one of 5 segments:
- High Growth, Growth, Neutral, Maintain, Defend
- Use a composite net_score = growth_score - risk_score, where:
  - growth_score = (CAGR_HH / 2) + (housing_new_share / 10) - (bias / 10)
  - risk_score = (total_competitor_ta / 50) + (bias / 10)
- Use quantile-based cutoffs (20th, 40th, 60th, 80th percentile of net_score) so each segment gets roughly equal distribution
- Add the segment label to the store loop results

**4. `app/streamlit_app.py`**

An interactive Streamlit demo app with Lowe's blue (#003087) theming. The app must have two operating modes:

**Mode 1 — Pre-computed Demo:** Load saved results from `outputs/` (model pickle, CSVs). Everything displays instantly. This is the default mode.

**Mode 2 — Upload & Score:** User uploads a new CSV via sidebar → app runs feature engineering → scores with saved model → runs store accuracy loop → displays live results.

The app should have these 10 sections:

1. **Header** — Lowe's blue gradient banner with project title
2. **Dataset Summary** — 5 metric cards (rows, stores, years, columns, features) + validation details expander
3. **Phase 1 Feature Set** — Interactive radio buttons to filter by feature family (All / Calendar / Lags / Store / Demand / Competition). Display features as color-coded tags (blue=raw, green=engineered, yellow=reserve)
4. **Model Configuration** — Two-column layout: model params table + hyperparams table. Blue info box showing leakage blacklist
5. **Model Performance** — 6 metric cards (best model, WAPE, Bias, RMSE, R², MAE) + success criteria checklist (✅/⚠️) + model comparison table with conditional formatting (highlight best WAPE green, best R² green)
6. **Store-Level Accuracy Loop** — Left column: 4 summary metrics (total stores, under-targeted, over-targeted, well-calibrated) + radio filter (Under/Over/All) + scrollable data table. Right column: top 15 feature importance horizontal bar chart (Plotly, blue gradient colors)
7. **Store Bias Distribution** — Two charts side by side: histogram of Bias % with dashed threshold lines at ±5% + scatter plot of Predicted vs Actual with perfect-prediction diagonal line, colored by target_status (green=calibrated, orange=under, red=over)
8. **Role-of-Store Segmentation** — Pie chart of segment distribution + stats table (stores, median WAPE, median bias, avg actual sales per segment)
9. **Store Drill-Down** — Dropdown to select any store → show metrics + quarterly bias bar chart colored by bias direction
10. **Download Results** — Two download buttons (store loop CSV + feature importance CSV)

Also add a Gemini AI commentary section: button that calls Gemini 2.0 Flash API (key from `st.secrets["GEMINI_API_KEY"]`) with a structured prompt asking for business interpretation of the model results.

Use Plotly for all charts (not matplotlib). Use `@st.cache_data` for data loading, `@st.cache_resource` for model loading. Wide layout, max 1400px.

### Deployment

After everything works locally:

1. Create `requirements.txt` with: pandas, numpy, scikit-learn, lightgbm, xgboost, streamlit, plotly, google-generativeai
2. Create `.streamlit/config.toml` for Lowe's blue theme
3. Create `.gitignore` (exclude data/, secrets, __pycache__)
4. Run the pipeline once locally to generate all `outputs/` files
5. Push to GitHub (use Git LFS for the CSV if needed, or ship only the pre-computed outputs)
6. Deploy on Streamlit Community Cloud — the professor should be able to click a URL and see the full working system instantly

### Project Structure

```
project/
├── CLAUDE.md
├── requirements.txt
├── .streamlit/
│   ├── config.toml
│   └── secrets.toml
├── data/
│   └── stores_sales_master_file_masked_final.csv
├── src/
│   ├── feature_engineering.py
│   ├── train_model.py
│   └── store_accuracy_loop.py
├── app/
│   └── streamlit_app.py
└── outputs/
    ├── model_xgboost.pkl
    ├── model_comparison.csv
    ├── feature_importance.csv
    └── store_accuracy_loop_results.csv
```

### Critical Rules

1. **NEVER use Plan Sales USD, Invoice Count, or Avg Ticket as model inputs.** They are same-period measures (corr = 0.986, 0.972, 0.126 with target). Using them is data leakage that would invalidate the entire model.
2. **All lag features must use shift >= 1.** The model must not see the current week's sales when predicting it.
3. **Time-based split only.** Random splits leak future information. Use rolling cutoff at 85th percentile of dates.
4. **Use exact column names from the CSV.** Column names have specific spacing (e.g., `CYE % Housing Unit Built 1950   1959` has triple spaces). Read them from the file header, don't type them manually.
5. **The app must work on Streamlit Community Cloud.** No hardcoded local paths. Use relative paths from the project root. Read API keys from `st.secrets`.

---

## ATTACHMENT: Phase 1 Feature List (40 Features)

### Calendar (2)
| Feature | Type | Correlation | Note |
|---------|------|-------------|------|
| Year | Raw | -0.059 | Macro drift; sales declined ~13% from 2023 to 2025 |
| Fiscal Week | Raw | -0.086 | Weekly seasonality; 96% spread peak-to-trough |

### Engineered Lag Features (6)
| Feature | Type | Correlation | Engineering Formula |
|---------|------|-------------|-------------------|
| lag_1 | Engineered | 0.982 | groupby('Store ID')['Actual Sales USD'].shift(1) |
| lag_4 | Engineered | 0.964 | .shift(4) |
| lag_13 | Engineered | 0.913 | .shift(13) |
| lag_52 | Engineered | 0.953 | .shift(52) |
| roll_4 | Engineered | 0.981 | .shift(1).rolling(4).mean() |
| roll_13 | Engineered | 0.964 | .shift(1).rolling(13).mean() |

### Store/Market (5 + 1 reserve)
| Feature | Type | Correlation | Note |
|---------|------|-------------|------|
| Sales Floor Size | Raw | 0.035 | Store capacity proxy; Q4 avg 10% higher than Q1 |
| Garden Ctr Size | Raw | 0.062 | Seasonal traffic driver; 468 valid zeros |
| Urbanicity | Categorical | N/A | 7 levels; LabelEncode. Metropolis=$1.63M vs Large City=$930K |
| CBSA Type | Categorical | N/A | 3 levels (Metro, Micro, non-CBSA); LabelEncode |
| CBSA Metro Size | Categorical | N/A | 4 levels; Small Metro outperforms Large Metro |
| Area Sq Mi | Reserve | 0.038 | Only if validation shows lift |

### Demand/Housing — Raw (11)
| Feature | Correlation | Note |
|---------|-------------|------|
| CYE Total Households | -0.045 | Core addressable market; std=143K |
| CYE Household Density HH SqMi | -0.001 | Density complement |
| CYE Median Household Income | -0.036 | Best purchasing-power summary |
| Compound Annual HH Growth Rate 2010 2020 | 0.073 | Market growth trajectory |
| CYE Total Housing Units | -0.040 | Housing stock size |
| CYE % Housing Units Owned | 0.019 | Ownership → improvement spend |
| CYE Median Year Housing Unit Built | 0.078 | Older stock → repair demand |
| CYE Average Mean Length of Residence Years | -0.038 | Behavioral improvement trigger |
| CYE Total Population | -0.044 | Market size complement |
| CYE Median Age Total Pop | 0.034 | Age 35-55 = peak DIY bracket |
| CYE Veteran Population | -0.018 | Business-specific discount segment |

### Demand/Housing — Engineered (5)
| Feature | Correlation | Engineering Formula |
|---------|-------------|-------------------|
| income_low_share | 0.027 | CYE % HH Income <25k + CYE % HH Income 25k-35k |
| income_diy_core | 0.040 | CYE % HH Income 50k-75k + CYE % HH Income 75k-100K |
| income_affluent | -0.032 | CYE % HH Income 150k-250k + CYE % HH Income 250K+ |
| housing_old_share | -0.075 | % Built before 1949 + % Built 1950-1959 + % Built 1960-1969 |
| housing_new_share | 0.088 | % Built 2000-2009 + % Built 2009-2019 (top static feature) |

### Demand/Housing — Reserve (3)
| Feature | Note |
|---------|------|
| CYE % College Graduate Pop 25plus | Add only if holdout WAPE improves |
| CYE Per Capita Income Total Pop | Highly correlated with Median HH Income |
| income_affluent | Keep conditionally; confirm stability |

### Competition (6 + 2 reserve)
| Feature | Type | Correlation | Note |
|---------|------|-------------|------|
| Sister Store Count in TradeArea | Raw | -0.029 | Self-cannibalization proxy |
| total_competitor_ta | Engineered | -0.035 | Sum of all 17 competitor TradeArea counts |
| Nut Cracker Tools Count in TradeArea | Raw | -0.024 | Major competitor |
| Wallflowers Depot Count in TradeArea | Raw | -0.006 | Highest avg count (4.69) |
| Iggy Pop Hardware Count in TradeArea | Raw | -0.043 | Highest competitor correlation |
| Horn Ok Tools Count in TradeArea | Raw | 0.008 | High-coverage regional competitor |
| Bo Jacks Hardware Count in TradeArea | Reserve | — | Add only if incremental |
| Greek Baths Hardware Count in TradeArea | Reserve | — | Collinear with radius variants |

### 17 Competitor TradeArea Columns (for total_competitor_ta engineering)
Lumber Jax, Nut Cracker Tools, BB King Store, Thin Lizzy Hardware, JJ Cale Wholesale Wholesale, Eddie Vedder Store, Greek Baths Hardware, Mile One Store, Bo Jacks Hardware, Dave Gilmour Tools, Neil Youngs Club, Bobs Supplies, Iggy Pop Hardware, Mick Js Groceries, Janis Jay Store, Horn Ok Tools, Wallflowers Depot

All follow the column naming pattern: `{Name} Count in TradeArea`
