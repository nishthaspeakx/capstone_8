# Deployment Guide — Streamlit App on Streamlit Community Cloud

## Goal
Deploy the Lowe's Store-Level Sales Target demo app so the professor can access it via a single URL — no installation needed.

## Prerequisites
1. GitHub account (free)
2. Streamlit Community Cloud account (free, sign up at https://share.streamlit.io)
3. Working Streamlit app in `app/streamlit_app.py`

## Step-by-Step Deployment

### 1. Prepare the repo for deployment

The repo needs these files at the root:
```
├── app/
│   └── streamlit_app.py        ← main app
├── src/
│   ├── feature_engineering.py
│   ├── store_accuracy_loop.py
│   └── train_model.py
├── data/
│   └── stores_sales_master_file_masked_final.csv  ← if < 100MB
├── outputs/
│   ├── model_lightgbm.pkl      ← pre-trained model (so app loads instantly)
│   ├── store_accuracy_loop_results.csv
│   └── feature_importance.csv
├── requirements.txt
└── .streamlit/
    └── config.toml             ← optional theme config
```

### 2. Handle the large CSV (210MB)

The CSV is too large for GitHub (100MB limit). Two options:

**Option A (Recommended): Pre-compute and ship results only**
- Run the full pipeline locally (`python src/train_model.py`)
- Save the trained model pickle, store loop CSV, and feature importance CSV to `outputs/`
- The Streamlit app loads pre-computed results instead of training live
- Professor sees instant results without waiting for model training
- No need to upload the 210MB CSV to GitHub

**Option B: Git LFS**
- `git lfs install && git lfs track "*.csv"`
- Push the CSV with Git LFS (free up to 1GB on GitHub)
- App can then train live from the uploaded CSV

### 3. Create GitHub repo

```bash
cd "Capstone 8"
git init
git add .
git commit -m "Capstone 8: Lowe's Store-Level Sales Target Model"
git remote add origin https://github.com/YOUR_USERNAME/lowes-capstone-8.git
git push -u origin main
```

### 4. Deploy on Streamlit Community Cloud

1. Go to https://share.streamlit.io
2. Click "New app"
3. Select your GitHub repo
4. Set main file path: `app/streamlit_app.py`
5. Click "Deploy"
6. Wait 2-3 minutes for the app to build
7. You get a URL like: `https://lowes-capstone-8.streamlit.app`

### 5. Share with professor

Send the URL. That's it — he clicks it, sees the full working system:
- Dataset summary and validation
- Phase 1 feature set (40 features with justification)
- Model configuration and results
- Store-level accuracy loop with under/over-targeted stores
- Feature importance chart
- Role-of-Store segmentation
- AI commentary (if Gemini API key is configured)

### 6. Optional: Add Gemini API commentary

If you want the AI commentary feature:
1. Get a Gemini API key from https://aistudio.google.com/apikey
2. In Streamlit Cloud: Settings → Secrets → add:
   ```
   GEMINI_API_KEY = "your-key-here"
   ```
3. The app reads it via `st.secrets["GEMINI_API_KEY"]`

## Important Notes

- **Streamlit Community Cloud is free** for public repos. For private repos, you get 1 free private app.
- **The app stays live** as long as your GitHub repo exists. It auto-sleeps after inactivity but wakes up when someone visits the URL.
- **Pre-computing results is strongly recommended** — it means the professor sees results instantly instead of waiting for a 269K-row model to train in the cloud (which may hit memory limits on the free tier).

## When Building the Streamlit App in Claude Code

Tell Claude Code:
> "Build the Streamlit app in app/streamlit_app.py. It should load pre-computed results from outputs/ (model pickle, store loop CSV, feature importance CSV). Mirror the UI from reference/lowes_model_app.html. Make sure it works for Streamlit Community Cloud deployment — no local file paths, use relative paths, and read secrets from st.secrets for any API keys."
