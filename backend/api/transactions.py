"""POST /api/transactions · 增 / 删 / 查交易

新增和删除接口都必须返回:
  - transaction (新增) 或 deleted (删除)
  - stats (最新统计)
  - lit_before / lit_after / delta / animation
  - explanation (文案基调由 explanation_service 负责)
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..db import session
from ..repositories import TransactionsRepo
from ..schemas import TransactionIn
from ..services import stats_service
from ..services.explanation_service import (
    explain_deletion,
    explain_transaction_delta,
)

router = APIRouter(prefix="/api", tags=["transactions"])


def _animation_kind(delta: int) -> str:
    if delta > 0:
        return "light_up"
    if delta < 0:
        return "extinguish"
    return "none"


@router.post("/transactions")
def post_transactions(body: TransactionIn) -> dict:
    with session() as conn:
        before = stats_service.compute_stats(conn).to_dict()
        tx = TransactionsRepo.create(conn, body)
        after = stats_service.compute_stats(conn).to_dict()

        lit_before = before["lit_count"]
        lit_after = after["lit_count"]
        delta = lit_after - lit_before

        explanation = explain_transaction_delta(
            tx_type=body.type,
            amount=body.amount,
            lit_before=lit_before,
            lit_after=lit_after,
            avg_before=before["avg_daily_expense"],
            avg_after=after["avg_daily_expense"],
            is_major=body.is_major,
        )

        return {
            "transaction": tx,
            "stats": after,
            "lit_before": lit_before,
            "lit_after": lit_after,
            "delta": delta,
            "animation": _animation_kind(delta),
            "explanation": explanation,
        }


@router.delete("/transactions/{tx_id}")
def delete_transactions(tx_id: int) -> dict:
    with session() as conn:
        existing = TransactionsRepo.get(conn, tx_id)
        if not existing:
            raise HTTPException(404, "transaction not found")
        before = stats_service.compute_stats(conn).to_dict()
        TransactionsRepo.delete(conn, tx_id)
        after = stats_service.compute_stats(conn).to_dict()

        lit_before = before["lit_count"]
        lit_after = after["lit_count"]
        delta = lit_after - lit_before

        explanation = explain_deletion(
            tx_type=existing["type"],  # type: ignore[arg-type]
            amount=float(existing["amount"]),
            lit_before=lit_before,
            lit_after=lit_after,
        )

        return {
            "deleted": tx_id,
            "stats": after,
            "lit_before": lit_before,
            "lit_after": lit_after,
            "delta": delta,
            "animation": _animation_kind(delta),
            "explanation": explanation,
        }


@router.get("/transactions")
def list_transactions(limit: int = 200, offset: int = 0) -> dict:
    with session() as conn:
        rows = TransactionsRepo.list(conn, limit=limit, offset=offset)
        return {"transactions": rows}
