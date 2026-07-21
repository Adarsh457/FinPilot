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
from models import Transaction, TransactionCreate, User, UserCreate, Token
from auth import hash_password, verify_password, create_access_token, get_current_user

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
    allow_origins=["http://localhost:3000", "http://localhost:5173","https://finpilotagent.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---- request body for the AI endpoint ----
class AskRequest(BaseModel):
    question: str


# ---- Public routes ----

@app.get("/")
def home():
    return {"message": "FinPilot API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/register", response_model=Token)
def register(user: UserCreate, session: Session = Depends(get_session)):
    existing = session.exec(select(User).where(User.username == user.username)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")
    new_user = User(username=user.username, hashed_password=hash_password(user.password))
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return Token(access_token=create_access_token(new_user.username))


@app.post("/login", response_model=Token)
def login(user: UserCreate, session: Session = Depends(get_session)):
    db_user = session.exec(select(User).where(User.username == user.username)).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return Token(access_token=create_access_token(db_user.username))


# ---- Protected routes (require a valid token, scoped to the logged-in user) ----

@app.get("/me")
def read_current_user(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "username": current_user.username}

@app.post("/transactions", response_model=Transaction)
def create_transaction(
    transaction: TransactionCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    db_transaction = Transaction.model_validate(transaction, update={"user_id": current_user.id})
    session.add(db_transaction)
    session.commit()
    session.refresh(db_transaction)
    return db_transaction


@app.get("/transactions", response_model=list[Transaction])
def list_transactions(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return session.exec(
        select(Transaction).where(Transaction.user_id == current_user.id)
    ).all()

# Edit Transactions 
@app.put("/transactions/{transaction_id}", response_model=Transaction)
def update_transaction(
    transaction_id: int,
    updated: TransactionCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    transaction = session.get(Transaction, transaction_id)
    if not transaction or transaction.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # apply the new values (validated by TransactionCreate)
    transaction.amount = updated.amount
    transaction.category = updated.category
    transaction.type = updated.type
    transaction.description = updated.description

    session.add(transaction)
    session.commit()
    session.refresh(transaction)
    return transaction


@app.get("/summary")
def get_summary(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    transactions = session.exec(
        select(Transaction).where(Transaction.user_id == current_user.id)
    ).all()

    total_income = 0.0
    total_expense = 0.0
    by_category = {}

    for t in transactions:
        if t.type == "income":
            total_income += t.amount
        elif t.type == "expense":
            total_expense += t.amount
            by_category[t.category] = by_category.get(t.category, 0.0) + t.amount

    balance = total_income - total_expense

    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": balance,
        "expense_by_category": by_category,
    }

@app.get("/insight")
def get_insight(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    transactions = session.exec(
        select(Transaction).where(Transaction.user_id == current_user.id)
    ).all()
    if not transactions:
        return {"insight": "Add a few transactions and I'll start spotting patterns for you."}

    total_income = 0.0
    total_expense = 0.0
    by_category = {}
    for t in transactions:
        if t.type == "income":
            total_income += t.amount
        else:
            total_expense += t.amount
            by_category[t.category] = by_category.get(t.category, 0.0) + t.amount

    balance = total_income - total_expense

    # --- the percentages (pure math, always accurate) ---
    if total_income > 0:
        expense_pct = round((total_expense / total_income) * 100, 1)
        savings_pct = round((balance / total_income) * 100, 1)
    else:
        expense_pct = 0.0
        savings_pct = 0.0

    # biggest spending category
    top_category = max(by_category, key=by_category.get) if by_category else None

    # --- short AI comment on top of the numbers ---
    facts = (
        f"Income: {total_income}, Expenses: {total_expense}, "
        f"You spent {expense_pct}% of income and saved {savings_pct}%. "
        f"Biggest spending category: {top_category or 'none'}."
    )
    system_prompt = (
        "You are FinPilot, a friendly finance assistant. Given the user's numbers, "
        "write ONE short encouraging sentence about their saving rate and biggest expense. "
        "Do NOT repeat the exact percentages (they're shown separately). Amounts are in INR. "
        "Keep it to one sentence, warm and practical."
    )
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=f"{facts}\n\nGive me one short encouraging tip.",
            config=types.GenerateContentConfig(system_instruction=system_prompt),
        )
        comment = response.text
    except Exception:
        comment = "Keep tracking — small changes add up."

    return {
        "expense_pct": expense_pct,
        "savings_pct": savings_pct,
        "top_category": top_category,
        "comment": comment,
    }


@app.post("/ask")
def ask_ai(
    payload: AskRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    # 1. Pull only THIS user's transactions from the database
    transactions = session.exec(
        select(Transaction).where(Transaction.user_id == current_user.id)
    ).all()

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
            config=types.GenerateContentConfig(system_instruction=system_prompt),
        )
        answer = response.text
    except Exception:
        raise HTTPException(
            status_code=503,
            detail="The AI is busy right now. Please try again in a moment.",
        )

    return {"question": payload.question, "answer": answer}


@app.get("/transactions/{transaction_id}", response_model=Transaction)
def get_transaction(
    transaction_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    transaction = session.get(Transaction, transaction_id)
    if not transaction or transaction.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction


@app.delete("/transactions/{transaction_id}")
def delete_transaction(
    transaction_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    transaction = session.get(Transaction, transaction_id)
    if not transaction or transaction.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Transaction not found")
    session.delete(transaction)
    session.commit()
    return {"message": "Transaction deleted"}