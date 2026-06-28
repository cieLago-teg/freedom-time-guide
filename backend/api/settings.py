"""POST /api/settings · 设置生日/目标/资产/覆盖规则"""
from __future__ import annotations

from fastapi import APIRouter

from ..db import session
from ..repositories import SettingsRepo
from ..schemas import SettingsIn
from ..services import stats_service

router = APIRouter(prefix="/api", tags=["settings"])


@router.post("/settings")
def post_settings(body: SettingsIn) -> dict:
    with session() as conn:
        settings = SettingsRepo.upsert(conn, body)
        stats = stats_service.compute_stats(conn).to_dict()
        return {"settings": settings, "stats": stats}
