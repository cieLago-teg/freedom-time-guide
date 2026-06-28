"""OpenClaw 适配器骨架

按开发方案 §OpenClaw 接口预留:
  - 获取当前总状态
  - 获取一段时间内的交易与统计摘要
  - 提交一个模拟请求并返回结果
  - 获取当前目标与风险提示
"""
from __future__ import annotations

from typing import Optional


class OpenClawAdapter:
    """占位实现。后续以本地服务 / 插件 / 独立 agent 形态接入。"""

    def __init__(self, auth_payload: Optional[dict] = None) -> None:
        self.auth_payload = auth_payload or {}

    def open_session(self, agent_id: str) -> dict:
        return {
            "ok": False,
            "placeholder": True,
            "message": "OpenClaw session 为占位实现。",
            "received": {"agent_id": agent_id},
        }

    def fetch_context(self, session_id: str) -> dict:
        return {
            "ok": False,
            "placeholder": True,
            "message": "OpenClaw context 为占位实现。",
            "received": {"session_id": session_id},
        }

    def submit_simulation(self, session_id: str, payload: dict) -> dict:
        return {
            "ok": False,
            "placeholder": True,
            "message": "OpenClaw simulation 为占位实现。",
            "received": {"session_id": session_id, "payload_keys": list(payload.keys())},
        }
