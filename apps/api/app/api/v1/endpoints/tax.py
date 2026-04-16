from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.spaza import SpazaShop
from app.models.tax import IncomeEntry, TaxBracket
from app.schemas import (
    IncomeEntryCreate, 
    IncomeEntryResponse, 
    TaxSummaryResponse,
    TaxBracketResponse
)
from app.services.tax_service import get_shop_tax_summary, get_active_brackets

router = APIRouter()

async def get_user_shop(db: AsyncSession, user: User) -> SpazaShop:
    result = await db.execute(
        select(SpazaShop).where(SpazaShop.owner_id == user.id)
    )
    shop = result.scalar_one_or_none()
    if not shop:
        raise HTTPException(status_code=404, detail="No spaza shop found for this user")
    return shop

@router.post("/income-entry", response_model=IncomeEntryResponse)
async def add_income_entry(
    payload: IncomeEntryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Security: Ensure user owns the shop
    shop = await get_user_shop(db, current_user)
    if shop.id != payload.shop_id:
        raise HTTPException(status_code=403, detail="Not authorized for this shop")

    entry = IncomeEntry(
        shop_id=payload.shop_id,
        amount=payload.amount,
        category=payload.category,
        entry_date=payload.entry_date or None,
        notes=payload.notes
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry

@router.get("/summary", response_model=TaxSummaryResponse)
async def get_tax_summary(
    year: int = 2025,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    shop = await get_user_shop(db, current_user)
    summary = await get_shop_tax_summary(db, shop.id, year)
    return summary

@router.get("/brackets", response_model=List[TaxBracketResponse])
async def list_tax_brackets(
    year: int = 2025,
    db: AsyncSession = Depends(get_db)
):
    brackets = await get_active_brackets(db, year)
    return brackets

@router.get("/history", response_model=List[IncomeEntryResponse])
async def get_income_history(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    shop = await get_user_shop(db, current_user)
    result = await db.execute(
        select(IncomeEntry)
        .where(IncomeEntry.shop_id == shop.id)
        .order_by(IncomeEntry.entry_date.desc())
        .limit(limit)
    )
    return result.scalars().all()
