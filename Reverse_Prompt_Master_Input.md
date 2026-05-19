# Reverse Prompt: The Master Input That Built This System

**What is this document?**
This reconstructs the complete set of instructions, context, and specifications that were provided to AI (Claude + Claude Code) to produce the entire Lowe's Store-Level Sales Target system — from raw data to a deployed live app at https://storewisetargets.streamlit.app/

The process used two AI tools working together: **Cowork** (Claude desktop app) for analysis, planning, and document creation, and **Claude Code** (terminal-based coding agent) for the Python pipeline, Streamlit app, and deployment.

---

## Phase 0: The Input Documents

Three documents were uploaded to Cowork as the starting knowledge base:

1. **`section6_phase1_feature_justification.docx`** — A detailed table of 40 recommended features with data-driven justification for each. Includes correlations, missing-value rates, business rationale, and phase classification (Keep / Engineer & Keep / Reserve). This was the analytical backbone that defined which features to use.

2. **`RoS_Dataset_Analysis_and_Comparison_260412_144205.pdf`** — A dataset health check report comparing three independent analyses (this analysis, GPT-based, and Claude-based). Confirmed: 269,412 rows, 195 columns, 1,727 stores, 0 missing values, 12 zero-sales rows, 102 collinear feature pairs, leakage risks (Plan Sales USD corr=0.986), and a naive lag-52 baseline of 8.90% wAPE.

3. **`lowes_model_app_google_ai_studio.html`** — A fully functional HTML/JavaScript prototype of the demo app, built for Google AI Studio. Contains: feature definitions, simulated model training with progress logging, fake results with random numbers, feature importance charts, store-level accuracy loop table, and Gemini API integration for AI commentary. This served as the exact UI specification for the Streamlit app.

4. **`stores_sales_master_file_masked_final.csv`** — The master dataset. 269,412 rows × 194 columns. 1,727 stores × 52 fiscal weeks × 3 years (FY2023–FY2025).

---

## Phase 1: Analysis & Project Planning (Cowork)

### Prompt Given
> "Please analyse and study all the docs very very closely and suggest a project plan — what actually needs to be done, what features to be used, and how to implement it."

### What the AI Did
- Read all three documents end-to-end
- Cross-referenced feature recommendations across documents
- Validated dataset dimensions against stated expectations
- Identified the leakage blacklist (Plan Sales USD, Invoice Count, Avg Ticket)
- Synthesized a 9-step implementation plan
- Made a key scope decision: supervised model as primary, clustering as post-prediction overlay
- Produced a professional Word document: `Capstone_Project_Implementation_Plan.docx`

### Key Decisions Made by AI
- Recommended 40 features in 6 families (Calendar, Lags, Store/Market, Demand/Housing, Competition)
- Recommended LightGBM as primary model with specific hyperparameters
- Defined success criteria: WAPE < 8%, Bias ±2%, R² > 0.88
- Designed the Store-Level Accuracy Loop as the project's key differentiator
- Proposed Role-of-Store as a post-prediction overlay (not a separate pipeline)
- Created a 5-week timeline with risk register

---

## Phase 2: Claude Code Starter Package (Cowork → Claude Code Handoff)

### Prompt Given
> "Take it to Claude Code — prepare a starter package."

### What Was Created

**CLAUDE.md** — The master context file placed in the project root. This is the single most important input. When Claude Code opens a project, it reads CLAUDE.md first and treats it as the project's "brain." Here is what it contained:

```
# Capstone 8 — Lowe's Store-Level Sales Target Model

## What This Project Is
An IIM Calcutta capstone (Group 8, APAL02) building an ML-powered store
sales target system for Lowe's. The current process uses a "peanut butter
spread" (3-year historical share) to set targets — we replace it with a
supervised model that accounts for local market dynamics.

## Three Deliverables
1. Working Python ML pipeline — LightGBM model on 269,412 store-week records
2. Interactive Streamlit demo app — mirrors the HTML prototype
3. Capstone report — to be done in Cowork

## Dataset
- File: data/stores_sales_master_file_masked_final.csv
- Rows: 269,412 (1,727 stores × 52 weeks × 3 years)
- Columns: 194
- Missing values: 0
- Zero-sales rows: 12 (exclude from training)
- Target variable: Actual Sales USD

## CRITICAL: Leakage Blacklist
NEVER use these as model inputs:
- Plan Sales USD (corr=0.986 with target)
- Invoice Count (corr=0.972)
- Avg Ticket (corr=0.133, same-period decomposition)

## Phase 1 Feature Set (40 Features)
[Full feature list with exact column names, correlations, engineering formulas]

## Model Configuration
[Exact hyperparameters for LightGBM, XGBoost, Ridge]

## Success Criteria
[WAPE, Bias, R² thresholds + baseline to beat]

## Store-Level Accuracy Loop
[Classification logic: Under-Targeted / Over-Targeted / Well-Calibrated]

## Role of Store Clustering
[5 segments derived from model outputs]

## Project Structure
[Exact folder/file layout]

## Build Order
1. src/feature_engineering.py
2. src/train_model.py
3. src/store_accuracy_loop.py
4. app/streamlit_app.py
```

**Three Starter Python Files:**

1. **`src/feature_engineering.py`** — Pre-written module with `build_phase1_features()` function, exact PHASE1_FEATURES list (40 features with correct column names), LEAKAGE_BLACKLIST, COMPETITOR_TA_COLUMNS (all 17 competitor column names), and `get_feature_matrix()` helper.

2. **`src/train_model.py`** — Full 8-step pipeline: load_and_validate() → build_phase1_features() → create_split() → train_and_evaluate() (LightGBM + XGBoost + Ridge + Naive baseline) → evaluate_predictions() → run_store_accuracy_loop() → assign_role_of_store() → export results.

3. **`src/store_accuracy_loop.py`** — Per-store metrics computation with quarterly bias breakdown, store classification, and Role-of-Store assignment.

**DEPLOYMENT.md** — Step-by-step deployment guide for Streamlit Community Cloud (GitHub → deploy → share URL with professor).

**Reference files copied into project:**
- `reference/lowes_model_app.html` — the HTML prototype as UI spec
- `reference/section6_phase1_feature_justification.docx`
- `data/stores_sales_master_file_masked_final.csv` — the 210MB master dataset

---

## Phase 3: Building the System (Claude Code)

### The Prompt to Claude Code
> "Read CLAUDE.md, then run `pip install -r requirements.txt` and `cd src && python train_model.py`. Fix any issues and show me the results."

> "Build the Streamlit app in app/streamlit_app.py. It should load pre-computed results from outputs/ (model pickle, store loop CSV, feature importance CSV). Mirror the UI from reference/lowes_model_app.html. Make sure it works for Streamlit Community Cloud deployment — no local file paths, use relative paths, and read secrets from st.secrets for any API keys."

### What Claude Code Built

**Model Pipeline** (`src/train_model.py`):
- Loads 269,412 rows, validates against expected dimensions
- Engineers all features via `build_phase1_features()`
- Creates rolling time split at 85th percentile of fiscal week dates
- Trains XGBoost (became best model by WAPE), LightGBM, Ridge
- Computes naive lag-52 baseline for comparison
- Runs store-level accuracy loop on holdout set
- Assigns Role-of-Store segments using quantile-based net_score
- Exports: model pickle, feature importance CSV, store loop CSV, model comparison CSV

**Streamlit App** (`app/streamlit_app.py` — 749 lines):
10 sections mirroring the HTML prototype:
1. Dataset Summary — metric cards (rows, stores, years, columns, features)
2. Phase 1 Feature Set — interactive radio buttons by family, color-coded tags
3. Model Configuration — two-column tables (model params + hyperparams), leakage guard info box
4. Model Performance — 6 metric cards + success criteria checklist + comparison table with highlighting
5. Store-Level Accuracy Loop — summary metrics + filterable store table (Under/Over/All) + feature importance bar chart
6. Store Bias Distribution — histogram with threshold lines + predicted vs actual scatter plot
7. Role-of-Store Segmentation — pie chart + stats table by segment
8. AI Commentary — Gemini 2.0 Flash API integration with structured prompt
9. Store Drill-Down — dropdown selector + quarterly bias bar chart per store
10. Download Results — CSV export buttons for store loop and feature importance

Two operating modes:
- **Pre-computed (Demo)**: Loads saved results from `outputs/` folder — instant display
- **Upload & Score**: User uploads new CSV → runs full feature engineering → scores with saved XGBoost model → runs store accuracy loop → shows live results

**Key Technical Details:**
- Custom CSS with Lowe's blue (#003087) theming
- Plotly charts (bar, histogram, scatter, pie) — not matplotlib
- `@st.cache_data` for pre-computed results, `@st.cache_resource` for model loading
- Sidebar radio for data source selection
- Wide layout (1400px max width)
- Gemini API key via `st.secrets` for cloud deployment

---

## Phase 4: Deployment (Claude Code + Manual)

### Steps Taken
1. Created `.streamlit/config.toml` for theme configuration
2. Created `.streamlit/secrets.toml` for Gemini API key
3. Added `.gitignore` to exclude large data files and secrets
4. Initialized git repo, committed all code
5. Pushed to GitHub
6. Connected to Streamlit Community Cloud
7. Deployed → live at https://storewisetargets.streamlit.app/

### The Pre-computation Strategy
Since the CSV is 210MB (too large for GitHub's 100MB limit) and model training takes time, the app ships with pre-computed results:
- `outputs/model_xgboost.pkl` — trained model + feature list
- `outputs/store_accuracy_loop_results.csv` — per-store metrics
- `outputs/feature_importance.csv` — ranked feature importances
- `outputs/model_comparison.csv` — 4-model comparison table

The professor clicks the URL → sees instant results. No waiting for model training.

---

## Phase 5: Documentation (Back to Cowork)

### Prompt Given
> "Phase 1 is ready. Can you provide me a PPT, or a full document to explain everyone in team what has been made in https://storewisetargets.streamlit.app/"

### What Was Produced
1. **Phase1_Completion_Presentation.pptx** — 14-slide PowerPoint deck (Lowe's blue theme)
2. **Phase1_Completion_Walkthrough.docx** — Detailed written walkthrough document

Both prominently feature the live app URL and are designed for dual audience (team + professor).

---

## The Key Insight: CLAUDE.md Was the Real Prompt

The most important thing that made this work was not any single conversation prompt — it was the **CLAUDE.md file**. This 128-line markdown file served as persistent context that Claude Code read at the start of every task. It contained:

- Exact problem definition
- Dataset specifications (rows, columns, stores, years)
- Leakage blacklist with correlations (the #1 risk in this project)
- All 40 feature names with exact column spellings from the CSV
- Engineering formulas for each derived feature
- Model hyperparameters
- Success criteria with specific thresholds
- The store accuracy loop classification rules
- Role-of-Store segment definitions
- Project structure and build order

Without CLAUDE.md, every prompt would have needed to re-explain the full context. With it, prompts could be short ("build the Streamlit app", "run the pipeline") because the AI already knew everything it needed.

---

## Total Artifacts Produced

| # | Artifact | Tool Used | Purpose |
|---|----------|-----------|---------|
| 1 | `CLAUDE.md` | Cowork | Master project context for Claude Code |
| 2 | `DEPLOYMENT.md` | Cowork | Deployment guide for Streamlit Cloud |
| 3 | `Capstone_Project_Implementation_Plan.docx` | Cowork | Full implementation plan |
| 4 | `src/feature_engineering.py` | Cowork → Claude Code | Feature engineering module (40 features) |
| 5 | `src/train_model.py` | Cowork → Claude Code | Full training pipeline |
| 6 | `src/store_accuracy_loop.py` | Cowork → Claude Code | Per-store metrics + Role-of-Store |
| 7 | `app/streamlit_app.py` | Claude Code | 749-line Streamlit app (10 sections) |
| 8 | `outputs/*.csv, *.pkl` | Claude Code (pipeline run) | Pre-computed model results |
| 9 | Live app deployment | Claude Code + Manual | https://storewisetargets.streamlit.app/ |
| 10 | `Phase1_Completion_Presentation.pptx` | Cowork | 14-slide team/professor deck |
| 11 | `Phase1_Completion_Walkthrough.docx` | Cowork | Detailed written walkthrough |
| 12 | This document | Cowork | Reverse prompt / process documentation |

---

## Lessons for the Team

1. **Start with analysis, not code.** The three input documents were analyzed thoroughly before a single line of Python was written. This prevented leakage bugs, feature selection mistakes, and scope creep.

2. **CLAUDE.md is your project's memory.** Writing a detailed context file upfront saved hours of re-explaining. Every AI interaction started from a shared understanding.

3. **Use the right tool for each job.** Cowork for analysis/planning/documents, Claude Code for Python/deployment. The handoff was a CLAUDE.md file + starter Python modules.

4. **Pre-compute for demos.** Shipping pre-computed results means the professor sees instant results instead of watching a model train for 5 minutes.

5. **The HTML prototype was invaluable.** Having a visual UI specification (the Google AI Studio app) meant the Streamlit app matched expectations exactly — no guessing about layout or features.

6. **Leakage control is non-negotiable.** The CLAUDE.md file had the leakage blacklist in ALL CAPS because one wrong feature inclusion would invalidate the entire model. The code has runtime guards that raise errors if blacklisted features sneak in.
