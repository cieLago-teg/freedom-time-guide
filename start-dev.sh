#!/usr/bin/env bash
# ==========================================================
# 自由时间指南灯 · Linux/macOS 一键启动
# ==========================================================
set -e
cd "$(dirname "$0")"

echo "[1/3] 启动后端..."
(cd backend && .venv/bin/python -m uvicorn backend.main:app --host 127.0.0.1 --port 8766) &
BACKEND_PID=$!

sleep 2

echo "[2/3] 启动前端..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

trap "echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

echo "============================================"
echo " 后端 -> http://127.0.0.1:8766"
echo " 前端 -> http://127.0.0.1:5174"
echo "============================================"

wait