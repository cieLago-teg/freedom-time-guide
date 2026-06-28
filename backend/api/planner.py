"""POST /api/planner/simulate · 规划模拟(不落库)"""
from __future__ import annotations

from fastapi import APIRouter

from ..schemas import PlannerSimulateIn
from ..services.planner_service import run_simulation

router = APIRouter(prefix="/api", tags=["planner"])


@router.post("/planner/simulate")
def post_simulate(body: PlannerSimulateIn) -> dict:
    return run_simulation(body)
