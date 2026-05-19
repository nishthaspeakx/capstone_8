# The Actual Prompt — What a Normal Person Would Say

**Files attached:** 
1. `stores_sales_master_file_masked_final.csv` (the store sales data)
2. `section6_phase1_feature_justification.docx` (our feature selection research)

---

## THE PROMPT

---

Hey, I need your help with my MBA capstone project at IIM Calcutta.

We're working on Lowe's (the US home improvement chain — think 1,700+ stores). Right now, Lowe's sets next year's sales targets for each store by just spreading the company total based on each store's historical sales share. It's basically a "peanut butter spread" — every store gets treated the same, no matter what's happening locally. The problem? In FY2025, about 26% of store-weeks missed their plan by more than 10%. That's terrible.

**Our idea:** Replace this with an ML model that actually looks at what's happening around each store — demographics, housing, competition, etc. — and predicts what each store should realistically sell.

I'm attaching two files:

1. **The dataset** — 3 years of weekly sales for ~1,727 stores. Each row is one store in one week. It has actual sales, planned sales, store size, demographics, housing data, competitor counts, etc. About 270K rows and 194 columns.

2. **Our feature research** — my team already did the analysis to figure out which of the 194 columns actually matter. We narrowed it down to about 40 features across 6 groups: time features, lag features (last week's sales, last month's, last quarter's, last year's), store characteristics, demographics/housing, and competition. The document has the full justification with correlations and business reasoning.

**What I need you to build:**

1. **A working ML model** that predicts weekly store sales using those ~40 features. Train it, test it, and show me if it beats the simple approach of "just use last year's same-week number" (which gets about 9% error). I want to see the error metrics and which features matter most.

2. **A store-by-store accuracy report** — don't just tell me the overall accuracy. I need to know WHICH stores the model gets wrong. Specifically, which stores are we setting targets too high for (they'll always miss) and which ones too low (they'll always beat it easily). This is the most important part — it tells planners where to intervene.

3. **A live web app** that I can share with my professor via a URL. He should be able to click a link, see the model results, browse individual stores, see charts, and understand what we built. It needs to look professional — Lowe's blue branding, clean layout, interactive charts. Think dashboard, not spreadsheet.

4. **Deploy it** so it actually works online. I need a link I can put in my presentation and my professor can open it on his laptop.

**Important things to know:**

- **Don't use Plan Sales, Invoice Count, or Avg Ticket as inputs to the model.** These are "same period" numbers — they're basically the answer we're trying to predict. Using them would be cheating (data leakage). Our research doc flags this.

- After the model runs, I also want to **group stores into 5 categories**: High Growth, Growth, Neutral, Maintain, and Defend — based on how the model sees them. This helps planners treat different stores differently instead of one-size-fits-all.

- The feature research doc has the exact column names and formulas for the engineered features (like combining income brackets into "low income share" or summing up competitor counts). Please follow those exactly.

- Make the code clean and modular — I need to explain this in my report and my teammates need to understand it.

Can you build all of this? Start by reading both files carefully, then build the Python code, then the web app, then deploy it.

---

## That's it. That's the prompt.

Everything else — the choice of XGBoost vs LightGBM, the hyperparameters, the 85th percentile time split, the quantile-based Role-of-Store scoring, the Plotly charts, the Streamlit framework, the pre-computed results strategy for fast loading, the Gemini AI commentary feature, the two-mode app design (demo + upload) — all of that was decided by the AI based on this input and the two attached files.

The only technical knowledge the prompter needed was:
- What the business problem is (bad target setting)
- What "data leakage" means (don't use the answer as an input)
- What they want to see (model results, per-store accuracy, live app)
- What the professor needs (a clickable URL)

The AI figured out the rest.
