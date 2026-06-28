import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { LifeGridEngine } from "@/engine/life-grid";
import { fmtInt, fmtPct } from "@/lib/format";
import { cn } from "@/lib/cn";

export default function GridPage() {
  const { stats } = useAppStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<LifeGridEngine | null>(null);
  // FIX-6: 首次进入时短暂显示引导提示(2.4s 后淡出)
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (!engineRef.current) {
      engineRef.current = new LifeGridEngine(canvasRef.current);
    }
    if (stats) engineRef.current.setData(stats);
    return () => {
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, [stats]);

  useEffect(() => {
    const t = window.setTimeout(() => setShowHint(false), 2400);
    return () => window.clearTimeout(t);
  }, []);

  if (!stats) return null;

  const litRatio =
    stats.future_cells > 0 ? stats.lit_count / stats.future_cells : 0;

  return (
    <div className="space-y-4 md:space-y-6 fade-in">
      <header className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-serif text-2xl md:text-3xl text-ink-strong">
            自由方格
          </h1>
          <p className="text-xs md:text-sm text-ink-soft mt-1">
            整体节奏比单格颜色更重要
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="flex items-baseline justify-end gap-1">
            <span className="font-serif text-3xl md:text-4xl text-ember-700">
              {fmtInt(stats.lit_count)}
            </span>
            <span className="text-ink-soft text-sm">
              / {fmtInt(stats.future_cells)}
            </span>
          </div>
          <div className="text-[11px] md:text-[12px] text-ink-soft mt-0.5 font-numeric">
            完成度 {fmtPct(litRatio * 100, 1)}
          </div>
        </div>
      </header>

      <section className="paper-card p-3 md:p-6 space-y-4 md:space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg md:text-xl text-ink-strong">
            人生方格
          </h2>
          <span className="text-[12px] text-ink-soft font-numeric">
            {stats.lit_count} / {stats.total_cells}
          </span>
        </div>

        {/* FIX-6: 方格交互引导(2.4s 后淡出) */}
        {showHint && (
          <div className="pointer-events-none text-center text-[12.5px] text-ink-soft italic toast-enter">
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className="inline-block w-1.5 h-1.5 rounded-full bg-ember-500"
              />
              方格颜色反映你的消费节奏
            </span>
          </div>
        )}

        {/* FIX-6: canvas 容器加 cursor-pointer + active 态 */}
        <div
          className={cn(
            "rounded-xl bg-paper-50 border border-paper-200 overflow-hidden relative",
            "cursor-pointer active:scale-[0.99] transition-transform duration-150",
            "aspect-square md:aspect-[2/1] md:min-h-[440px]"
          )}
          aria-label="人生方格 · 颜色反映消费节奏"
          role="img"
        >
          <canvas ref={canvasRef} className="w-full h-full block" />
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-paper-200 rounded-xl" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          <LegendItem color="bg-ember-500" label="净储蓄" value={`${fmtInt(stats.income_lit)} 天`} />
          <LegendItem color="bg-moon-500/70" label="资产" value={`${fmtInt(stats.asset_lit)} 天`} />
          <LegendItem color="bg-paper-300" label="未点亮" value={`${fmtInt(Math.max(0, stats.future_cells - stats.lit_count))} 天`} />
          <LegendItem color="bg-ember-200" label="超额" value={`${fmtInt(stats.overflow)} 天`} />
        </div>
      </section>

      {/* 解读区 · FIX-5: 滚动遮罩 */}
      <section className="paper-card p-5 md:p-6 space-y-3 scroll-fade-bottom">
        <h2 className="font-serif text-lg md:text-xl text-ink-strong">解读</h2>
        <p className="text-[12.5px] text-ink-500 leading-relaxed">
          净储蓄格 = 你记账以来每天攒下来的钱折算成自由时间 · 资产格 = 起始资产按比例折算 · 未点亮 = 仍未被覆盖的未来
        </p>
        <p className="text-[12px] text-ink-soft text-center pt-2">
          方格随交易自动重绘 · 新增一笔收入后会看到点亮仪式
        </p>
      </section>
    </div>
  );
}

function LegendItem({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-paper-50 border border-paper-200">
      <span className={`w-3 h-3 rounded-sm ${color} shrink-0`} />
      <div className="flex-1 min-w-0">
        <div className="text-[11px] text-ink-soft uppercase tracking-wider">
          {label}
        </div>
        <div className="font-numeric text-[14px] md:text-[15px] text-ink-strong mt-0.5">
          {value}
        </div>
      </div>
    </div>
  );
}