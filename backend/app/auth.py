from fastapi import Depends, HTTPException, Header
from typing import Optional
from app.supabase_client import supabase


def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    """
    FastAPI dependency.
    Reads the Bearer token from the Authorization header,
    verifies it with Supabase, and returns the user's UUID.
    Raises HTTP 401 if the token is missing or invalid.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.removeprefix("Bearer ").strip()

    try:
        response = supabase.auth.get_user(token)
        user = response.user
        if not user or not user.id:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        return user.id
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token validation failed: {e}")
