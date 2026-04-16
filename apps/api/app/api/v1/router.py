"""
Main API v1 router — aggregates all route modules.
"""
from fastapi import APIRouter

from app.api.v1.endpoints import auth, chat, reports, datasets, admin, users, spaza

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
api_router.include_router(reports.router, prefix="/reports", tags=["Municipal Reports"])
api_router.include_router(datasets.router, prefix="/datasets", tags=["Datasets"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(spaza.router, prefix="/spaza", tags=["SpazaAI"])
