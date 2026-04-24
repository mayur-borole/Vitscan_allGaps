import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field

from src.controllers.auth_controller import CurrentUser
from src.services.ai_service import AIService

service = AIService()

REPORTS_FILE = Path(__file__).resolve().parent.parent / "db" / "reports.json"


def _read_reports() -> list[dict]:
    if not REPORTS_FILE.exists():
        return []
    data = REPORTS_FILE.read_text(encoding="utf-8").strip()
    return json.loads(data) if data else []


def _write_reports(reports: list[dict]) -> None:
    REPORTS_FILE.write_text(json.dumps(reports, indent=2, ensure_ascii=False), encoding="utf-8")


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=8000)
    context: str | None = Field(default=None, max_length=8000)


class TextResponse(BaseModel):
    output: str


class ReportUpdateRequest(BaseModel):
    prompt: str | None = Field(default=None, max_length=500)


async def analyze_images(
    files: list[UploadFile] = File(...),
    prompt: str | None = Form(default=None),
    areas: list[str] | None = Form(default=None),
    user: CurrentUser | None = None,
) -> TextResponse:
    if len(files) < 1 or len(files) > 8:
        raise HTTPException(status_code=400, detail="Upload between 1 and 8 images.")

    filenames: list[str] = []
    payloads: list[tuple[bytes, str]] = []
    for file in files:
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.filename}")

        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail=f"Empty file: {file.filename}")
        payloads.append((content, file.content_type))
        filenames.append(file.filename or "unknown")

    try:
        profile_context = None
        if user:
            profile_context = f"User profile: age={user.age}, gender={user.gender}, name={user.name}."

        scan_context = None
        if areas:
            normalized = [area.strip() for area in areas if area and area.strip()]
            if normalized:
                scan_context = "Scan areas uploaded: " + ", ".join(normalized) + "."

        merged_prompt = "\n".join(
            part for part in [profile_context, scan_context, prompt] if part and part.strip()
        )
        output = service.analyze_images(payloads, extra_prompt=merged_prompt or None)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"AI analyze failed: {exc}") from exc

    report = {
        "id": str(uuid.uuid4()),
        "date": datetime.now(timezone.utc).isoformat(),
        "user_id": user.id if user else "anonymous",
        "user_name": user.name if user else "Anonymous",
        "files": filenames,
        "areas": areas or [],
        "prompt": prompt,
        "output": output,
    }
    reports = _read_reports()
    reports.insert(0, report)
    _write_reports(reports)

    return TextResponse(output=output)


async def get_reports(user: CurrentUser) -> list[dict]:
    reports = _read_reports()
    return [report for report in reports if report.get("user_id") == user.id]


async def delete_report(report_id: str, user: CurrentUser) -> dict[str, bool]:
    reports = _read_reports()
    target = next((r for r in reports if r.get("id") == report_id), None)
    if not target or target.get("user_id") != user.id:
        raise HTTPException(status_code=404, detail="Report not found.")

    filtered = [report for report in reports if report.get("id") != report_id]
    _write_reports(filtered)
    return {"success": True}


async def update_report(report_id: str, payload: ReportUpdateRequest, user: CurrentUser) -> dict:
    reports = _read_reports()
    index = next(
        (i for i, report in enumerate(reports) if report.get("id") == report_id and report.get("user_id") == user.id),
        None,
    )
    if index is None:
        raise HTTPException(status_code=404, detail="Report not found.")

    reports[index]["prompt"] = payload.prompt.strip() if payload.prompt else None
    _write_reports(reports)
    return reports[index]


async def chat(payload: ChatRequest, user: CurrentUser) -> TextResponse:
    try:
        user_context = payload.context or ""
        scoped_context = f"User: {user.name} ({user.id})\n{user_context}".strip()
        output = service.chat(message=payload.message, context=scoped_context)
        return TextResponse(output=output)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"AI chat failed: {exc}") from exc
