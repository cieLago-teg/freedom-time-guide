/** 后端 API 客户端
 *
 * - 所有接口契约与 backend/api/* 一一对应
 * - 不在前端做计算/统计,只搬运原始结构
 */
const BASE = "/api";

async function request<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${text}`);
  }
  // 部分导出接口返回二进制,调用方按需处理
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    return (await res.json()) as T;
  }
  return (await res.text()) as unknown as T;
}

// ---------- 类型 ----------
export interface Settings {
  birth_date: string;
  target_age: number;
  currency: string;
  show_past: number | boolean;
  use_initial_assets: number | boolean;
  initial_assets: number;
  initial_assets_ratio: number;
  tracking_days_override: number;
  avg_daily_expense_override: number;
}

export interface Stats {
  total_income: number;
  total_expense: number;
  tracking_days: number;
  avg_daily_expense: number;
  net_savings: number;
  asset_freedom: number;
  income_freedom: number;
  freedom_days_bought: number;
  asset_lit: number;
  income_lit: number;
  lit_count: number;
  overflow: number;
  past_cells: number;
  future_cells: number;
  total_cells: number;
  tracked_past_cells: number;
  show_past: boolean | number;
  use_initial_assets: boolean | number;
  initial_assets: number;
  initial_assets_ratio: number;
  first_record: string | null;
  last_record: string | null;
  currency: string;
  target_age: number;
  risk_alerts: string[];
}

export interface Transaction {
  id: number;
  occurred_on: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  note: string;
  is_major: number;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: number;
  name: string;
  type: string;
  target_amount: number;
  target_date: string | null;
  note: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface StateResponse {
  settings: Settings | null;
  stats: Stats;
  transactions: Transaction[];
}

export interface TxMutationResponse {
  transaction?: Transaction;
  deleted?: number;
  stats: Stats;
  lit_before: number;
  lit_after: number;
  delta: number;
  animation: "light_up" | "extinguish" | "none";
  explanation: string;
}

export interface SimulationResponse {
  kind: string;
  explanation: string;
  simulated: {
    target_avg_daily_expense: number;
    horizon_days: number;
    asset_freedom: number;
    income_freedom: number;
    freedom_days_bought: number;
    lit_count: number;
    overflow: number;
  };
  baseline: {
    avg_daily_expense: number;
    freedom_days_bought: number;
    lit_count: number;
  };
  delta: {
    lit_count: number;
    freedom_days_bought: number;
    avg_daily_expense: number;
  };
}

// ---------- 接口 ----------
export const api = {
  getState: () => request<StateResponse>(`/state`),

  postSettings: (body: Partial<Settings>) =>
    request<{ settings: Settings; stats: Stats }>(`/settings`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  listTransactions: (limit = 200) =>
    request<{ transactions: Transaction[] }>(`/transactions?limit=${limit}`),

  addTransaction: (body: {
    occurred_on?: string;
    type: "income" | "expense";
    amount: number;
    category?: string;
    note?: string;
    is_major?: boolean;
    source?: string;
  }) =>
    request<TxMutationResponse>(`/transactions`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  deleteTransaction: (id: number) =>
    request<TxMutationResponse>(`/transactions/${id}`, {
      method: "DELETE",
    }),

  simulate: (body: {
    kind: "avg_expense_change" | "delay_consumption";
    target_avg_daily_expense?: number;
    delay_days?: number;
    delayed_amount?: number;
    horizon_days?: number;
  }) =>
    request<SimulationResponse>(`/planner/simulate`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  listGoals: () => request<{ goals: Goal[] }>(`/goals`),

  createGoal: (body: Partial<Goal>) =>
    request<{ goal: Goal }>(`/goals`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateGoalStatus: (id: number, status: string) =>
    request<{ goal: Goal }>(`/goals/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  deleteGoal: (id: number) =>
    request<{ deleted: number }>(`/goals/${id}`, { method: "DELETE" }),

  importCsvPreview: (csv: string) =>
    request<{
      ok: boolean;
      error?: string;
      fieldnames?: string[];
      total?: number;
      valid_count?: number;
      error_count?: number;
      errors?: { row: number; error: string; raw: Record<string, string> }[];
      sample?: Record<string, unknown>[];
      rows?: Record<string, unknown>[];
    }>(`/import/csv/preview`, {
      method: "POST",
      body: csv,
    }),

  importCsvCommit: (rows: Record<string, unknown>[]) =>
    request<{
      inserted: number;
      error_count: number;
      errors: { row: number; error: string; raw: Record<string, unknown> }[];
    }>(`/import/csv/commit`, {
      method: "POST",
      body: JSON.stringify({ rows }),
    }),

  exportJsonUrl: () => `${BASE}/export/json`,
};
