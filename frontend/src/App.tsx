import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import Dashboard from "@/pages/dashboard";
import GridPage from "@/pages/grid";
import TransactionsPage from "@/pages/transactions";
import PlannerPage from "@/pages/planner";
import GoalsPage from "@/pages/goals";
import SettingsPage from "@/pages/settings";
import ImportExportPage from "@/pages/import-export";
import { useAppStore } from "@/store/useAppStore";

export default function App() {
  const refresh = useAppStore((s) => s.refresh);
  const loading = useAppStore((s) => s.loading);
  const settings = useAppStore((s) => s.settings);
  const error = useAppStore((s) => s.error);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="paper-card max-w-md w-full p-8 text-center">
          <h2 className="font-serif text-xl mb-2">连不上后端</h2>
          <p className="text-sm text-ink-400 mb-4">
            请确认 FastAPI 服务已经启动在 http://127.0.0.1:8766
          </p>
          <button className="btn btn-primary" onClick={() => refresh()}>
            重试
          </button>
          <pre className="mt-4 text-xs text-ink-400 whitespace-pre-wrap">{error}</pre>
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/grid" element={<GridPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/planner" element={<PlannerPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/import-export" element={<ImportExportPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {loading && !settings && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <div className="chip chip-paper animate-pulse">正在加载</div>
        </div>
      )}
    </AppShell>
  );
}
