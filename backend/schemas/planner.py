"""Planner 输入模型

MVP 阶段只支持最简单的两种模拟:
  1. 调整未来日均花销(target_avg_daily_expense):用户在 N 天后保持某个更低/更高的日均
  2. 延迟大件消费:模拟推迟指定天数后再购买
"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class PlannerSimulateIn(BaseModel):
    # 模拟类型:'avg_expense_change' | 'delay_consumption'
    kind: str = Field(..., pattern="^(avg_expense_change|delay_consumption)$")
    # 调整后的日均花销(用于 avg_expense_change)
    target_avg_daily_expense: Optional[float] = Field(None, ge=0)
    # 延迟天数(用于 delay_consumption)
    delay_days: Optional[int] = Field(None, ge=0)
    # 延迟消费的单笔金额(用于 delay_consumption)
    delayed_amount: Optional[float] = Field(None, ge=0)
    # 模拟窗口(多少天后达到目标状态)
    horizon_days: int = Field(90, ge=1, le=3650)
