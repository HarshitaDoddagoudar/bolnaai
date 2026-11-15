from datetime import datetime, timezone
from sqlalchemy import String, Text, DateTime, Float
from sqlalchemy.orm import Mapped, mapped_column
from .database import Base
class CallRecord(Base):
    __tablename__ = "calls"
    id: Mapped[str] = mapped_column(String(120), primary_key=True)
    agent_id: Mapped[str] = mapped_column(String(120), default="", index=True)
    status: Mapped[str] = mapped_column(String(40), default="", index=True)
    scenario_id: Mapped[str] = mapped_column(String(120), default="unspecified")
    transcript: Mapped[str] = mapped_column(Text, default="")
    event_log: Mapped[str] = mapped_column(Text, default="")
    raw_payload: Mapped[str] = mapped_column(Text, default="{}")
    report_json: Mapped[str] = mapped_column(Text, default="")
    evaluation_status: Mapped[str] = mapped_column(String(40), default="pending")
    score: Mapped[float | None] = mapped_column(Float, nullable=True)
    received_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    evaluated_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    error: Mapped[str] = mapped_column(Text, default="")
