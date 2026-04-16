from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.core.database import Base

class BookingStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class Office(Base):
    __tablename__ = "offices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str] = mapped_column(String(500), nullable=False)
    office_type: Mapped[str] = mapped_column(String(100), nullable=False) # DHA, SASSA, PostOffice
    
    slots = relationship("TimeSlot", back_populates="office", cascade="all, delete-orphan")

class TimeSlot(Base):
    __tablename__ = "time_slots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    office_id: Mapped[int] = mapped_column(Integer, ForeignKey("offices.id", ondelete="CASCADE"), nullable=False)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    capacity: Mapped[int] = mapped_column(Integer, default=1)
    booked_count: Mapped[int] = mapped_column(Integer, default=0)

    office = relationship("Office", back_populates="slots")

class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    office_id: Mapped[int] = mapped_column(Integer, ForeignKey("offices.id", ondelete="CASCADE"), nullable=False, index=True)
    slot_id: Mapped[int] = mapped_column(Integer, ForeignKey("time_slots.id", ondelete="CASCADE"), nullable=False)
    service_type: Mapped[str] = mapped_column(String(255), nullable=False) # Passport, ID, Grant, etc.
    status: Mapped[BookingStatus] = mapped_column(Enum(BookingStatus), default=BookingStatus.PENDING)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    user = relationship("User")
    office = relationship("Office")
    time_slot = relationship("TimeSlot")
