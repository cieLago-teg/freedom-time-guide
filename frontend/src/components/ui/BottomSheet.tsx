import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** 默认 85vh,小内容可传 compact */
  size?: "default" | "compact";
}

/** 移动端底部上滑 Sheet(自带遮罩 + 锁定 body 滚动 + safe-area 适配) */
export default function BottomSheet({
  open,
  onClose,
  title,
  children,
  size = "default",
}: Props) {
  // 锁定 body 滚动 + ESC 关闭
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="md:hidden fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
    >
      {/* 遮罩 */}
      <button
        aria-label="关闭"
        onClick={onClose}
        className="absolute inset-0 bg-ink-strong/40 backdrop-blur-sm fade-in"
      />

      {/* Sheet */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-paper rounded-t-3xl shadow-[0_-8px_30px_rgba(60,50,30,0.15)] flex flex-col",
          size === "compact" ? "max-h-[55vh]" : "max-h-[85vh]"
        )}
        style={{
          animation: "sheet-up 320ms cubic-bezier(0.32, 0.72, 0, 1)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <span className="w-9 h-1 rounded-full bg-ink-faint/40" />
        </div>

        {title && (
          <div className="px-5 pt-2 pb-3 shrink-0">
            <h2 className="font-serif text-[17px] text-ink-strong">{title}</h2>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 pb-5">{children}</div>
      </div>

      <style>{`
        @keyframes sheet-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}