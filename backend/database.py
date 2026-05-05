"""
FairAI — Database layer
────────────────────────────────────────────────────────────────
Persists anonymised resume-scoring results for real percentile
benchmarking. No PII (name, email, phone, institution, etc.)
ever touches this table — only the role, the score, and a few
analytic flags.

Connection priority:
  1. DATABASE_URL env var (Render Postgres, e.g.
     postgres://user:pass@host:port/db)
  2. Fallback: local SQLite file (sqlite:///./local_scores.db)

Render note: Render exposes the legacy "postgres://" scheme, but
SQLAlchemy 2.x requires "postgresql://". We auto-normalise it.
"""
from __future__ import annotations

import os
import sys

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    Integer,
    String,
    create_engine,
    func,
)
from sqlalchemy.orm import declarative_base, sessionmaker


# ─── Connection string ────────────────────────────────────────
_DEFAULT_SQLITE_URL = "sqlite:///./local_scores.db"
DATABASE_URL = os.environ.get("DATABASE_URL", _DEFAULT_SQLITE_URL).strip()

# Render (and Heroku) hand out "postgres://..." — SQLAlchemy 2.x
# only accepts "postgresql://...". Normalise silently.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

_is_sqlite = DATABASE_URL.startswith("sqlite")

# SQLite needs a flag to be safe across FastAPI's threadpool
_engine_kwargs: dict = {"pool_pre_ping": True}
if _is_sqlite:
    _engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **_engine_kwargs)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,
)

Base = declarative_base()


# ─── Model ────────────────────────────────────────────────────
class ResumeScore(Base):
    """
    One row per completed /analyze invocation.

    PII-free by design: we store the role the candidate was
    scored against, the fit_score Bot 4 produced, and a couple
    of analytical flags used for trend reporting.
    """

    __tablename__ = "resume_scores"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    role_target = Column(String(255), nullable=False, index=True)
    fit_score = Column(Integer, nullable=False, index=True)
    contextual_ratio = Column(Float, nullable=False, default=0.5)
    has_pii_stripped = Column(Boolean, nullable=False, default=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    def __repr__(self) -> str:  # pragma: no cover
        return (
            f"<ResumeScore id={self.id} role={self.role_target!r} "
            f"fit={self.fit_score} ratio={self.contextual_ratio:.2f}>"
        )


# ─── Helpers ──────────────────────────────────────────────────
def init_db() -> None:
    """Create tables if they don't already exist. Idempotent."""
    try:
        Base.metadata.create_all(bind=engine)
        backend = "SQLite" if _is_sqlite else "PostgreSQL"
        print(f"[FairAI] DB ready ({backend}) — table 'resume_scores' ensured.")
    except Exception as e:  # noqa: BLE001
        # Never crash the app just because stats persistence is down.
        print(f"[FairAI] WARNING: could not initialise DB: {e}", file=sys.stderr)
