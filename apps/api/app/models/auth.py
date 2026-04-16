from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Enum, Table
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.core.database import Base

class TenantType(str, enum.Enum):
    MUNICIPALITY = "municipality"
    SHOP = "shop"
    GOVERNMENT = "government"
    SYSTEM = "system"

class Tenant(Base):
    __tablename__ = "tenants"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[TenantType] = mapped_column(Enum(TenantType), default=TenantType.MUNICIPALITY)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    users = relationship("User", back_populates="tenant")

# Association table for User-Role (if users can have multiple roles across tenants)
user_roles = Table(
    "user_roles_association",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("role_id", Integer, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
)

class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False) # admin, citizen, spaza_owner, gov_agent
    permissions: Mapped[dict] = mapped_column(default={}) # JSON list of permissions

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    action: Mapped[str] = mapped_column(String(255))
    entity_type: Mapped[str] = mapped_column(String(100))
    entity_id: Mapped[str] = mapped_column(String(100))
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    metadata_json: Mapped[dict] = mapped_column(default={})
