"""
Database models — verification records, datasets, audit logs, municipal reports.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Dataset(Base):
    __tablename__ = "datasets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    source: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    document_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    documents = relationship("DatasetDocument", back_populates="dataset", cascade="all, delete-orphan")


class DatasetDocument(Base):
    __tablename__ = "dataset_documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    dataset_id: Mapped[int] = mapped_column(
        ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str | None] = mapped_column(String(500), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    # embedding stored as pgvector — column added via raw SQL in init.sql
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    dataset = relationship("Dataset", back_populates="documents")


class VerificationRecord(Base):
    __tablename__ = "verification_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    query: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="uncertain")
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    response_summary: Mapped[str] = mapped_column(Text, nullable=False)
    sources: Mapped[dict] = mapped_column(JSONB, default=list)
    recommended_action: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    user = relationship("User", back_populates="verification_records")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    action: Mapped[str] = mapped_column(String(255), nullable=False)
    metadata: Mapped[dict] = mapped_column(JSONB, default=dict)
    ip_address: Mapped[str | None] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    user = relationship("User", back_populates="audit_logs")


class MunicipalReport(Base):
    __tablename__ = "municipal_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tracking_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), default=uuid.uuid4, unique=True, index=True)
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True
    )
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    urgency_score: Mapped[int] = mapped_column(Integer, default=1)
    location: Mapped[str | None] = mapped_column(String(500), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    ward: Mapped[str | None] = mapped_column(String(100), nullable=True)
    households_affected: Mapped[int] = mapped_column(Integer, default=1)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    municipality: Mapped[str | None] = mapped_column(String(255), nullable=True)
    suggested_department: Mapped[str] = mapped_column(String(255), nullable=False)
    generated_report: Mapped[str] = mapped_column(Text, nullable=False)
    evidence_urls: Mapped[dict] = mapped_column(JSONB, default=list)
    is_anonymous: Mapped[bool] = mapped_column(Integer, default=False)
    upvotes: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(50), default="submitted")  # submitted, acknowledged, in_progress, resolved, escalated
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="municipal_reports")
