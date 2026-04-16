import math
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.tax import TaxBracket, IncomeEntry, TaxSummary

async def get_active_brackets(db: AsyncSession, year: int = 2025) -> List[TaxBracket]:
    result = await db.execute(
        select(TaxBracket)
        .where(TaxBracket.tax_year == year)
        .order_by(TaxBracket.min_turnover)
    )
    return result.scalars().all()

def calculate_turnover_tax(turnover: float, brackets: List[TaxBracket]) -> float:
    """
    Tax = base_tax + (turnover - min_turnover) * rate_percentage
    """
    applicable_bracket = None
    for b in brackets:
        if b.min_turnover <= turnover <= b.max_turnover:
            applicable_bracket = b
            break
    
    if not applicable_bracket:
        # If exceeds max bracket, use the last one
        applicable_bracket = brackets[-1] if brackets else None

    if not applicable_bracket:
        return 0.0

    excess = max(0, turnover - applicable_bracket.min_turnover)
    tax = applicable_bracket.base_tax + (excess * (applicable_bracket.rate_percentage / 100))
    return tax

async def get_shop_tax_summary(db: AsyncSession, shop_id: str, year: int = 2025) -> dict:
    # 1. Get total turnover for the year
    # SARS Tax Year: March 1 to Feb 28/29
    start_date = datetime(year - 1, 3, 1)
    end_date = datetime(year, 2, 28, 23, 59, 59)
    
    result = await db.execute(
        select(func.sum(IncomeEntry.amount))
        .where(
            IncomeEntry.shop_id == shop_id,
            IncomeEntry.entry_date >= start_date,
            IncomeEntry.entry_date <= end_date
        )
    )
    total_turnover = result.scalar() or 0.0

    # 2. Daily average for forecast (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    result_30 = await db.execute(
        select(func.sum(IncomeEntry.amount))
        .where(
            IncomeEntry.shop_id == shop_id,
            IncomeEntry.entry_date >= thirty_days_ago
        )
    )
    last_30_total = result_30.scalar() or 0.0
    avg_daily = last_30_total / 30

    # 3. Project year end
    remaining_days = (end_date - datetime.utcnow()).days
    if remaining_days < 0: remaining_days = 0
    projected_turnover = total_turnover + (avg_daily * remaining_days)

    # 4. Calculate tax
    brackets = await get_active_brackets(db, year)
    estimated_tax = calculate_turnover_tax(total_turnover, brackets)
    
    current_bracket = None
    for b in brackets:
        if b.min_turnover <= total_turnover <= b.max_turnover:
            current_bracket = b
            break

    return {
        "shop_id": shop_id,
        "tax_year": year,
        "total_turnover": total_turnover,
        "estimated_tax": estimated_tax,
        "current_bracket": current_bracket,
        "projected_turnover": projected_turnover,
        "progress_percentage": min(100.0, (total_turnover / 1000000) * 100) # Assuming 1M is the max micro-business cap
    }
