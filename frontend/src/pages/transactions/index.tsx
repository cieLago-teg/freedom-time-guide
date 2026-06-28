import { useState } from "react";
import {
  Trash2,
  ArrowDownRight,
  ArrowUpRight,
  MoreHorizontal,
  X,
  Check,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { api, type Transaction } from "@/lib/api";
import { fmtCNY, fmtInt, todayISO } from "@/lib/format";
import { toast } from "@/components/ui/Toast"; // FIX-4: 轻提示
import { useLocation } from "react-router-dom";

interface LocationState {
  type?: "income" | "expense";
  amount?: string;
}

export default function TransactionsPage() {
  const { transactions, stats, recordMutation, applyDeletion, setBusy, busy } =
    useAppStore();
  const location = useLocation();
  const init = (location.state || {}) as LocationState;

  const [txType, setTxType] = useState<"income" | "expense">(
    init.type || "expense"
  );
  const [amount, setAmount] = useState(init.amount || "");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayISO());
  const [error, setError] = useState<string | null>(null);
  const [actionFor, setActionFor] = useState<Transaction | null>(null);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    const a = parseFloat(amount);
    if (!(a > 0)) {
      setError("金额必须大于 0");
      return;
    }
    setBusy(true);
    try {
      const res = await api.addTransaction({
        type: txType,
        amount: a,
        note: note.trim(),
        occurred_on: date,
      });
      recordMutation({
        delta: res.delta,
        animation: res.animation,
        explanation: res.explanation,
        stats: res.stats,
        transaction: res.transaction,
      });
      setAmount("");
      setNote("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!actionFor) return;
    const id = actionFor.id;
    setActionFor(null);
    setBusy(true);
    try {
      const res = await api.deleteTransaction(id);
      applyDeletion({
        delta: res.delta,
        animation: res.animation,
        explanation: res.explanation,
        stats: res.stats,
        deletedId: id,
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5 md:space-y-7 fade-in pb-2">
      <header>
        <h1 className="font-serif text-2xl md:text-3xl text-ink-strong">
          交易
        </h1>
        <p className="text-sm text-ink-soft mt-1">
          每一笔都参与下一次自由时间的计算
        </p>
      </header>

      {/* 录入卡(顶部固定,移动端友好) */}
      <form
        onSubmit={submit}
        className="paper-card p-5 md:p-6 space-y-5"
      >
        {/* 类型 toggle(大尺寸,移动端触屏友好) */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div
            className="flex bg-paper-200 rounded-2xl p-1.5 gap-1 w-full md:w-auto"
            role="tablist"
          >
            <button
              type="button"
              className={`flex-1 md:flex-none px-6 md:px-8 h-12 rounded-xl font-medium text-[15px] transition-all flex items-center justify-center gap-2 ${
                txType === "income"
                  ? "bg-paper-card text-ember-700 shadow-[0_2px_8px_rgba(60,50,30,0.08)]"
                  : "text-ink-soft active:bg-paper-300"
              }`}
              onClick={() => setTxType("income")}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-ember-500" />
              收入
            </button>
            <button
              type="button"
              className={`flex-1 md:flex-none px-6 md:px-8 h-12 rounded-xl font-medium text-[15px] transition-all flex items-center justify-center gap-2 ${
                txType === "expense"
                  ? "bg-paper-card text-moon-500 shadow-[0_2px_8px_rgba(60,50,30,0.08)]"
                  : "text-ink-soft active:bg-paper-300"
              }`}
              onClick={() => setTxType("expense")}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-moon-500" />
              支出
            </button>
          </div>
          <div className="text-[12px] text-ink-soft hidden md:block">
            当前已买{" "}
            <span className="font-numeric text-ember-700">
              {fmtInt(stats?.lit_count ?? 0)}
            </span>{" "}
            天自由
          </div>
        </div>

        {/* 金额输入(超大) */}
        <div>
          <label className="text-[11px] text-ink-soft tracking-wider uppercase block mb-2">
            金额
          </label>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl text-ink-soft">¥</span>
            <input
              autoFocus
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="input font-numeric text-3xl md:text-4xl h-16 md:h-20 border-0 border-b-2 border-paper-300 focus:border-ember-500 rounded-none px-1 bg-transparent"
              style={{ fontSize: "max(16px, 1.875rem)" }}
            />
          </div>
        </div>

        {/* 日期 + 备注 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] text-ink-soft tracking-wider uppercase block mb-1.5">
              日期
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input h-12"
            />
          </div>
          <div>
            <label className="text-[11px] text-ink-soft tracking-wider uppercase block mb-1.5">
              备注(可选)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={40}
              placeholder={
                txType === "income"
                  ? "比如:稿费 / 工资 / 奖学金"
                  : "比如:外卖 / 打车 / 大件"
              }
              className="input h-12"
            />
          </div>
        </div>

        {error && (
          <div className="text-[13px] text-ember-700 bg-ember-50 border border-ember-200/60 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className={`w-full h-14 rounded-2xl font-medium text-[15px] text-white transition-all flex items-center justify-center gap-2 ${
            txType === "income"
              ? "bg-ember-500 active:bg-ember-600 shadow-[0_4px_14px_rgba(182,130,44,0.32)]"
              : "bg-moon-500 active:bg-moon-500/85 shadow-[0_4px_14px_rgba(107,126,150,0.32)]"
          } disabled:opacity-60`}
        >
          {/* FIX-4: loading spinner */}
          {busy ? (
            <span className="btn-spinner" />
          ) : (
            <Check size={18} strokeWidth={2} />
          )}
          {busy
            ? "记下中…"
            : txType === "income"
            ? "点亮人生"
            : "记下花销"}
        </button>
      </form>

      {/* 历史记录 · FIX-5: 滚动遮罩 */}
      <section className="paper-card p-5 md:p-6 scroll-fade-bottom">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg md:text-xl text-ink-strong">
            历史记录
          </h2>
          <span className="text-[12px] text-ink-soft font-numeric">
            {transactions.length} 条
          </span>
        </div>
        {transactions.length === 0 ? (
          <p className="text-sm text-ink-soft py-12 text-center">
            还没有任何记录
          </p>
        ) : (
          <ul className="divide-y divide-paper-200 -mx-1">
            {transactions.map((t) => (
              <TxRow
                key={t.id}
                tx={t}
                onAction={() => setActionFor(t)}
              />
            ))}
          </ul>
        )}
      </section>

      {/* 移动端:操作 Sheet(删除/取消) */}
      {actionFor && (
        <div
          className="md:hidden fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
        >
          <button
            aria-label="取消"
            onClick={() => setActionFor(null)}
            className="absolute inset-0 bg-ink-strong/40 backdrop-blur-sm fade-in"
          />
          <div
            className="absolute bottom-0 left-0 right-0 bg-paper rounded-t-3xl shadow-[0_-8px_30px_rgba(60,50,30,0.15)] p-3"
            style={{
              animation: "slide-up 320ms cubic-bezier(0.32, 0.72, 0, 1)",
              paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
            }}
          >
            <div className="flex justify-center pt-2 pb-3">
              <span className="w-9 h-1 rounded-full bg-ink-faint/40" />
            </div>

            <div className="px-3 py-2 mb-2">
              <div className="text-[11px] text-ink-soft tracking-wider uppercase mb-1">
                这笔 {actionFor.type === "income" ? "收入" : "支出"}
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  className={`font-numeric text-2xl ${
                    actionFor.type === "income"
                      ? "text-ember-700"
                      : "text-ink-strong"
                  }`}
                >
                  {actionFor.type === "income" ? "+" : "−"}
                  {fmtCNY(actionFor.amount)}
                </span>
                <span className="text-[12px] text-ink-soft">
                  {actionFor.occurred_on}
                </span>
              </div>
              {actionFor.note && (
                <div className="text-[13px] text-ink-500 mt-1">
                  {actionFor.note}
                </div>
              )}
            </div>

            <button
              onClick={confirmDelete}
              disabled={busy}
              className="w-full h-14 rounded-2xl bg-ember-50 text-ember-700 font-medium flex items-center justify-center gap-2 active:bg-ember-100 mb-2"
            >
              <Trash2 size={17} />
              删除这条记录
            </button>
            <button
              onClick={() => setActionFor(null)}
              className="w-full h-14 rounded-2xl bg-paper-200 text-ink-strong font-medium active:bg-paper-300"
            >
              取消
            </button>
          </div>
          <style>{`@keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
        </div>
      )}
    </div>
  );
}

function TxRow({
  tx,
  onAction,
}: {
  tx: Transaction;
  onAction: () => void;
}) {
  return (
    <li className="group">
      {/* 移动端:点击行 → 操作 sheet */}
      <button
        onClick={onAction}
        className="w-full text-left py-3 px-2 flex items-center gap-3 min-h-[60px] active:bg-paper-200/40 md:cursor-default md:active:bg-transparent"
      >
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            tx.type === "income"
              ? "bg-ember-100 text-ember-700"
              : "bg-moon-500/15 text-moon-500"
          }`}
        >
          {tx.type === "income" ? (
            <ArrowUpRight size={17} />
          ) : (
            <ArrowDownRight size={17} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14.5px] text-ink-strong truncate">
            {tx.note || (tx.type === "income" ? "一笔收入" : "一笔支出")}
          </div>
          <div className="text-[11.5px] text-ink-soft mt-0.5 font-numeric">
            {tx.occurred_on}
            {tx.category && <> · {tx.category}</>}
            {tx.is_major ? <> · 大额</> : null}
          </div>
        </div>
        <div
          className={`font-numeric text-[15px] shrink-0 ${
            tx.type === "income" ? "text-ember-700" : "text-ink-600"
          }`}
        >
          {tx.type === "income" ? "+" : "−"}
          {fmtCNY(tx.amount)}
        </div>
        {/* 桌面端:显示删除按钮,移动端:显示 ... 提示可点击 */}
        <span className="hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-ink-soft">
          <MoreHorizontal size={16} />
        </span>
      </button>
    </li>
  );
}
