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
    text,
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
    One row per completed /analyze OR /counterfactual-test invocation.

    PII-free by design: we store the role the candidate was
    scored against, the fit_score Bot 4 produced, and a couple
    of analytical flags used for trend reporting.

    Bias delta columns (nullable) are populated when /counterfactual-test
    is run, enabling the /bias-comparison aggregate dashboard.
    """

    __tablename__ = "resume_scores"

    id               = Column(Integer, primary_key=True, index=True, autoincrement=True)
    role_target      = Column(String(255), nullable=False, index=True)
    fit_score        = Column(Integer, nullable=False, index=True)
    contextual_ratio = Column(Float, nullable=False, default=0.5)
    has_pii_stripped = Column(Boolean, nullable=False, default=True)
    timestamp        = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # ── Bias delta columns (None if counterfactual was not run) ──
    delta_institution = Column(Float, nullable=True)   # inst_score - original_score
    delta_gap         = Column(Float, nullable=True)   # gap_score  - original_score
    delta_name        = Column(Float, nullable=True)   # name_score - original_score
    delta_combined    = Column(Float, nullable=True)   # all-combined - original_score
    evaluator_model   = Column(String(64), nullable=True)  # "aethel" | "llama" | etc.

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
        
        # --- Migration for newly added columns ---
        # sqlalchemy's create_all doesn't add new columns to existing tables
        with engine.connect() as conn:
            # We wrap in try-except because ALTER TABLE fails if column already exists
            # and SQLite ALTER TABLE doesn't support IF NOT EXISTS in all versions.
            columns = [
                "delta_institution FLOAT",
                "delta_gap FLOAT",
                "delta_name FLOAT",
                "delta_combined FLOAT",
                "evaluator_model VARCHAR(64)"
            ]
            for col in columns:
                try:
                    conn.execute(text(f"ALTER TABLE resume_scores ADD COLUMN {col}"))
                    conn.commit()
                except Exception:
                    pass  # column already exists or syntax error

        backend = "SQLite" if _is_sqlite else "PostgreSQL"
        print(f"[FairAI] DB ready ({backend}) — table 'resume_scores' ensured.")
    except Exception as e:  # noqa: BLE001
        # Never crash the app just because stats persistence is down.
        print(f"[FairAI] WARNING: could not initialise DB: {e}", file=sys.stderr)


def record_bias_deltas(
    role_target: str,
    original_score: float,
    variants: dict,          # {"institution": 93, "gap": 90, "name": 88, "combined": 95}
    evaluator_model: str = "aethel",
) -> None:
    """
    Write per-signal bias deltas to the resume_scores table after a
    /counterfactual-test run.

    Fails silently so it NEVER blocks the API response.

    Args:
        variants: keys must include institution, gap, name, combined.
                  Values are absolute scores (not deltas) — we compute
                  the delta here as variant_score - original_score.
    """
    try:
        with SessionLocal() as db:
            row = ResumeScore(
                role_target=role_target,
                fit_score=int(original_score),
                contextual_ratio=0.5,
                has_pii_stripped=True,
                delta_institution=variants.get("institution", original_score) - original_score,
                delta_gap=variants.get("gap", original_score) - original_score,
                delta_name=variants.get("name", original_score) - original_score,
                delta_combined=variants.get("combined", original_score) - original_score,
                evaluator_model=evaluator_model,
            )
            db.add(row)
            db.commit()
            print(f"[FairAI] Bias deltas recorded — role={role_target}, model={evaluator_model}, "
                  f"Δinst={row.delta_institution:+.1f} Δgap={row.delta_gap:+.1f} "
                  f"Δname={row.delta_name:+.1f}")
    except Exception as e:
        print(f"[FairAI] WARNING: Failed to record bias deltas: {e}", file=sys.stderr)


def get_bias_trends(role_target: str | None = None, limit: int = 100) -> list[dict]:
    """
    Fetch bias delta rows for the /bias-comparison and /bias-trends endpoints.

    Args:
        role_target: optional role filter; None returns all roles.
        limit: max rows to return (most recent first).

    Returns a list of dicts, each with:
        id, role_target, fit_score, delta_institution, delta_gap,
        delta_name, delta_combined, evaluator_model, timestamp, total_bias
    """
    try:
        with SessionLocal() as db:
            q = db.query(ResumeScore).filter(
                ResumeScore.delta_institution.isnot(None)
            )
            if role_target:
                q = q.filter(ResumeScore.role_target == role_target)
            rows = q.order_by(ResumeScore.timestamp.desc()).limit(limit).all()

            result = []
            for r in rows:
                deltas = [r.delta_institution, r.delta_gap, r.delta_name]
                total_bias = sum(abs(d) for d in deltas if d is not None)
                result.append({
                    "id":                r.id,
                    "role_target":       r.role_target,
                    "fit_score":         r.fit_score,
                    "delta_institution": r.delta_institution,
                    "delta_gap":         r.delta_gap,
                    "delta_name":        r.delta_name,
                    "delta_combined":    r.delta_combined,
                    "evaluator_model":   r.evaluator_model,
                    "timestamp":         r.timestamp.isoformat() if r.timestamp else None,
                    "total_bias":        round(total_bias, 2),
                })
            return result
    except Exception as e:
        print(f"[FairAI] WARNING: get_bias_trends failed: {e}", file=sys.stderr)
        return []
