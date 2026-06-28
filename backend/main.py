"""自由时间指南灯 · 后端入口

FastAPI + SQLite · 模块化架构
"""
from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from backend.api import (
    goals_router,
    import_export_router,
    integrations_router,
    planner_router,
    settings_router,
    state_router,
    transactions_router,
)
from backend.db import init_db

init_db()

app = FastAPI(
    title="自由时间指南灯",
    description="把收入、支出和资产翻译成你真正拥有的自由时间。",
    version="0.1.0",
    docs_url="/api/docs",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 业务路由
app.include_router(state_router)
app.include_router(settings_router)
app.include_router(transactions_router)
app.include_router(planner_router)
app.include_router(goals_router)
app.include_router(import_export_router)
app.include_router(integrations_router)


@app.get("/api/health")
def health() -> dict:
    return {"ok": True}


# 生产模式: 托管前端 dist/(start-prod.bat / Docker)
# 开发模式(dist 不存在):跳过,只用 API
_DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if _DIST.exists():
    _INDEX = _DIST / "index.html"

    # 1. 静态资源(/assets 下的 JS / CSS / 字体)
    _ASSETS = _DIST / "assets"
    if _ASSETS.exists():
        app.mount(
            "/assets",
            StaticFiles(directory=str(_ASSETS)),
            name="frontend-assets",
        )

    # 2. SPA fallback(所有非 /api/* 路径都返回 index.html)
    @app.get("/{full_path:path}", include_in_schema=False)
    def spa_fallback(full_path: str):
        # /api/* 路径不存在 → 返回 JSON 404(不进 SPA)
        if full_path.startswith("api/"):
            return JSONResponse(
                {"detail": "Not Found", "path": f"/{full_path}"},
                status_code=404,
            )
        # 真实存在的静态文件(favicon.ico / robots.txt 等)直接返回
        candidate = _DIST / full_path
        if full_path and candidate.is_file():
            return FileResponse(str(candidate))
        # 否则返回 index.html,前端 react-router 处理路由
        return FileResponse(str(_INDEX))

    @app.get("/", include_in_schema=False)
    def root():
        return FileResponse(str(_INDEX))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8766)
