# ⚡ RSAI ExamMaster · Weeks 1–12 Master Prep & Diagnostic Platform

An interactive exam simulation and diagnostic platform designed for **Responsible & Safe AI (RSAI)**. Features 141 officially extracted multiple-choice questions, adaptive test modes, persistent question pool tracking, and comprehensive week-by-week performance diagnostics.

---

## 🌟 Key Highlights

- **🎯 Complete 141-Question Bank (Weeks 1 to 12)**:
  - Extracted and structured directly from official solution sheets.
  - Multi-select (*"Select all that apply"*), single choice, and numerical questions.
  - Complete with official solutions, lecture context, and formula working diagrams.
- **🔄 Fresh Questions Every Attempt**:
  - Automatically records answered questions in `localStorage`.
  - Ensures subsequent attempts prioritize unseen questions until all 141 questions are practiced.
- **📊 Comprehensive Weakness Diagnostic Report**:
  - **🏆 Top Scoring Weeks**: Identifies areas of strength and topic mastery.
  - **⚠️ Needs More Preparation**: Highlights weeks with missed questions and lowest accuracy.
  - **📈 Week-by-Week Visual Progress**: Interactive progress bars and accuracy rates across all tested weeks.
  - **📝 Official Solution Review**: Side-by-side comparison of user picks vs. correct answers with in-depth explanations.
- **📚 Complete 141-Question Study Guide**:
  - Searchable by keywords (*e.g., GDPR, LIME, SaGE, Differential Privacy*).
  - Filterable by week with toggleable answer reveals for flashcard-style study.

---

## 🚀 Quick Start

### Option 1: Direct in Browser (No Server Needed)
Simply double-click `index.html` in your browser. All data and diagrams are self-contained.

### Option 2: Local HTTP Server
Run with Python:
```bash
python -m http.server 3000
```
Then navigate to: **[http://localhost:3000](http://localhost:3000)**

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML5, CSS3 (Modern Glassmorphic Dark UI), JavaScript (ES6+)
- **Storage**: Browser `localStorage` (state persistence across reloads)
- **Data Engine**: Python (`pymupdf` / `fitz`) extraction script for PDF solution parsing
- **Fonts**: Google Fonts (`Plus Jakarta Sans`, `Inter`, `JetBrains Mono`)

---

## 📂 Project Structure

```
├── index.html                 # Main web application entry point
├── style.css                  # Modern dark glassmorphic styling
├── app.js                     # Interactive quiz engine, timer, and diagnostics
├── questions_data.js          # Pre-packaged 141-question database with base64 diagrams
├── questions.json             # Raw structured JSON question bank
├── generate_questions_db.py   # PDF extraction script
├── quiz_images/               # Extracted formula and diagram assets
├── Solutions of RSAI-*.pdf    # Solution PDFs for Weeks 1 to 12
└── README.md                  # Project documentation
```

---

## 📜 License
Educational and academic preparation use.
