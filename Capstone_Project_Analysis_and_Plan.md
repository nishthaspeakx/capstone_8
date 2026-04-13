# Capstone Project Analysis: Role of a Retail Store
## Group 8 | IIM Calcutta | APAL02

---

## 1. PROJECT UNDERSTANDING (from PPT Analysis)

### What Is This Project?

Your capstone is about building an **ML-enabled store-targeting tool for Lowe's** (a leading US home improvement retailer with ~1,759 stores and ~$85B revenue). The core problem: Lowe's currently sets next-year store sales targets by simply spreading the total company plan using each store's 3-year historical sales share (a "peanut butter spread" approach). This ignores local market dynamics like population growth, income shifts, housing age, and competitive pressure changes.

### The Proposed Solution

Replace that simplistic spreading with a data-driven approach that:

1. **Clusters stores into 5 roles**: High Growth, Growth, Neutral, Maintain, Defend — based on local demand and risk drivers
2. **Estimates store-level growth expectations** and seasonality patterns
3. **Allocates annual + monthly targets** via constrained optimization (targets must still sum to the division plan)
4. **Provides explainability**: driver-based explanations, peer benchmarks, planner overrides

### POC Scope

The proof of concept focuses on the **West Division (~492 stores)** only. Scale chainwide after validation.

### Success Measures

- Lower store-month plan error vs. current baseline spreading
- Fewer extreme misses (% stores outside ±10-15%)
- Fewer mid-year re-targets/replanning
- Division total plan met by construction (constraint)

---

## 2. DATASET OVERVIEW

### What You Have

| Dimension | Detail |
|-----------|--------|
| **Total Rows** | 269,412 |
| **Total Columns** | 195 |
| **Unique Stores** | 1,727 |
| **West Division Stores (POC)** | 492 |
| **Time Period** | 3 years (2023, 2024, 2025) |
| **Granularity** | Store-Week (52 weeks/year) |
| **Weeks Per Store** | ~156 (52 weeks x 3 years) |
| **Divisions** | NORTH (94,380 rows), SOUTH (98,280), WEST (76,752) |

### Data Quality Notes

- **2023 weeks 27-52**: Actual Sales are missing for all 1,727 stores (looks like a data cutoff for the older year — only H1 2023 actuals available)
- **2025 data**: All 52 weeks present but actuals likely only through recent weeks
- **CYE % Household Income 250K Plus**: ~112K rows missing (41.6%) — a significant gap
- **2010 Total Housing Units**: ~22K rows missing (8.3%)
- **All other features**: Fully populated with zero or near-zero missing values

---

## 3. COMPLETE FEATURE INVENTORY

Your data has **195 columns** which fall into these categories:

| Category | Count | Examples |
|----------|-------|---------|
| **Store Identity** | 7 | Store ID, Name, District, Region, Division |
| **Time** | 3 | Year, Fiscal Week, Fiscal Week Ending Date |
| **Sales/Performance (Target Variables)** | 4 | Actual Sales USD, Plan Sales USD, Invoice Count, Avg Ticket |
| **Store Physical** | 2 | Sales Floor Size, Garden Ctr Size |
| **Geography/Urbanicity** | 4 | Urbanicity, CBSA Type, CBSA Metro Size, Area Sq Mi |
| **Household Demographics** | ~18 | Total Households (2010/2020/CYE), Income brackets, Density, Growth Rate |
| **Housing Characteristics** | ~18 | Housing Units, Ownership, Age of Housing (decade buckets), Home Values |
| **Population Demographics** | ~25 | Total Pop, Age, Education, Marital Status, Language, Veterans, Per Capita Income |
| **Competition — Trade Area** | 18 | One column per competitor within the store's trade area |
| **Competition — 3mi radius** | 16 | One column per competitor within 3 miles |
| **Competition — 5mi radius** | 16 | One column per competitor within 5 miles |
| **Competition — 10mi radius** | 16 | One column per competitor within 10 miles |
| **Competition — 0-11mi radius** | 16 | One column per competitor within 0-11 miles |
| **Competition — 11-30mi radius** | 16 | One column per competitor within 11-30 miles |

---

## 4. RECOMMENDED FEATURES: 42 Features Across 7 Groups

After analyzing all 195 columns for relevance, data quality, variance, redundancy, and alignment with the PDF's priority weightage, here is my recommended feature set.

---

### GROUP A: TARGET / DEPENDENT VARIABLES (4 features)

These are what you're predicting or benchmarking against — not inputs to the clustering model.

| # | Feature | Role | Why |
|---|---------|------|-----|
| 1 | **Actual Sales USD** | Primary target | The actual weekly sales — this is what you're trying to allocate and predict |
| 2 | **Plan Sales USD** | Baseline benchmark | The current "peanut butter spread" plan — you need this to measure improvement |
| 3 | **Invoice Count** | Supporting metric | Transaction volume indicates store traffic patterns independent of ticket size |
| 4 | **Avg Ticket** | Supporting metric | Average transaction value helps distinguish high-value vs. volume stores |

---

### GROUP B: STORE PHYSICAL ATTRIBUTES (3 features)

| # | Feature | Priority (PDF) | Why Include |
|---|---------|----------------|-------------|
| 5 | **Sales_Floor_Size** | Y (no weight) | While the PDF notes fulfillment is largely unaffected by size, floor size still correlates with product assortment breadth and walk-in customer experience. Use as a control variable. |
| 6 | **Garden_Ctr_Size** | High | Explicitly called out as a "traffic driving category." Larger garden centers attract more footfall, especially in spring/summer seasonality. Directly impacts sales potential. |
| 7 | **Urbanicity** | High | 7 levels from Metropolis to Remote. This is a master segmentation variable — it captures density, accessibility, customer behavior, and competitive dynamics in a single feature. Essential for clustering. |

---

### GROUP C: HOUSEHOLD & INCOME DEMOGRAPHICS (8 features)

The PDF lists 8 income bracket columns (Less than 25k through 250K+), all marked "High" priority. However, **using all 8 brackets creates multicollinearity** (they sum to ~100%). My recommendation:

| # | Feature | Priority | Why Include |
|---|---------|----------|-------------|
| 8 | **CYE_Total_Households** | High | Total addressable market size — the single most important demand driver. More households = more potential customers. |
| 9 | **CYE_Median_Household_Income** | High | Best single summary of trade area purchasing power. Median is robust to outliers unlike mean/aggregate. |
| 10 | **CYE_%_Household_Income_Less_than_25k** | High | Captures the "value-conscious" segment. High percentage indicates a trade area skewed toward budget shoppers — affects product mix and ticket size. |
| 11 | **CYE_%_Household_Income_75k_to_100K** | High | The "sweet spot" for home improvement: households with enough income for projects but not wealthy enough to hire everything out. This is Lowe's core DIY customer. |
| 12 | **CYE_%_Household_Income_150k_to_250k** | High | Captures the "Pro/contractor" customer proxy — wealthier areas tend to have more remodeling projects and higher-value purchases. |

**Why not all 8 brackets?** Income distribution information is captured by the median plus the 3 strategic brackets above (low-end, core DIY, high-end). Including all 8 introduces near-perfect multicollinearity which destabilizes regression/clustering. If the model needs more income granularity, use PCA on all 8 to create 2-3 income components.

| 13 | **Compound_Annual_HH_Growth_Rate_2010_2020** | — | Not in PDF but present in CSV. Captures whether the trade area is growing or declining over a decade — a critical forward-looking indicator. Growing areas = "High Growth" role candidates. |

**Dropped from this group:**
- *CYE_Aggregate_Family_Household_Income*: Marked "Low" priority in PDF. Aggregate income is redundant with Median + Total Households.
- *CYE_Average_Mean_Household_Income*: Redundant with Median; mean is more sensitive to outliers.

---

### GROUP D: HOUSING CHARACTERISTICS (7 features)

| # | Feature | Priority | Why Include |
|---|---------|----------|-------------|
| 14 | **CYE_Total_Housing_Units** | High | Total housing stock in trade area. Correlated with Total Households but captures vacant/new units too — important for renovation demand. |
| 15 | **CYE_Median_Year_Housing_Unit_Built** | High | Single best indicator of housing age. Older homes = more maintenance/repair needs (plumbing, electrical, roofing). Directly drives "Maintain" role identification. |
| 16 | **CYE_%_Housing_Unit_Built_before_1949** | High | Very old housing stock — highest maintenance demand. These homes need continuous repair. |
| 17 | **CYE_%_Housing_Unit_Built_2000_to_2009** | High | Recent construction — lower repair needs but higher "finishing" demand (landscaping, upgrades). |
| 18 | **CYE_%_Housing_Unit_Built_after_2020** | High | Brand new construction — drives new-homeowner demand (appliances, fixtures, landscaping). High values signal "High Growth" areas. |
| 19 | **CYE_Average_Mean_Length_of_Residence_Years** | High | New move-ins have improvement needs; long-term residents have maintenance needs. A key behavioral segmentation variable per the PDF. |

**Why not all 8 decade buckets?** Same multicollinearity concern as income brackets — they sum to ~100%. The three chosen brackets capture the strategic extremes (very old, recent, brand new), and the Median Year Built provides the central tendency. If needed, PCA on all decade buckets can extract 2-3 housing-age components.

| 20 | **CYE_%_Housing_Units_Owned** | Low (PDF) | Including despite "Low" PDF priority because home ownership is a fundamental driver of home improvement spending. Renters spend significantly less on home improvement. Use selectively. |

**Dropped:**
- *CYE_%_House_Units_Rented*: Perfect inverse of % Owned — completely redundant.
- *Individual decade buckets (1950s-1990s)*: Captured by Median Year Built + the 3 strategic buckets above.

---

### GROUP E: POPULATION & DEMOGRAPHIC FEATURES (6 features)

| # | Feature | Priority | Why Include |
|---|---------|----------|-------------|
| 21 | **CYE_Total_Population** | High | Raw market size. Complements Total Households — captures multi-person households and individual demand potential. |
| 22 | **CYE_Median_Age_Total_Pop** | High/Medium | Age drives spending patterns: younger populations tend toward new homes/renovations; older populations toward maintenance/accessibility. |
| 23 | **CYE_Veteran_Population** | High | Veterans get a flat 10% discount at Lowe's — this directly impacts both traffic and margin. A unique Lowe's-specific demand driver. |
| 24 | **CYE_%_College_Graduate_Pop_25plus** | — | Education level correlates with income and home ownership rates. Adds a dimension beyond just income for understanding the trade area profile. |
| 25 | **CYE_%_Speak_only_English_at_Home_Pop_5plus** | — | Language composition can indicate diverse communities with different shopping behaviors and product preferences. |
| 26 | **CYE_Per_Capita_Income_Total_Pop** | — | Complements Median Household Income by capturing individual-level purchasing power. Useful when household sizes vary significantly. |

---

### GROUP F: COMPETITIVE LANDSCAPE (11 features)

This is where careful selection matters most. The CSV has **98 competition columns** (18 competitors x 5-6 distance bands + trade area). Using all of them would drown the model in noise. Here is the strategic selection:

**Major competitors (use Trade Area count — the most business-relevant geography):**

| # | Feature | Why Include |
|---|---------|-------------|
| 27 | **Nut_Cracker_Tools_Count_in_TradeArea** | Described as "major competitor." Mean=3.45, only 10% zeros — highly prevalent and variable. This is likely the primary competitor (Home Depot analog). |
| 28 | **Greek_Baths_Hardware_Count_in_TradeArea** | "Major competitor." Mean=0.36 but up to 8 — significant in certain markets. |
| 29 | **Bo_Jacks_Hardware_Count_in_TradeArea** | "Major competitor." Mean=2.32, 19% zeros — widely present. |
| 30 | **Dave_Gilmour_Tools_Count_in_TradeArea** | "Major competitor." Mean=0.23 — lower presence but still strategically important. |
| 31 | **Janis_Jay_Store_Count_in_TradeArea** | "Major competitor." Mean=1.41, 22% zeros — broad presence. |

**High-volume secondary competitors (use Trade Area count):**

| # | Feature | Why Include |
|---|---------|-------------|
| 32 | **Iggy_Pop_Hardware_Count_in_TradeArea** | Mean=5.25, only 2% zeros — the most prevalent competitor. Despite being "small pockets," their sheer density matters. |
| 33 | **Wallflowers_Depot_Count_in_TradeArea** | Mean=4.68, only 1% zeros — nearly universal competitor presence. |
| 34 | **Horn_Ok_Tools_Count_in_TradeArea** | Mean=3.43, 15% zeros — widespread. |
| 35 | **Mick_Js_Groceries_Count_in_TradeArea** | Mean=2.47, 21% zeros — possibly a big-box/grocery competitor that sells home improvement items. |

**Cannibalization (sister stores):**

| # | Feature | Why Include |
|---|---------|-------------|
| 36 | **Sister_Store_Count_in_TradeArea** | Measures self-cannibalization. More sister stores = shared demand. Critical for understanding a store's true addressable market. |

**Aggregate competition pressure:**

| # | Feature (Engineered) | Why Include |
|---|---------------------|-------------|
| 37 | **Total_Competitor_Count_in_TradeArea** | Sum of ALL competitor counts in trade area. A single composite measure of competitive intensity. Engineer this from the raw columns. |

**Why Trade Area counts and not 5mi/10mi?**
The PDF explicitly states: "Lowe's Trade Areas are derived through a proprietary process that accounts for approximately 70% of a location's annual sales." Trade area is the most business-meaningful geography. The 5mi/10mi radius features are crude proxies. Use one distance band (10mi) only as a robustness check, not as a primary feature.

**Dropped:**
- *Thin_Lizzy_Hardware*: 100% zeros — this competitor has zero presence in the data. Completely useless.
- *Bobs_Supplies*: 99% zeros — near-zero variance, no predictive value.
- *All 3mi, 5mi, 0-11mi, 11-30mi bands*: Redundant with Trade Area. Would add 80+ columns of noise.
- *Lumber_Jax, BB_King, Eddie_Vedder, Mile_One, Neil_Youngs, JJ_Cale*: Smaller competitors (77%, 30%, 35%, 10%, 43%, 52% zeros respectively). Include only Lumber_Jax or Neil_Youngs if initial model performance is weak and you want more granularity.

---

### GROUP G: TIME & GEOGRAPHY IDENTIFIERS (5 features)

| # | Feature | Why Include |
|---|---------|-------------|
| 38 | **Year** | Captures year-over-year trends and macro shifts |
| 39 | **Fiscal_Week** | Captures seasonality (critical for monthly target allocation) |
| 40 | **Region** | Sub-division geography for regional effects within West Division |
| 41 | **CBSA_Type** | Metropolitan vs. Micropolitan — captures urban economic structure |
| 42 | **CBSA_Metro_Size** | Finer-grained metro classification |

---

## 5A. LEAN STARTING SET: 20 Features for Phase 1

Rather than starting with all 42 features, a leaner initial set of ~20 features is recommended for the first iteration. This gives a healthier ratio of ~25 stores per feature (vs. ~12:1 with 42 features), making clustering significantly more stable. Run the full pipeline end-to-end with this set first, then add features in later iterations only if they improve model performance.

### Why Start Lean?

- **Better clustering stability**: 492 stores ÷ 20 features = ~25:1 ratio (rule of thumb is 10-15:1 minimum)
- **Faster iteration**: Run the full pipeline (clustering → growth estimation → allocation → validation) quickly
- **Empirical feature selection**: Add features back based on whether they actually improve silhouette scores or reduce MAPE, rather than guessing upfront
- **Avoids curse of dimensionality**: Distance metrics work better in lower-dimensional space
- **Simpler explainability**: Easier to present 20 well-chosen features to business stakeholders

### The 20-Feature Starting Set

| # | Feature | Group | Why It Made the Cut |
|---|---------|-------|---------------------|
| 1 | **Actual Sales USD** | A: Target | Primary target variable |
| 2 | **Plan Sales USD** | A: Target | Baseline benchmark for measuring improvement |
| 3 | **Invoice Count** | A: Target | Traffic patterns independent of ticket size |
| 4 | **Avg Ticket** | A: Target | Distinguishes high-value vs. volume stores |
| 5 | **Urbanicity** | B: Store Physical | Master segmentation variable — 7 levels capturing density, accessibility, behavior |
| 6 | **Garden_Ctr_Size** | B: Store Physical | Explicitly called out as "traffic driving category" in PDF |
| 7 | **CYE_Total_Households** | C: Household | Single most important demand driver — total addressable market size |
| 8 | **CYE_Median_Household_Income** | C: Household | Best single summary of purchasing power (replaces all 8 income brackets) |
| 9 | **Compound_Annual_HH_Growth_Rate_2010_2020** | C: Household | Forward-looking indicator — growing vs. declining trade areas |
| 10 | **CYE_Total_Housing_Units** | D: Housing | Total housing stock including vacant/new — drives renovation demand |
| 11 | **CYE_Median_Year_Housing_Unit_Built** | D: Housing | Single best indicator of housing age (replaces all decade buckets) |
| 12 | **CYE_Average_Mean_Length_of_Residence_Years** | D: Housing | New move-ins vs. long-term residents — key behavioral variable |
| 13 | **CYE_Total_Population** | E: Population | Raw market size, complements Total Households |
| 14 | **CYE_Veteran_Population** | E: Population | Lowe's-specific: 10% veteran discount directly impacts traffic and margin |
| 15 | **Nut_Cracker_Tools_Count_in_TradeArea** | F: Competition | Primary competitor (Home Depot analog). Mean=3.45, only 10% zeros |
| 16 | **Wallflowers_Depot_Count_in_TradeArea** | F: Competition | Most prevalent competitor. Mean=4.68, only 1% zeros |
| 17 | **Sister_Store_Count_in_TradeArea** | F: Competition | Self-cannibalization — critical for true addressable market |
| 18 | **Total_Competitor_Count_in_TradeArea** | F: Competition | Engineered: composite measure of competitive intensity |
| 19 | **Year** | G: Time | Year-over-year trends |
| 20 | **Fiscal_Week** | G: Time | Seasonality (critical for monthly allocation) |

### What's Deferred to Phase 2 (Add Back If Needed)

| Deferred Feature | Original Group | When to Add Back |
|-----------------|----------------|------------------|
| Sales_Floor_Size | B | If clustering doesn't distinguish store capacity well |
| CYE_%_HH_Income_Less_than_25k | C | If clusters don't separate value vs. premium markets |
| CYE_%_HH_Income_75k_to_100K | C | If core DIY segment isn't captured by median income alone |
| CYE_%_HH_Income_150k_to_250k | C | If Pro/contractor demand isn't differentiated |
| CYE_%_Housing_Unit_Built_before_1949 | D | If housing age median alone misses the "very old homes" signal |
| CYE_%_Housing_Unit_Built_2000_to_2009 | D | If recent construction demand isn't captured |
| CYE_%_Housing_Unit_Built_after_2020 | D | If new-build areas aren't identified as High Growth |
| CYE_%_Housing_Units_Owned | D | If ownership rate matters beyond income proxy |
| CYE_Median_Age_Total_Pop | E | If age-driven spending patterns aren't captured |
| CYE_%_College_Graduate_Pop_25plus | E | If education adds predictive power beyond income |
| CYE_%_Speak_only_English_at_Home | E | If community diversity affects shopping behavior |
| CYE_Per_Capita_Income_Total_Pop | E | If individual income adds signal beyond household income |
| Greek_Baths_Hardware, Bo_Jacks_Hardware, Dave_Gilmour_Tools, Janis_Jay_Store | F | If top-2 competitors + total count don't capture competitive dynamics |
| Iggy_Pop_Hardware, Horn_Ok_Tools, Mick_Js_Groceries | F | If secondary competitor density matters |
| Region, CBSA_Type, CBSA_Metro_Size | G | If geographic effects aren't captured by Urbanicity alone |

### How to Decide What to Add Back

1. **Run clustering with 20 features** → check silhouette score and business interpretability
2. **Run growth model with 20 features** → check MAPE and feature importance (SHAP)
3. **Add one group at a time** (e.g., all deferred income brackets) → re-run → check if metrics improve
4. **Keep only features that improve metrics by >1%** — otherwise they're adding noise

---

## 5B. FULL SET: 42 FEATURES RECOMMENDED

| Group | Count | Features |
|-------|-------|----------|
| A: Target Variables | 4 | Actual Sales, Plan Sales, Invoice Count, Avg Ticket |
| B: Store Physical | 3 | Sales Floor Size, Garden Ctr Size, Urbanicity |
| C: Household & Income | 6 | Total Households, Median Income, 3 income brackets, HH Growth Rate |
| D: Housing | 7 | Total Housing Units, Median Year Built, 3 age buckets, Residence Length, % Owned |
| E: Population | 6 | Total Pop, Median Age, Veterans, College %, English %, Per Capita Income |
| F: Competition | 11 | 5 major competitors, 4 high-volume secondary, Sister Stores, Total Competitor (engineered) |
| G: Time & Geography | 5 | Year, Fiscal Week, Region, CBSA Type, CBSA Metro Size |
| **TOTAL** | **42** | **Down from 195 raw columns (78% reduction)** |

### What You're Dropping and Why

| Dropped Category | Count | Reason |
|-----------------|-------|--------|
| Redundant income brackets | 5 | Multicollinearity — captured by Median + 3 strategic brackets |
| Redundant housing decade buckets | 5 | Multicollinearity — captured by Median Year + 3 strategic buckets |
| % Rented | 1 | Perfect inverse of % Owned |
| Aggregate/Mean income | 2 | Redundant with Median Household Income |
| Zero-variance competitors | 2 | Thin Lizzy (100% zeros), Bobs Supplies (99% zeros) |
| Redundant distance bands (3mi/5mi/10mi/0-11mi/11-30mi) | ~80 | Trade Area is the gold standard per Lowe's methodology |
| Minor competitors | 6 | Low presence, high zeros — keep as fallback |
| Store identity columns | 4 | Real Store ID, Store Name, District (use Region instead) |
| Historical demographics (2010, 2020 snapshots) | ~10 | CYE (current year estimates) are more relevant; growth rate captures trend |
| Remaining low-signal population features | ~20 | Marital status, rural %, various language breakdowns — weak home improvement drivers |

---

## 6. PROJECT PLAN: How to Execute This Capstone

### Phase 0: Setup & Data Preparation (Weeks 1-2)

**Goal**: Clean data, engineer features, create the analytical dataset.

**Tasks:**
1. **Filter to West Division** — reduce from 1,727 to 492 stores
2. **Handle missing data** — 2023 H2 actuals are missing; use 2024 as primary training year with 2023 H1 as supplementary. Impute CYE_%_Household_Income_250K_Plus (41.6% missing) — either drop it or impute with median by Urbanicity
3. **Aggregate weekly to store-level annual summaries** — for clustering, you need one row per store with: Annual Sales (TY, LY), YoY growth %, seasonality profile (e.g., peak week sales / average week sales), average weekly invoice count, average ticket
4. **Engineer features**: Total_Competitor_Count_in_TradeArea (sum of all competitor counts), YoY_Sales_Growth_Pct, Seasonality_Index, Plan_vs_Actual_Ratio (how well current planning works for each store)
5. **Normalize/standardize** all numerical features for clustering (StandardScaler or RobustScaler)
6. **Create a store-level master table**: one row per store, 42 features

**Deliverable**: Clean, analysis-ready dataset (492 stores x ~45 features)

---

### Phase 1: Exploratory Data Analysis (Week 2-3)

**Goal**: Understand distributions, correlations, and natural groupings.

**Tasks:**
1. **Univariate analysis** — distribution of each feature, outlier detection
2. **Correlation matrix** — identify highly correlated pairs (>0.85) for potential further reduction
3. **Plan vs. Actual analysis** — quantify how bad the current "peanut butter" approach is: by store, by month, by urbanicity. This becomes your baseline
4. **Geographic visualization** — map stores colored by current plan accuracy, income levels, competition density
5. **Seasonality analysis** — identify seasonal patterns by store cluster (rural vs. metro stores may peak differently)

**Deliverable**: EDA report with key insights, baseline error quantification

---

### Phase 2: Store Role Clustering (Weeks 3-5)

**Goal**: Cluster 492 stores into 5 meaningful roles.

**Tasks:**
1. **Feature selection for clustering** — use only the demand/market features (Groups B-F, not sales targets). Consider PCA for dimensionality reduction
2. **Try multiple clustering approaches**:
   - **K-Means** (k=5) — simple, interpretable baseline
   - **Hierarchical clustering** — reveals natural groupings, dendrogram visualization
   - **Gaussian Mixture Models (GMM)** — softer boundaries, probability-based assignment
3. **Validate clusters** — Silhouette score, Davies-Bouldin index, and most importantly: **business interpretability**. Each cluster should map clearly to one of the 5 roles
4. **Label clusters** — based on their feature profiles, assign meaningful role names: High Growth (growing area, new housing, high income), Growth (moderate positive signals), Neutral (stable market), Maintain (aging housing, steady population), Defend (declining market, high competition)
5. **Profile each role** — create a "persona" for each cluster with key driver values

**Deliverable**: 5 well-defined store roles with business-meaningful profiles

---

### Phase 3: Growth Estimation & Target Allocation (Weeks 5-7)

**Goal**: Build the constrained allocation model.

**Tasks:**
1. **Estimate store-level growth rates** — use role-specific regression models (or gradient boosting) to predict next-year sales for each store based on its features and historical trajectory
2. **Seasonality modeling** — for each role, learn monthly/weekly sales phasing (e.g., Fourier decomposition or simple seasonal indices)
3. **Constrained optimization** — formulate the allocation problem: maximize target accuracy per store SUBJECT TO all store targets summing to the division plan. This is a constrained least-squares or proportional scaling problem
4. **Monthly target allocation** — apply role-specific seasonality profiles to annual targets to generate monthly targets
5. **Compare to baseline** — measure Plan Error (your allocation vs. current allocation) against actuals

**Deliverable**: Store-level annual + monthly targets for all 492 West Division stores

---

### Phase 4: Explainability & Planner Tool (Weeks 7-9)

**Goal**: Make the model transparent and usable.

**Tasks:**
1. **SHAP/Feature importance** — for each store, show which features drove its role assignment and growth estimate
2. **Peer benchmarking** — for each store, show its closest peers (same role, similar features) and their performance
3. **Risk flagging** — identify stores with high uncertainty in predictions (wide confidence intervals) for planner review
4. **Build a simple front-end** — a Streamlit or Gradio app where planners can: input a division growth target (%), see how it allocates to each store by role, drill into any store to see driver explanations, override and see downstream impact
5. **What-if scenarios** — allow planners to change the growth target and see real-time reallocation

**Deliverable**: Interactive planner tool with explainability

---

### Phase 5: Validation & Presentation (Weeks 9-11)

**Goal**: Prove the approach works better than the baseline.

**Tasks:**
1. **Back-testing** — use 2023 features to predict 2024 actuals, compare your allocation vs. the actual 2024 plan
2. **Key metrics**: Mean Absolute % Error (MAPE) by store, % of stores within ±10% of actual, % of stores within ±15% of actual, reduction in extreme misses vs. baseline
3. **Role stability analysis** — do stores stay in the same role when you re-run with different time periods? Stable roles = trustworthy model
4. **Prepare capstone presentation** — results, methodology, business impact, limitations, scale-up plan
5. **Document the full pipeline** — code, data dictionary, model cards

**Deliverable**: Final capstone report + presentation

---

### Timeline Summary

| Phase | Weeks | Key Output |
|-------|-------|------------|
| 0: Data Prep | 1-2 | Clean dataset (492 stores x 45 features) |
| 1: EDA | 2-3 | Baseline error analysis, key insights |
| 2: Clustering | 3-5 | 5 store roles with profiles |
| 3: Allocation Model | 5-7 | Constrained annual + monthly targets |
| 4: Explainability & Tool | 7-9 | Streamlit planner app |
| 5: Validation & Presentation | 9-11 | Back-test results, final report |

---

### Recommended Tech Stack

| Component | Tool | Why |
|-----------|------|-----|
| Data Processing | Python (pandas, numpy) | Standard, your team likely knows it |
| Clustering | scikit-learn (KMeans, GMM, Hierarchical) | Well-documented, easy to compare |
| Growth Modeling | XGBoost or LightGBM | Handles mixed feature types, built-in feature importance |
| Constrained Optimization | scipy.optimize or cvxpy | For constrained target allocation |
| Explainability | SHAP | Industry standard for ML explainability |
| Seasonality | statsmodels (seasonal decompose) or Prophet | Robust seasonal decomposition |
| Front-end | Streamlit | Fast prototyping, interactive, Python-native |
| Visualization | plotly, seaborn, matplotlib | Interactive charts for the planner tool |

---

### Key Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| 2023 H2 missing actuals | Reduces training data | Use 2024 as primary year; 2023 H1 as supplementary |
| Income 250K+ column 41.6% missing | Loss of high-income signal | Impute by Urbanicity median; or drop and rely on 150K-250K bracket |
| Cluster instability | Roles change with minor data changes | Use ensemble clustering; validate with multiple methods |
| Overfitting on 492 stores | Small sample for ML | Use regularization; prefer simpler models; cross-validate rigorously |
| Seasonality varies by store | One-size-fits-all monthly allocation fails | Use role-specific seasonal profiles, not chain-level |

---

*Document prepared for Group 8 Capstone | April 2026*
