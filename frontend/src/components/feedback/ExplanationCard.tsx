import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight, Minus, X } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

/** 变更解释卡
 *
 * - 桌面端:右下角浮窗
 * - 移动端:底部 Sheet(从底部滑入,可点击关闭或自动消失)
 */
export default function ExplanationCard() {
  const { lastExplanation, lastDelta, lastAnimation, clearLastExplanation } =
    useAppStore();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!lastExplanation) return;
    setVisible(true);
    setDismissed(false);
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(clearLastExplanation, 320);
    }, 5800);
    return () => clearTimeout(t);
  }, [lastExplanation, clearLastExplanation]);

  if (!lastExplanation || dismissed) return null;

  const direction =
    lastAnimation === "light_up"
      ? "up"
      : lastAnimation === "extinguish"
      ? "down"
      : "none";

  const Icon =
    direction === "up"
      ? ArrowUpRight
      : direction === "down"
      ? ArrowDownRight
      : Minus;

  const tone =
    direction === "up"
      ? "border-ember-200 bg-ember-50"
      : direction === "down"
      ? "border-moon-500/30 bg-moon-500/5"
      : "border-paper-300 bg-paper-50";

  const iconTone =
    direction === "up"
      ? "bg-ember-100 text-ember-700"
      : direction === "down"
      ? "bg-moon-500/15 text-moon-500"
      : "bg-paper-200 text-ink-500";

  const deltaText =
    lastDelta > 0
      ? `+${lastDelta} 天`
      : lastDelta < 0
      ? `${lastDelta} 天`
      : "无变化";

  // 桌面端:right-6 bottom-6 max-w-sm
  // 移动端:底部 Sheet,全宽
  return (
    <>
      {/* 桌面端浮窗 */}
      <div
        className={`hidden md:block fixed bottom-6 right-6 z-50 max-w-sm transition-all duration-300 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <div className={`paper-card p-4 border ${tone}`}>
          <div className="flex items-start gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconTone}`}
            >
              <Icon size={16} />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] tracking-wider uppercase text-ink-400 mb-1">
                变化 · {direction === "up" ? "点亮" : direction === "down" ? "熄灭" : "无变化"} {deltaText}
              </div>
              <p className="text-[13.5px] text-ink-strong leading-relaxed">
                {lastExplanation}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 移动端:底部 Sheet */}
      <div
        className="md:hidden fixed left-0 right-0 z-50 px-3"
        style={{
          bottom: "calc(72px + env(safe-area-inset-bottom))", // 避开 tab bar
          transform: visible ? "translateY(0)" : "translateY(140%)",
          transition: "transform 320ms cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        <div
          className={`paper-card p-4 border ${tone} shadow-[0_-4px_20px_rgba(60,50,30,0.12)]`}
          role="status"
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconTone}`}
            >
              <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10.5px] tracking-[0.18em] uppercase text-ink-400 mb-1">
                变化 · {direction === "up" ? "点亮" : direction === "down" ? "熄灭" : "无变化"} · {deltaText}
              </div>
              <p className="text-[14px] text-ink-strong leading-relaxed">
                {lastExplanation}
              </p>
            </div>
            <button
              onClick={() => setDismissed(true)}
              aria-label="关闭"
              className="w-8 h-8 -mr-1 -mt-1 rounded-full flex items-center justify-center text-ink-400 active:bg-paper-200/60"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
