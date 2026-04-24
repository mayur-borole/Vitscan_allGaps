import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import Header, HTTPException
import bcrypt
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Literal

DB_DIR = Path(__file__).resolve().parent.parent / "db"
USERS_FILE = DB_DIR / "users.json"
SESSIONS_FILE = DB_DIR / "sessions.json"


def _read_json(path: Path) -> list[dict]:
    if not path.exists():
        return []
    data = path.read_text(encoding="utf-8").strip()
    return json.loads(data) if data else []


def _write_json(path: Path, rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(rows, indent=2, ensure_ascii=False), encoding="utf-8")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    age: int = Field(ge=1, le=120)
    gender: Literal["male", "female", "other"]
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)
    phone: str

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        digits = "".join(ch for ch in value if ch.isdigit())
        if len(digits) != 10:
            raise ValueError("Phone number must contain exactly 10 digits.")
        return digits


class UserData(BaseModel):
    id: str
    name: str
    age: int
    gender: Literal["male", "female", "other"]
    email: str
    phone: str


class LoginResponse(BaseModel):
    token: str
    user: UserData


class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    phone: str
    new_password: str = Field(min_length=1, max_length=72)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        digits = "".join(ch for ch in value if ch.isdigit())
        if len(digits) != 10:
            raise ValueError("Phone number must contain exactly 10 digits.")
        return digits


class CurrentUser(BaseModel):
    id: str
    name: str
    age: int
    gender: Literal["male", "female", "other"]
    email: str
    phone: str


def _sanitize_user(user: dict) -> UserData:
    raw_gender = str(user.get("gender", "other")).strip().lower()
    gender: Literal["male", "female", "other"] = raw_gender if raw_gender in {"male", "female", "other"} else "other"
    return UserData(
        id=str(user["id"]),
        name=str(user["name"]),
        age=int(user["age"]),
        gender=gender,
        email=str(user["email"]),
        phone=str(user["phone"]),
    )


def _hash_password(raw_password: str) -> str:
    return bcrypt.hashpw(raw_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def _verify_password(raw_password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(raw_password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        return False


def _find_user_by_email(email: str) -> dict | None:
    users = _read_json(USERS_FILE)
    normalized_email = email.strip().lower()
    return next((u for u in users if str(u.get("email", "")).lower() == normalized_email), None)


def _create_user(payload: RegisterRequest) -> dict:
    users = _read_json(USERS_FILE)
    normalized_email = payload.email.strip().lower()
    existing = next((u for u in users if str(u.get("email", "")).lower() == normalized_email), None)
    if existing:
        raise HTTPException(status_code=409, detail="Email already exists.")

    new_user = {
        "id": str(uuid.uuid4()),
        "name": payload.name.strip(),
        "age": payload.age,
        "gender": payload.gender,
        "email": normalized_email,
        "password_hash": _hash_password(payload.password),
        "phone": payload.phone,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    users.append(new_user)
    _write_json(USERS_FILE, users)
    return new_user


def _create_session(user_id: str) -> str:
    sessions = _read_json(SESSIONS_FILE)
    token = str(uuid.uuid4())
    sessions.append(
        {
            "token": token,
            "user_id": user_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
    )
    _write_json(SESSIONS_FILE, sessions)
    return token


async def login(payload: LoginRequest) -> LoginResponse:
    user = _find_user_by_email(str(payload.email))
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials.")

    password_hash = user.get("password_hash")
    if not password_hash or not _verify_password(payload.password, str(password_hash)):
        raise HTTPException(status_code=401, detail="Invalid credentials.")

    token = _create_session(user["id"])
    return LoginResponse(token=token, user=_sanitize_user(user))


async def register(payload: RegisterRequest) -> LoginResponse:
    user = _create_user(payload)
    token = _create_session(user["id"])
    return LoginResponse(token=token, user=_sanitize_user(user))


async def forgot_password(payload: ForgotPasswordRequest) -> dict[str, str]:
    users = _read_json(USERS_FILE)
    normalized_email = payload.email.strip().lower()
    index = next(
        (i for i, user in enumerate(users) if str(user.get("email", "")).lower() == normalized_email),
        None,
    )
    if index is None:
        raise HTTPException(status_code=404, detail="Account not found for this email.")

    user_phone = "".join(ch for ch in str(users[index].get("phone", "")) if ch.isdigit())
    if not user_phone:
        raise HTTPException(
            status_code=400,
            detail="This account does not support password reset. Please create a new account.",
        )
    if user_phone != payload.phone:
        raise HTTPException(status_code=401, detail="Phone number does not match this account.")

    users[index]["password_hash"] = _hash_password(payload.new_password)
    _write_json(USERS_FILE, users)

    # Invalidate all existing sessions for this user after password change.
    sessions = _read_json(SESSIONS_FILE)
    filtered = [s for s in sessions if s.get("user_id") != users[index].get("id")]
    if len(filtered) != len(sessions):
        _write_json(SESSIONS_FILE, filtered)

    return {"message": "Password reset successful. Please login with your new password."}


def _resolve_session(token: str) -> dict:
    sessions = _read_json(SESSIONS_FILE)
    session = next((s for s in sessions if s["token"] == token), None)
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired session.")

    users = _read_json(USERS_FILE)
    user = next((u for u in users if u["id"] == session["user_id"]), None)
    if not user:
        raise HTTPException(status_code=401, detail="User not found for this session.")

    required_fields = {"name", "age", "email", "phone", "password_hash"}
    if not required_fields.issubset(user.keys()):
        raise HTTPException(
            status_code=401,
            detail="Legacy account detected. Please register again with full profile details.",
        )

    if user.get("gender") not in {"male", "female", "other"}:
        user["gender"] = "other"

    return user


async def get_current_user(authorization: str | None = Header(default=None)) -> CurrentUser:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Authorization header.")

    token = authorization.replace("Bearer ", "", 1).strip()
    if not token:
        raise HTTPException(status_code=401, detail="Missing bearer token.")

    user = _resolve_session(token)
    return CurrentUser(
        id=user["id"],
        name=user["name"],
        age=user["age"],
        gender=user["gender"],
        email=user["email"],
        phone=user["phone"],
    )


async def me(user: CurrentUser) -> UserData:
    return UserData(
        id=user.id,
        name=user.name,
        age=user.age,
        gender=user.gender,
        email=user.email,
        phone=user.phone,
    )


async def logout(user: CurrentUser, authorization: str | None = None) -> dict[str, bool]:
    if not authorization or not authorization.startswith("Bearer "):
        return {"success": True}

    token = authorization.replace("Bearer ", "", 1).strip()
    sessions = _read_json(SESSIONS_FILE)
    filtered = [s for s in sessions if s.get("token") != token]
    if len(filtered) != len(sessions):
        _write_json(SESSIONS_FILE, filtered)
    return {"success": True}
