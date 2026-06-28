"""自由时间指南灯 · 后端入口

FastAPI + SQLite · 模块化架构
"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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


@app.get("/")
def index() -> dict:
    return {
        "name": "自由时间指南灯",
        "tagline": "把收入、支出和资产,翻译成你真正拥有的自由时间",
        "docs": "/api/docs",
    }


@app.get("/api/health")
def health() -> dict:
    return {"ok": True}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8766)
