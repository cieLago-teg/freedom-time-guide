"""Settings 仓库 · 单行(id=1)的写入与读取"""
from __future__ import annotations

import sqlite3
from datetime import datetime
from typing import Optional

from ..schemas import SettingsIn


class SettingsRepo:
    @staticmethod
    def get(conn: sqlite3.Connection) -> Optional[dict]:
        row = conn.execute("SELECT * FROM settings WHERE id = 1").fetchone()
        return dict(row) if row else None

    @staticmethod
    def upsert(conn: sqlite3.Connection, body: SettingsIn) -> dict:
        now = datetime.now().isoformat()
        existing = SettingsRepo.get(conn)
        if existing:
            conn.execute(
                """
                UPDATE settings SET
                  birth_date = ?, target_age = ?, currency = ?,
                  show_past = ?, use_initial_assets = ?, initial_assets = ?,
                  initial_assets_ratio = ?, tracking_days_override = ?,
                  avg_daily_expense_override = ?, updated_at = ?
                WHERE id = 1
                """,
                (
                    body.birth_date,
                    body.target_age,
                    body.currency,
                    int(body.show_past),
                    int(body.use_initial_assets),
                    float(body.initial_assets),
                    float(body.initial_assets_ratio),
                    int(body.tracking_days_override),
                    float(body.avg_daily_expense_override),
                    now,
                ),
            )
        else:
            conn.execute(
                """
                INSERT INTO settings (
                  id, birth_date, target_age, currency, show_past,
                  use_initial_assets, initial_assets, initial_assets_ratio,
                  tracking_days_override, avg_daily_expense_override,
                  created_at, updated_at
                ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    body.birth_date,
                    body.target_age,
                    body.currency,
                    int(body.show_past),
                    int(body.use_initial_assets),
                    float(body.initial_assets),
                    float(body.initial_assets_ratio),
                    int(body.tracking_days_override),
                    float(body.avg_daily_expense_override),
                    now,
                    now,
                ),
            )
        return SettingsRepo.get(conn)  # type: ignore[return-value]
