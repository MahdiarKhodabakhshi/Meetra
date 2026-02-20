from pydantic import BaseModel, EmailStr, Field


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str | None = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class RefreshIn(BaseModel):
    refresh_token: str | None = None


class LogoutIn(BaseModel):
    refresh_token: str | None = None


class AuthTokensOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_id: str
    email: str
    name: str | None = None
    role: str
    status: str


class MeOut(BaseModel):
    user_id: str
    email: str
    role: str
    status: str


class UserOut(BaseModel):
    user_id: str
    email: str
    role: str
    status: str
    last_login_at: str | None
    created_at: str


class UpdateUserIn(BaseModel):
    role: str | None = None
    status: str | None = None


class PublicKeyOut(BaseModel):
    """Public key for JWT verification by other services."""
    algorithm: str
    public_key: str
    issuer: str
    audience: str
