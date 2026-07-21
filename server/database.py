import os
from sqlmodel import SQLModel, create_engine, Session

# Local dev falls back to SQLite; production sets DATABASE_URL (Postgres)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///finpilot.db")

# Managed Postgres often hands out a "postgres://" URL — normalize it for
# SQLAlchemy and point it at the modern psycopg (v3) driver.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

# check_same_thread is a SQLite-only setting
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session