# Lowe's Store-Level Sales Target Model - Capstone Presentation

## Quick Start

**File:** `Phase1_Completion_Presentation.pptx`  
**Location:** `/sessions/busy-confident-curie/mnt/Capstone 8/`  
**Slides:** 14  
**Size:** 294 KB  
**Format:** PowerPoint (.pptx)

Open the PowerPoint file directly in Microsoft PowerPoint, Google Slides, or any compatible presentation software.

---

## Presentation Overview

A polished 14-slide PowerPoint presentation for IIM Calcutta Group 8's capstone project on Lowe's store-level sales targeting. The presentation is designed for both team review and professor evaluation.

### Key Features

- **Lowe's Brand Colors:** Primary blue (#003087), secondary (#005B9F), accent (#1565C0)
- **Professional Design:** Varied layouts with tables, callout boxes, and visual hierarchy
- **Complete Coverage:** All 10 sections of the live Streamlit app + technical architecture
- **Live App URL:** Prominently displayed on opening, app overview, and closing slides
- **Data-Driven:** All metrics, statistics, and model results included

---

## Slide-by-Slide Breakdown

| Slide | Title | Key Content |
|-------|-------|-------------|
| 1 | Title Slide | Project name, tagline, group info, live app URL |
| 2 | The Problem | Current 25.83% miss rate, peanut butter spread limitations |
| 3 | Our Solution | Input → Process → Output flow, key benefits |
| 4 | Dataset Overview | 269K rows, 1,727 stores, 194 columns, 0 missing |
| 5 | Feature Engineering | 5 families of features (35 total), leakage blacklist |
| 6 | Lag Features | 6 power features with correlations (0.91–0.98) |
| 7 | Model Architecture | 4 models, training setup, success criteria |
| 8 | Model Results | Performance comparison, XGBoost winner (7.2% WAPE) |
| 9 | Store Accuracy Loop | Classification: Under/Well-Calibrated/Over-Targeted |
| 10 | Role-of-Store | 5 segments with strategies |
| 11 | Live Demo App | 10 app sections, URL highlight |
| 12 | Technical Architecture | Python modules, deployment details |
| 13 | Key Findings & Recommendations | 4 findings, 4 recommendations |
| 14 | Thank You | Closing Q&A slide with URL |

---

## Design Specifications

### Colors
- **Primary:** #003087 (Lowe's blue) — headers, key boxes
- **Secondary:** #005B9F (darker blue) — borders, secondary elements
- **Accent:** #1565C0 (bright blue) — emphasis, metrics
- **Light:** #D5E8F0 (light blue) — backgrounds
- **Text:** #333333 (dark gray)

### Typography
- **Titles:** 40–52pt, bold, Arial
- **Section Headers:** 14–18pt, bold
- **Body Text:** 11–14pt
- **Captions:** 10–12pt

### Layout Variety
Each slide uses a distinct layout to maintain visual interest:
- Full-screen backgrounds (Slides 1, 14)
- Header bar + content + callout boxes (Slides 2–5)
- Correlation tables (Slide 6)
- Classification boxes (Slides 9–10)
- Multi-column layouts (Slides 11–12)

---

## Content Highlights

### Key Metrics
- **Dataset:** 269,412 store-weeks | 1,727 stores | FY2023–FY2025
- **XGBoost Performance:** 7.2% WAPE, -0.8% bias, 0.912 R²
- **Baseline Improvement:** 19% better than naive lag-52 (8.9% WAPE)
- **Feature Power:** Engineered lags with 0.913–0.982 correlation

### Business Impact
- Replaces subjective "peanut butter spread" with data-driven targeting
- Identifies store-level accuracy issues (Under/Over-Targeted)
- Enables Role-of-Store segmentation for strategic planning
- Quarterly re-scoring capability for adaptive forecasting

---

## File Formats

| Format | File | Size | Use Case |
|--------|------|------|----------|
| PowerPoint | `Phase1_Completion_Presentation.pptx` | 294 KB | Presentation, editing |
| PDF | `Phase1_Completion_Presentation.pdf` | 160 KB | Read-only, universal access |
| JPEG | `slide-01.jpg` through `slide-14.jpg` | ~100 KB each | Web preview, individual slides |

---

## Live Application

**URL:** https://storewisetargets.streamlit.app/

The presentation references this live Streamlit app with 10 interactive sections:
1. Dataset Summary
2. Phase 1 Features
3. Model Configuration
4. Model Results
5. Store Accuracy Loop
6. Role-of-Store Segmentation
7. AI Commentary (Gemini 2.0 Flash)
8. Store Drill-Down
9. Download Results
10. Upload & Score

---

## Presentation Tips

- **Duration:** 20–25 minutes with Q&A
- **Audience:** IIM Calcutta team + professor
- **Key Messages:**
  - Current process misses 25.83% of store-week targets
  - ML model achieves 7.2% WAPE (below 8% success criterion)
  - Lag features are the power drivers (0.91–0.98 correlation)
  - Store-level accuracy loop enables targeted overrides
  - Role-of-Store segmentation drives strategic decisions

---

## Technical Details

**Created:** April 13, 2026  
**Tool:** pptxgenjs (Node.js)  
**Dimensions:** 10" × 7.5" (standard 16:9)  
**Compatibility:** PowerPoint 2010+, Google Slides, LibreOffice

---

## Quality Assurance

✓ All 14 slides created and verified  
✓ Content accuracy checked against project specifications  
✓ Design consistency (Lowe's brand colors, typography)  
✓ Live app URL prominently displayed  
✓ PDF export successful  
✓ Individual slide images extracted at 150 DPI  

---

## Next Steps

1. Open `Phase1_Completion_Presentation.pptx`
2. Review slides for accuracy
3. Practice presentation with timing
4. Have live app ready for demo: https://storewisetargets.streamlit.app/
5. Print or distribute PDF as handout if needed

---

For questions or edits, the PowerPoint file is fully editable in Microsoft PowerPoint or Google Slides.

**IIM Calcutta Capstone — Group 8 (APAL02)**
