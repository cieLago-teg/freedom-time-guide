"""生产模式验收 · 全部 9 项 API + 静态托管 + SPA fallback"""
import os
for k in ("HTTP_PROXY", "HTTPS_PROXY", "http_proxy", "https_proxy"):
    os.environ.pop(k, None)

import urllib.request, urllib.error, json

BASE = "http://127.0.0.1:8766"


def get(path):
    try:
        with urllib.request.urlopen(f"{BASE}{path}", timeout=5) as r:
            return r.status, r.headers.get("content-type", ""), r.read()[:300]
    except urllib.error.HTTPError as e:
        return e.code, "", e.read()[:200]
    except Exception as e:
        return -1, "", str(e).encode()


def post(path, body=None, headers=None):
    h = {"Content-Type": "application/json"}
    if headers:
        h.update(headers)
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(f"{BASE}{path}", data=data, headers=h, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=5) as r:
            return r.status, r.headers.get("content-type", ""), r.read()[:300]
    except urllib.error.HTTPError as e:
        return e.code, "", e.read()[:200]


print("=" * 70)
print("  自由时间指南灯 · 生产模式全面验收 @ 8766")
print("=" * 70)

# === 1. 静态托管 ===
print("\n[1] 静态托管验证")
for path in ["/", "/index.html", "/transactions", "/goals"]:
    code, ct, body = get(path)
    is_html = "text/html" in ct or "<!doctype" in body.decode("utf-8", "ignore").lower()
    print(f"  [{code}] {path:18s} -> ct={ct.split(';')[0]:20s} html={is_html}")

# === 2. 静态资源 ===
print("\n[2] 静态资源")
code, ct, body = get("/assets")
print(f"  [{code}] /assets -> ct={ct.split(';')[0]}")

# === 3. 9 项核心 API ===
print("\n[3] 9 项 MVP API")
paths = [
    ("GET",  "/api/health", None),
    ("GET",  "/api/state", None),
    ("GET",  "/api/transactions", None),
    ("POST", "/api/planner/simulate", {"kind": "avg_expense_change", "target_avg_daily_expense": 30, "horizon_days": 60}),
    ("GET",  "/api/goals", None),
    ("GET",  "/api/export/json", None),
    ("GET",  "/api/integrations", None),
    ("GET",  "/api/nonexistent-for-404-test", None),  # 真不存在的路径应返回 404 JSON,不是 index.html
]
for method, path, body in paths:
    if method == "GET":
        code, ct, resp = get(path)
    else:
        code, ct, resp = post(path, body)
    short = resp.decode("utf-8", "ignore").replace("\n", " ")[:60]
    print(f"  [{method}] [{code}] {path:30s} -> {short}")

# === 4. 记一笔(POST 写入测试) ===
print("\n[4] 写入测试 · 记一笔")
code, ct, body = post("/api/transactions", {
    "type": "income", "amount": 200, "note": "smoke-test"
})
print(f"  POST /api/transactions (income 200) -> [{code}] {body.decode()[:120]}")

# === 5. Swagger ===
print("\n[5] Swagger")
code, ct, body = get("/api/docs")
print(f"  [{code}] /api/docs -> ct={ct.split(';')[0]} len={len(body)}")

print("\n" + "=" * 70)
print("  验收完成")
print("=" * 70)