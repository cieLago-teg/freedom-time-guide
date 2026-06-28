"""导入导出 API · CSV 预览/提交 + JSON 全量导出"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse

from ..db import session
from ..repositories import TransactionsRepo
from ..schemas import TransactionIn
from ..services.import_export_service import (
    export_full,
    parse_csv_preview,
)

router = APIRouter(prefix="/api", tags=["import_export"])


@router.post("/import/csv/preview")
async def import_csv_preview(request: Request) -> dict:
    body = await request.body()
    content = body.decode("utf-8-sig")
    return parse_csv_preview(content)


@router.post("/import/csv/commit")
async def import_csv_commit(request: Request) -> dict:
    """提交预览返回的 rows(避免重复解析)。"""
    body = await request.json()
    rows = body.get("rows") or []
    if not isinstance(rows, list):
        raise HTTPException(400, "rows 必须是数组")
    inserted = 0
    errors: list[dict] = []
    with session() as conn:
        for idx, raw in enumerate(rows, start=1):
            try:
                TransactionsRepo.create(conn, TransactionIn(**raw))
                inserted += 1
            except Exception as e:  # noqa: BLE001
                errors.append({"row": idx, "error": str(e), "raw": raw})
    return {"inserted": inserted, "error_count": len(errors), "errors": errors[:50]}


@router.get("/export/json")
def export_json() -> JSONResponse:
    from ..repositories import GoalsRepo  # local import to avoid cycle

    with session() as conn:
        goals = GoalsRepo.list(conn)
        data = export_full(conn, goals)
    return JSONResponse(
        content=data,
        headers={
            "Content-Disposition": (
                'attachment; filename="freedom-time-export.json"'
            )
        },
    )
