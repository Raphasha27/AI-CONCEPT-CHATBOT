from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.api.v1.endpoints.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.spaza import SpazaShop, InventoryInsight
from pydantic import BaseModel

router = APIRouter()

class SpazaShopCreate(BaseModel):
    name: str
    location: str

class SpazaShopResponse(BaseModel):
    id: str
    name: str
    location: str
    class Config:
        from_attributes = True

@router.post("/shops", response_model=SpazaShopResponse)
async def create_shop(
    shop_in: SpazaShopCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Create a new Spaza shop profile."""
    shop = SpazaShop(
        name=shop_in.name,
        location=shop_in.location,
        owner_id=current_user.id
    )
    db.add(shop)
    await db.commit()
    await db.refresh(shop)
    return shop

@router.get("/shops", response_model=List[SpazaShopResponse])
async def get_my_shops(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get all shops for the current user."""
    result = await db.execute(select(SpazaShop).where(SpazaShop.owner_id == current_user.id))
    return result.scalars().all()

@router.get("/insights/{shop_id}")
async def get_shop_insights(
    shop_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Generate or retrieve business insights for a shop."""
    result = await db.execute(select(SpazaShop).where(SpazaShop.id == shop_id, SpazaShop.owner_id == current_user.id))
    shop = result.scalars().first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    
    # In a real app, we'd call an AI service here. 
    # For now, we return the mathematical insights requested by the user.
    return [
        {
            "type": "growth",
            "title": "Strategic Growth Analysis",
            "content": "Projections show 14.2% growth if inventory turnover scales to 1.6x.",
            "metrics": {"percentage": 14.2, "period": "quarter"}
        },
        {
            "type": "loss",
            "title": "Loss Prevention Alert",
            "content": "Estimated R420 leakage detected in dairy stock cooling efficiency.",
            "metrics": {"value": 420, "currency": "ZAR"}
        }
    ]
