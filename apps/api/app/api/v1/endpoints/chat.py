"""
Chat endpoints — session management + RAG-powered AI responses.
"""
import json

import structlog
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.chat import ChatMessage, ChatSession
from app.models.user import User
from app.schemas import (
    ChatMessageResponse,
    ChatRequest,
    ChatResponse,
    ChatSessionCreate,
    ChatSessionResponse,
)
from app.services.audit_service import log_action
from app.services.rag_engine import generate_rag_answer, get_embedding, retrieve_relevant_documents

log = structlog.get_logger()
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


# ── Sessions ─────────────────────────────────────────────
@router.get("/sessions", response_model=list[ChatSessionResponse])
async def list_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.updated_at.desc())
        .limit(50)
    )
    return result.scalars().all()


@router.post("/sessions", response_model=ChatSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    payload: ChatSessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    session = ChatSession(user_id=current_user.id, title=payload.title or "New Chat")
    db.add(session)
    await db.flush()
    await db.refresh(session)
    return session


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ChatSession).where(
            ChatSession.id == session_id,
            ChatSession.user_id == current_user.id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    await db.delete(session)


@router.get("/sessions/{session_id}/messages", response_model=list[ChatMessageResponse])
async def get_messages(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ChatSession).where(
            ChatSession.id == session_id,
            ChatSession.user_id == current_user.id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    msgs = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
    )
    return msgs.scalars().all()


# ── Main Chat Endpoint ────────────────────────────────────
@router.post("/", response_model=ChatResponse)
@limiter.limit("30/minute")
async def chat(
    request: Request,
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Get or create session
    if payload.session_id:
        result = await db.execute(
            select(ChatSession).where(
                ChatSession.id == payload.session_id,
                ChatSession.user_id == current_user.id,
            )
        )
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
    else:
        session = ChatSession(
            user_id=current_user.id,
            title=payload.message[:50] + "..." if len(payload.message) > 50 else payload.message,
        )
        db.add(session)
        await db.flush()
        await db.refresh(session)

    # Save user message
    user_msg = ChatMessage(session_id=session.id, role="user", content=payload.message)
    db.add(user_msg)
    await db.flush()

    # RAG retrieval
    try:
        embedding = await get_embedding(payload.message)
        docs = await retrieve_relevant_documents(db, embedding)
    except Exception as e:
        log.warning("RAG retrieval failed", error=str(e))
        docs = []

    # Generate AI answer
    result_data = await generate_rag_answer(payload.message, docs, db)

    reply_text = (
        f"**{result_data.get('status', 'uncertain').upper()}**\n\n"
        f"{result_data.get('summary', '')}\n\n"
        f"📋 **Recommended Action:** {result_data.get('recommended_action', '')}"
    )

    # Save assistant message
    assistant_msg = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=reply_text,
        verification_result=json.dumps(result_data),
    )
    db.add(assistant_msg)

    # Audit
    await log_action(
        db,
        "CHAT_QUERY",
        user_id=current_user.id,
        metadata={"session_id": session.id, "status": result_data.get("status")},
        ip_address=request.client.host if request.client else None,
    )

    from app.models.dataset import VerificationRecord
    vr = VerificationRecord(
        user_id=current_user.id,
        query=payload.message,
        status=result_data.get("status", "uncertain"),
        confidence=result_data.get("confidence", 0.0),
        response_summary=result_data.get("summary", ""),
        sources=result_data.get("sources", []),
        recommended_action=result_data.get("recommended_action", ""),
    )
    db.add(vr)

    log.info("Chat response generated", session_id=session.id, status=result_data.get("status"))

    from app.schemas import VerificationResult
    ver_result = None
    if result_data:
        try:
            ver_result = VerificationResult(**result_data)
        except Exception:
            pass

    return ChatResponse(
        session_id=session.id,
        reply=reply_text,
        verification_result=ver_result,
        sources=result_data.get("sources", []),
    )
