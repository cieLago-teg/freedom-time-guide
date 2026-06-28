"""集成 API · 适配层接口契约 + agent-facing API

MVP 阶段只暴露契约,实际对接在后续版本完成。
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..adapters.feishu import FeishuAdapter
from ..adapters.openclaw import OpenClawAdapter
from ..db import session
from ..repositories import GoalsRepo
from ..services import integration_service, stats_service

router = APIRouter(prefix="/api", tags=["integrations"])


@router.get("/integrations")
def list_integrations() -> dict:
    with session() as conn:
        return {"connections": integration_service.list_connections(conn)}


@router.post("/integrations/feishu/connect")
def feishu_connect(body: dict) -> dict:
    app_id = body.get("app_id", "")
    app_secret = body.get("app_secret", "")
    if not app_id or not app_secret:
        raise HTTPException(400, "app_id / app_secret 必填")
    adapter = FeishuAdapter()
    result = adapter.connect(app_id, app_secret)
    return {"adapter": "feishu", "result": result}


@router.post("/integrations/feishu/sync")
def feishu_sync(body: dict) -> dict:
    base_token = body.get("base_token", "")
    table_id = body.get("table_id", "")
    adapter = FeishuAdapter()
    result = adapter.sync_base_table(base_token, table_id)
    return {"adapter": "feishu", "result": result}


@router.post("/integrations/openclaw/session")
def openclaw_session(body: dict) -> dict:
    agent_id = body.get("agent_id", "")
    adapter = OpenClawAdapter()
    return {"adapter": "openclaw", "result": adapter.open_session(agent_id)}


@router.get("/integrations/openclaw/context")
def openclaw_context(session_id: str = "") -> dict:
    adapter = OpenClawAdapter()
    return {"adapter": "openclaw", "result": adapter.fetch_context(session_id)}


# ---------- agent-facing API ----------
@router.get("/agent/state-summary")
def agent_state_summary() -> dict:
    with session() as conn:
        snapshot = stats_service.compute_stats(conn).to_dict()
        goals = GoalsRepo.list(conn)
        summary = integration_service.get_agent_state_summary(conn, snapshot)
        summary["goals"] = goals
    return summary


@router.post("/agent/simulate")
def agent_simulate(body: dict) -> dict:
    """agent-facing:代理也可以提交模拟请求。"""
    from ..schemas import PlannerSimulateIn  # local import 避免循环
    from ..services.planner_service import run_simulation

    return run_simulation(PlannerSimulateIn(**body))


# ---------- ledger 导入适配层(预留) ----------
@router.post("/import/ledger/preview")
async def import_ledger_preview(request: dict) -> dict:
    """预留:第二阶段针对具体 App 的导入预览。MVP 阶段直接落到 CSV 通道。"""
    return {
        "ok": False,
        "placeholder": True,
        "message": "请使用 /api/import/csv/preview,App 专用通道将在 V1 接入。",
    }


@router.post("/import/ledger/commit")
async def import_ledger_commit(body: dict) -> dict:
    return {
        "ok": False,
        "placeholder": True,
        "message": "请使用 /api/import/csv/commit,App 专用通道将在 V1 接入。",
    }
