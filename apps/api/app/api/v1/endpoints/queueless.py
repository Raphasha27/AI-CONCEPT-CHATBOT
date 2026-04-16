from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.booking import Office, TimeSlot, Booking, BookingStatus
from app.schemas import OfficeResponse, TimeSlotResponse, BookingCreate, BookingResponse

router = APIRouter()

@router.get("/offices", response_model=List[OfficeResponse])
async def list_offices(
    office_type: str = Query(None),
    db: AsyncSession = Depends(get_db)
):
    query = select(Office)
    if office_type:
        query = query.where(Office.office_type == office_type)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/offices/{office_id}/slots", response_model=List[TimeSlotResponse])
async def get_office_slots(
    office_id: int,
    db: AsyncSession = Depends(get_db)
):
    # For demo: if no slots exist, generate some for today/tomorrow
    result = await db.execute(select(TimeSlot).where(TimeSlot.office_id == office_id))
    slots = result.scalars().all()
    
    if not slots:
        # Generate mock slots
        now = datetime.utcnow().replace(minute=0, second=0, microsecond=0)
        for i in range(1, 9): # 8 slots
            start = now + timedelta(hours=i + 24) # Starts tomorrow
            end = start + timedelta(hours=1)
            new_slot = TimeSlot(office_id=office_id, start_time=start, end_time=end, capacity=5)
            db.add(new_slot)
        await db.commit()
        result = await db.execute(select(TimeSlot).where(TimeSlot.office_id == office_id))
        slots = result.scalars().all()
        
    return slots

@router.post("/book", response_model=BookingResponse)
async def create_booking(
    payload: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 1. Check slot capacity
    result = await db.execute(select(TimeSlot).where(TimeSlot.id == payload.slot_id))
    slot = result.scalar_one_or_none()
    if not slot or slot.booked_count >= slot.capacity:
        raise HTTPException(status_code=400, detail="Time slot is full or invalid")

    # 2. Create booking
    booking = Booking(
        user_id=current_user.id,
        office_id=payload.office_id,
        slot_id=payload.slot_id,
        service_type=payload.service_type,
        notes=payload.notes,
        status=BookingStatus.CONFIRMED # Auto-confirm for now
    )
    
    # 3. Increment booked count
    slot.booked_count += 1
    
    db.add(booking)
    await db.commit()
    await db.refresh(booking)
    return booking

@router.get("/my-bookings", response_model=List[BookingResponse])
async def list_my_bookings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy.orm import joinedload
    result = await db.execute(
        select(Booking)
        .options(joinedload(Booking.office), joinedload(Booking.time_slot))
        .where(Booking.user_id == current_user.id)
        .order_by(Booking.created_at.desc())
    )
    return result.scalars().all()
