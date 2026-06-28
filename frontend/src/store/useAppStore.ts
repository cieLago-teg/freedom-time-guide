/** Zustand store · 全局应用状态
 *
 * 设计原则:
 *  - 后端是真相来源,前端 store 只缓存「当前可见的快照 + 进行中的录入状态」
 *  - 不在前端做 stats 计算,所有 lit/avg 都来自后端
 */
import { create } from "zustand";
import { api, type Settings, type Stats, type Transaction } from "@/lib/api";

interface AppState {
  // 服务器快照
  settings: Settings | null;
  stats: Stats | null;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  // 进行中的录入(只影响 UI 反馈,不入库)
  busy: boolean;
  lastExplanation: string | null;
  lastDelta: number;
  lastAnimation: "light_up" | "extinguish" | "none";

  // 动作
  refresh: () => Promise<void>;
  setBusy: (v: boolean) => void;
  recordMutation: (payload: {
    delta: number;
    animation: "light_up" | "extinguish" | "none";
    explanation: string;
    stats: Stats;
    transaction?: Transaction;
  }) => void;
  applyDeletion: (payload: {
    delta: number;
    animation: "light_up" | "extinguish" | "none";
    explanation: string;
    stats: Stats;
    deletedId: number;
  }) => void;
  updateSettingsLocally: (settings: Settings, stats: Stats) => void;
  clearLastExplanation: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  settings: null,
  stats: null,
  transactions: [],
  loading: false,
  error: null,
  busy: false,
  lastExplanation: null,
  lastDelta: 0,
  lastAnimation: "none",

  setBusy: (v) => set({ busy: v }),

  refresh: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.getState();
      set({
        settings: data.settings,
        stats: data.stats,
        transactions: data.transactions,
        loading: false,
      });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  recordMutation: ({ delta, animation, explanation, stats, transaction }) =>
    set((state) => ({
      stats,
      transactions: transaction
        ? [transaction, ...state.transactions].slice(0, 200)
        : state.transactions,
      lastDelta: delta,
      lastAnimation: animation,
      lastExplanation: explanation,
    })),

  applyDeletion: ({ delta, animation, explanation, stats, deletedId }) =>
    set((state) => ({
      stats,
      transactions: state.transactions.filter((t) => t.id !== deletedId),
      lastDelta: delta,
      lastAnimation: animation,
      lastExplanation: explanation,
    })),

  updateSettingsLocally: (settings, stats) => set({ settings, stats }),

  clearLastExplanation: () =>
    set({ lastExplanation: null, lastDelta: 0, lastAnimation: "none" }),
}));
