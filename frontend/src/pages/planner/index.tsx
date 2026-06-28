import { useState } from "react";
import { Compass, Sparkles, Hourglass, ArrowRight, ArrowLeft } from "lucide-react";
import { api, type SimulationResponse } from "@/lib/api";
import { fmtCNY, fmtInt } from "@/lib/format";

type Kind = "avg_expense_change" | "delay_consumption";

export default function PlannerPage() {
  const [kind, setKind] = useState<Kind>("avg_expense_change");
  const [horizon, setHorizon] = useState(90);
  const [targetAvg, setTargetAvg] = useState<string>("");
  const [delayedAmount, setDelayedAmount] = useState<string>("");
  const [delayDays, setDelayDays] = useState<number>(30);
  const [result, setResult] = useState<SimulationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload =
        kind === "avg_expense_change"
          ? {
              kind,
              target_avg_daily_expense: parseFloat(targetAvg) || undefined,
              horizon_days: horizon,
            }
          : {
              kind,
              delayed_amount: parseFloat(delayedAmount) || undefined,
              delay_days: delayDays,
            };
      const res = await api.simulate(payload as Parameters<typeof api.simulate>[0]);
      setResult(res);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 md:space-y-7 fade-in pb-2">
      <header>
        <h1 className="font-serif text-2xl md:text-3xl text-ink-strong">
          规划模拟
        </h1>
        <p className="text-sm text-ink-soft mt-1">
          不修改任何数据,只是把「如果……」的结果先算给你看
        </p>
      </header>

      <form onSubmit={submit} className="paper-card p-5 md:p-6 space-y-5">
        {/* 类型切换(全宽 tab,移动端友好) */}
        <div className="flex bg-paper-200 rounded-2xl p-1.5 gap-1" role="tablist">
          <button
            type="button"
            className={`flex-1 px-4 h-12 rounded-xl font-medium text-[14px] transition-all flex items-center justify-center gap-2 ${
              kind === "avg_expense_change"
                ? "bg-paper-card text-ember-700 shadow-[0_2px_8px_rgba(60,50,30,0.08)]"
                : "text-ink-soft active:bg-paper-300"
            }`}
            onClick={() => setKind("avg_expense_change")}
          >
            <Sparkles size={15} strokeWidth={1.8} />
            调整日均
          </button>
          <button
            type="button"
            className={`flex-1 px-4 h-12 rounded-xl font-medium text-[14px] transition-all flex items-center justify-center gap-2 ${
              kind === "delay_consumption"
                ? "bg-paper-card text-ember-700 shadow-[0_2px_8px_rgba(60,50,30,0.08)]"
                : "text-ink-soft active:bg-paper-300"
            }`}
            onClick={() => setKind("delay_consumption")}
          >
            <Hourglass size={15} strokeWidth={1.8} />
            延迟消费
          </button>
        </div>

        {kind === "avg_expense_change" ? (
          <div className="space-y-4">
            <div>
              <label className="text-[11px] text-ink-soft tracking-wider uppercase block mb-2">
                目标日均花销
              </label>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-xl text-ink-soft">¥</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  value={targetAvg}
                  onChange={(e) => setTargetAvg(e.target.value)}
                  placeholder="比如 50"
                  className="input font-numeric text-2xl h-14"
                />
              </div>
              <p className="text-[11.5px] text-ink-soft mt-1.5">
                留空则按当前平均日花销对比
              </p>
            </div>
            <div>
              <label className="text-[11px] text-ink-soft tracking-wider uppercase block mb-2">
                达到目标的窗口(天)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="7"
                  max="365"
                  step="1"
                  value={horizon}
                  onChange={(e) => setHorizon(parseInt(e.target.value))}
                  className="flex-1 accent-ember-500"
                />
                <span className="font-numeric text-[15px] text-ink-strong min-w-[60px] text-right">
                  {horizon} 天
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-[11px] text-ink-soft tracking-wider uppercase block mb-2">
                想推迟的一笔支出
              </label>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-xl text-ink-soft">¥</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  value={delayedAmount}
                  onChange={(e) => setDelayedAmount(e.target.value)}
                  placeholder="比如 3000"
                  className="input font-numeric text-2xl h-14"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-ink-soft tracking-wider uppercase block mb-2">
                推迟多少天再兑现
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="180"
                  step="1"
                  value={delayDays}
                  onChange={(e) => setDelayDays(parseInt(e.target.value))}
                  className="flex-1 accent-ember-500"
                />
                <span className="font-numeric text-[15px] text-ink-strong min-w-[60px] text-right">
                  {delayDays} 天
                </span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-[13px] text-ember-700 bg-ember-50 border border-ember-200/60 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          /* FIX-2: 与「点亮人生」相同的金色主调 */
          className="w-full h-14 rounded-2xl font-medium text-[15px] text-white bg-ember-500 active:bg-ember-600 shadow-[0_4px_14px_rgba(182,130,44,0.32)] disabled:opacity-60 transition-all flex items-center justify-center gap-2"
        >
          {/* FIX-4: loading spinner */}
          {loading ? (
            <span className="btn-spinner" />
          ) : (
            <Compass size={17} strokeWidth={2} />
          )}
          {loading ? "正在模拟…" : "运行模拟"}
        </button>
      </form>

      {result && <CompareCard r={result} />}
    </div>
  );
}

function CompareCard({ r }: { r: SimulationResponse }) {
  const dLit = r.delta.lit_count;
  const isUp = dLit > 0;
  const isDown = dLit < 0;

  return (
    <section className="paper-card p-5 md:p-6 fade-in space-y-5">
      <div className="text-[11px] tracking-[0.2em] uppercase text-ink-soft">
        模拟结果
      </div>
      <p className="font-serif text-[17px] md:text-[19px] text-ink-strong leading-relaxed">
        {r.explanation}
      </p>

      {/* 对比卡片 */}
      <div className="grid grid-cols-2 gap-3">
        <CompareSide
          label="现在"
          lit={r.baseline.lit_count}
          avg={r.baseline.avg_daily_expense}
        />
        <CompareSide
          label="如果这样"
          lit={r.simulated.lit_count}
          avg={r.simulated.target_avg_daily_expense}
          highlight
        />
      </div>

      {/* Delta 显示 */}
      <div
        className={`flex items-center justify-center gap-2 py-4 rounded-xl ${
          isUp
            ? "bg-ember-50"
            : isDown
            ? "bg-moon-500/5"
            : "bg-paper-50"
        }`}
      >
        <span
          className={`text-[12px] tracking-wider uppercase ${
            isUp
              ? "text-ember-700"
              : isDown
              ? "text-moon-500"
              : "text-ink-soft"
          }`}
        >
          变化
        </span>
        <span
          className={`font-numeric text-3xl ${
            isUp
              ? "text-ember-700"
              : isDown
              ? "text-moon-500"
              : "text-ink-soft"
          }`}
        >
          {dLit > 0 ? "+" : ""}
          {fmtInt(dLit)}
        </span>
        <span
          className={`text-[14px] ${
            isUp
              ? "text-ember-700"
              : isDown
              ? "text-moon-500"
              : "text-ink-soft"
          }`}
        >
          天
        </span>
        {isUp && <ArrowRight size={16} className="text-ember-700" />}
        {isDown && <ArrowLeft size={16} className="text-moon-500" />}
      </div>

      <p className="text-[11.5px] text-ink-soft text-center px-4 leading-relaxed">
        这只是「如果……」的对照,不会写入数据库。
      </p>
    </section>
  );
}

function CompareSide({
  label,
  lit,
  avg,
  highlight,
}: {
  label: string;
  lit: number;
  avg: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-2xl border ${
        highlight
          ? "bg-ember-50/60 border-ember-200"
          : "bg-paper-50 border-paper-200"
      }`}
    >
      <div className="text-[11px] text-ink-soft uppercase tracking-wider mb-2">
        {label}
      </div>
      <div className="font-numeric text-2xl md:text-3xl text-ink-strong">
        {fmtInt(lit)}
        <span className="text-sm text-ink-soft ml-1">天</span>
      </div>
      <div className="text-[11px] text-ink-soft mt-1 font-numeric">
        日均 {fmtCNY(avg)}
      </div>
    </div>
  );
}
