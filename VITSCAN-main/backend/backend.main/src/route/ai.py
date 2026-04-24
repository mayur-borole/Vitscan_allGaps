from fastapi import APIRouter, Depends, File, Form, UploadFile

from src.controllers.auth_controller import CurrentUser, get_current_user
from src.controllers.ai_controller import (
    ChatRequest,
    ReportUpdateRequest,
    TextResponse,
    analyze_images,
    chat,
    delete_report,
    get_reports,
    update_report,
)

router = APIRouter(tags=["ai"])


@router.post("/analyze", response_model=TextResponse, summary="Analyze 1 to 8 images")
async def route_analyze(
    files: list[UploadFile] = File(...),
    prompt: str | None = Form(default=None),
    areas: list[str] | None = Form(default=None),
    user: CurrentUser = Depends(get_current_user),
) -> TextResponse:
    return await analyze_images(files=files, prompt=prompt, areas=areas, user=user)


@router.get("/reports", summary="Get all saved reports")
async def route_reports(user: CurrentUser = Depends(get_current_user)) -> list[dict]:
    return await get_reports(user)


@router.delete("/reports/{report_id}", summary="Delete one report")
async def route_delete_report(
    report_id: str,
    user: CurrentUser = Depends(get_current_user),
) -> dict[str, bool]:
    return await delete_report(report_id, user)


@router.patch("/reports/{report_id}", summary="Update one report")
async def route_update_report(
    report_id: str,
    payload: ReportUpdateRequest,
    user: CurrentUser = Depends(get_current_user),
) -> dict:
    return await update_report(report_id, payload, user)


@router.post("/chat", response_model=TextResponse, summary="Chat with AI")
async def route_chat(
    payload: ChatRequest,
    user: CurrentUser = Depends(get_current_user),
) -> TextResponse:
    return await chat(payload, user)
