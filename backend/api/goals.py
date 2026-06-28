"""目标 API · 基础 CRUD"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..db import session
from ..repositories import GoalsRepo
from ..schemas import GoalIn

router = APIRouter(prefix="/api", tags=["goals"])


@router.get("/goals")
def list_goals() -> dict:
    with session() as conn:
        return {"goals": GoalsRepo.list(conn)}


@router.post("/goals")
def create_goal(body: GoalIn) -> dict:
    with session() as conn:
        goal = GoalsRepo.create(conn, body)
        return {"goal": goal}


@router.patch("/goals/{goal_id}")
def update_goal(goal_id: int, body: dict) -> dict:
    status = body.get("status")
    if not status:
        raise HTTPException(400, "status required")
    with session() as conn:
        ok = GoalsRepo.update_status(conn, goal_id, status)
        if not ok:
            raise HTTPException(404, "goal not found")
        return {"goal": GoalsRepo.get(conn, goal_id)}


@router.delete("/goals/{goal_id}")
def delete_goal(goal_id: int) -> dict:
    with session() as conn:
        ok = GoalsRepo.delete(conn, goal_id)
        if not ok:
            raise HTTPException(404, "goal not found")
        return {"deleted": goal_id}
