"""集成服务骨架

本模块负责:
  - 列出已注册的外部连接(飞书、OpenClaw、ledger 导入器)
  - 创建/更新连接
  - 触发同步任务(占位:记录 sync_jobs 即可)

MVP 阶段只保证接口契约稳定,不实际对接任何第三方。
"""
from __future__ import annotations

import json
import sqlite3
from datetime import datetime
from typing import Optional

from ..db import session


SUPPORTED_PROVIDERS = {"feishu", "openclaw", "ledger_csv"}


def list_connections(conn: sqlite3.Connection) -> list[dict]:
    rows = conn.execute(
        "SELECT * FROM integration_connections ORDER BY id DESC"
    ).fetchall()
    out = []
    for r in rows:
        d = dict(r)
        # 不向前端泄露原始 auth_payload
        d["auth_payload_json"] = "{}" if d.get("auth_payload_json") else "{}"
        out.append(d)
    return out


def upsert_connection(
    conn: sqlite3.Connection,
    *,
    provider: str,
    connection_name: str,
    status: str = "disconnected",
    auth_payload: Optional[dict] = None,
    config_payload: Optional[dict] = None,
) -> dict:
    if provider not in SUPPORTED_PROVIDERS:
        raise ValueError(f"unsupported provider: {provider}")
    now = datetime.now().isoformat()
    auth_json = json.dumps(auth_payload or {}, ensure_ascii=False)
    config_json = json.dumps(config_payload or {}, ensure_ascii=False)
    cur = conn.execute(
        """
        INSERT INTO integration_connections (
          provider, connection_name, status, auth_payload_json,
          config_payload_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (provider, connection_name, status, auth_json, config_json, now, now),
    )
    row = conn.execute(
        "SELECT * FROM integration_connections WHERE id = ?",
        (cur.lastrowid,),
    ).fetchone()
    d = dict(row)
    d["auth_payload_json"] = "{}"
    return d


def start_sync_job(
    conn: sqlite3.Connection,
    *,
    provider: str,
    job_type: str,
    request_payload: Optional[dict] = None,
) -> int:
    now = datetime.now().isoformat()
    cur = conn.execute(
        """
        INSERT INTO sync_jobs (
          provider, job_type, status, request_payload_json,
          started_at, created_at
        ) VALUES (?, ?, 'pending', ?, ?, ?)
        """,
        (
            provider,
            job_type,
            json.dumps(request_payload or {}, ensure_ascii=False),
            now,
            now,
        ),
    )
    return cur.lastrowid  # type: ignore[return-value]


def finish_sync_job(
    conn: sqlite3.Connection,
    job_id: int,
    *,
    status: str,
    result_payload: Optional[dict] = None,
) -> None:
    now = datetime.now().isoformat()
    conn.execute(
        """
        UPDATE sync_jobs SET status = ?, result_payload_json = ?, finished_at = ?
        WHERE id = ?
        """,
        (status, json.dumps(result_payload or {}, ensure_ascii=False), now, job_id),
    )


def get_agent_state_summary(conn: sqlite3.Connection, snapshot: dict) -> dict:
    """agent-facing:返回 agent 可读的当前状态摘要(供 OpenClaw 等调用)。"""
    return {
        "snapshot": snapshot,
        "today": datetime.now().date().isoformat(),
        "summary": (
            f"已记账 {snapshot.get('tracking_days', 0)} 天,"
            f"平均日花销 ¥{snapshot.get('avg_daily_expense', 0):.2f},"
            f"已买 {snapshot.get('lit_count', 0)} 天自由。"
        ),
    }
