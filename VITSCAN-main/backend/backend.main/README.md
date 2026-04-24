# VITSCAN Backend

FastAPI backend for the VITSCAN vitamin deficiency detection system. Handles image analysis, AI chatbot, and report storage using the Google Gemini API.

## Project Structure

```
backend/
├── src/
│   ├── main.py                 # FastAPI app entry point
│   ├── config/
│   │   └── settings.py         # Environment config (pydantic-settings)
│   ├── route/
│   │   ├── ai.py               # Routes: /analyze, /chat, /reports
│   │   └── health.py           # Route: /health
│   ├── controllers/
│   │   └── ai_controller.py    # Request handling & report storage
│   ├── services/
│   │   └── ai_service.py       # Gemini API integration
│   ├── prompts/
│   │   └── ai_prompts.py       # System prompts for analyze & chat
│   └── db/
│       └── reports.json        # Stored analysis reports
├── requirements.txt
├── .env.example
└── README.md
```

## Architecture

```
Request → route/ → controllers/ → services/ → Gemini API
                        ↕
                    db/reports.json
```

- **route/** — Defines API endpoints and delegates to controllers
- **controllers/** — Business logic, validation, report persistence
- **services/** — Gemini API calls using system prompts
- **prompts/** — System prompts for image analysis and chatbot
- **config/** — Environment settings via pydantic-settings

## Setup

### Prerequisites

- Python 3.10+
- Google Gemini API key — get one at [Google AI Studio](https://aistudio.google.com/apikey)

### Installation

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env from example
cp .env.example .env
```

Edit `.env` and add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL_ID=gemini-2.5-flash
```

### Run

```bash
python -m uvicorn src.main:app --reload --host 127.0.0.1 --port 8001
```

Server starts at http://127.0.0.1:8001

## API Endpoints

### `POST /analyze`

Upload 1–4 biomarker images for AI analysis.

**Request:** `multipart/form-data`
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `files` | File[] | Yes | 1–4 image files |
| `prompt` | string | No | Optional user focus prompt |

**Response:**
```json
{
  "output": "{ \"overall_confidence\": 85, \"results\": [...] }"
}
```

### `POST /chat`

Send a message to the AI health chatbot.

**Request:** `application/json`
```json
{
  "message": "What causes Vitamin D deficiency?",
  "context": "optional context string"
}
```

**Response:**
```json
{
  "output": "Vitamin D deficiency is commonly caused by..."
}
```

### `GET /reports`

Get all saved analysis reports.

**Response:**
```json
[
  {
    "id": "uuid",
    "date": "2026-03-31T14:28:02+00:00",
    "files": ["tongue.jpg"],
    "prompt": null,
    "output": "{ ... }"
  }
]
```

### `GET /health`

Health check.

**Response:**
```json
{ "status": "ok" }
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | Yes | — | Google Gemini API key |
| `GEMINI_MODEL_ID` | No | `gemini-2.5-flash` | Gemini model to use |

## Dependencies

- **FastAPI** — Web framework
- **Uvicorn** — ASGI server
- **google-genai** — Google Gemini API SDK
- **pydantic-settings** — Environment configuration
- **python-multipart** — File upload support
