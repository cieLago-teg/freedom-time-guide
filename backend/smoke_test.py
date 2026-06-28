"""后端冒烟测试: 验证核心 API 在生产可用"""
import os
# 绕过系统代理
for k in ("HTTP_PROXY", "HTTPS_PROXY", "http_proxy", "https_proxy"):
    os.environ.pop(k, None)

import urllib.request, urllib.error, json

BASE = "http://127.0.0.1:8766"


def get(path: str):
    try:
        with urllib.request.urlopen(f"{BASE}{path}", timeout=5) as r:
            body = r.read().decode("utf-8")
            return r.status, body
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="ignore")
    except Exception as e:
        return -1, str(e)


print("=" * 60)
print(f"Backend smoke test @ {BASE}")
print("=" * 60)

paths = ["/api/health", "/api/state", "/api/settings", "/api/transactions", "/api/goals"]
for p in paths:
    code, body = get(p)
    short = body[:120].replace("\n", " ")
    print(f"  [{code}] {p:25s} -> {short}")

# simulate(模拟规划) 也跑一下
try:
    payload = json.dumps({"kind": "avg_expense_change", "target_avg_daily_expense": 30, "horizon_days": 60}).encode()
    req = urllib.request.Request(f"{BASE}/api/planner/simulate", data=payload, headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=5) as r:
        body = r.read().decode("utf-8")
        print(f"  [200] /api/planner/simulate  -> {body[:120]}")
except Exception as e:
    print(f"  [ERR] /api/planner/simulate -> {e}")

print("=" * 60)