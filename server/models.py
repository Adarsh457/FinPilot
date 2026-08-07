from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import field_validator
from sqlmodel import SQLModel, Field

class Budget(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    category: str
    limit_amount: float


class BudgetCreate(SQLModel):
    category: str
    limit_amount: float

    @field_validator("limit_amount")
    @classmethod
    def limit_positive(cls, value):
        if value <= 0:
            raise ValueError("limit must be greater than 0")
        return value

    @field_validator("category")
    @classmethod
    def category_not_blank(cls, value):
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("category cannot be empty")
        return cleaned.lower()

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
    user_id: int = Field(foreign_key="user.id")  

class TransactionCreate(TransactionBase):
    pass

# ---- Auth models ----

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    hashed_password: str


class UserCreate(SQLModel):
    username: str
    password: str

    @field_validator("username")
    @classmethod
    def username_valid(cls, value):
        cleaned = value.strip()
        if len(cleaned) < 3:
            raise ValueError("Username must be at least 3 characters")
        if not any(c.isalpha() for c in cleaned):
            raise ValueError("Username must contain at least one letter")
        if not cleaned.replace("_", "").isalnum():
            raise ValueError("Username can only use letters, numbers, and underscores")
        return cleaned

    @field_validator("password")
    @classmethod
    def password_valid(cls, value):
        if len(value) < 6:
            raise ValueError("Password must be at least 6 characters")
        return value


class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"