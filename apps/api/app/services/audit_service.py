"""
Audit log service.
"""
from typing import Any, Dict, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dataset import AuditLog


async def log_action(
    db: AsyncSession,
    action: str,
    user_id: Optional[int] = None,
    metadata: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
) -> None:
    """Write an audit log entry."""
    entry = AuditLog(
        user_id=user_id,
        action=action,
        metadata=metadata or {},
        ip_address=ip_address,
    )
    db.add(entry)
    await db.flush()
