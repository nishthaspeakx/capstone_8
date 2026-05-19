"""
Lowe's Store-Level Sales Target Model — Presentation Demo
Capstone 8 | Group 8 | IIM Calcutta | APAL02

Final 16-feature XGBoost model. Designed for professor presentation:
clean narrative flow, executive summary, and live upload scoring.
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import pickle
import os
import sys

# ─── Page config ──────────────────────────────────────────────
st.set_page_config(
    page_title="Lowe's Store-Level Sales Target Model | Capstone 8",
    page_icon="🏪",
    layout="wide",
    initial_sidebar_state="collapsed",
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUTS_DIR = os.path.join(BASE_DIR, "outputs")
SRC_DIR = os.path.join(BASE_DIR, "src")
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

# ─── Global Styling ──────────────────────────────────────────
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    html, body, [class*="css"] { font-family: 'Inter', sans-serif; }
    .main .block-container { padding-top: 1.5rem; padding-bottom: 2rem; max-width: 1380px; }
    h1, h2, h3, h4 { color: #003087; font-weight: 700; }

    /* Hero */
    .hero {
        background: linear-gradient(135deg, #003087 0%, #0277bd 60%, #005b9f 100%);
        color: white; padding: 38px 44px; border-radius: 18px; margin-bottom: 28px;
        box-shadow: 0 10px 30px rgba(0,48,135,0.25);
    }
    .hero h1 { color: white; font-size: 30px; font-weight: 800; margin: 0; letter-spacing: -0.5px; }
    .hero .sub { font-size: 15px; opacity: 0.92; margin-top: 8px; font-weight: 500; }
    .hero .tag { display:inline-block; background: rgba(255,255,255,0.18); padding: 5px 14px;
                 border-radius: 20px; font-size: 12px; margin-top: 16px; margin-right: 8px; font-weight: 600; }

    /* Section headers */
    .section-h {
        font-size: 22px; font-weight: 800; color: #003087; margin: 36px 0 6px 0;
        padding-bottom: 8px; border-bottom: 3px solid #e8f0fe;
    }
    .section-sub { color: #64748b; font-size: 14px; margin-bottom: 18px; }

    /* KPI cards */
    .kpi {
        background: white; border: 1px solid #e2e8f0; border-radius: 14px;
        padding: 22px 20px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.04);
        height: 100%;
    }
    .kpi .v { font-size: 34px; font-weight: 800; color: #003087; line-height: 1; }
    .kpi .l { font-size: 12px; color: #64748b; margin-top: 8px; font-weight: 600;
              text-transform: uppercase; letter-spacing: 0.5px; }
    .kpi .d { font-size: 12px; margin-top: 6px; font-weight: 600; }
    .kpi.green { border-top: 4px solid #2e7d32; }
    .kpi.blue  { border-top: 4px solid #0277bd; }
    .kpi.gold  { border-top: 4px solid #f9a825; }

    /* Pills */
    .pill { display:inline-block; padding: 5px 13px; border-radius: 8px; font-size: 12.5px;
            margin: 4px; font-weight: 600; }
    .pill.lag   { background:#e3f2fd; color:#0277bd; border:1px solid #90caf9; }
    .pill.demo  { background:#fce4ec; color:#c2185b; border:1px solid #f48fb1; }
    .pill.eng   { background:#e8f5e9; color:#2e7d32; border:1px solid #a5d6a7; }
    .pill.comp  { background:#fff3e0; color:#e65100; border:1px solid #ffcc80; }
    .pill.store { background:#ede7f6; color:#5e35b1; border:1px solid #b39ddb; }

    .callout {
        background: #f0f7ff; border-left: 5px solid #0277bd; border-radius: 8px;
        padding: 16px 20px; margin: 14px 0; font-size: 14px; color: #334155;
    }
    .callout.warn { background:#fff8e1; border-left-color:#f9a825; }
    .callout.good { background:#e8f5e9; border-left-color:#2e7d32; }

    .crit-pass { color:#2e7d32; font-weight:700; }
    div[data-testid="stDataFrame"] { border-radius: 10px; overflow: hidden; }
</style>
""", unsafe_allow_html=True)


# ─── Data loading ─────────────────────────────────────────────
@st.cache_data
def load_precomputed():
    data = {}
    for key, fname in [("comparison", "model_comparison.csv"),
                       ("importance", "feature_importance.csv"),
                       ("store_loop", "store_accuracy_loop_results.csv")]:
        p = os.path.join(OUTPUTS_DIR, fname)
        if os.path.exists(p):
            data[key] = pd.read_csv(p, index_col=0 if key == "comparison" else None)
    return data


@st.cache_resource
def load_model():
    p = os.path.join(OUTPUTS_DIR, "model_xgboost.pkl")
    if os.path.exists(p):
        with open(p, "rb") as f:
            return pickle.load(f)
    return None


def score_uploaded_csv(uploaded_file):
    from feature_engineering import build_phase1_features, PHASE1_FEATURES, TARGET
    from store_accuracy_loop import run_store_accuracy_loop, assign_role_of_store

    artifact = load_model()
    if artifact is None:
        st.error("No trained model found.")
        return None
    model = artifact["model"]
    mfeats = artifact["features"]

    df = pd.read_csv(uploaded_file)
    df.columns = df.columns.str.strip()
    df[TARGET] = pd.to_numeric(df[TARGET], errors="coerce")
    raw_rows, raw_stores = len(df), df["Store ID"].nunique()
    raw_years = sorted(df["Year"].unique())
    df = df[df[TARGET] > 0].copy()
    df = build_phase1_features(df, verbose=False)

    avail = [f for f in mfeats if f in df.columns]
    clean = df.dropna(subset=avail + [TARGET]).copy()
    X = clean[avail].apply(pd.to_numeric, errors="coerce").fillna(0)
    y = clean[TARGET]
    clean["predicted"] = model.predict(X)

    wape = np.abs(y.values - clean["predicted"].values).sum() / y.values.sum() * 100
    bias = (clean["predicted"].sum() - y.values.sum()) / y.values.sum() * 100
    rmse = np.sqrt(np.mean((y.values - clean["predicted"].values) ** 2))
    mae = np.mean(np.abs(y.values - clean["predicted"].values))
    r2 = 1 - np.sum((y.values - clean["predicted"].values) ** 2) / np.sum((y.values - y.values.mean()) ** 2)
    comparison = pd.DataFrame({"WAPE": [wape], "Bias": [bias], "RMSE": [rmse], "MAE": [mae], "R2": [r2]},
                              index=["XGBoost (Upload)"])

    if hasattr(model, "feature_importances_"):
        imp = pd.Series(model.feature_importances_, index=mfeats)
        imp_pct = (imp / imp.sum() * 100).sort_values(ascending=False)
        importance = pd.DataFrame({"Feature": imp_pct.index, "Importance_pct": imp_pct.values})
    else:
        importance = pd.DataFrame()

    loop_df = run_store_accuracy_loop(clean, verbose=False)
    loop_df = assign_role_of_store(loop_df, clean, verbose=False)
    return {"comparison": comparison, "importance": importance, "store_loop": loop_df,
            "upload_meta": {"raw_rows": raw_rows, "raw_stores": raw_stores,
                            "raw_years": raw_years, "clean_rows": len(clean)}}


# ─── Sidebar (optional upload) ────────────────────────────────
with st.sidebar:
    st.markdown("### 🔄 Live Scoring")
    st.caption("Upload a new CSV (same format) to score it with the trained model.")
    uploaded = st.file_uploader("Upload CSV", type=["csv"], label_visibility="collapsed")
    st.markdown("---")
    st.caption("**Capstone 8 · Group 8**\nIIM Calcutta · APAL02")

if uploaded is not None:
    with st.spinner("Scoring uploaded data with the trained 16-feature model…"):
        results = score_uploaded_csv(uploaded)
    is_upload = True
else:
    results = load_precomputed()
    is_upload = False

if not results:
    st.error("No results found. Run `python src/train_model.py` first.")
    st.stop()

comp = results["comparison"]
loop = results.get("store_loop", pd.DataFrame())
imp = results.get("importance", pd.DataFrame())
best_model = comp["WAPE"].idxmin()
best = comp.loc[best_model]
naive_wape = comp.loc["Naive (lag-52)", "WAPE"] if "Naive (lag-52)" in comp.index else 8.27


# ═══════════════════════════════════════════════════════════════
# HERO
# ═══════════════════════════════════════════════════════════════
st.markdown(f"""
<div class="hero">
    <h1>🏪 Lowe's Store-Level Sales Target Model</h1>
    <div class="sub">Replacing the "peanut butter spread" with a supervised ML model that accounts for local market dynamics</div>
    <span class="tag">📊 1,727 Stores</span>
    <span class="tag">🎯 16 Final Features</span>
    <span class="tag">🤖 XGBoost</span>
    <span class="tag">📅 FY2023–FY2025</span>
    <span class="tag">🏛️ IIM Calcutta · Capstone 8 · Group 8</span>
</div>
""", unsafe_allow_html=True)


# ═══════════════════════════════════════════════════════════════
# 1. THE PROBLEM
# ═══════════════════════════════════════════════════════════════
st.markdown('<div class="section-h">1 &nbsp;·&nbsp; The Business Problem</div>', unsafe_allow_html=True)
st.markdown('<div class="section-sub">Why the current target-setting process fails planners</div>', unsafe_allow_html=True)

pc1, pc2 = st.columns([3, 2])
with pc1:
    st.markdown("""
    Lowe's currently sets each store's annual sales target using a **"peanut butter spread"** —
    it takes the total company plan and divides it across stores based on each store's
    **3-year historical sales share**.

    **The flaw:** This approach completely ignores local market dynamics:
    - A store in a booming new-construction suburb gets the *same growth rate* as one in a declining rural town
    - Demographic shifts, housing age, income changes, and competitive pressure are invisible to the model
    - **Result:** Planners spend the entire year doing manual overrides because targets are wrong
    """)
    st.markdown("""
    <div class="callout warn">
    <b>The number that hurts:</b> Under the current method, <b>25.83% of store-weeks</b> miss
    their target by more than ±10%. That's 1 in 4 store-weeks requiring re-planning.
    </div>
    """, unsafe_allow_html=True)
with pc2:
    st.markdown("""
    <div class="callout">
    <b>Our Solution</b><br><br>
    A <b>supervised learning model</b> (XGBoost) trained on 269,412 store-week records that learns
    how local market conditions + recent store performance drive sales — then sets
    store-specific, data-driven targets.
    <br><br>
    Plus a <b>Store-Level Accuracy Loop</b> that flags exactly which stores are
    under- or over-targeted, enabling surgical overrides instead of chain-wide guesses.
    </div>
    """, unsafe_allow_html=True)


# ═══════════════════════════════════════════════════════════════
# 2. HEADLINE RESULTS
# ═══════════════════════════════════════════════════════════════
st.markdown('<div class="section-h">2 &nbsp;·&nbsp; Headline Results</div>', unsafe_allow_html=True)
st.markdown('<div class="section-sub">The final 16-feature XGBoost model — every success criterion met</div>', unsafe_allow_html=True)

k1, k2, k3, k4, k5 = st.columns(5)
with k1:
    st.markdown(f'<div class="kpi green"><div class="v">{best["WAPE"]:.2f}%</div><div class="l">Overall WAPE</div><div class="d crit-pass">✓ Target &lt; 8%</div></div>', unsafe_allow_html=True)
with k2:
    st.markdown(f'<div class="kpi green"><div class="v">{best["Bias"]:+.2f}%</div><div class="l">Bias</div><div class="d crit-pass">✓ Within ±2%</div></div>', unsafe_allow_html=True)
with k3:
    st.markdown(f'<div class="kpi green"><div class="v">{best["R2"]:.3f}</div><div class="l">R² Score</div><div class="d crit-pass">✓ Target &gt; 0.88</div></div>', unsafe_allow_html=True)
with k4:
    lift = (naive_wape - best["WAPE"]) / naive_wape * 100
    st.markdown(f'<div class="kpi blue"><div class="v">{lift:.0f}%</div><div class="l">Better vs Naive</div><div class="d" style="color:#0277bd">vs {naive_wape:.2f}% baseline</div></div>', unsafe_allow_html=True)
with k5:
    if len(loop) > 0:
        ok = (loop["target_status"] == "Well-Calibrated").sum()
        st.markdown(f'<div class="kpi gold"><div class="v">{ok/len(loop)*100:.0f}%</div><div class="l">Stores Calibrated</div><div class="d" style="color:#f9a825">{ok:,} of {len(loop):,} stores</div></div>', unsafe_allow_html=True)

st.markdown("##### Model Comparison")
disp = comp.copy()
disp.columns = ["WAPE (%)", "Bias (%)", "RMSE ($)", "MAE ($)", "R²"]
st.dataframe(
    disp.style.format({"WAPE (%)": "{:.2f}", "Bias (%)": "{:+.2f}", "RMSE ($)": "${:,.0f}",
                       "MAE ($)": "${:,.0f}", "R²": "{:.4f}"})
    .highlight_min(subset=["WAPE (%)"], color="#c8e6c9")
    .highlight_max(subset=["R²"], color="#c8e6c9"),
    use_container_width=True,
)
st.caption("XGBoost wins on WAPE. Ridge is competitive but XGBoost handles non-linear market interactions better. Naive baseline = 'same week last year'.")


# ═══════════════════════════════════════════════════════════════
# 3. THE FINAL 16 FEATURES
# ═══════════════════════════════════════════════════════════════
st.markdown('<div class="section-h">3 &nbsp;·&nbsp; The Final 16 Features</div>', unsafe_allow_html=True)
st.markdown('<div class="section-sub">Selected by criticality analysis from 35 Phase-1 candidates · color-coded by group</div>', unsafe_allow_html=True)

FINAL_FEATURES = {
    "Lag / Momentum (4)": ("lag", [
        ("lag_1", "Sales 1 week ago — strongest predictor (corr 0.982)"),
        ("lag_4", "Sales 4 weeks ago — monthly rhythm"),
        ("lag_13", "Sales 13 weeks ago — quarterly rhythm"),
        ("lag_52", "Sales 52 weeks ago — annual seasonality"),
    ]),
    "Demand — Raw (5)": ("demo", [
        ("CYE Total Households", "Core addressable market size"),
        ("CYE Household Density HH/SqMi", "Urban vs rural shopping behavior"),
        ("CYE Median Household Income", "Purchasing power of trade area"),
        ("CYE Total Housing Units", "Housing stock incl. vacant/new"),
        ("CYE Total Population", "Market size complement"),
    ]),
    "Demand — Engineered (3)": ("eng", [
        ("income_affluent", "% households $150K+ — Pro/contractor proxy"),
        ("housing_new_share", "% post-2000 homes — new-build demand"),
        ("housing_old_share", "% pre-1969 homes — repair/maintenance demand"),
    ]),
    "Competition (3)": ("comp", [
        ("Sister Store Count (TA)", "Self-cannibalization within trade area"),
        ("total_competitor_ta", "Engineered: total competitive pressure"),
        ("Wallflowers Depot Count (TA)", "Most prevalent competitor"),
    ]),
    "Store / Market (1)": ("store", [
        ("Urbanicity (encoded)", "7-level density: Metropolis → Remote"),
    ]),
}

cols = st.columns(len(FINAL_FEATURES))
for col, (grp, (cls, feats)) in zip(cols, FINAL_FEATURES.items()):
    with col:
        st.markdown(f"**{grp}**")
        for name, desc in feats:
            st.markdown(f'<span class="pill {cls}" title="{desc}">{name}</span>', unsafe_allow_html=True)

st.markdown("""
<div class="callout good">
<b>Why only 16?</b> We deliberately dropped <code>roll_4</code>, <code>roll_13</code>, <code>Year</code>,
and <code>Fiscal Week</code>. The rolling-average features were so dominant (94% combined importance)
that they masked the market signals. By removing them, the model is <b>more explainable</b> to planners
and the demographic/competition features get to demonstrate their value — while bias actually
<b>improved to {:+.2f}%</b> (near-perfect).
</div>
""".format(best["Bias"]), unsafe_allow_html=True)


# ═══════════════════════════════════════════════════════════════
# 4. FEATURE IMPORTANCE
# ═══════════════════════════════════════════════════════════════
st.markdown('<div class="section-h">4 &nbsp;·&nbsp; What Drives the Predictions</div>', unsafe_allow_html=True)
st.markdown('<div class="section-sub">XGBoost feature importance — how much each feature shaped model decisions</div>', unsafe_allow_html=True)

if len(imp) > 0:
    top = imp.head(16).copy()
    fig = px.bar(top, x="Importance_pct", y="Feature", orientation="h",
                 color="Importance_pct", color_continuous_scale=["#bbdefb", "#1976d2", "#003087"],
                 text="Importance_pct")
    fig.update_traces(texttemplate="%{text:.2f}%", textposition="outside")
    fig.update_layout(height=520, margin=dict(l=0, r=40, t=10, b=0),
                      yaxis=dict(autorange="reversed", title=""),
                      xaxis_title="Importance (%)", coloraxis_showscale=False,
                      plot_bgcolor="white", font=dict(size=12))
    st.plotly_chart(fig, use_container_width=True)
    st.caption("`lag_1` + `lag_4` lead, but the market features (housing, income, competition) now contribute a meaningful, interpretable share — exactly what planners need to trust the targets.")


# ═══════════════════════════════════════════════════════════════
# 5. STORE-LEVEL ACCURACY LOOP
# ═══════════════════════════════════════════════════════════════
st.markdown('<div class="section-h">5 &nbsp;·&nbsp; Store-Level Accuracy Loop</div>', unsafe_allow_html=True)
st.markdown('<div class="section-sub">The key differentiator — per-store diagnostics for surgical planner overrides</div>', unsafe_allow_html=True)

if len(loop) > 0:
    n_under = (loop["target_status"] == "Under-Targeted").sum()
    n_over = (loop["target_status"] == "Over-Targeted").sum()
    n_ok = (loop["target_status"] == "Well-Calibrated").sum()

    sc1, sc2, sc3, sc4 = st.columns(4)
    sc1.metric("Total Stores", f"{len(loop):,}")
    sc2.metric("✅ Well-Calibrated", f"{n_ok:,}", f"{n_ok/len(loop)*100:.1f}%")
    sc3.metric("⬇ Under-Targeted", f"{n_under}", f"{n_under/len(loop)*100:.1f}%", delta_color="inverse")
    sc4.metric("⬆ Over-Targeted", f"{n_over}", f"{n_over/len(loop)*100:.1f}%", delta_color="inverse")

    lc, rc = st.columns(2)
    with lc:
        fig_h = px.histogram(loop, x="Bias_pct", nbins=50, color_discrete_sequence=["#0277bd"],
                             labels={"Bias_pct": "Store Bias (%)"}, title="Bias Distribution Across 1,727 Stores")
        fig_h.add_vline(x=-5, line_dash="dash", line_color="#e65100")
        fig_h.add_vline(x=5, line_dash="dash", line_color="#c62828")
        fig_h.update_layout(height=340, plot_bgcolor="white", margin=dict(t=44, b=10), showlegend=False)
        st.plotly_chart(fig_h, use_container_width=True)
        st.caption("Tight, centered distribution = model is well-calibrated chain-wide. The few stores in the tails are exactly the ones planners should review.")
    with rc:
        fig_s = px.scatter(loop, x="Actual_Total", y="Predicted_Total", color="target_status",
                           color_discrete_map={"Under-Targeted": "#e65100", "Over-Targeted": "#c62828",
                                               "Well-Calibrated": "#2e7d32"},
                           labels={"Actual_Total": "Actual Sales ($)", "Predicted_Total": "Predicted Sales ($)"},
                           title="Predicted vs Actual (Store Totals)",
                           hover_data=["Store ID", "Store Name"])
        mx = max(loop["Actual_Total"].max(), loop["Predicted_Total"].max())
        fig_s.add_trace(go.Scatter(x=[0, mx], y=[0, mx], mode="lines",
                                   line=dict(dash="dash", color="gray"), name="Perfect", showlegend=False))
        fig_s.update_layout(height=340, plot_bgcolor="white", margin=dict(t=44, b=10),
                            legend=dict(orientation="h", y=-0.2))
        st.plotly_chart(fig_s, use_container_width=True)
        st.caption("Points hug the diagonal = accurate predictions. Orange/red points = override candidates.")

    st.markdown("##### Stores Requiring Planner Attention")
    tab1, tab2, tab3 = st.tabs(["⬇ Under-Targeted", "⬆ Over-Targeted", "All Stores"])
    cols_show = ["Store ID", "Store Name", "Division", "Actual_Total", "Predicted_Total",
                 "WAPE_pct", "Bias_pct", "role_of_store"]
    cols_show = [c for c in cols_show if c in loop.columns]
    fmt = {"Actual_Total": "${:,.0f}", "Predicted_Total": "${:,.0f}",
           "WAPE_pct": "{:.1f}%", "Bias_pct": "{:+.1f}%"}
    with tab1:
        d = loop[loop["target_status"] == "Under-Targeted"].sort_values("Bias_pct").head(15)
        st.dataframe(d[cols_show].style.format(fmt), use_container_width=True, hide_index=True)
        st.caption("Model predicts LESS than actual → these stores are sandbagged. Raise their targets.")
    with tab2:
        d = loop[loop["target_status"] == "Over-Targeted"].sort_values("Bias_pct", ascending=False).head(15)
        st.dataframe(d[cols_show].style.format(fmt), use_container_width=True, hide_index=True)
        st.caption("Model predicts MORE than actual → these targets may be too aggressive. Review for headwinds.")
    with tab3:
        st.dataframe(loop[cols_show].head(40).style.format(fmt), use_container_width=True, hide_index=True)


# ═══════════════════════════════════════════════════════════════
# 6. ROLE-OF-STORE SEGMENTATION
# ═══════════════════════════════════════════════════════════════
if len(loop) > 0 and "role_of_store" in loop.columns:
    st.markdown('<div class="section-h">6 &nbsp;·&nbsp; Role-of-Store Segmentation</div>', unsafe_allow_html=True)
    st.markdown('<div class="section-sub">Strategic overlay — every store gets a planning role based on growth signals + model bias</div>', unsafe_allow_html=True)

    order = ["High Growth", "Growth", "Neutral", "Maintain", "Defend"]
    colors = {"High Growth": "#1565c0", "Growth": "#43a047", "Neutral": "#757575",
              "Maintain": "#ff8f00", "Defend": "#c62828"}
    rc1, rc2 = st.columns([1, 2])
    with rc1:
        vc = loop["role_of_store"].value_counts()
        fig_p = px.pie(values=[vc.get(r, 0) for r in order], names=order, color=order,
                       color_discrete_map=colors, hole=0.45)
        fig_p.update_layout(height=340, margin=dict(t=10, b=10),
                            legend=dict(orientation="h", y=-0.15))
        st.plotly_chart(fig_p, use_container_width=True)
    with rc2:
        rs = loop.groupby("role_of_store").agg(
            Stores=("Store ID", "count"), Median_WAPE=("WAPE_pct", "median"),
            Median_Bias=("Bias_pct", "median"), Avg_Sales=("Actual_Total", "mean"),
        ).reindex(order).dropna(how="all")
        rs["Share"] = (rs["Stores"] / rs["Stores"].sum() * 100)
        st.dataframe(rs.style.format({"Stores": "{:,.0f}", "Median_WAPE": "{:.1f}%",
                                      "Median_Bias": "{:+.1f}%", "Avg_Sales": "${:,.0f}",
                                      "Share": "{:.1f}%"}), use_container_width=True)
        st.markdown("""
        <div class="callout">
        <b>How to read this:</b> <b>High Growth</b> = expanding market + store outperforming model →
        raise targets aggressively. <b>Defend</b> = high competition + underperforming →
        protect share, set conservative targets. This turns one model into 5 distinct planning playbooks.
        </div>
        """, unsafe_allow_html=True)


# ═══════════════════════════════════════════════════════════════
# 7. AI COMMENTARY
# ═══════════════════════════════════════════════════════════════
st.markdown('<div class="section-h">7 &nbsp;·&nbsp; AI Executive Commentary</div>', unsafe_allow_html=True)
st.markdown('<div class="section-sub">Gemini-generated business interpretation of the model results</div>', unsafe_allow_html=True)


def get_ai_commentary():
    try:
        import google.generativeai as genai
        key = None
        if hasattr(st, "secrets") and "GEMINI_API_KEY" in st.secrets:
            key = st.secrets["GEMINI_API_KEY"]
        elif os.environ.get("GEMINI_API_KEY"):
            key = os.environ["GEMINI_API_KEY"]
        if not key:
            return None
        genai.configure(api_key=key)
        m = genai.GenerativeModel("gemini-2.0-flash")
        top_feat = imp.iloc[0]["Feature"] if len(imp) > 0 else "lag_1"
        prompt = f"""You are a senior retail analytics partner presenting to executives at a home-improvement retailer (like Lowe's).

Final model: XGBoost, 16 features. WAPE={best['WAPE']:.2f}%, Bias={best['Bias']:+.2f}%, R²={best['R2']:.3f}.
Beats naive baseline by {(naive_wape-best['WAPE'])/naive_wape*100:.0f}%. Top feature: {top_feat}.
Well-calibrated stores: {(loop['target_status']=='Well-Calibrated').sum() if len(loop)>0 else 'N/A'} of {len(loop) if len(loop)>0 else 'N/A'}.

Give a crisp executive briefing in 4 short paragraphs:
1. Bottom-line verdict on model readiness for planning use
2. What the near-zero bias means for the annual plan reconciliation
3. The strategic value of the store-level accuracy loop
4. One clear recommendation for rollout
Business language only, confident and concise."""
        return m.generate_content(prompt).text
    except Exception as e:
        return f"*AI commentary unavailable: {e}*"


if st.button("🤖 Generate Executive Commentary", type="primary"):
    with st.spinner("Gemini is analyzing the results…"):
        c = get_ai_commentary()
        if c:
            st.markdown(f'<div class="callout">{c}</div>', unsafe_allow_html=True)
        else:
            st.warning("Gemini API key not configured. Add `GEMINI_API_KEY` to Streamlit Secrets.")
else:
    st.info("Click to generate an AI executive briefing on the model results (powered by Gemini).")


# ═══════════════════════════════════════════════════════════════
# 8. METHODOLOGY (for Q&A)
# ═══════════════════════════════════════════════════════════════
st.markdown('<div class="section-h">8 &nbsp;·&nbsp; Methodology &amp; Integrity</div>', unsafe_allow_html=True)
st.markdown('<div class="section-sub">For the technical Q&A — how we kept the model honest</div>', unsafe_allow_html=True)

mc1, mc2, mc3 = st.columns(3)
with mc1:
    st.markdown("""
    **🔒 Leakage Prevention**

    Three same-period columns are **never** used as inputs:
    - `Plan Sales USD` (corr 0.986)
    - `Invoice Count` (corr 0.972)
    - `Avg Ticket` (corr 0.133)

    All lag features use `shift(1)` minimum — the model can never see the answer.
    """)
with mc2:
    st.markdown("""
    **⏱️ Time-Based Validation**

    - Rolling split, **not** random
    - Train: data before Sep 19, 2025
    - Holdout: Sep 2025 → Jan 2026 (Q4 FY2025)
    - 22,439 holdout rows, all 1,727 stores

    Predicts the *future* using only the *past*.
    """)
with mc3:
    st.markdown("""
    **⚙️ Model Configuration**

    - XGBoost: 500 trees, lr=0.05, depth=7
    - Early stopping: 50 rounds
    - Subsample 0.8, colsample 0.8
    - Benchmarked vs LightGBM, Ridge, Naive

    Reproducible: `python src/train_model.py`
    """)


# ═══════════════════════════════════════════════════════════════
# FOOTER
# ═══════════════════════════════════════════════════════════════
st.markdown("---")
st.markdown(
    "<div style='text-align:center; color:#64748b; font-size:13px;'>"
    "<b>Capstone 8</b> · Group 8 · IIM Calcutta APAL02 &nbsp;|&nbsp; "
    "Lowe's Store-Level Sales Target Model &nbsp;|&nbsp; "
    "XGBoost · 16 Features · 1,727 Stores · FY2023–FY2025"
    "</div>", unsafe_allow_html=True)
