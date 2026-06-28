# ==========================================================
# 自由时间指南灯 · 单容器镜像
# 1. 先 build 前端 (Node 阶段)
# 2. 后端运行时由 FastAPI 托管 dist/
# ==========================================================

# -------- 阶段 1: 构建前端 --------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
RUN npm run build

# -------- 阶段 2: 后端运行时 --------
FROM python:3.14-slim AS runtime
WORKDIR /app

# 系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 后端依赖
COPY backend/ /app/backend/
RUN python -m venv /app/.venv \
    && /app/.venv/bin/pip install --no-cache-dir --upgrade pip \
    && /app/.venv/bin/pip install --no-cache-dir \
       fastapi==0.138.1 \
       uvicorn[standard]==0.49.0 \
       pydantic==2.13.4 \
       python-multipart \
    || /app/.venv/bin/pip install --no-cache-dir -r /app/backend/requirements.txt

# 复制前端构建产物(由 FastAPI 静态托管)
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# 数据持久化目录
RUN mkdir -p /app/data
ENV FREEDOM_DB=/app/data/freedom.db
ENV FREEDOM_FRONTEND_DIST=/app/frontend/dist

EXPOSE 8766

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -fs http://127.0.0.1:8766/api/health || exit 1

# 用单进程跑 uvicorn,FastAPI 内部 StaticFiles 托管前端
CMD ["sh", "-c", ".venv/bin/python -m uvicorn backend.main:app --host 0.0.0.0 --port 8766"]