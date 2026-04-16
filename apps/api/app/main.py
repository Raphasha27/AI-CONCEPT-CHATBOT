"""
VerifyZA FastAPI Application Entry Point
"""
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.router import api_router
from app.core.logging import setup_logging
from app.models.spaza import SpazaShop, InventoryInsight

setup_logging()
log = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — startup + shutdown."""
    log.info("Starting VerifyZA API", environment=settings.ENVIRONMENT)
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    log.info("Database tables initialized")
    yield
    log.info("Shutting down VerifyZA API")
    await engine.dispose()


# Rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="VerifyZA API",
    description="AI Compliance & Accreditation Verification Platform for South Africa",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)

# Trusted host
if settings.ENVIRONMENT == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.ALLOWED_HOSTS.split(","),
    )

# Routes
app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return JSONResponse(
        content={
            "status": "healthy",
            "service": "VerifyZA API",
            "version": "1.0.0",
            "environment": settings.ENVIRONMENT,
        }
    )


@app.get("/", tags=["Root"])
async def root():
    return {"message": "VerifyZA API — South Africa Compliance Verification Platform"}
