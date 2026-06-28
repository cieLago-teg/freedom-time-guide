"""统计与自由时间计算核心

本模块是产品的「真相来源」。所有公式必须忠实于开发方案 §算法与数据口径,
demo 中已经验证过的逻辑会迁移过来并补充细化。

关键不变量(写代码时反复对照):
  1. avg_daily_expense = total_expense / tracking_days,不做平滑
  2. freedom_days = floor(initial_assets / avg) + floor(net_savings / avg)
  3. lit_count 是 future_cells 的截断 + 资产段 / 净储蓄段的拼接
  4. 模拟结果不落库,只用于规划页的对照展示
"""
from __future__ import annotations

import sqlite3
from dataclasses import dataclass
from datetime import date
from math import floor
from typing import Optional

from ..repositories import TransactionsRepo


@dataclass(frozen=True)
class StatsSnapshot:
    """某一时点的完整统计快照(用于动画 delta 计算与模拟对比)。"""

    total_income: float
    total_expense: float
    tracking_days: int
    avg_daily_expense: float
    net_savings: float

    asset_freedom: int
    income_freedom: int
    freedom_days_bought: int

    asset_lit: int
    income_lit: int
    lit_count: int
    overflow: int

    past_cells: int
    future_cells: int
    total_cells: int
    tracked_past_cells: int

    show_past: bool
    use_initial_assets: bool
    initial_assets: float
    initial_assets_ratio: float

    first_record: Optional[str]
    last_record: Optional[str]

    currency: str
    target_age: int

    def to_dict(self) -> dict:
        return {
            "total_income": round(self.total_income, 2),
            "total_expense": round(self.total_expense, 2),
            "tracking_days": self.tracking_days,
            "avg_daily_expense": round(self.avg_daily_expense, 4),
            "net_savings": round(self.net_savings, 2),
            "asset_freedom": self.asset_freedom,
            "income_freedom": self.income_freedom,
            "freedom_days_bought": self.freedom_days_bought,
            "asset_lit": self.asset_lit,
            "income_lit": self.income_lit,
            "lit_count": self.lit_count,
            "overflow": self.overflow,
            "past_cells": self.past_cells,
            "future_cells": self.future_cells,
            "total_cells": self.total_cells,
            "tracked_past_cells": self.tracked_past_cells,
            "show_past": self.show_past,
            "use_initial_assets": self.use_initial_assets,
            "initial_assets": round(self.initial_assets, 2),
            "initial_assets_ratio": self.initial_assets_ratio,
            "first_record": self.first_record,
            "last_record": self.last_record,
            "currency": self.currency,
            "target_age": self.target_age,
        }


def _resolve_target_end(birth: date, target_age: int) -> date:
    """计算目标生命终点。闰年生日(2/29)在非闰年用 2/28 兜底。"""
    try:
        return birth.replace(year=birth.year + target_age)
    except ValueError:
        return birth.replace(year=birth.year + target_age, day=28)


def compute_stats(conn: sqlite3.Connection) -> StatsSnapshot:
    """根据当前数据库状态计算 StatsSnapshot。"""
    totals = TransactionsRepo.totals_by_type(conn)
    first_str, last_str = TransactionsRepo.record_extrema(conn)

    today = date.today()
    first_record = date.fromisoformat(first_str) if first_str else None
    last_record = date.fromisoformat(last_str) if last_str else None

    if first_record and last_record:
        tracking_days = max((last_record - first_record).days + 1, 1)
    else:
        tracking_days = 0

    avg = (
        totals["expense"] / tracking_days
        if tracking_days > 0 and totals["expense"] > 0
        else 0.0
    )

    settings_row = conn.execute("SELECT * FROM settings WHERE id = 1").fetchone()
    s = dict(settings_row) if settings_row else None

    use_assets = bool(s.get("use_initial_assets", 0)) if s else False
    initial_assets = float(s.get("initial_assets", 0)) if s else 0.0
    initial_assets_ratio = float(s.get("initial_assets_ratio", 1.0)) if s else 1.0
    show_past = bool(s.get("show_past", 0)) if s else False
    currency = s.get("currency", "CNY") if s else "CNY"
    target_age = int(s.get("target_age", 80)) if s else 80

    td_override = int(s.get("tracking_days_override", 0)) if s else 0
    avg_override = float(s.get("avg_daily_expense_override", 0.0)) if s else 0.0
    if td_override > 0:
        tracking_days = td_override
    if avg_override > 0:
        avg = avg_override

    # 资产带来的自由(按纳入比例)
    effective_assets = initial_assets * initial_assets_ratio
    asset_freedom = (
        floor(effective_assets / avg) if (avg > 0 and use_assets and effective_assets > 0) else 0
    )

    net_savings = totals["income"] - totals["expense"]
    income_freedom = (
        floor(net_savings / avg) if (avg > 0 and net_savings > 0) else 0
    )
    freedom_days_bought = asset_freedom + income_freedom

    future_cells = 0
    past_cells = 0
    if s:
        birth = date.fromisoformat(s["birth_date"])
        end = _resolve_target_end(birth, target_age)
        future_cells = max((end - today).days, 0)
        past_cells = max((today - birth).days, 0)

    total_cells = (past_cells + future_cells) if show_past else future_cells

    # 资产段优先占用 future_cells,余下给净储蓄段
    if future_cells > 0:
        asset_lit = min(asset_freedom, future_cells)
        income_lit = min(income_freedom, max(0, future_cells - asset_lit))
    else:
        asset_lit = asset_freedom
        income_lit = income_freedom
    lit = asset_lit + income_lit
    overflow = max(freedom_days_bought - future_cells, 0) if future_cells > 0 else 0

    if first_record and first_record < today and show_past:
        tracked_past_cells = min(past_cells, (today - first_record).days)
    else:
        tracked_past_cells = 0

    return StatsSnapshot(
        total_income=totals["income"],
        total_expense=totals["expense"],
        tracking_days=tracking_days,
        avg_daily_expense=avg,
        net_savings=net_savings,
        asset_freedom=asset_freedom,
        income_freedom=income_freedom,
        freedom_days_bought=freedom_days_bought,
        asset_lit=asset_lit,
        income_lit=income_lit,
        lit_count=lit,
        overflow=overflow,
        past_cells=past_cells,
        future_cells=future_cells,
        total_cells=total_cells,
        tracked_past_cells=tracked_past_cells,
        show_past=show_past,
        use_initial_assets=use_assets,
        initial_assets=initial_assets,
        initial_assets_ratio=initial_assets_ratio,
        first_record=first_str,
        last_record=last_str,
        currency=currency,
        target_age=target_age,
    )


def compute_simulated_stats(
    base: StatsSnapshot,
    target_avg: Optional[float] = None,
    horizon_days: int = 90,
) -> dict:
    """不落库的模拟计算。

    用法:把「未来的日均花销」换成 target_avg,假设 horizon_days 后达到该水平,
    重算 freedom_days_bought,用于在规划页面对比。

    注意:这是 MVP 简化版。完整版要支持分段变化、收入追加、家庭成员变化等。
    """
    if target_avg is None or target_avg <= 0:
        target_avg = base.avg_daily_expense

    effective_assets = base.initial_assets * base.initial_assets_ratio
    sim_asset_freedom = (
        floor(effective_assets / target_avg) if base.use_initial_assets and effective_assets > 0 else 0
    )
    # 净储蓄不变,只是分母变了
    sim_income_freedom = (
        floor(base.net_savings / target_avg) if base.net_savings > 0 else 0
    )
    sim_freedom = sim_asset_freedom + sim_income_freedom
    sim_lit = (
        min(sim_freedom, base.future_cells) if base.future_cells > 0 else sim_freedom
    )
    delta_lit = sim_lit - base.lit_count
    delta_freedom = sim_freedom - base.freedom_days_bought

    return {
        "simulated": {
            "target_avg_daily_expense": round(target_avg, 4),
            "horizon_days": horizon_days,
            "asset_freedom": sim_asset_freedom,
            "income_freedom": sim_income_freedom,
            "freedom_days_bought": sim_freedom,
            "lit_count": sim_lit,
            "overflow": max(sim_freedom - base.future_cells, 0) if base.future_cells > 0 else 0,
        },
        "delta": {
            "lit_count": delta_lit,
            "freedom_days_bought": delta_freedom,
            "avg_daily_expense": round(target_avg - base.avg_daily_expense, 4),
        },
        "baseline": {
            "avg_daily_expense": round(base.avg_daily_expense, 4),
            "freedom_days_bought": base.freedom_days_bought,
            "lit_count": base.lit_count,
        },
    }
