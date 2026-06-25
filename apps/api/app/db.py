from __future__ import annotations

import os
from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, String, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./worldcup_path.db")
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


class Prediction(Base):
    __tablename__ = "predictions"

    id: Mapped[str] = mapped_column(String(16), primary_key=True)
    snapshot_id: Mapped[str] = mapped_column(String(64), index=True)
    state: Mapped[dict] = mapped_column(JSON)
    derived_state: Mapped[dict] = mapped_column(JSON)
    engine_version: Mapped[str] = mapped_column(String(16), default="1.0.0")
    schema_version: Mapped[str] = mapped_column(String(16), default="1.0.0")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
