/** FIX-4: 全局轻提示 Toast
 *
 * 用法:
 *   import { toast } from "@/components/ui/Toast";
 *   toast.success("已记录,自由又近了一步");
 *   toast.error("提交失败,请稍后再试");
 */
import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastKind = "success" | "error";

interface ToastItem {
  id: number;
  kind: ToastKind;
  text: string;
  exiting?: boolean;
}

let pushFn: ((k: ToastKind, text: string) => void) | null = null;
let nextId = 1;

export const toast = {
  success: (text: string) => pushFn?.("success", text),
  error: (text: string) => pushFn?.("error", text),
};

export default function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((kind: ToastKind, text: string) => {
    const id = nextId++;
    setItems((prev) => [...prev, { id, kind, text }]);
    // 1.8s 后开始淡出,2s 后移除
    window.setTimeout(() => {
      setItems((prev) =>
        prev.map((x) => (x.id === id ? { ...x, exiting: true } : x))
      );
      window.setTimeout(() => {
        setItems((prev) => prev.filter((x) => x.id !== id));
      }, 240);
    }, 1800);
  }, []);

  useEffect(() => {
    pushFn = push;
    return () => {
      pushFn = null;
    };
  }, [push]);

  if (items.length === 0) return null;

  return (
    <div
      className="fixed z-[60] left-0 right-0 pointer-events-none"
      style={{
        bottom: "calc(80px + env(safe-area-inset-bottom))",
      }}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-2 px-4">
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-center gap-2 max-w-[92vw] px-4 py-3 rounded-2xl shadow-[0_8px_24px_rgba(60,50,30,0.18)] backdrop-blur-sm",
              t.kind === "success"
                ? "bg-ink-strong text-paper border border-ink-mid"
                : "bg-ember-50 text-ember-700 border border-ember-200",
              t.exiting ? "toast-exit" : "toast-enter"
            )}
          >
            {t.kind === "success" ? (
              <CheckCircle2
                size={16}
                strokeWidth={1.8}
                className="text-ember-300 shrink-0"
              />
            ) : (
              <AlertCircle
                size={16}
                strokeWidth={1.8}
                className="shrink-0"
              />
            )}
            <span className="text-[13.5px] font-medium">{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}