import os
from contextlib import asynccontextmanager

from datetime import datetime, timedelta
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from pydantic import BaseModel
from sqlmodel import Session, select


from database import create_db_and_tables, get_session
from models import Transaction, TransactionCreate, User, UserCreate, Token, Budget, BudgetCreate
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
    allow_origins=["http://localhost:3000",
                   "http://localhost:5173", "https://finpilotagent.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---- request body for the AI endpoint ----
class AskRequest(BaseModel):
    question: str


class ReceiptData(BaseModel):
    amount: float
    category: str
    description: str
    type: str


# ---- Public routes ----

@app.get("/")
def home():
    return {"message": "FinPilot API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/register", response_model=Token)
def register(user: UserCreate, session: Session = Depends(get_session)):
    existing = session.exec(select(User).where(
        User.username == user.username)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")
    new_user = User(username=user.username,
                    hashed_password=hash_password(user.password))
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return Token(access_token=create_access_token(new_user.username))


@app.post("/login", response_model=Token)
def login(user: UserCreate, session: Session = Depends(get_session)):
    db_user = session.exec(select(User).where(
        User.username == user.username)).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=401, detail="Invalid username or password")
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
    db_transaction = Transaction.model_validate(
        transaction, update={"user_id": current_user.id})
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
            by_category[t.category] = by_category.get(
                t.category, 0.0) + t.amount

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
            by_category[t.category] = by_category.get(
                t.category, 0.0) + t.amount

    balance = total_income - total_expense

    # --- the percentages (pure math, always accurate) ---
    if total_income > 0:
        expense_pct = round((total_expense / total_income) * 100, 1)
        savings_pct = round((balance / total_income) * 100, 1)
    else:
        expense_pct = 0.0
        savings_pct = 0.0

    # biggest spending category
    top_category = max(
        by_category, key=by_category.get) if by_category else None

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
            config=types.GenerateContentConfig(
                system_instruction=system_prompt),
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


@app.get("/dashboard-stats")
def dashboard_stats(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    transactions = session.exec(
        select(Transaction).where(Transaction.user_id == current_user.id)
    ).all()

    now = datetime.now()
    week_ago = now - timedelta(days=7)

    total_income = 0.0
    total_expense = 0.0
    month_expense = 0.0
    week_expense = 0.0

    for t in transactions:
        if t.type == "income":
            total_income += t.amount
        else:
            total_expense += t.amount
            if t.date.month == now.month and t.date.year == now.year:
                month_expense += t.amount
            if t.date >= week_ago:
                week_expense += t.amount

    return {
        "balance": total_income - total_expense,
        "total_income": total_income,
        "month_expense": month_expense,
        "week_expense": week_expense,
    }


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


# ---- Receipt ----

@app.post("/scan-receipt")
async def scan_receipt(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    image_bytes = await file.read()

    prompt = (
        "This is a photo of a financial document — it could be a receipt, a bill, "
        "or an income document like a salary slip or payslip. Read it and extract: "
        "1) 'amount' — the main total or net amount, as a number. "
        "2) 'type' — 'income' if it's a salary slip / payslip / payment received, "
        "otherwise 'expense' for receipts and bills. "
        "3) 'description' — a short label (the shop, employer, or what it's for). "
        "4) 'category' — the best fit from: food, rent, bills, transport, shopping, "
        "entertainment, health, salary, other. Use 'salary' for payslips. "
        "If you can't read the amount, set it to 0."
    )

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_bytes(
                    data=image_bytes, mime_type=file.content_type or "image/jpeg"),
                prompt,
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ReceiptData,
            ),
        )
        data = response.parsed
    except Exception:
        raise HTTPException(
            status_code=503, detail="Couldn't read the document. Try a clearer photo.")

    if data is None or data.amount <= 0:
        raise HTTPException(
            status_code=422, detail="Couldn't find an amount on this document. Please enter it manually.")

    # only accept the two valid types; default to expense if the AI returns something odd
    tx_type = data.type.lower() if data.type.lower() in (
        "income", "expense") else "expense"

    return {
        "amount": data.amount,
        "category": data.category.lower(),
        "description": data.description,
        "type": tx_type,
    }

# ---- Budgets ----


@app.post("/budgets", response_model=Budget)
def set_budget(
    payload: BudgetCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    # one budget per category — update it if it already exists, otherwise create
    existing = session.exec(
        select(Budget).where(
            Budget.user_id == current_user.id,
            Budget.category == payload.category,
        )
    ).first()
    if existing:
        existing.limit_amount = payload.limit_amount
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return existing
    budget = Budget(
        user_id=current_user.id,
        category=payload.category,
        limit_amount=payload.limit_amount,
    )
    session.add(budget)
    session.commit()
    session.refresh(budget)
    return budget


@app.get("/budgets")
def get_budgets(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    budgets = session.exec(
        select(Budget).where(Budget.user_id == current_user.id)
    ).all()

    # how much has this user spent per category THIS month?
    now = datetime.now()
    expenses = session.exec(
        select(Transaction).where(
            Transaction.user_id == current_user.id,
            Transaction.type == "expense",
        )
    ).all()

    spent_by_category = {}
    for t in expenses:
        if t.date.month == now.month and t.date.year == now.year:
            spent_by_category[t.category] = spent_by_category.get(
                t.category, 0.0) + t.amount

    # build each budget with its live spending + status
    result = []
    for b in budgets:
        spent = spent_by_category.get(b.category, 0.0)
        pct = round((spent / b.limit_amount) * 100,
                    1) if b.limit_amount > 0 else 0.0
        if pct >= 100:
            status = "over"
        elif pct >= 80:
            status = "warning"
        else:
            status = "ok"
        result.append({
            "id": b.id,
            "category": b.category,
            "limit_amount": b.limit_amount,
            "spent": spent,
            "percentage": pct,
            "status": status,
        })
    return result


@app.delete("/budgets/{budget_id}")
def delete_budget(
    budget_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    budget = session.get(Budget, budget_id)
    if not budget or budget.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Budget not found")
    session.delete(budget)
    session.commit()
    return {"message": "Budget deleted"}
