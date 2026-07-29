# ⚡ Volt Guard AI — Electricity Bill Fraud Detection

An intelligent AI Agent for Electricity Bill Fraud Detection built for power distribution companies and utility officers.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![HTML](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Groq](https://img.shields.io/badge/Powered%20by-Groq%20LLaMA%203.3%2070B-orange)

---

## 🚀 Live Demo

> Open `index.html` in a browser **after** starting the local server (see [Usage](#usage)).

---

## 📋 Features

- **💬 AI Chat Interface** — Free-form conversation with Volt Guard AI using Groq LLaMA 3.3 70B
- **📋 Bill Analyser Form** — Structured form to enter all billing details and get instant fraud analysis
- **📈 Fraud Risk Scoring** — 0–100 risk score with 5 levels: Very Low / Low / Medium / High / Critical
- **🚨 Anomaly Detection** — Detects reading rollback, billing mismatch, meter bypass, illegal connections
- **🕑 Analysis History** — Session history of all form-based analyses
- **📱 Responsive Design** — Works on desktop and mobile

---

## 🧠 AI Analysis Workflow

| Step | Action |
|------|--------|
| 1 | Calculate consumption (Current − Previous Reading) |
| 2 | Compare calculated vs billed units (>10% = Billing Mismatch) |
| 3 | Analyse historical consumption trends |
| 4 | Detect fraud indicators (bypass, rollback, illegal connection) |
| 5 | Factor in field observations (broken seal, meter damage) |

---

## 📊 Fraud Risk Levels

| Score | Level | Action |
|-------|-------|--------|
| 0–20 | 🟢 Very Low | No Action Required |
| 21–40 | 🔵 Low | Monitor Next Billing Cycle |
| 41–60 | 🟡 Medium | Schedule Field Inspection |
| 61–80 | 🔴 High | Urgent Meter Inspection |
| 81–100 | ⛔ Critical | Potential Fraud Investigation |

---

## 📁 Project Structure

```
volt-guard-ai/
├── index.html          # Main app (self-contained with inline CSS + JS)
├── app.js              # AI logic, Groq API client, fraud detection system prompt
├── style.css           # Dark theme UI styles
├── marked.min.js       # Bundled markdown parser (no CDN needed)
├── start.bat           # One-click local server launcher (Windows)
└── README.md           # This file
```

---

## ⚙️ Setup & Usage

### Prerequisites
- Python 3.x installed (for local server)
- A [Groq API Key](https://console.groq.com) (free)

### Step 1 — Add Your API Key

Open `app.js` and replace `YOUR_GROQ_API_KEY` with your actual Groq API key:

```js
const GROQ_API_KEY = "gsk_your_actual_key_here";
```

### Step 2 — Start the Local Server

**Windows:** Double-click `start.bat`

**Mac / Linux:**
```bash
cd path/to/volt-guard-ai
python3 -m http.server 8000
```

### Step 3 — Open in Browser

Go to: **http://localhost:8000**

> ⚠️ Do NOT open `index.html` directly as a `file://` URL — the Groq API requires an HTTP origin for CORS.

---

## 🔑 Get a Free Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up / Log in
3. Click **API Keys** → **Create API Key**
4. Copy and paste it into `app.js`

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| HTML5 / CSS3 | UI layout and dark theme |
| Vanilla JavaScript | App logic, API calls |
| Groq API | AI inference (LLaMA 3.3 70B) |
| marked.js | Markdown rendering in chat |
| Python http.server | Local development server |

---

## ⚠️ Disclaimer

Volt Guard AI is an **audit assistance tool** — it does not make final legal or billing determinations. All flagged cases require human verification before any action is taken.

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

*Built with ❤️ using Groq LLaMA 3.3 70B*
