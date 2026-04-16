"""
Pydantic v2 schemas for all API endpoints.
"""
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


# ── Auth ──────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=255)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def password_complexity(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Chat ──────────────────────────────────────────────────
class ChatSessionCreate(BaseModel):
    title: Optional[str] = "New Chat"


class ChatSessionResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ChatMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    verification_result: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    session_id: Optional[int] = None


class VerificationResult(BaseModel):
    status: str  # verified | unverified | uncertain
    confidence: float = Field(ge=0.0, le=1.0)
    summary: str
    sources: List[str] = []
    recommended_action: str


class ChatResponse(BaseModel):
    session_id: int
    reply: str
    verification_result: Optional[VerificationResult] = None
    sources: List[str] = []


# ── Reports ───────────────────────────────────────────────
class ReportGenerateRequest(BaseModel):
    description: str = Field(min_length=10, max_length=3000)
    location: Optional[str] = Field(default=None, max_length=500)
    municipality: Optional[str] = Field(default=None, max_length=255)


class ReportGenerateResponse(BaseModel):
    report_id: int
    category: str
    urgency_score: int
    municipality: Optional[str]
    suggested_department: str
    generated_report: str
    status: str

    model_config = {"from_attributes": True}


class MunicipalReportResponse(BaseModel):
    id: int
    category: str
    urgency_score: int
    location: Optional[str]
    description: str
    municipality: Optional[str]
    suggested_department: str
    generated_report: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Dataset / Admin ───────────────────────────────────────
class DatasetResponse(BaseModel):
    id: int
    name: str
    source: str
    description: Optional[str]
    document_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Audit ─────────────────────────────────────────────────
class AuditLogResponse(BaseModel):
    id: int
    action: str
    metadata: Dict[str, Any]
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Pagination ────────────────────────────────────────────
class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    page_size: int
    pages: int
