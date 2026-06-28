"""规划模拟服务

MVP 阶段只支持两种模拟:
  1. avg_expense_change: 在 horizon_days 后达到某个新的日均花销
  2. delay_consumption: 把一笔支出推迟 delay_days 再兑现

两个模拟都不修改数据库,仅返回对照结果。
"""
from __future__ import annotations

from dataclasses import dataclass

from ..schemas import PlannerSimulateIn
from .stats_service import StatsSnapshot, compute_simulated_stats, compute_stats
from .explanation_service import explain_simulation
from ..db import session


def run_simulation(body: PlannerSimulateIn) -> dict:
    """执行模拟并返回结构化结果。"""
    with session() as conn:
        base = compute_stats(conn)
    return run_simulation_on_snapshot(base, body)


def run_simulation_on_snapshot(
    base: StatsSnapshot, body: PlannerSimulateIn
) -> dict:
    if body.kind == "avg_expense_change":
        target_avg = body.target_avg_daily_expense or base.avg_daily_expense
        result = compute_simulated_stats(
            base, target_avg=target_avg, horizon_days=body.horizon_days
        )
        explanation = explain_simulation(
            target_avg=target_avg,
            horizon_days=body.horizon_days,
            baseline_lit=base.lit_count,
            sim_lit=result["simulated"]["lit_count"],
            baseline_avg=base.avg_daily_expense,
        )
        result["explanation"] = explanation
        result["kind"] = body.kind
        return result

    if body.kind == "delay_consumption":
        # 简化模型:把一笔支出延迟 delay_days,等于减少一次 avg 的拖累,
        # 等价于让 horizon_days 多 1 天的低花销余量
        amount = body.delayed_amount or 0.0
        delay = body.delay_days or 0
        # 计算「假如不花这笔」的瞬时快照
        baseline_expense = base.total_expense
        hypothetical_expense = max(0.0, baseline_expense - amount)
        tracking_days = base.tracking_days or 1
        new_avg = hypothetical_expense / tracking_days if tracking_days > 0 else 0
        result = compute_simulated_stats(
            base, target_avg=new_avg if new_avg > 0 else base.avg_daily_expense,
            horizon_days=delay,
        )
        explanation = (
            f"如果你把 ¥{amount:.0f} 的支出推迟 {delay} 天再兑现,"
            f"你的自由时间将{('增加 ' if result['delta']['lit_count'] >= 0 else '减少 ')}"
            f"{abs(result['delta']['lit_count'])} 天。"
        )
        result["explanation"] = explanation
        result["kind"] = body.kind
        return result

    raise ValueError(f"unknown simulation kind: {body.kind}")
