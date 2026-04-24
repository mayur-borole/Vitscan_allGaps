from fastapi import APIRouter, Depends, Header

from src.controllers.auth_controller import (
    CurrentUser,
    ForgotPasswordRequest,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    UserData,
    forgot_password,
    get_current_user,
    login,
    logout,
    me,
    register,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=LoginResponse, summary="Register with profile and log in")
async def route_register(payload: RegisterRequest) -> LoginResponse:
    return await register(payload)


@router.post("/login", response_model=LoginResponse, summary="Log in with email and password")
async def route_login(payload: LoginRequest) -> LoginResponse:
    return await login(payload)


@router.post("/forgot-password", summary="Reset password using email and phone")
async def route_forgot_password(payload: ForgotPasswordRequest) -> dict[str, str]:
    return await forgot_password(payload)


@router.get("/me", response_model=UserData, summary="Get current logged-in user")
async def route_me(user: CurrentUser = Depends(get_current_user)) -> UserData:
    return await me(user)


@router.post("/logout", summary="Log out current user")
async def route_logout(
    user: CurrentUser = Depends(get_current_user),
    authorization: str | None = Header(default=None),
) -> dict[str, bool]:
    return await logout(user, authorization)
