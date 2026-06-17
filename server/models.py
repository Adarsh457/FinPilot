from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class TransactionBase(SQLModel):
    amount: float
    category: str
    type: str
    description: Optional[str] = None


class Transaction(TransactionBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    date: datetime = Field(default_factory=datetime.now)


class TransactionCreate(TransactionBase):
    pass