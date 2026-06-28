"""账本导入器骨架(适配层)

不同记账软件的导出格式差异极大,适配层把这些差异隔离在外部,
只把清洗后的数据交给核心交易表。MVP 阶段只实现 CSV 通用入口。

第一阶段(已实现):CSV / Excel / JSON 通用入口
第二阶段:针对单 App 的映射规则(钱包类 / 鲨鱼记账 / Money Pro 等)
第三阶段:如果目标 App 提供 API,再做直接同步
"""
from __future__ import annotations

from typing import Iterable, Optional


class LedgerImporter:
    """适配层:把任意原始账本数据 → 标准 TransactionIn 列表。"""

    def __init__(self, name: str) -> None:
        self.name = name

    def normalize(self, rows: Iterable[dict]) -> list[dict]:
        """子类应实现。MVP 阶段返回空。"""
        raise NotImplementedError


class CsvGenericImporter(LedgerImporter):
    """通用 CSV 导入器(已通过 import_export_service 实现)。"""

    def __init__(self) -> None:
        super().__init__(name="csv_generic")

    def normalize(self, rows: Iterable[dict]) -> list[dict]:
        out = []
        for raw in rows:
            t = (raw.get("type") or "").strip().lower()
            if t not in ("income", "expense"):
                continue
            try:
                amt = float(raw.get("amount") or 0)
            except (TypeError, ValueError):
                continue
            if amt <= 0:
                continue
            out.append({
                "occurred_on": (raw.get("occurred_on") or "").strip(),
                "type": t,
                "amount": amt,
                "category": (raw.get("category") or "").strip(),
                "note": (raw.get("note") or "").strip(),
                "is_major": str(raw.get("is_major") or "").lower() in ("1", "true", "yes"),
                "source": "csv",
            })
        return out


class AppSpecificImporter(LedgerImporter):
    """第二阶段的占位:针对具体 App 的专用导入器。"""

    def __init__(self, app_name: str) -> None:
        super().__init__(name=f"app:{app_name}")
        self.app_name = app_name

    def normalize(self, rows: Iterable[dict]) -> list[dict]:
        # 实际实现需要针对 app_name 做字段映射(MVP 阶段不实现)
        return []
