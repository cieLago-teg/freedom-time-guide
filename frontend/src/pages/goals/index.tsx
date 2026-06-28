import { useEffect, useState } from "react";
import { Plus, Trash2, Target, MoreVertical, ChevronRight, Check } from "lucide-react";
import { api, type Goal } from "@/lib/api";
import { fmtCNY } from "@/lib/format";
import { cn } from "@/lib/cn";
import BottomSheet from "@/components/ui/BottomSheet";

const GOAL_TYPES = [
  { value: "emergency", label: "应急储备", emoji: "🛟" },
  { value: "device", label: "设备升级", emoji: "💻" },
  { value: "house", label: "买房首付", emoji: "🏠" },
  { value: "car", label: "买车", emoji: "🚗" },
  { value: "family", label: "家庭支持", emoji: "👨‍👩‍👧" },
  { value: "gap", label: "长期休息", emoji: "☕" },
  { value: "passive", label: "被动收入", emoji: "🌱" },
  { value: "other", label: "其他", emoji: "✨" },
];

const STATUS_META: Record<string, { label: string; color: string }> = {
  active: { label: "进行中", color: "bg-ember-100 text-ember-700" },
  paused: { label: "已暂停", color: "bg-paper-200 text-ink-soft" },
  done: { label: "已兑现", color: "bg-moon-500/15 text-moon-500" },
  abandoned: { label: "已放弃", color: "bg-paper-200/50 text-ink-faint line-through" },
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 新建
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("emergency");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");

  // 操作
  const [acting, setActing] = useState<Goal | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const r = await api.listGoals();
      setGoals(r.goals);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("请填写目标名称");
      return;
    }
    setError(null);
    try {
      await api.createGoal({
        name: name.trim(),
        type,
        target_amount: parseFloat(targetAmount) || 0,
        target_date: targetDate || null,
      });
      setName("");
      setTargetAmount("");
      setTargetDate("");
      setCreateOpen(false);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const setStatus = async (g: Goal, status: string) => {
    try {
      await api.updateGoalStatus(g.id, status);
      setActing(null);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const remove = async (g: Goal) => {
    try {
      await api.deleteGoal(g.id);
      setActing(null);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="space-y-5 md:space-y-7 fade-in">
      <header>
        <h1 className="font-serif text-2xl lg:text-3xl">目标</h1>
        <p className="text-[13px] md:text-sm text-ink-400 mt-1">
          不是愿望清单 · 每个目标都要回答:它会吃掉多少自由时间,是否值得
        </p>
      </header>

      {/* 新建表单(桌面端 inline,移动端隐藏——通过底栏 +) */}
      <form
        onSubmit={submitCreate}
        className="hidden md:block paper-card p-6 space-y-5"
      >
        <h2 className="font-serif text-lg flex items-center gap-2">
          <Plus size={16} className="text-ember-700" />
          新建目标
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label className="text-[11px] text-ink-400 tracking-wider uppercase">
              名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="比如:换一台笔记本"
              className="input mt-1"
              maxLength={40}
            />
          </div>
          <div>
            <label className="text-[11px] text-ink-400 tracking-wider uppercase">
              类型
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="input mt-1"
            >
              {GOAL_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-ink-400 tracking-wider uppercase">
              金额
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="0"
              className="input mt-1 font-numeric"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] text-ink-400 tracking-wider uppercase">
              期望兑现日期(可选)
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="input mt-1"
            />
          </div>
        </div>
        {error && (
          <div className="text-[12.5px] text-ember-700 bg-ember-50 border border-ember-200/60 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        <button type="submit" className="btn btn-primary">
          创建目标
        </button>
      </form>

      {/* 移动端新建表单 Sheet */}
      <BottomSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="新建目标"
        size="default"
      >
        <form onSubmit={submitCreate} className="space-y-4">
          <div>
            <label className="text-[11px] text-ink-400 tracking-wider uppercase">
              名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="比如:换一台笔记本"
              className="input mt-1.5 h-12 text-base"
              maxLength={40}
              autoFocus
            />
          </div>
          <div>
            <label className="text-[11px] text-ink-400 tracking-wider uppercase">
              类型
            </label>
            <div className="mt-1.5 grid grid-cols-4 gap-2">
              {GOAL_TYPES.map((t) => {
                const active = type === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={cn(
                      "h-14 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95",
                      active
                        ? "bg-ember-500 text-white border-ember-500 shadow-[0_2px_8px_rgba(232,185,96,0.4)]"
                        : "bg-paper-card text-ink-soft border-paper-200"
                    )}
                  >
                    <span className="text-[16px]">{t.emoji}</span>
                    <span className="text-[10px] tracking-wide">
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="text-[11px] text-ink-400 tracking-wider uppercase">
              金额(¥)
            </label>
            <div className="relative mt-1.5">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft font-numeric">
                ¥
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="0"
                className="input h-12 pl-9 font-numeric text-base"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-ink-400 tracking-wider uppercase">
              期望兑现日期(可选)
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="input mt-1.5 h-12"
            />
          </div>
          {error && (
            <div className="text-[12.5px] text-ember-700 bg-ember-50 border border-ember-200/60 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="btn btn-primary w-full h-12 text-[15px] mt-2"
          >
            <Plus size={16} />
            创建目标
          </button>
        </form>
      </BottomSheet>

      {/* 目标操作 Sheet(移动端) */}
      <BottomSheet
        open={!!acting}
        onClose={() => setActing(null)}
        title={acting?.name || "目标"}
        size="compact"
      >
        {acting && (
          <div className="space-y-4">
            {/* 摘要 */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-paper-50 border hairline">
              <span className="text-[24px]">
                {GOAL_TYPES.find((t) => t.value === acting.type)?.emoji || "✨"}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] text-ink-400">
                  {typeLabel(acting.type)}
                </div>
                <div className="font-numeric text-[17px] text-ink-strong mt-0.5">
                  {fmtCNY(acting.target_amount)}
                </div>
                {acting.target_date && (
                  <div className="text-[11px] text-ink-soft mt-0.5">
                    目标 {acting.target_date}
                  </div>
                )}
              </div>
              <span
                className={cn(
                  "px-2.5 py-1 rounded-full text-[11px] font-medium",
                  STATUS_META[acting.status]?.color
                )}
              >
                {STATUS_META[acting.status]?.label}
              </span>
            </div>

            {/* 状态切换 */}
            <div>
              <div className="text-[11px] text-ink-400 uppercase tracking-wider mb-2">
                切换状态
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(STATUS_META).map(([key, meta]) => {
                  const active = acting.status === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setStatus(acting, key)}
                      className={cn(
                        "h-11 rounded-xl border flex items-center justify-center gap-2 text-[13px] transition-all active:scale-95",
                        active
                          ? "bg-ink-strong text-paper border-ink-strong"
                          : "bg-paper-card text-ink-soft border-paper-200"
                      )}
                    >
                      {active && <Check size={13} />}
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 删除 */}
            <button
              onClick={() => remove(acting)}
              className="w-full h-11 rounded-xl border border-ember-200 text-ember-700 bg-ember-50 flex items-center justify-center gap-2 text-[13px] active:scale-95"
            >
              <Trash2 size={14} />
              删除目标
            </button>
          </div>
        )}
      </BottomSheet>

      {/* 列表区 */}
      <section className="paper-card p-4 md:p-6">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="font-serif text-lg flex items-center gap-2">
            <Target size={16} className="text-ember-700" />
            我的目标
          </h2>
          <span className="text-[12px] text-ink-400 font-numeric">
            {goals.length} 个
          </span>
        </div>

        {loading && <div className="text-sm text-ink-400">加载中…</div>}
        {!loading && goals.length === 0 && (
          /* FIX-7: 空状态引导 —— 插图 + 文案 + 行动按钮 */
          <div className="py-10 text-center fade-in">
            <div
              aria-hidden
              className="mx-auto mb-4 w-20 h-20 rounded-full bg-paper-200 flex items-center justify-center text-[36px]"
            >
              🎯
            </div>
            <h3 className="font-serif text-[17px] text-ink-strong mb-1.5">
              还没有目标
            </h3>
            <p className="text-[13px] text-ink-soft leading-relaxed max-w-[280px] mx-auto">
              把模糊的想法落到纸面 · 每个目标都会换算成"它会吃掉多少自由时间"
            </p>
            <button
              onClick={() => setCreateOpen(true)}
              className="btn btn-primary mt-5 h-11 px-6 text-[14px]"
            >
              <Plus size={16} />
              添加你的第一个目标
            </button>
          </div>
        )}

        {/* 移动端:卡片列表 */}
        <ul className="md:hidden space-y-2.5">
          {goals.map((g) => (
            <li key={g.id}>
              <button
                onClick={() => setActing(g)}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-paper-card border border-paper-200 active:bg-paper-200/40 active:scale-[0.99] transition-all text-left min-h-[68px]"
              >
                <div className="w-11 h-11 rounded-xl bg-paper-200 flex items-center justify-center text-[20px] shrink-0">
                  {GOAL_TYPES.find((t) => t.value === g.type)?.emoji || "✨"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-[14.5px] text-ink-strong truncate font-medium">
                      {g.name}
                    </div>
                  </div>
                  <div className="text-[11.5px] text-ink-soft mt-1 font-numeric flex items-center gap-1.5">
                    <span>{fmtCNY(g.target_amount)}</span>
                    {g.target_date && (
                      <>
                        <span className="text-ink-faint">·</span>
                        <span>{g.target_date}</span>
                      </>
                    )}
                  </div>
                </div>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10.5px] font-medium shrink-0",
                    STATUS_META[g.status]?.color
                  )}
                >
                  {STATUS_META[g.status]?.label}
                </span>
                <ChevronRight
                  size={16}
                  strokeWidth={1.6}
                  className="text-ink-faint shrink-0"
                />
              </button>
            </li>
          ))}
        </ul>

        {/* 桌面端:列表 inline 操作 */}
        <ul className="hidden md:block divide-y hairline">
          {goals.map((g) => (
            <li key={g.id} className="py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-paper-200 flex items-center justify-center text-ember-700">
                <Target size={17} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14.5px] text-ink-strong truncate">
                  {g.name}
                </div>
                <div className="text-[11.5px] text-ink-400 mt-0.5 font-numeric">
                  {typeLabel(g.type)} · {fmtCNY(g.target_amount)}
                  {g.target_date && <> · 目标 {g.target_date}</>}
                </div>
              </div>
              <select
                value={g.status}
                onChange={(e) => setStatus(g, e.target.value)}
                className="text-[12px] py-1.5 px-2 rounded-md border hairline bg-paper-50"
              >
                <option value="active">进行中</option>
                <option value="paused">已暂停</option>
                <option value="done">已兑现</option>
                <option value="abandoned">已放弃</option>
              </select>
              <button
                onClick={() => remove(g)}
                title="删除"
                className="w-8 h-8 rounded-lg text-ink-400 hover:text-ember-700 hover:bg-ember-50 flex items-center justify-center"
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* 移动端底部 + 浮动新建按钮 */}
      <button
        onClick={() => setCreateOpen(true)}
        className="md:hidden fixed right-5 z-30 w-14 h-14 rounded-full bg-ember-500 text-white shadow-[0_6px_20px_rgba(232,185,96,0.4)] flex items-center justify-center active:scale-95 transition-transform"
        style={{
          bottom: "calc(80px + env(safe-area-inset-bottom))",
        }}
        aria-label="新建目标"
      >
        <Plus size={22} strokeWidth={2} />
      </button>
    </div>
  );
}

function typeLabel(t: string) {
  return GOAL_TYPES.find((x) => x.value === t)?.label || t;
}