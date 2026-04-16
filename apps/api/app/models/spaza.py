from sqlalchemy import Column, String, Float, ForeignKey, JSON, DateTime, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

class SpazaShop(Base):
    __tablename__ = "spaza_shops"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    location = Column(String(255))
    metrics = Column(JSON, default={})  # Weekly sales, stock levels, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    owner = relationship("User", back_populates="shops")
    insights = relationship("InventoryInsight", back_populates="shop", cascade="all, delete-orphan")

class InventoryInsight(Base):
    __tablename__ = "inventory_insights"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    shop_id = Column(String(36), ForeignKey("spaza_shops.id"), nullable=False)
    type = Column(String(50))  # restock, pricing, tax, loss
    title = Column(String(255))
    content = Column(String(1000))
    metadata_json = Column(JSON, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    shop = relationship("SpazaShop", back_populates="insights")
