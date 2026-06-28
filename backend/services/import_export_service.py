"""导入/导出服务

MVP 阶段提供:
  - CSV 导入(支持预览,确认后写入 transactions)
  - JSON 全量导出(settings + transactions + goals)
"""
from __future__ import annotations

import csv
import io
import json
from datetime import date
from typing import Iterable

from ..schemas import TransactionIn


REQUIRED_CSV_COLUMNS = ["type", "amount", "occurred_on"]
OPTIONAL_CSV_COLUMNS = ["category", "note", "is_major", "source"]


def parse_csv_preview(content: str) -> dict:
    """解析 CSV 并返回预览:总行数、合法条数、错误列表、首批样本。"""
    reader = csv.DictReader(io.StringIO(content))
    fieldnames = reader.fieldnames or []
    missing = [c for c in REQUIRED_CSV_COLUMNS if c not in fieldnames]
    if missing:
        return {
            "ok": False,
            "error": f"缺少必要列: {', '.join(missing)}",
            "fieldnames": fieldnames,
        }

    rows: list[dict] = []
    errors: list[dict] = []
    for idx, raw in enumerate(reader, start=1):
        try:
            t = raw["type"].strip().lower()
            if t not in ("income", "expense"):
                raise ValueError(f"type 必须是 income 或 expense,实际是 {t!r}")
            amt = float(raw["amount"])
            if amt <= 0:
                raise ValueError("amount 必须大于 0")
            date.fromisoformat(raw["occurred_on"].strip())
            tx = TransactionIn(
                occurred_on=raw["occurred_on"].strip(),
                type=t,  # type: ignore[arg-type]
                amount=amt,
                category=(raw.get("category") or "").strip(),
                note=(raw.get("note") or "").strip(),
                is_major=str(raw.get("is_major") or "").lower() in ("1", "true", "yes"),
                source=(raw.get("source") or "csv").strip() or "csv",
            )
            rows.append(tx.model_dump())
        except Exception as e:  # noqa: BLE001
            errors.append({"row": idx, "error": str(e), "raw": dict(raw)})
        if len(rows) >= 5000:
            break

    return {
        "ok": True,
        "fieldnames": fieldnames,
        "total": len(rows) + len(errors),
        "valid_count": len(rows),
        "error_count": len(errors),
        "errors": errors[:50],
        "sample": rows[:20],
        "rows": rows,
    }


def export_full(conn, goals: list[dict]) -> dict:
    """导出 settings + transactions + goals 全量 JSON。"""
    settings_row = conn.execute("SELECT * FROM settings WHERE id = 1").fetchone()
    settings = dict(settings_row) if settings_row else None
    tx_rows = conn.execute(
        "SELECT * FROM transactions ORDER BY occurred_on, id"
    ).fetchall()
    transactions = [dict(r) for r in tx_rows]
    return {
        "version": 1,
        "exported_at": date.today().isoformat(),
        "settings": settings,
        "transactions": transactions,
        "goals": goals,
    }
