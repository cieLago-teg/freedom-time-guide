"""Transactions 仓库"""
from __future__ import annotations

import sqlite3
from datetime import date, datetime
from typing import Optional

from ..schemas import TransactionIn


class TransactionsRepo:
    @staticmethod
    def list(
        conn: sqlite3.Connection,
        limit: int = 200,
        offset: int = 0,
    ) -> list[dict]:
        rows = conn.execute(
            """
            SELECT * FROM transactions
            ORDER BY occurred_on DESC, id DESC
            LIMIT ? OFFSET ?
            """,
            (limit, offset),
        ).fetchall()
        return [dict(r) for r in rows]

    @staticmethod
    def get(conn: sqlite3.Connection, tx_id: int) -> Optional[dict]:
        row = conn.execute(
            "SELECT * FROM transactions WHERE id = ?", (tx_id,)
        ).fetchone()
        return dict(row) if row else None

    @staticmethod
    def create(conn: sqlite3.Connection, body: TransactionIn) -> dict:
        when = body.occurred_on or date.today().isoformat()
        date.fromisoformat(when)  # validate
        now = datetime.now().isoformat()
        cur = conn.execute(
            """
            INSERT INTO transactions (
              occurred_on, type, category, amount, note,
              is_major, source, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                when,
                body.type,
                body.category or "",
                float(body.amount),
                body.note or "",
                int(body.is_major),
                body.source or "manual",
                now,
                now,
            ),
        )
        return TransactionsRepo.get(conn, cur.lastrowid)  # type: ignore[return-value]

    @staticmethod
    def delete(conn: sqlite3.Connection, tx_id: int) -> bool:
        cur = conn.execute("DELETE FROM transactions WHERE id = ?", (tx_id,))
        return cur.rowcount > 0

    @staticmethod
    def totals_by_type(conn: sqlite3.Connection) -> dict:
        rows = conn.execute(
            "SELECT type, COALESCE(SUM(amount), 0) AS total FROM transactions GROUP BY type"
        ).fetchall()
        out = {"income": 0.0, "expense": 0.0}
        for r in rows:
            out[r["type"]] = float(r["total"] or 0)
        return out

    @staticmethod
    def record_extrema(conn: sqlite3.Connection) -> tuple[Optional[str], Optional[str]]:
        row = conn.execute(
            "SELECT MIN(occurred_on) AS first, MAX(occurred_on) AS last FROM transactions"
        ).fetchone()
        return (row["first"], row["last"])
