from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.route.auth import router as auth_router
from src.route.ai import router as ai_router
from src.route.health import router as health_router

app = FastAPI(title="VITSCAN Backend", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(ai_router)


@app.get("/", summary="Root")
async def root() -> dict[str, str]:
    return {"message": "VITSCAN backend running"}
