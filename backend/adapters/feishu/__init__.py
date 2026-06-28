"""飞书适配器骨架

实际实现将在后续版本完成。MVP 阶段只保证:
  - 适配器签名稳定(后续接入时不需要改路由层)
  - 与 settings 库使用同一份 connection / sync_job 表

后续接入计划(开发方案 §飞书与多维表格接入建议):
  - 数据互通:把时间规划多维表格同步到本地 + 把本地目标回写多维表格
  - 工作流协同:在飞书触发每日回顾 / 读取计划节点
"""
from __future__ import annotations

from typing import Optional


class FeishuAdapter:
    """占位实现。后续接 lark-cli / 飞书 OpenAPI。"""

    def __init__(self, auth_payload: Optional[dict] = None) -> None:
        self.auth_payload = auth_payload or {}

    def is_connected(self) -> bool:
        return bool(self.auth_payload.get("access_token"))

    def connect(self, app_id: str, app_secret: str) -> dict:
        """实际实现应调用飞书 tenant_access_token 接口。MVP 阶段只占位。"""
        return {
            "ok": False,
            "placeholder": True,
            "message": "飞书适配器为占位实现,实际接入将在后续版本完成。",
            "received": {"app_id": app_id, "app_secret_prefix": app_secret[:4] + "***"},
        }

    def sync_base_table(self, base_token: str, table_id: str) -> dict:
        """同步飞书多维表格到本地 transactions(占位)。"""
        return {
            "ok": False,
            "placeholder": True,
            "message": "飞书多维表格同步为占位实现。",
            "received": {"base_token": base_token, "table_id": table_id},
        }

    def push_goal(self, goal: dict) -> dict:
        """把本地目标回写到飞书多维表格(占位)。"""
        return {
            "ok": False,
            "placeholder": True,
            "message": "目标回写为占位实现。",
            "received": {"goal_name": goal.get("name")},
        }
