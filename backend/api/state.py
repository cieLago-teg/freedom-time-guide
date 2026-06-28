"""GET /api/state · 返回 settings + stats + 最近交易"""
from __future__ import annotations

from fastapi import APIRouter

from ..db import session
from ..repositories import SettingsRepo, TransactionsRepo
from ..services import stats_service
from ..services.explanation_service import explain_risk

router = APIRouter(prefix="/api", tags=["state"])


@router.get("/state")
def get_state() -> dict:
    with session() as conn:
        settings = SettingsRepo.get(conn)
        stats = stats_service.compute_stats(conn).to_dict()
        txs = TransactionsRepo.list(conn, limit=50)
        stats["risk_alerts"] = explain_risk(stats)
        return {"settings": settings, "stats": stats, "transactions": txs}
