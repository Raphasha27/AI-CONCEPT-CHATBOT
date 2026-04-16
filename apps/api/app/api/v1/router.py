"""
Main API v1 router — aggregates all route modules.
"""
from fastapi import APIRouter

from app.api.v1.endpoints import auth, chat, reports, datasets, admin, users, spaza, tax, queueless, command_center, national, billing, hybrid, incidents

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
api_router.include_router(reports.router, prefix="/reports", tags=["Municipal Reports"])
api_router.include_router(datasets.router, prefix="/datasets", tags=["Datasets"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(spaza.router, prefix="/spaza", tags=["SpazaAI"])
api_router.include_router(tax.router, prefix="/tax", tags=["TaxMate"])
api_router.include_router(queueless.router, prefix="/queueless", tags=["QueueLess AI"])
api_router.include_router(command_center.router, prefix="/command-center", tags=["Command Center"])
api_router.include_router(national.router, prefix="/national", tags=["National Control Tower"])
api_router.include_router(billing.router, prefix="/billing", tags=["SaaS Billing"])
api_router.include_router(hybrid.router, prefix="/hybrid", tags=["Hybrid National Intelligence"])
api_router.include_router(incidents.router, prefix="/incidents", tags=["CivicOS Incidents"])
