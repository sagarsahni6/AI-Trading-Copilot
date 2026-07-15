"""
Authentication Routes — JWT-based auth
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class LoginRequest(BaseModel):
    api_key: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest) -> TokenResponse:
    """Authenticate and receive JWT token."""
    from app.core.security import create_access_token, verify_api_key

    if not verify_api_key(request.api_key):
        raise HTTPException(status_code=401, detail="Invalid API key")

    token = create_access_token(data={"sub": "extension"})
    return TokenResponse(access_token=token)
