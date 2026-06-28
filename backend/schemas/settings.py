"""Settings 输入/输出模型"""
from __future__ import annotations

from pydantic import BaseModel, Field


class SettingsIn(BaseModel):
    birth_date: str = Field(..., description="YYYY-MM-DD")
    target_age: int = Field(80, ge=1, le=150)
    currency: str = Field("CNY")
    show_past: bool = False
    use_initial_assets: bool = False
    initial_assets: float = Field(0.0, ge=0)
    initial_assets_ratio: float = Field(1.0, ge=0, le=1)
    tracking_days_override: int = Field(0, ge=0)
    avg_daily_expense_override: float = Field(0.0, ge=0)
