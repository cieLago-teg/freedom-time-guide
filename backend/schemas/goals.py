"""Goal 输入模型"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class GoalIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    type: str = Field(..., min_length=1, max_length=40)
    target_amount: float = Field(0.0, ge=0)
    target_date: Optional[str] = None
    note: str = ""
    status: str = Field("active")
