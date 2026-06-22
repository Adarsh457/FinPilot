from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from database import create_db_and_tables, get_session
from models import Transaction, TransactionCreate


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


# 1. Create the app FIRST
app = FastAPI(title="FinPilot API", lifespan=lifespan)

# 2. THEN add the middleware (it needs 'app' to already exist)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # your React dev URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
            by_category[t.category] = by_category.get(t.category, 0.0) + t.amount

    balance = total_income - total_expense

    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": balance,
        "expense_by_category": by_category,
    }


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