from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid

from app.core.database import Base

class TaxBracket(Base):
    __tablename__ = "tax_brackets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    min_turnover: Mapped[float] = mapped_column(Float, nullable=False)
    max_turnover: Mapped[float] = mapped_column(Float, nullable=False)
    base_tax: Mapped[float] = mapped_column(Float, default=0.0)
    rate_percentage: Mapped[float] = mapped_column(Float, default=0.0)
    tax_year: Mapped[int] = mapped_column(Integer, default=2025)

class IncomeEntry(Base):
    __tablename__ = "tax_income_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    shop_id: Mapped[str] = mapped_column(String(36), ForeignKey("spaza_shops.id", ondelete="CASCADE"), index=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    category: Mapped[str] = mapped_column(String(50), default="sales")  # sales, other
    entry_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[dict] = mapped_column(JSONB, default=dict)

    shop = relationship("SpazaShop")

class TaxSummary(Base):
    __tablename__ = "tax_year_summaries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    shop_id: Mapped[str] = mapped_column(String(36), ForeignKey("spaza_shops.id", ondelete="CASCADE"), index=True)
    tax_year: Mapped[int] = mapped_column(Integer, nullable=False)
    total_turnover: Mapped[float] = mapped_column(Float, default=0.0)
    estimated_tax: Mapped[float] = mapped_column(Float, default=0.0)
    last_updated: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    shop = relationship("SpazaShop")

class ComplianceReminder(Base):
    __tablename__ = "compliance_reminders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    deadline: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    remind_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    owner = relationship("User")
