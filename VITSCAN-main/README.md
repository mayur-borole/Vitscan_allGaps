# VITSCAN — Non-Invasive Vitamin Deficiency Detection

AI-powered web application that detects vitamin deficiencies from images of tongue, nails, lips, and skin using deep learning, and provides personalized health guidance through a chatbot.

## Features

- **Image Analysis** — Upload biomarker images (tongue, nails, lips, skin) for AI-powered deficiency detection
- **Multi-Vitamin Detection** — Detects deficiencies in Vitamins A, B1, B2, B3, B6, B9, B12, C, D, E, K, Iron, Zinc, Biotin, and Protein
- **Severity & Confidence Scoring** — Each finding includes a confidence score and severity level (mild / moderate / severe)
- **Detailed Results Dashboard** — Radar charts, bar charts, and deficiency cards with food, precaution, and supplement recommendations
- **PDF Report Download** — Generate and download formatted medical-style PDF reports
- **AI Health Chatbot** — Ask follow-up questions about deficiencies, diet, and supplements
- **Report History** — View and download past analysis reports

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Recharts, Framer Motion |
| Backend | Python 3.10+, FastAPI, Uvicorn |
| AI | Google Gemini API (gemini-2.5-flash) |
| PDF | jsPDF |

## Project Structure

```
VITSCAN/
├── src/                          # React frontend
│   ├── components/services/
│   │   └── aiApi.ts              # API client
│   └── pages/
│       ├── UploadPage.tsx        # Image upload & analysis
│       ├── ResultsPage.tsx       # Results with charts
│       ├── ReportsPage.tsx       # Report history
│       └── ChatbotPage.tsx       # AI health chatbot
├── backend/                      # FastAPI backend (see backend/README.md)
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **Google Gemini API key** — get one at [Google AI Studio](https://aistudio.google.com/apikey)

### 1. Clone the repository

```bash
git clone <YOUR_GIT_URL>
cd VITSCAN
```

### 2. Setup Backend

See [backend/README.md](backend/README.md) for detailed backend setup.

```bash
cd backend
python -m venv venv
venv\Scripts\activate              # or: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env               # add your GEMINI_API_KEY
```

### 3. Setup Frontend

```bash
# From project root
npm install
```

### 4. Run the Application

Open **two terminals**:

**Terminal 1 — Backend** (http://127.0.0.1:8001):
```bash
cd backend
venv\Scripts\activate
python -m uvicorn src.main:app --reload --host 127.0.0.1 --port 8001
```

**Terminal 2 — Frontend** (http://localhost:5173):
```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## Environment Variables

| Variable | Where | Required | Default | Description |
|----------|-------|----------|---------|-------------|
| `GEMINI_API_KEY` | `backend/.env` | Yes | — | Google Gemini API key |
| `GEMINI_MODEL_ID` | `backend/.env` | No | `gemini-2.5-flash` | Gemini model |
| `VITE_BACKEND_URL` | root `.env` | No | `http://127.0.0.1:8001` | Backend URL for frontend |
