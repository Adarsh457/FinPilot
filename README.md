# FinPilot

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite&logoColor=white)
![Status](https://img.shields.io/badge/status-in%20development-orange)

> An AI-powered personal finance assistant. Track income and expenses, view spending insights, and (soon) ask an LLM-based agent natural-language questions about your money.

---

## Overview

**FinPilot** is a full-stack personal finance assistant that helps users record their income and expenses, organize transactions by category, and see clear summaries of where their money goes. Beyond standard expense tracking, the project is being built toward an **AI agent** that answers natural-language questions about your finances — fetching your real transaction data, analyzing it, and returning personalized insights rather than generic advice.

The backend is built with **Python (FastAPI)** and a relational database, with a **React** frontend. The project is structured to grow incrementally into a containerized, microservices-based architecture.

> **Note:** FinPilot is being developed as a hands-on learning project to demonstrate full-stack engineering across backend development, database design, API architecture, and applied AI.

---

## Features

- **Add transactions** — record income and expenses from the UI, with amount, category, type, and an optional description.
- **View transactions** — see a live list of all recorded transactions.
- **Financial summary** — automatic totals for income, expenses, current balance, and a per-category spending breakdown.
- **Input validation** — the API rejects invalid data (negative amounts, blank categories, invalid transaction types) before it reaches the database.
- **Interactive API docs** — auto-generated, testable documentation at `/docs`.
- **Live UI updates** — adding a transaction instantly refreshes the totals and list without a page reload.

---

## Tech Stack

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| Frontend     | React                  |
| Backend      | Python, FastAPI                     |
| ORM / Models | SQLModel (SQLAlchemy + Pydantic)    |
| Database     | SQLite (PostgreSQL planned)         |
| Server       | Uvicorn (ASGI)                      |

---

## Architecture

The browser only ever communicates with the FastAPI backend — it never touches the database directly. FastAPI handles the API, validation, and business logic, and reads/writes the database.

```
┌──────────────┐      REST/HTTP      ┌──────────────────┐      SQL      ┌──────────────┐
│    React     │  ───────────────►   │  FastAPI Backend │  ──────────►  │   Database   │
│  (frontend)  │  ◄───────────────   │  API · validation│  ◄──────────  │   (SQLite)   │
└──────────────┘                     └──────────────────┘               └──────────────┘
```

In later phases, the backend will be split into microservices (a dedicated AI service with a Node.js gateway), containerized with Docker.

---

## Project Structure

```
finpilot/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   └── App.jsx         # Main UI: summary cards, add form, transaction list
│   ├── package.json
│   └── ...
├── server/                 # FastAPI backend
│   ├── main.py             # App, CORS, and route definitions
│   ├── models.py           # Data models + validation rules
│   ├── database.py         # Database connection and session handling
│   ├── requirements.txt    # Python dependencies
│   └── finpilot.db         # SQLite database (gitignored — created at runtime)
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- [Python 3.10+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/) and npm
- [Git](https://git-scm.com/)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/finpilot.git
cd finpilot
```

### 2. Backend setup (server)

```bash
cd server

# Create and activate a virtual environment
python -m venv venv
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# macOS / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

> If `requirements.txt` doesn't exist yet, install the packages directly and then generate it:
> ```bash
> pip install fastapi "uvicorn[standard]" sqlmodel
> pip freeze > requirements.txt
> ```

### 3. Frontend setup (client)

```bash
cd client
npm install
```

---

## Running the App

The backend and frontend run in **two separate terminals** at the same time.

**Terminal 1 — backend** (from the `server/` folder, with the virtual environment active):

```bash
uvicorn main:app --reload
```

Backend runs at `http://127.0.0.1:8000`. Interactive docs: `http://127.0.0.1:8000/docs`.

**Terminal 2 — frontend** (from the `client/` folder):

```bash
npm run dev
```

Frontend runs at `http://localhost:5173` (Vite). Open this URL in your browser.

> **CORS:** the backend allows requests from `http://localhost:5173` and `http://localhost:3000`. If your frontend runs on a different port, update the `allow_origins` list in `server/main.py`.

---

## API Reference

Base URL: `http://127.0.0.1:8000`

| Method   | Endpoint               | Description                                            |
| -------- | ---------------------- | ------------------------------------------------------ |
| `GET`    | `/`                    | Health message                                         |
| `GET`    | `/health`              | Health check                                           |
| `POST`   | `/transactions`        | Create a new transaction                               |
| `GET`    | `/transactions`        | List all transactions                                  |
| `GET`    | `/transactions/{id}`   | Get a single transaction by ID                         |
| `DELETE` | `/transactions/{id}`   | Delete a transaction by ID                             |
| `GET`    | `/summary`             | Totals for income, expenses, balance, and by category  |

### Example: create a transaction

**Request** — `POST /transactions`

```json
{
  "amount": 500,
  "category": "food",
  "type": "expense",
  "description": "Groceries"
}
```

**Response** — `200 OK`

```json
{
  "id": 1,
  "amount": 500.0,
  "category": "food",
  "type": "expense",
  "description": "Groceries",
  "date": "2026-06-22T16:22:02.350523"
}
```

### Example: summary

**Request** — `GET /summary`

**Response** — `200 OK`

```json
{
  "total_income": 30000.0,
  "total_expense": 500.0,
  "balance": 29500.0,
  "expense_by_category": {
    "food": 500.0
  }
}
```

---

## Validation Rules

The API enforces the following before saving a transaction (returns `422 Unprocessable Entity` on failure):

- `type` must be exactly `"income"` or `"expense"`.
- `amount` must be greater than `0`.
- `category` cannot be blank, and is automatically normalized to lowercase (so `Food`, `food`, and `FOOD` are treated as one category).

---

## Roadmap

- [x] **Phase 1** — Backend REST API with SQLite (transactions: create, list, get, delete)
- [x] Financial summary endpoint (totals + per-category breakdown)
- [x] Input validation (transaction type, positive amount, non-blank category)
- [x] React frontend (summary dashboard + add-transaction form)
- [ ] **Phase 2** — User authentication (private, per-user data)
- [ ] **Phase 3** — AI agent: ask natural-language questions about your finances and get data-driven insights
- [ ] **Phase 4** — Containerize with Docker, migrate to PostgreSQL, and split into microservices (Node.js gateway + Python AI service)

---

## Skills Demonstrated

- Designing and building a RESTful API with FastAPI
- Relational data modeling and ORM usage with SQLModel
- Server-side input validation and error handling
- Full-stack integration (React frontend ↔ Python backend) and handling CORS
- Project structure, Git version control, and incremental, phased development

---

## License

This project is licensed under the MIT License — see the `LICENSE` file for details.

## Author

**[Your Name]** — [GitHub](https://github.com/YOUR-USERNAME) · [LinkedIn](https://linkedin.com/in/YOUR-PROFILE)
