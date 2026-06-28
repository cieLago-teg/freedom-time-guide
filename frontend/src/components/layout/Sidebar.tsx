import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Grid3X3,
  ScrollText,
  Compass,
  Target,
  Settings as SettingsIcon,
  FileUp,
} from "lucide-react";
import { cn } from "@/lib/cn";

const NAV = [
  { to: "/", label: "总览", icon: LayoutDashboard },
  { to: "/grid", label: "自由方格", icon: Grid3X3 },
  { to: "/transactions", label: "交易", icon: ScrollText },
  { to: "/planner", label: "规划模拟", icon: Compass },
  { to: "/goals", label: "目标", icon: Target },
  { to: "/import-export", label: "导入导出", icon: FileUp },
  { to: "/settings", label: "设置", icon: SettingsIcon },
];

export default function Sidebar() {
  return (
    <aside className="w-[220px] shrink-0 hidden md:flex flex-col border-r hairline bg-paper-50/60 backdrop-blur-sm">
      <div className="px-5 pt-7 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-paper-200 flex items-center justify-center shadow-ring">
            <span className="w-3 h-3 rounded-full bg-ember-500 glow-pulse" />
          </div>
          <div className="leading-tight">
            <div className="font-serif text-[15px] tracking-wide">自由时间指南灯</div>
            <div className="text-[11px] text-ink-400 mt-0.5">Freedom Time Guide</div>
          </div>
        </div>
      </div>

      <nav className="px-3 py-2 flex-1 space-y-0.5">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-paper-200/80 text-ink-strong shadow-ring"
                  : "text-ink-500 hover:bg-paper-200/40"
              )
            }
          >
            <item.icon size={16} strokeWidth={1.7} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-5 text-[11px] text-ink-400 leading-relaxed border-t hairline">
        <p>数据是真相,动画是仪式。</p>
        <p className="mt-1 opacity-70">仪式服从真相。</p>
      </div>
    </aside>
  );
}
