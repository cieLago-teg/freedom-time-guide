"""Goals 仓库"""
from __future__ import annotations

import sqlite3
from datetime import datetime
from typing import Optional

from ..schemas import GoalIn


class GoalsRepo:
    @staticmethod
    def list(conn: sqlite3.Connection) -> list[dict]:
        rows = conn.execute(
            "SELECT * FROM goals ORDER BY id DESC"
        ).fetchall()
        return [dict(r) for r in rows]

    @staticmethod
    def get(conn: sqlite3.Connection, goal_id: int) -> Optional[dict]:
        row = conn.execute(
            "SELECT * FROM goals WHERE id = ?", (goal_id,)
        ).fetchone()
        return dict(row) if row else None

    @staticmethod
    def create(conn: sqlite3.Connection, body: GoalIn) -> dict:
        now = datetime.now().isoformat()
        cur = conn.execute(
            """
            INSERT INTO goals (
              name, type, target_amount, target_date, note, status,
              created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                body.name,
                body.type,
                float(body.target_amount),
                body.target_date,
                body.note or "",
                body.status or "active",
                now,
                now,
            ),
        )
        return GoalsRepo.get(conn, cur.lastrowid)  # type: ignore[return-value]

    @staticmethod
    def update_status(conn: sqlite3.Connection, goal_id: int, status: str) -> bool:
        cur = conn.execute(
            "UPDATE goals SET status = ?, updated_at = ? WHERE id = ?",
            (status, datetime.now().isoformat(), goal_id),
        )
        return cur.rowcount > 0

    @staticmethod
    def delete(conn: sqlite3.Connection, goal_id: int) -> bool:
        cur = conn.execute("DELETE FROM goals WHERE id = ?", (goal_id,))
        return cur.rowcount > 0
