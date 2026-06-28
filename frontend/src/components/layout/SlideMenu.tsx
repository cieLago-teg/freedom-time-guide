import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import {
  X,
  Target,
  Settings as SettingsIcon,
  FileUp,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/cn";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ITEMS = [
  { to: "/goals", label: "我的目标", desc: "把模糊的想法落到纸面", icon: Target },
  { to: "/import-export", label: "导入导出", desc: "数据永远是你的", icon: FileUp },
  { to: "/settings", label: "设置", desc: "人生参数 · 资产参数", icon: SettingsIcon },
];

export default function SlideMenu({ open, onClose }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      // 锁定 body 滚动
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="md:hidden fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="我的菜单"
    >
      {/* 背景遮罩 */}
      <button
        aria-label="关闭菜单"
        onClick={onClose}
        className="absolute inset-0 bg-ink-strong/40 backdrop-blur-sm fade-in"
      />

      {/* Sheet */}
      <div
        ref={ref}
        className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-paper rounded-t-3xl shadow-[0_-8px_30px_rgba(60,50,30,0.15)] flex flex-col"
        style={{
          animation: "slide-up 320ms cubic-bezier(0.32, 0.72, 0, 1)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* handle */}
        <div className="flex justify-center pt-3 pb-1">
          <span className="w-9 h-1 rounded-full bg-ink-faint/40" />
        </div>

        {/* 标题 */}
        <div className="px-5 pt-3 pb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl text-ink-strong">我的</h2>
          <button
            onClick={onClose}
            aria-label="关闭"
            className="w-10 h-10 rounded-full flex items-center justify-center text-ink-500 hover:bg-paper-200/60 active:bg-paper-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* 列表 */}
        <ul className="px-3 pb-4 space-y-1 overflow-y-auto">
          {ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-4 px-4 py-3.5 rounded-2xl active:bg-paper-200/60 transition-colors min-h-[56px]",
                    isActive && "bg-paper-200/60"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        isActive
                          ? "bg-ember-100 text-ember-700"
                          : "bg-paper-200 text-ink-500"
                      )}
                    >
                      <item.icon size={18} strokeWidth={1.7} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] text-ink-strong">{item.label}</div>
                      <div className="text-[12px] text-ink-soft mt-0.5">
                        {item.desc}
                      </div>
                    </div>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* 底部签名 */}
        <div className="mt-auto px-5 pt-3 pb-4 border-t border-paper-200 flex items-center gap-2 text-[11.5px] text-ink-soft">
          <Sparkles size={12} className="text-ember-700" />
          <span>数据是真相 · 动画是仪式 · 仪式服从真相</span>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
