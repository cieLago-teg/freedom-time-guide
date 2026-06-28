import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Grid3X3,
  ScrollText,
  Compass,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/cn";

interface Props {
  onMenuClick: () => void;
}

/** 移动端底部 Tab Bar · 5 个主入口,中间凸起做"记一笔" */
const PRIMARY = [
  { to: "/", label: "总览", icon: LayoutDashboard },
  { to: "/grid", label: "方格", icon: Grid3X3 },
  { to: "/transactions", label: "记一笔", icon: ScrollText, primary: true },
  { to: "/planner", label: "规划", icon: Compass },
  { to: "/menu", label: "我的", icon: Menu, asMenu: true },
];

export default function BottomTabBar({ onMenuClick }: Props) {
  return (
    <nav
      aria-label="主导航"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-paper/95 backdrop-blur-md border-t border-paper-200 pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-5 h-[64px]">
        {PRIMARY.map((item) => {
          const isPrimary = (item as { primary?: boolean }).primary;
          const asMenu = (item as { asMenu?: boolean }).asMenu;
          if (asMenu) {
            return (
              <li key={item.to} className="flex items-stretch">
                <button
                  onClick={onMenuClick}
                  aria-label="打开我的菜单"
                  className="flex-1 flex flex-col items-center justify-center gap-1 active:bg-paper-200/60 transition-colors"
                >
                  <item.icon size={22} strokeWidth={1.6} className="text-ink-500" />
                  <span className="text-[10.5px] tracking-wider text-ink-500">
                    {item.label}
                  </span>
                </button>
              </li>
            );
          }
          if (isPrimary) {
            return (
              <li key={item.to} className="flex items-stretch">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex-1 flex flex-col items-center justify-center gap-0.5 active:bg-paper-200/60 transition-colors",
                      isActive ? "text-ember-700" : "text-ink-500"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className={cn(
                          "w-12 h-12 -mt-5 rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(60,50,30,0.18)] transition-all",
                          isActive
                            ? "bg-ember-500 text-white"
                            : "bg-ink-strong text-paper"
                        )}
                      >
                        <item.icon size={22} strokeWidth={1.8} />
                      </div>
                      <span
                        className={cn(
                          "text-[10.5px] tracking-wider mt-0.5",
                          isActive ? "text-ember-700 font-medium" : "text-ink-500"
                        )}
                      >
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              </li>
            );
          }
          return (
            <li key={item.to} className="flex items-stretch">
              <NavLink
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex-1 flex flex-col items-center justify-center gap-1 active:bg-paper-200/60 transition-colors",
                    isActive ? "text-ember-700" : "text-ink-500"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      size={22}
                      strokeWidth={isActive ? 2 : 1.6}
                      className={cn(
                        "transition-all",
                        isActive && "scale-110"
                      )}
                    />
                    <span
                      className={cn(
                        "text-[10.5px] tracking-wider",
                        isActive && "font-medium"
                      )}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
