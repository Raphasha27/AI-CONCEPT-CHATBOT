"""
User model — accounts + roles.
"""
import enum
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum, Integer, String, Column, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole), default=UserRole.USER, nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    role = Column(String(50), default="citizen") # citizen, gov_agent, spaza_owner, admin
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    
    # New relationships
    tenant = relationship("Tenant", back_populates="users")
    chat_sessions = relationship("ChatSession", back_populates="user")
    verifications = relationship("VerificationRecord", back_populates="user")
    municipal_reports = relationship("MunicipalReport", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")
    shops = relationship("SpazaShop", back_populates="owner", cascade="all, delete-orphan")
