"""Transaction 输入/输出模型"""
from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field


class TransactionIn(BaseModel):
    occurred_on: Optional[str] = None
    type: Literal["income", "expense"]
    amount: float = Field(..., gt=0)
    category: str = ""
    note: str = ""
    is_major: bool = False
    source: str = "manual"
