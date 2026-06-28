import { useState, type ReactNode } from "react";
import { Menu as MenuIcon } from "lucide-react";
import Sidebar from "./Sidebar";
import BottomTabBar from "./BottomTabBar";
import SlideMenu from "./SlideMenu";
import ExplanationCard from "@/components/feedback/ExplanationCard";
import ToastHost from "@/components/ui/Toast"; // FIX-4: 全局 Toast

export default function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-paper text-ink-strong">
      {/* 桌面端:侧边栏 */}
      <Sidebar />

      {/* 移动端:顶部 header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-paper/95 backdrop-blur-md border-b border-paper-200 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-paper-200 flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-ember-500 glow-pulse" />
          </div>
          <span className="font-serif text-[15px] tracking-wide">自由时间指南灯</span>
        </div>
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="打开菜单"
          className="w-10 h-10 rounded-full flex items-center justify-center text-ink-500 active:bg-paper-200/60"
        >
          <MenuIcon size={20} strokeWidth={1.7} />
        </button>
      </header>

      {/* 主内容区 */}
      <main
        className="flex-1 min-w-0 md:ml-0 pt-14 pb-20 md:pt-10 md:pb-10 px-4 md:px-8 lg:px-10 max-w-[1180px] mx-auto w-full"
        style={{
          paddingTop: "calc(56px + env(safe-area-inset-top))",
        }}
      >
        {/* 桌面端 padding 由 class 提供;移动端 paddingTop 由 inline style 处理 */}
        <div className="md:pt-0 pt-2 max-w-[1180px] mx-auto w-full md:px-0">
          {children}
        </div>
      </main>

      {/* 移动端:底部 Tab */}
      <BottomTabBar onMenuClick={() => setMenuOpen(true)} />

      {/* 移动端:底部菜单 */}
      <SlideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* 解释卡(全局) */}
      <ExplanationCard />
    </div>
  );
}
