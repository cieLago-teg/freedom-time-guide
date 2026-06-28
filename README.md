# 自由时间指南灯

> 把收入、支出和资产,翻译成你真正拥有的自由时间。

本项目是 `财富自由指南灯` demo 的模块化重建版本,核心理念是把财务状态翻译成"自由时间",帮助用户看见自己的消费决策对未来人生空间的真实影响。

## ⚡ 快速启动

### 方式 1 · Windows 一键(推荐)

```cmd
# 双击运行
start-dev.bat        :: 开发模式: 后端 8766 + 前端 5174(HMR 热更)
start-prod.bat       :: 生产模式: FastAPI 托管前端 → 访问 http://127.0.0.1:8766
```

### 方式 2 · macOS / Linux

```bash
chmod +x start-dev.sh && ./start-dev.sh
```

### 方式 3 · Docker(任何环境)

```bash
docker compose up -d
# 访问 http://127.0.0.1:8766
# 数据持久化到 ./data/freedom.db
```

### 方式 4 · 手动(开发学习用)

```bash
# 后端
cd backend
python -m venv .venv && .venv\Scripts\activate     # Windows
# source .venv/bin/activate                        # macOS/Linux
pip install fastapi uvicorn[standard] pydantic
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8766

# 前端(另一终端)
cd frontend
npm install
npm run dev          # 开发 → http://127.0.0.1:5174
npm run build        # 生产构建到 dist/
```

## 项目结构

```
自由时间指南灯/
├── start-dev.bat / start-dev.sh / start-prod.bat   # 一键启动
├── Dockerfile / docker-compose.yml                 # 容器化部署
├── backend/                      # FastAPI + SQLite
│   ├── api/                      # 路由层(7 个模块)
│   ├── services/                 # 计算 + 解释 + 集成服务
│   ├── adapters/                 # 飞书 / OpenClaw / 账本导入(占位)
│   ├── repositories/             # 数据访问层
│   ├── schemas/                  # Pydantic 模型
│   ├── db/                       # SQLite 会话与初始化
│   ├── data/                     # 本地数据库(freedom.db,git ignore)
│   ├── main.py                   # FastAPI 入口
│   ├── smoke_test.py             # 启动后跑一遍冒烟
│   └── requirements.txt
├── frontend/                     # React + TS + Tailwind + shadcn 风格
│   ├── src/
│   │   ├── pages/                # 7 个页面:dashboard/grid/transactions/...
│   │   ├── components/           # layout / feedback / ui
│   │   ├── engine/life-grid/     # 方格引擎(从 demo 迁移 + 重构)
│   │   ├── store/                # Zustand store
│   │   ├── lib/                  # api client + format + cn
│   │   └── styles/               # 纸张黄主题 global.css
│   ├── tailwind.config.ts        # 纸张黄 #F5F2E8 + 宣纸金主题
│   ├── vite.config.ts
│   └── package.json
├── .gitignore
└── README.md                     # 本文件
```

## MVP 9 项最小可用清单

1. ✅ 本地账户与设置(`/api/settings`)
2. ✅ 交易录入、删除、列表(`/api/transactions`)
3. ✅ 平均日花销自动计算(`stats_service`)
4. ✅ 资产自由与净储蓄自由分段计算(`asset_freedom` + `income_freedom`)
5. ✅ 人生方格可视化(`engine/life-grid` + Canvas)
6. ✅ 收入点亮 / 支出熄灭反馈(`light_up` + `extinguish` + 解释卡)
7. ✅ 首页总览(`/pages/dashboard`)
8. ✅ 简单模拟(`/api/planner/simulate` + `/pages/planner`)
9. ✅ 数据导入导出(`/api/import/csv/*` + `/api/export/json`)

## 接口契约

| Method | Path | 说明 |
|--------|------|------|
| GET | `/api/state` | settings + stats + 最近 50 笔交易 + 风险提示 |
| POST | `/api/settings` | 保存设置并返回最新 stats |
| GET | `/api/transactions` | 分页列表 |
| POST | `/api/transactions` | 新增交易,返回 lit_before/after/delta/animation/explanation |
| DELETE | `/api/transactions/{id}` | 删除,返回同上 |
| POST | `/api/planner/simulate` | 不落库模拟 |
| GET / POST / PATCH / DELETE | `/api/goals` | 目标 CRUD |
| POST | `/api/import/csv/preview` | CSV 预览 |
| POST | `/api/import/csv/commit` | CSV 提交 |
| GET | `/api/export/json` | 全量 JSON 导出 |
| GET | `/api/integrations` | 集成连接列表(占位) |
| POST | `/api/integrations/feishu/connect` | 飞书连接(占位) |
| POST | `/api/integrations/openclaw/session` | OpenClaw session(占位) |
| GET | `/api/agent/state-summary` | agent-facing 状态摘要 |
| POST | `/api/agent/simulate` | agent-facing 模拟 |

## 后续版本

- **V1** 支出分类洞察 · 大额消费解释卡片 · 飞书多维表格最小闭环 · 每日回放
- **V2** 移动端原生 · 智能建议 agent · 投资资产分析

## 设计原则(来自开发方案)

1. 数据是真相,动画是仪式 · 仪式服从真相
2. 消费反馈必须具体(数字 + 影响 + 抹平日)
3. 工具应该帮助用户做长期判断
4. 外部系统只通过适配层接入,不污染核心计算
5. 本地数据库始终是自由时间计算的唯一真实来源
