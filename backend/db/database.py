"""数据库连接与会话管理"""
from __future__ import annotations

import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = ROOT / "data" / "freedom.db"
DB_PATH.parent.mkdir(exist_ok=True)


def get_connection() -> sqlite3.Connection:
    """创建新的 SQLite 连接(由调用方负责关闭)。"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


@contextmanager
def session() -> Iterator[sqlite3.Connection]:
    """上下文管理的事务会话。"""
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  birth_date TEXT NOT NULL,
  target_age INTEGER NOT NULL DEFAULT 80,
  currency TEXT NOT NULL DEFAULT 'CNY',
  show_past INTEGER NOT NULL DEFAULT 0,
  use_initial_assets INTEGER NOT NULL DEFAULT 0,
  initial_assets REAL NOT NULL DEFAULT 0,
  initial_assets_ratio REAL NOT NULL DEFAULT 1.0,
  tracking_days_override INTEGER NOT NULL DEFAULT 0,
  avg_daily_expense_override REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  occurred_on TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL DEFAULT '',
  amount REAL NOT NULL CHECK (amount > 0),
  note TEXT NOT NULL DEFAULT '',
  is_major INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'manual',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tx_date ON transactions(occurred_on);
CREATE INDEX IF NOT EXISTS idx_tx_type ON transactions(type);

CREATE TABLE IF NOT EXISTS goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  target_amount REAL NOT NULL DEFAULT 0,
  target_date TEXT,
  note TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scenarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS integration_connections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider TEXT NOT NULL,
  connection_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'disconnected',
  auth_payload_json TEXT NOT NULL DEFAULT '{}',
  config_payload_json TEXT NOT NULL DEFAULT '{}',
  last_sync_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sync_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider TEXT NOT NULL,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  request_payload_json TEXT NOT NULL DEFAULT '{}',
  result_payload_json TEXT NOT NULL DEFAULT '{}',
  started_at TEXT,
  finished_at TEXT,
  created_at TEXT NOT NULL
);
"""


def init_db() -> None:
    """初始化所有表(MVP 第一版只确保表存在)。"""
    with session() as conn:
        conn.executescript(SCHEMA_SQL)
