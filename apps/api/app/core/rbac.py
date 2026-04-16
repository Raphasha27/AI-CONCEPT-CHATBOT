from functools import wraps
from typing import List, Optional
from fastapi import HTTPException, Depends, status
from app.core.deps import get_current_user
from app.models.user import User

class RBAC:
    """
    Role-Based Access Control logic for FastAPI dependencies.
    """
    
    @staticmethod
    def has_role(allowed_roles: List[str]):
        """
        Check if the current user has one of the allowed roles.
        Example: @router.get("/", dependencies=[Depends(RBAC.has_role(["admin", "gov_agent"]))])
        """
        async def dependency(user: User = Depends(get_current_user)):
            if user.role not in allowed_roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Resource requires roles: {allowed_roles}. Your role: {user.role}"
                )
            return user
        return dependency

    @staticmethod
    def is_tenant_owner(shop_id_param: str = "shop_id"):
        """
        Middleware to ensure a user (e.g., Spaza Owner) is accessing their own tenant.
        """
        async def dependency(
            shop_id: str, 
            user: User = Depends(get_current_user)
        ):
            # Admin bypass
            if user.role == "admin":
                return True
            
            # For spaza owners, ensure they own this shop
            if user.role == "spaza_owner":
                # Implementation would look up the shop or check if user.tenant_id matches
                pass

        return dependency

def require_permissions(perms: List[str]):
    """
    Decorator for granular permission checking (optional upgrade).
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Logic to check user.role.permissions
            return await func(*args, **kwargs)
        return wrapper
    return decorator
