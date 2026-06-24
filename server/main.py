import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from pydantic import BaseModel
from sqlmodel import Session, select

from database import create_db_and_tables, get_session
from models import Transaction, TransactionCreate

# Load variables from the .env file (must run before creating the Gemini client)
load_dotenv()

# Gemini client — automatically reads GEMINI_API_KEY from the environment
client = genai.Client()


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(title="FinPilot API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---- request body for the AI endpoint ----
class AskRequest(BaseModel):
    question: str


@app.get("/")
def home():
    return {"message": "FinPilot API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/transactions", response_model=Transaction)
def create_transaction(transaction: TransactionCreate, session: Session = Depends(get_session)):
    db_transaction = Transaction.model_validate(transaction)
    session.add(db_transaction)
    session.commit()
    session.refresh(db_transaction)
    return db_transaction


@app.get("/transactions", response_model=list[Transaction])
def list_transactions(session: Session = Depends(get_session)):
    return session.exec(select(Transaction)).all()


@app.get("/summary")
def get_summary(session: Session = Depends(get_session)):
    transactions = session.exec(select(Transaction)).all()

    total_income = 0.0
    total_expense = 0.0
    by_category = {}

    for t in transactions:
        if t.type == "income":
            total_income += t.amount
        elif t.type == "expense":
            total_expense += t.amount
            by_category[t.category] = by_category.get(
                t.category, 0.0) + t.amount

    balance = total_income - total_expense

    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": balance,
        "expense_by_category": by_category,
    }


@app.post("/ask")
def ask_ai(payload: AskRequest, session: Session = Depends(get_session)):
    # 1. Pull the user's real transactions from the database
    transactions = session.exec(select(Transaction)).all()

    # 2. Convert them into plain text the AI can read, and tally totals
    lines = []
    total_income = 0.0
    total_expense = 0.0
    for t in transactions:
        note = t.description or "no description"
        lines.append(
            f"- {t.date.date()}: {t.type} of {t.amount} in '{t.category}' ({note})"
        )
        if t.type == "income":
            total_income += t.amount
        else:
            total_expense += t.amount

    balance = total_income - total_expense
    data_text = "\n".join(lines) if lines else "No transactions recorded yet."

    # 3. Build the instructions and the data-filled question
    system_prompt = (
        "You are FinPilot, a friendly personal finance assistant. "
        "Answer the user's question using ONLY the financial data provided below. "
        "Be concise and specific with numbers. Amounts are in Indian Rupees (INR). "
        "If the data does not contain enough information to answer, say so honestly."
    )
    user_prompt = (
        f"Total income: {total_income}\n"
        f"Total expense: {total_expense}\n"
        f"Balance: {balance}\n\n"
        f"Transactions:\n{data_text}\n\n"
        f"Question: {payload.question}"
    )

    # 4. Send it to Gemini and return the answer
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt),
        )
        answer = response.text
    except Exception:
        raise HTTPException(
            status_code=503,
            detail="The AI is busy right now. Please try again in a moment.",
        )

    return {"question": payload.question, "answer": answer}
    # 1. Pull the user's real transactions from the database
    transactions = session.exec(select(Transaction)).all()

    # 2. Convert them into plain text the AI can read, and tally totals
    lines = []
    total_income = 0.0
    total_expense = 0.0
    for t in transactions:
        note = t.description or "no description"
        lines.append(
            f"- {t.date.date()}: {t.type} of {t.amount} in '{t.category}' ({note})"
        )
        if t.type == "income":
            total_income += t.amount
        else:
            total_expense += t.amount

    balance = total_income - total_expense
    data_text = "\n".join(lines) if lines else "No transactions recorded yet."

    # 3. Build the instructions and the data-filled question
    system_prompt = (
        "You are FinPilot, a friendly personal finance assistant. "
        "Answer the user's question using ONLY the financial data provided below. "
        "Be concise and specific with numbers. Amounts are in Indian Rupees (INR). "
        "If the data does not contain enough information to answer, say so honestly."
    )
    user_prompt = (
        f"Total income: {total_income}\n"
        f"Total expense: {total_expense}\n"
        f"Balance: {balance}\n\n"
        f"Transactions:\n{data_text}\n\n"
        f"Question: {payload.question}"
    )

    # 4. Send it to Gemini and return the answer
    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=user_prompt,
        config=types.GenerateContentConfig(system_instruction=system_prompt),
    )

    answer = response.text
    return {"question": payload.question, "answer": answer}


@app.get("/transactions/{transaction_id}", response_model=Transaction)
def get_transaction(transaction_id: int, session: Session = Depends(get_session)):
    transaction = session.get(Transaction, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction


@app.delete("/transactions/{transaction_id}")
def delete_transaction(transaction_id: int, session: Session = Depends(get_session)):
    transaction = session.get(Transaction, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    session.delete(transaction)
    session.commit()
    return {"message": "Transaction deleted"}
