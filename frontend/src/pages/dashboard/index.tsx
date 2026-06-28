import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { LifeGridEngine } from "@/engine/life-grid";
import { fmtCNY, fmtInt, fmtPct } from "@/lib/format";
import {
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { stats, settings, transactions } = useAppStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<LifeGridEngine | null>(null);
  // FIX-9: 精简为快捷入口,保留金额 + 类型,点击跳转到完整记一笔页
  const [quickType, setQuickType] = useState<"income" | "expense">("income");
  const [quickAmount, setQuickAmount] = useState("");
  const navigate = useNavigate();

  const goRecord = () => {
    // FIX-9: 跳转时把已输入的值带到记一笔页
    const a = parseFloat(quickAmount);
    navigate("/transactions", {
      state: {
        type: quickType,
        amount: a > 0 ? quickAmount : undefined,
      },
    });
  };

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

  if (!stats || !settings) {
    return (
      <div className="space-y-4">
        <div className="paper-card p-6">
          <p className="text-ink-500">请先在「设置」页填写生日与目标年龄。</p>
          <Link to="/settings" className="btn btn-primary mt-4 inline-flex">
            去设置
          </Link>
        </div>
      </div>
    );
  }

  const litRatio = stats.future_cells > 0 ? stats.lit_count / stats.future_cells : 0;
  const showAsset = !!stats.use_initial_assets && stats.initial_assets > 0;
  const daysLeft = Math.max(0, stats.future_cells - stats.lit_count);

  return (
    <div className="space-y-5 md:space-y-7 fade-in pb-2">
      {/* Hero · 已买自由天数(单列首屏) */}
      <section className="paper-card relative overflow-hidden p-5 md:p-8">
        <div className="flex items-start justify-between gap-4 mb-1">
          <div className="text-[11px] tracking-[0.2em] uppercase text-ink-soft">
            已买自由
          </div>
          <div className="hidden md:flex items-center gap-3 text-[12px] text-ink-500">
            {showAsset && (
              <span>
                起始资产 <span className="font-numeric text-ink-strong">{fmtCNY(stats.initial_assets)}</span>
              </span>
            )}
            <span>
              已记账 <span className="font-numeric text-ink-strong">{stats.tracking_days}</span> 天
            </span>
          </div>
        </div>

        <div className="flex items-baseline gap-3 mt-2">
          <span className="font-serif text-[56px] md:text-[80px] leading-none text-ember-700 tracking-tight">
            {fmtInt(stats.lit_count)}
          </span>
          <span className="text-base md:text-xl text-ink-soft">天</span>
        </div>

        <p className="text-[13.5px] md:text-[14.5px] text-ink-500 mt-3 leading-relaxed">
          距走完还差{" "}
          <em className="not-italic font-numeric text-ink-strong font-medium">
            {fmtInt(daysLeft)}
          </em>{" "}
          天 · 完成度 {fmtPct(litRatio * 100, 1)}
        </p>

        {/* 资产 + 净储蓄双段进度条 */}
        <div className="mt-5 md:mt-7">
          <div className="flex h-1.5 bg-paper-200 rounded-full overflow-hidden">
            <div
              className="bg-moon-500/70 transition-all duration-700 ease-out"
              style={{
                width: `${stats.future_cells > 0
                  ? (stats.asset_lit / stats.future_cells) * 100
                  : 0}%`,
              }}
            />
            <div
              className="bg-ember-500 transition-all duration-700 ease-out"
              style={{
                width: `${stats.future_cells > 0
                  ? (stats.income_lit / stats.future_cells) * 100
                  : 0}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-[11px] md:text-[12px] text-ink-soft mt-2 font-numeric">
            <span>0 天</span>
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-moon-500/70" />
                资产 {fmtInt(stats.asset_lit)}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-ember-500" />
                净储蓄 {fmtInt(stats.income_lit)}
              </span>
              <span>{fmtInt(stats.future_cells)} 天 · 终</span>
            </span>
          </div>
        </div>
      </section>

      {/* 第二行:平均日花销 + 风险提示(移动端单列) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        <div className="paper-card p-5 md:p-6">
          <div className="text-[11px] tracking-[0.2em] uppercase text-ink-soft">
            平均日花销
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-numeric text-3xl md:text-4xl text-ink-strong">
              {fmtCNY(stats.avg_daily_expense)}
            </span>
            <span className="text-xs text-ink-soft">/ 天</span>
          </div>
          <p className="text-[12px] text-ink-500 mt-2 leading-relaxed">
            你的自由时间 = 资产 / 净储蓄 ÷ 这个数字
          </p>
        </div>

        <div className="paper-card p-5 md:p-6 flex flex-col">
          <div className="text-[11px] tracking-[0.2em] uppercase text-ink-soft">
            风险提示
          </div>
          {stats.risk_alerts?.length > 0 ? (
            <ul className="mt-2 space-y-1.5 text-[13px] flex-1">
              {stats.risk_alerts.map((a, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-ink-strong leading-relaxed"
                >
                  <AlertCircle
                    size={14}
                    className="text-ember-700 mt-0.5 shrink-0"
                  />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-2 flex-1 flex items-center text-[13px] text-ink-soft">
              <span>暂无风险 · 继续保持这份节制</span>
            </div>
          )}
        </div>
      </section>

      {/* FIX-9: 快捷入口(精简版)—— 只保留金额 + 类型,点击跳转到记一笔页 */}
      <section className="paper-card p-5 md:p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-lg md:text-xl text-ink-strong">
            记一笔
          </h2>
          <span className="text-[11px] text-ink-soft tracking-wider uppercase">
            快捷入口
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
          <div>
            <label className="text-[11px] text-ink-soft tracking-wider uppercase block mb-1.5">
              金额(可选,先填可少输入一次)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-ink-soft">¥</span>
              <input
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                value={quickAmount}
                onChange={(e) => setQuickAmount(e.target.value)}
                placeholder="0.00"
                className="input font-numeric text-lg md:text-xl flex-1 h-12"
              />
            </div>
          </div>

          {/* FIX-9: 类型切换简化为 icon-only segmented control */}
          <div className="flex gap-2">
            <button
              onClick={() => setQuickType("income")}
              className={`flex-1 md:flex-none px-5 h-12 rounded-xl font-medium text-[13.5px] transition-all flex items-center justify-center gap-1.5 min-w-[88px] ${
                quickType === "income"
                  ? "bg-ember-500 text-white shadow-[0_2px_8px_rgba(182,130,44,0.32)]"
                  : "bg-paper-200 text-ink-500 active:bg-paper-300"
              }`}
            >
              <ArrowUpRight size={15} strokeWidth={2} />
              收入
            </button>
            <button
              onClick={() => setQuickType("expense")}
              className={`flex-1 md:flex-none px-5 h-12 rounded-xl font-medium text-[13.5px] transition-all flex items-center justify-center gap-1.5 min-w-[88px] ${
                quickType === "expense"
                  ? "bg-moon-500 text-white shadow-[0_2px_8px_rgba(107,126,150,0.32)]"
                  : "bg-paper-200 text-ink-500 active:bg-paper-300"
              }`}
            >
              <ArrowDownRight size={15} strokeWidth={2} />
              支出
            </button>
          </div>
        </div>

        <button
          onClick={goRecord}
          className="btn btn-primary w-full h-12 text-[14px] mt-3"
        >
          <Plus size={16} />
          {quickAmount ? `去记一笔(${quickAmount})` : "去记一笔"}
          <ChevronRight size={14} className="ml-1 opacity-70" />
        </button>
      </section>

      {/* 方格摘要(可点击进入方格页) */}
      <Link
        to="/grid"
        className="block paper-card p-5 md:p-6 active:scale-[0.995] transition-transform"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-serif text-lg md:text-xl text-ink-strong">
              人生方格
            </h2>
            <p className="text-[12.5px] text-ink-soft mt-0.5">
              每一格是一天自由 · 灰=未点亮 · 月光=资产 · 金=净储蓄
            </p>
          </div>
          <ChevronRight size={18} className="text-ink-soft" />
        </div>
        <div className="aspect-[2.6/1] md:aspect-[3/1] rounded-xl bg-paper-50 border border-paper-200 overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
      </Link>

      {/* 最近变化 */}
      <section className="paper-card p-5 md:p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-lg md:text-xl text-ink-strong">
            最近变化
          </h2>
          <Link
            to="/transactions"
            className="text-[12px] text-ink-500 hover:text-ink-strong"
          >
            查看全部 →
          </Link>
        </div>
        {transactions.length === 0 ? (
          <button
            onClick={() => setQuickType("income")}
            className="w-full py-10 text-center text-[13px] text-ink-soft hover:text-ink-strong transition-colors"
          >
            还没有任何记录 · 记下第一笔,让方格开始亮起来
          </button>
        ) : (
          <ul className="divide-y divide-paper-200">
            {transactions.slice(0, 6).map((t) => (
              <li key={t.id} className="py-3 flex items-center gap-3 min-h-[56px]">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    t.type === "income"
                      ? "bg-ember-100 text-ember-700"
                      : "bg-moon-500/15 text-moon-500"
                  }`}
                >
                  {t.type === "income" ? (
                    <ArrowUpRight size={16} />
                  ) : (
                    <ArrowDownRight size={16} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] text-ink-strong truncate">
                    {t.note || (t.type === "income" ? "一笔收入" : "一笔支出")}
                  </div>
                  <div className="text-[11.5px] text-ink-soft font-numeric mt-0.5">
                    {t.occurred_on}
                  </div>
                </div>
                <div
                  className={`font-numeric text-[15px] shrink-0 ${
                    t.type === "income" ? "text-ember-700" : "text-ink-600"
                  }`}
                >
                  {t.type === "income" ? "+" : "−"}
                  {fmtCNY(t.amount)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
