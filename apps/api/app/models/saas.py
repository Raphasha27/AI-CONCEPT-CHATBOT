from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Subscription(Base):
    __tablename__ = "subscriptions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tenant_id: Mapped[str] = mapped_column(String(36), ForeignKey("tenants.id"), unique=True)
    plan: Mapped[str] = mapped_column(String(50), default="free") # free, pro, enterprise
    status: Mapped[str] = mapped_column(String(50), default="active")
    stripe_customer_id: Mapped[str] = mapped_column(String(255), nullable=True)
    stripe_subscription_id: Mapped[str] = mapped_column(String(255), nullable=True)
    current_period_end: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

class UsageEvent(Base):
    __tablename__ = "usage_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tenant_id: Mapped[str] = mapped_column(String(36), ForeignKey("tenants.id"))
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    event_type: Mapped[str] = mapped_column(String(100)) # ai_call, simulation, prediction
    cost: Mapped[float] = mapped_column(Float, default=0.0)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    metadata_json: Mapped[dict] = mapped_column(JSON, default={})
