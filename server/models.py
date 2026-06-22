from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import field_validator
from sqlmodel import SQLModel, Field

class TransactionType(str, Enum):
    income = "income"
    expense = "expense"
class TransactionBase(SQLModel):
    amount: float
    category: str
    type: TransactionType          # now only "income" or "expense" allowed
    description: Optional[str] = None

    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, value):
        if value <= 0:
            raise ValueError("amount must be greater than 0")
        return value

    @field_validator("category")
    @classmethod
    def category_not_blank(cls, value):
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("category cannot be empty")
        return cleaned.lower()


class Transaction(TransactionBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    date: datetime = Field(default_factory=datetime.now)


class TransactionCreate(TransactionBase):
    pass