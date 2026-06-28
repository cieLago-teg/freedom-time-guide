"""变更影响文字解释服务

产品文案基调(开发方案 §产品文案基调):
  - 克制、清醒、带一点人生重量,但不像训诫软件
  - 避免成功学、贩卖焦虑、劝用户节省
  - 像冷静的陪跑者,告诉用户「这笔消费如何影响自由时间」

MVP 阶段提供 4 类解释:
  1. 新增收入
  2. 新增支出
  3. 删除交易
  4. 模拟结果
"""
from __future__ import annotations

from typing import Literal


def _fmt_days(n: int) -> str:
    if abs(n) >= 365:
        years = n / 365.0
        return f"{years:.1f} 年"
    return f"{abs(n)} 天"


def explain_transaction_delta(
    *,
    tx_type: Literal["income", "expense"],
    amount: float,
    lit_before: int,
    lit_after: int,
    avg_before: float,
    avg_after: float,
    is_major: bool = False,
) -> str:
    """生成单笔交易的解释文案。"""
    delta = lit_after - lit_before
    avg_delta = avg_after - avg_before

    if delta == 0 and abs(avg_delta) < 0.01:
        return "这次记账没有改变你的自由时间。"

    # 收入
    if tx_type == "income":
        if delta > 0:
            major_hint = "这笔收入足够大,会拉低你的平均日花销。" if is_major else ""
            return (
                f"你刚刚为自己买到了 {delta} 天的自由。"
                f"目前平均日花销是 ¥{avg_after:.2f}。"
                f"{major_hint}"
            ).strip()
        else:
            # 罕见:收入但 avg 没降低(已经在极低位 / tracking_days 短)
            return (
                f"这笔收入已记录,但因为记账天数太短,"
                f"还没能明显折算成新的自由天数。"
            )

    # 支出
    if delta < 0:
        if avg_delta > 0:
            return (
                f"这笔 ¥{amount:.0f} 支出让你的平均日花销上升了 ¥{avg_delta:.2f},"
                f"折算下来自由时间减少了 {-delta} 天。"
            )
        return (
            f"这笔 ¥{amount:.0f} 支出让你的自由时间减少了 {-delta} 天。"
        )
    if delta == 0 and avg_delta > 0:
        return (
            f"这笔 ¥{amount:.0f} 支出抬高了 ¥{avg_delta:.2f} 的日均花销,"
            f"目前尚未熄灭已点亮的方格,但趋势正在累积。"
        )
    return "这次记账没有改变你的自由时间。"

def explain_deletion(
    *,
    tx_type: Literal["income", "expense"],
    amount: float,
    lit_before: int,
    lit_after: int,
) -> str:
    """删除交易时的反向解释。"""
    delta = lit_after - lit_before
    if delta == 0:
        return "撤销这条记录后,自由时间没有变化。"
    if tx_type == "expense" and delta > 0:
        return f"撤销这笔 ¥{amount:.0f} 支出后,你重新拿回了 {delta} 天自由。"
    if tx_type == "income" and delta < 0:
        return f"撤销这笔 ¥{amount:.0f} 收入后,自由时间回退了 {-delta} 天。"
    return "撤销记录后,自由时间已重新计算。"

def explain_simulation(
    *,
    target_avg: float,
    horizon_days: int,
    baseline_lit: int,
    sim_lit: int,
    baseline_avg: float,
) -> str:
    """模拟结果的文字解释。"""
    delta_lit = sim_lit - baseline_lit
    if delta_lit == 0:
        return (
            f"在 {horizon_days} 天内把日均花销调到 ¥{target_avg:.2f},"
            f"对自由天数没有可观察的影响。"
        )
    direction = "增加" if delta_lit > 0 else "减少"
    return (
        f"如果未来 {horizon_days} 天把日均花销从 ¥{baseline_avg:.2f}"
        f"控制到 ¥{target_avg:.2f},你的自由时间将{direction} {abs(delta_lit)} 天。"
    )

def explain_risk(snapshot: dict) -> list[str]:
    """根据当前快照给出风险提示(MVP 简化版)。"""
    alerts: list[str] = []
    lit = snapshot.get("lit_count", 0) or 0
    avg = snapshot.get("avg_daily_expense", 0) or 0
    overflow = snapshot.get("overflow", 0) or 0

    if lit < 30:
        alerts.append(
            "你的自由时间少于 30 天,留意这段时间的大额支出。"
        )
    elif lit < 90:
        alerts.append(
            "你的自由时间少于 90 天,试着控制接下来的日均花销。"
        )

    if overflow > 0:
        alerts.append(
            f"你已经超额 {overflow} 天,继续保持这份节制。"
        )

    return alerts
