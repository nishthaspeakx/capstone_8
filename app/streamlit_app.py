"""
Lowe's Store-Level Sales Target Model — Streamlit Demo App
Capstone 8 | IIM Calcutta | APAL02

Loads pre-computed model results from outputs/ and renders an
interactive dashboard mirroring the HTML prototype.
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import pickle
import os

# ─── Page config ──────────────────────────────────────────────
st.set_page_config(
    page_title="Lowe's Store-Level Sales Target Model",
    page_icon="🏪",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ─── Paths ────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUTS_DIR = os.path.join(BASE_DIR, "outputs")
DATA_DIR = os.path.join(BASE_DIR, "data")

# ─── Custom CSS (Lowe's blue theme) ──────────────────────────
st.markdown("""
<style>
    .main .block-container { padding-top: 1rem; max-width: 1400px; }
    h1, h2, h3 { color: #003087; }
    .stMetric > div { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
    .stMetric label { color: #64748b !important; font-size: 12px !important; }
    .feature-tag { display: inline-block; background: #e8f0fe; color: #1565c0;
                   font-size: 12px; padding: 3px 10px; border-radius: 4px; margin: 3px; }
    .feature-tag.engineered { background: #e8f5e9; color: #2e7d32; }
    .feature-tag.reserve { background: #fff8e1; color: #f57f17; }
    .badge-under { background: #fff3e0; color: #e65100; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .badge-over { background: #fce4ec; color: #c62828; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .badge-ok { background: #e8f5e9; color: #2e7d32; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
</style>
""", unsafe_allow_html=True)

# ─── Header ───────────────────────────────────────────────────
st.markdown("""
<div style="background: linear-gradient(135deg, #003087 0%, #005b9f 100%); color: white;
            padding: 20px 32px; border-radius: 12px; margin-bottom: 20px;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🏪 Lowe's Store-Level Sales Target — Supervised Model Demo</h1>
    <p style="opacity: 0.85; margin-top: 4px; font-size: 14px;">
        Phase 1 Feature Set (35 Features) · LightGBM / XGBoost · Store-Level Accuracy Loop · AI Commentary
    </p>
</div>
""", unsafe_allow_html=True)


# ─── Load pre-computed results ────────────────────────────────
@st.cache_data
def load_results():
    """Load all pre-computed model outputs."""
    data = {}

    # Model comparison
    comp_path = os.path.join(OUTPUTS_DIR, "model_comparison.csv")
    if os.path.exists(comp_path):
        data["comparison"] = pd.read_csv(comp_path, index_col=0)

    # Feature importance
    imp_path = os.path.join(OUTPUTS_DIR, "feature_importance.csv")
    if os.path.exists(imp_path):
        data["importance"] = pd.read_csv(imp_path)

    # Store accuracy loop
    loop_path = os.path.join(OUTPUTS_DIR, "store_accuracy_loop_results.csv")
    if os.path.exists(loop_path):
        data["store_loop"] = pd.read_csv(loop_path)

    # Model pickle (for metadata)
    pkl_path = os.path.join(OUTPUTS_DIR, "model_xgboost.pkl")
    if os.path.exists(pkl_path):
        with open(pkl_path, "rb") as f:
            data["model_artifact"] = pickle.load(f)

    return data


results = load_results()

if not results:
    st.error("No pre-computed results found in outputs/. Run `python src/train_model.py` first.")
    st.stop()


# ═══════════════════════════════════════════════════════════════
# SECTION 1: Dataset Summary
# ═══════════════════════════════════════════════════════════════
st.markdown("### 📂 Dataset Summary")

c1, c2, c3, c4, c5 = st.columns(5)
c1.metric("Total Rows", "269,412")
c2.metric("Stores", "1,727")
c3.metric("Fiscal Years", "2023–2025")
c4.metric("Columns", "194")
c5.metric("Phase 1 Features", "35")

# Validation details
with st.expander("Dataset Validation Details"):
    st.markdown("""
    | Check | Result |
    |-------|--------|
    | Rows | 269,412 (1,727 stores × 52 weeks × 3 years) |
    | Missing target rows | 44,902 (16.7%) — removed before training |
    | Zero-sales rows | 12 — excluded from training |
    | After cleaning | 224,498 usable rows |
    | Leakage blacklist | Plan Sales USD (corr=0.986), Invoice Count (corr=0.973), Avg Ticket (corr=0.126) — all excluded |
    """)


# ═══════════════════════════════════════════════════════════════
# SECTION 2: Phase 1 Feature Set
# ═══════════════════════════════════════════════════════════════
st.markdown("### 🔬 Phase 1 Feature Set")

FEATURES = {
    "Calendar (2)": [
        ("Year", "raw", "Macro drift; avg sales declined ~13% 2023→2025"),
        ("Fiscal Week", "raw", "Weekly seasonality; 96% spread peak-to-trough"),
    ],
    "Engineered Lags (6)": [
        ("lag_1 (shift=1)", "engineered", "corr=0.982 — strongest single predictor"),
        ("lag_4 (shift=4)", "engineered", "corr=0.964 — monthly rhythm"),
        ("lag_13 (shift=13)", "engineered", "corr=0.913 — quarterly rhythm"),
        ("lag_52 (shift=52)", "engineered", "corr=0.953 — annual seasonality"),
        ("roll_4 (4wk mean)", "engineered", "corr=0.981 — short-term smoother"),
        ("roll_13 (13wk mean)", "engineered", "corr=0.964 — seasonal trend smoother"),
    ],
    "Store/Market (5)": [
        ("Sales Floor Size", "raw", "Store capacity proxy"),
        ("Garden Ctr Size", "raw", "Traffic driving category"),
        ("Urbanicity", "raw", "7 levels: Metropolis=$1.63M vs Large City=$930K"),
        ("CBSA Type", "raw", "Metro vs Micro vs Non-CBSA"),
        ("CBSA Metro Size", "raw", "4 categories of metro area size"),
    ],
    "Demand/Housing (16)": [
        ("CYE Total Households", "raw", "Core addressable market"),
        ("CYE HH Density/SqMi", "raw", "Density complement"),
        ("CYE Median HH Income", "raw", "Best purchasing-power summary"),
        ("CAGR HH 2010-2020", "raw", "Market growth trajectory"),
        ("CYE Total Housing Units", "raw", "Housing stock size"),
        ("CYE % HU Owned", "raw", "Ownership → improvement spend"),
        ("CYE Median Yr HU Built", "raw", "Housing age indicator"),
        ("CYE Avg Residence Years", "raw", "Behavioral trigger"),
        ("CYE Total Population", "raw", "Market size complement"),
        ("CYE Median Age Pop", "raw", "Age-driven spending"),
        ("CYE Veteran Population", "raw", "10% discount segment"),
        ("income_low_share", "engineered", "<25K + 25-35K combined"),
        ("income_diy_core", "engineered", "50-75K + 75-100K combined"),
        ("income_affluent", "engineered", "150-250K + 250K+ combined"),
        ("housing_old_share", "engineered", "Pre-1949 + 1950s + 1960s"),
        ("housing_new_share", "engineered", "2000s + 2010s; top static feature"),
    ],
    "Competition (6)": [
        ("Sister Store Count (TA)", "raw", "Self-cannibalization proxy"),
        ("total_competitor_ta", "engineered", "Sum of all 17 competitor counts"),
        ("Nut Cracker Tools (TA)", "raw", "Major competitor"),
        ("Wallflowers Depot (TA)", "raw", "Highest avg count"),
        ("Iggy Pop Hardware (TA)", "raw", "Highest competitor correlation"),
        ("Horn Ok Tools (TA)", "raw", "High-coverage competitor"),
    ],
}

feature_group = st.radio(
    "Feature Group",
    ["All"] + list(FEATURES.keys()),
    horizontal=True,
    label_visibility="collapsed",
)

if feature_group == "All":
    groups_to_show = FEATURES
else:
    groups_to_show = {feature_group: FEATURES[feature_group]}

tags_html = ""
for group_name, features in groups_to_show.items():
    for name, ftype, desc in features:
        css_class = "engineered" if ftype == "engineered" else "reserve" if ftype == "reserve" else ""
        tags_html += f'<span class="feature-tag {css_class}" title="{desc}">{name}</span>'

st.markdown(tags_html, unsafe_allow_html=True)
st.caption("🟦 Raw features  🟩 Engineered features  🟨 Reserve features")


# ═══════════════════════════════════════════════════════════════
# SECTION 3: Model Configuration
# ═══════════════════════════════════════════════════════════════
st.markdown("### ⚙️ Model Configuration")

col_a, col_b = st.columns(2)
with col_a:
    st.markdown("""
    | Parameter | Value |
    |-----------|-------|
    | Primary Model | XGBoost (best WAPE) |
    | Secondary | LightGBM |
    | Baseline | Ridge Regression |
    | Naive Baseline | Lag-52 (last year same week) |
    | Holdout | Rolling time split (85th percentile cutoff) |
    | Early Stopping | 50 rounds on validation |
    """)
with col_b:
    st.markdown("""
    | Hyperparameter | Value |
    |----------------|-------|
    | n_estimators | 500 |
    | learning_rate | 0.05 |
    | max_depth | 7 (XGB) / 8 (LGB) |
    | subsample | 0.8 |
    | colsample_bytree | 0.8 |
    | min_child_samples | 50 (LGB) |
    """)

st.info("**Leakage Guard:** Plan Sales USD (corr=0.986), Invoice Count (corr=0.973), and Avg Ticket (corr=0.126) are **never** used as model inputs — they are same-period measures.")


# ═══════════════════════════════════════════════════════════════
# SECTION 4: Model Performance
# ═══════════════════════════════════════════════════════════════
st.markdown("### 📈 Model Performance Summary")

if "comparison" in results:
    comp = results["comparison"]
    best_model = comp["WAPE"].idxmin()
    best = comp.loc[best_model]

    # Top metrics
    m1, m2, m3, m4, m5, m6 = st.columns(6)
    m1.metric("Best Model", best_model)
    m2.metric("WAPE", f"{best['WAPE']:.2f}%", delta=f"vs naive {comp.loc['Naive (lag-52)', 'WAPE']:.1f}%", delta_color="inverse")
    m3.metric("Bias", f"{best['Bias']:+.2f}%")
    m4.metric("RMSE", f"${best['RMSE']:,.0f}")
    m5.metric("R²", f"{best['R2']:.4f}")
    m6.metric("MAE", f"${best['MAE']:,.0f}")

    # Success criteria check
    st.markdown("#### Success Criteria")
    criteria = {
        "WAPE < 8%": best["WAPE"] < 8,
        "Bias within ±2%": abs(best["Bias"]) < 2,
        "R² > 0.88": best["R2"] > 0.88,
        "Beat naive baseline (lag-52 WAPE)": best["WAPE"] < comp.loc["Naive (lag-52)", "WAPE"],
    }
    for criterion, passed in criteria.items():
        icon = "✅" if passed else "⚠️"
        st.markdown(f"{icon} **{criterion}**")

    # Model comparison table
    st.markdown("#### Model Comparison")
    display_comp = comp.copy()
    display_comp.columns = ["WAPE (%)", "Bias (%)", "RMSE ($)", "MAE ($)", "R²"]
    st.dataframe(
        display_comp.style.format({
            "WAPE (%)": "{:.2f}",
            "Bias (%)": "{:+.2f}",
            "RMSE ($)": "${:,.0f}",
            "MAE ($)": "${:,.0f}",
            "R²": "{:.4f}",
        }).highlight_min(subset=["WAPE (%)"], color="#e8f5e9")
        .highlight_max(subset=["R²"], color="#e8f5e9"),
        use_container_width=True,
    )


# ═══════════════════════════════════════════════════════════════
# SECTION 5: Store-Level Accuracy Loop + Feature Importance
# ═══════════════════════════════════════════════════════════════
st.markdown("### 🏪 Store-Level Accuracy Loop & Feature Importance")

col_left, col_right = st.columns([3, 2])

with col_left:
    if "store_loop" in results:
        loop = results["store_loop"]

        # Summary stats
        s1, s2, s3, s4 = st.columns(4)
        n_under = (loop["target_status"] == "Under-Targeted").sum()
        n_over = (loop["target_status"] == "Over-Targeted").sum()
        n_ok = (loop["target_status"] == "Well-Calibrated").sum()
        s1.metric("Total Stores", f"{len(loop):,}")
        s2.metric("Under-Targeted", f"{n_under}", delta=f"{n_under/len(loop)*100:.1f}%", delta_color="inverse")
        s3.metric("Over-Targeted", f"{n_over}", delta=f"{n_over/len(loop)*100:.1f}%", delta_color="inverse")
        s4.metric("Well-Calibrated", f"{n_ok}", delta=f"{n_ok/len(loop)*100:.1f}%")

        # Store filter tabs
        store_view = st.radio(
            "View",
            ["Under-Targeted", "Over-Targeted", "All Stores"],
            horizontal=True,
            label_visibility="collapsed",
        )

        if store_view == "Under-Targeted":
            view_df = loop[loop["target_status"] == "Under-Targeted"].sort_values("Bias_pct").head(20)
        elif store_view == "Over-Targeted":
            view_df = loop[loop["target_status"] == "Over-Targeted"].sort_values("Bias_pct", ascending=False).head(20)
        else:
            view_df = loop.head(30)

        display_cols = ["Store ID", "Store Name", "Division", "n_weeks",
                        "Actual_Total", "Predicted_Total", "WAPE_pct", "Bias_pct", "target_status"]
        available_cols = [c for c in display_cols if c in view_df.columns]

        st.dataframe(
            view_df[available_cols].style.format({
                "Actual_Total": "${:,.0f}",
                "Predicted_Total": "${:,.0f}",
                "WAPE_pct": "{:.1f}%",
                "Bias_pct": "{:+.1f}%",
            }),
            use_container_width=True,
            height=400,
        )

with col_right:
    st.markdown("#### 🔑 Top Feature Importances")
    if "importance" in results:
        imp = results["importance"].head(15)
        fig = px.bar(
            imp,
            x="Importance_pct",
            y="Feature",
            orientation="h",
            color="Importance_pct",
            color_continuous_scale=["#90caf9", "#1565c0", "#003087"],
        )
        fig.update_layout(
            height=420,
            margin=dict(l=0, r=0, t=10, b=0),
            yaxis=dict(autorange="reversed"),
            showlegend=False,
            coloraxis_showscale=False,
            xaxis_title="Importance (%)",
            yaxis_title="",
        )
        st.plotly_chart(fig, use_container_width=True)


# ═══════════════════════════════════════════════════════════════
# SECTION 6: Store Bias Distribution
# ═══════════════════════════════════════════════════════════════
if "store_loop" in results:
    st.markdown("### 📊 Store Bias Distribution")

    col_chart1, col_chart2 = st.columns(2)

    with col_chart1:
        fig_hist = px.histogram(
            loop, x="Bias_pct", nbins=60,
            color_discrete_sequence=["#003087"],
            labels={"Bias_pct": "Bias (%)"},
            title="Distribution of Store-Level Bias",
        )
        fig_hist.add_vline(x=-5, line_dash="dash", line_color="orange", annotation_text="Under-Target Threshold")
        fig_hist.add_vline(x=5, line_dash="dash", line_color="red", annotation_text="Over-Target Threshold")
        fig_hist.update_layout(height=350, margin=dict(t=40, b=20))
        st.plotly_chart(fig_hist, use_container_width=True)

    with col_chart2:
        fig_scatter = px.scatter(
            loop, x="Actual_Total", y="Predicted_Total",
            color="target_status",
            color_discrete_map={
                "Under-Targeted": "#e65100",
                "Over-Targeted": "#c62828",
                "Well-Calibrated": "#2e7d32",
            },
            labels={"Actual_Total": "Actual Sales ($)", "Predicted_Total": "Predicted Sales ($)"},
            title="Predicted vs Actual (Store-Level Totals)",
            hover_data=["Store ID", "Store Name", "WAPE_pct"],
        )
        # Add perfect prediction line
        max_val = max(loop["Actual_Total"].max(), loop["Predicted_Total"].max())
        fig_scatter.add_trace(go.Scatter(
            x=[0, max_val], y=[0, max_val],
            mode="lines", line=dict(dash="dash", color="gray"),
            name="Perfect Prediction", showlegend=True,
        ))
        fig_scatter.update_layout(height=350, margin=dict(t=40, b=20))
        st.plotly_chart(fig_scatter, use_container_width=True)


# ═══════════════════════════════════════════════════════════════
# SECTION 7: Role of Store Segmentation
# ═══════════════════════════════════════════════════════════════
if "store_loop" in results and "role_of_store" in loop.columns:
    st.markdown("### 🏷️ Role-of-Store Segmentation")

    role_counts = loop["role_of_store"].value_counts()
    role_order = ["High Growth", "Growth", "Neutral", "Maintain", "Defend"]
    role_colors = {"High Growth": "#1565c0", "Growth": "#43a047", "Neutral": "#757575",
                   "Maintain": "#ff8f00", "Defend": "#c62828"}

    col_pie, col_table = st.columns([1, 2])

    with col_pie:
        fig_pie = px.pie(
            values=[role_counts.get(r, 0) for r in role_order],
            names=role_order,
            color=role_order,
            color_discrete_map=role_colors,
            title="Store Distribution by Role",
        )
        fig_pie.update_layout(height=350, margin=dict(t=40, b=20))
        st.plotly_chart(fig_pie, use_container_width=True)

    with col_table:
        role_stats = loop.groupby("role_of_store").agg(
            Stores=("Store ID", "count"),
            Median_WAPE=("WAPE_pct", "median"),
            Median_Bias=("Bias_pct", "median"),
            Avg_Actual=("Actual_Total", "mean"),
        ).reindex(role_order).dropna(how="all")
        role_stats["Pct"] = (role_stats["Stores"] / role_stats["Stores"].sum() * 100).round(1)

        st.dataframe(
            role_stats.style.format({
                "Stores": "{:,}",
                "Median_WAPE": "{:.1f}%",
                "Median_Bias": "{:+.1f}%",
                "Avg_Actual": "${:,.0f}",
                "Pct": "{:.1f}%",
            }),
            use_container_width=True,
        )

    st.caption("""
    **Segmentation Logic:** Combines model bias, CAGR HH (2010-2020), housing_new_share, and total_competitor_ta.
    High Growth = strong demand signals + model under-predicts (store outperforms).
    Defend = high competition + model over-predicts (store underperforms).
    """)


# ═══════════════════════════════════════════════════════════════
# SECTION 8: AI Commentary (Gemini)
# ═══════════════════════════════════════════════════════════════
st.markdown("### 🤖 AI Commentary (Gemini Analysis)")

def get_ai_commentary():
    """Generate AI commentary using Gemini API."""
    try:
        import google.generativeai as genai

        api_key = None
        if hasattr(st, "secrets") and "GEMINI_API_KEY" in st.secrets:
            api_key = st.secrets["GEMINI_API_KEY"]
        elif os.environ.get("GEMINI_API_KEY"):
            api_key = os.environ["GEMINI_API_KEY"]

        if not api_key:
            return None

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.0-flash")

        comp = results.get("comparison", pd.DataFrame())
        best_row = comp.loc[comp["WAPE"].idxmin()] if len(comp) > 0 else {}
        loop = results.get("store_loop", pd.DataFrame())
        imp = results.get("importance", pd.DataFrame())

        prompt = f"""You are a senior retail analytics expert reviewing a machine learning model for store-level sales target setting at a home improvement retailer (similar to Lowe's).

Model Details:
- Algorithm: XGBoost (best performing)
- Phase 1 Feature Set: 35 features (calendar, lag sales, store structure, demographics, housing, competition)
- Overall WAPE: {best_row.get('WAPE', 'N/A'):.2f}%
- Bias: {best_row.get('Bias', 'N/A'):+.2f}%
- R²: {best_row.get('R2', 'N/A'):.4f}
- Top feature: {imp.iloc[0]['Feature'] if len(imp) > 0 else 'lag_1'} ({imp.iloc[0]['Importance_pct']:.1f}%)
- Under-targeted stores: {(loop['target_status'] == 'Under-Targeted').sum() if len(loop) > 0 else 'N/A'}
- Over-targeted stores: {(loop['target_status'] == 'Over-Targeted').sum() if len(loop) > 0 else 'N/A'}
- Well-calibrated stores: {(loop['target_status'] == 'Well-Calibrated').sum() if len(loop) > 0 else 'N/A'}

Please provide:
1. A 2-sentence interpretation of the WAPE and Bias from a planning standpoint
2. One insight about what the top feature importance tells us about store sales drivers
3. One actionable recommendation for stores with persistent targeting bias
4. A note on whether this model would reduce override rates vs. current top-down allocation

Keep your response to 4 concise paragraphs, business-language only (no math jargon)."""

        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"*AI commentary unavailable: {e}*"


if st.button("🔄 Generate AI Commentary"):
    with st.spinner("Calling Gemini API..."):
        commentary = get_ai_commentary()
        if commentary:
            st.markdown(commentary)
        else:
            st.warning("No Gemini API key configured. Add `GEMINI_API_KEY` to Streamlit Secrets or environment variables.")
else:
    st.info("Click the button above to generate AI-powered commentary on model results. Requires a Gemini API key.")


# ═══════════════════════════════════════════════════════════════
# SECTION 9: Store Drill-Down
# ═══════════════════════════════════════════════════════════════
if "store_loop" in results:
    st.markdown("### 🔍 Store Drill-Down")

    store_options = loop["Store ID"].tolist()
    selected_store = st.selectbox("Select a store to inspect", store_options)

    if selected_store:
        store_row = loop[loop["Store ID"] == selected_store].iloc[0]

        d1, d2, d3, d4, d5 = st.columns(5)
        d1.metric("Store", f"{store_row['Store ID']}")
        d2.metric("WAPE", f"{store_row['WAPE_pct']:.1f}%")
        d3.metric("Bias", f"{store_row['Bias_pct']:+.1f}%")
        d4.metric("Status", store_row["target_status"])
        if "role_of_store" in store_row:
            d5.metric("Role", store_row["role_of_store"])

        # Quarterly bias
        q_cols = ["Q1_Bias", "Q2_Bias", "Q3_Bias", "Q4_Bias"]
        q_vals = [store_row.get(q) for q in q_cols]
        q_data = [(q.replace("_Bias", ""), v) for q, v in zip(q_cols, q_vals) if pd.notna(v)]
        if q_data:
            q_df = pd.DataFrame(q_data, columns=["Quarter", "Bias (%)"])
            fig_q = px.bar(
                q_df, x="Quarter", y="Bias (%)",
                color="Bias (%)",
                color_continuous_scale=["#c62828", "#fff9c4", "#2e7d32"],
                color_continuous_midpoint=0,
                title=f"Quarterly Bias — {store_row['Store ID']} {store_row.get('Store Name', '')}",
            )
            fig_q.update_layout(height=280, margin=dict(t=40, b=20), coloraxis_showscale=False)
            st.plotly_chart(fig_q, use_container_width=True)


# ═══════════════════════════════════════════════════════════════
# FOOTER
# ═══════════════════════════════════════════════════════════════
st.markdown("---")
st.caption("Capstone 8 | Group 8 | IIM Calcutta APAL02 | Built with Streamlit + XGBoost + LightGBM")
