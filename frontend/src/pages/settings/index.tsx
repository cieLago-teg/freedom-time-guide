import { useState } from "react";
import { ChevronDown, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { api } from "@/lib/api";
import { fmtCNY } from "@/lib/format";
import { cn } from "@/lib/cn";

export default function SettingsPage() {
  const { settings, stats, updateSettingsLocally, setBusy } = useAppStore();

  const [birthDate, setBirthDate] = useState(settings?.birth_date || "2000-01-01");
  const [targetAge, setTargetAge] = useState<number>(settings?.target_age || 80);
  const [showPast, setShowPast] = useState<boolean>(!!settings?.show_past);
  const [useAssets, setUseAssets] = useState<boolean>(!!settings?.use_initial_assets);
  const [initialAssets, setInitialAssets] = useState<string>(
    settings?.initial_assets ? String(settings.initial_assets) : ""
  );
  const [assetsRatio, setAssetsRatio] = useState<number>(
    settings?.initial_assets_ratio ?? 1.0
  );
  const [trackingDaysOverride, setTrackingDaysOverride] = useState<string>(
    settings?.tracking_days_override ? String(settings.tracking_days_override) : ""
  );
  const [avgOverride, setAvgOverride] = useState<string>(
    settings?.avg_daily_expense_override
      ? String(settings.avg_daily_expense_override)
      : ""
  );
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // 折叠状态:移动端默认只展开"人生参数"
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    life: true,
    assets: false,
    override: false,
    status: false,
  });
  const toggle = (k: string) =>
    setOpenSections((s) => ({ ...s, [k]: !s[k] }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSavedAt(null);
    setBusy(true);
    try {
      const r = await api.postSettings({
        birth_date: birthDate,
        target_age: targetAge,
        currency: "CNY",
        show_past: showPast,
        use_initial_assets: useAssets,
        initial_assets: parseFloat(initialAssets) || 0,
        initial_assets_ratio: assetsRatio,
        tracking_days_override: parseInt(trackingDaysOverride) || 0,
        avg_daily_expense_override: parseFloat(avgOverride) || 0,
      } as Parameters<typeof api.postSettings>[0]);
      updateSettingsLocally(r.settings, r.stats);
      setSavedAt(new Date().toLocaleTimeString("zh-CN"));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5 md:space-y-7 fade-in max-w-3xl">
      <header className="md:block">
        <h1 className="font-serif text-2xl lg:text-3xl">设置</h1>
        <p className="text-[13px] md:text-sm text-ink-400 mt-1">
          产品的真相参数 · 改动后所有方格会重新计算
        </p>
      </header>

      {/* 移动端:4 个折叠分组(默认只展开「人生参数」) */}
      <form onSubmit={submit} className="md:hidden space-y-3">
        <Accordion
          title="人生参数"
          desc="确定你的人生方格总数"
          open={openSections.life}
          onToggle={() => toggle("life")}
        >
          <Field label="出生日期">
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="input h-12 text-base"
              required
            />
          </Field>
          <Field label="目标年龄">
            <input
              type="number"
              inputMode="numeric"
              min="1"
              max="150"
              value={targetAge}
              onChange={(e) => setTargetAge(parseInt(e.target.value || "0") || 80)}
              className="input h-12 font-numeric text-base"
            />
          </Field>
          <Toggle
            label="显示已度过的人生"
            desc="把过去的人生方格也展示出来"
            checked={showPast}
            onChange={setShowPast}
          />
        </Accordion>

        <Accordion
          title="资产参数"
          desc="起始资产 · 折算比例"
          open={openSections.assets}
          onToggle={() => toggle("assets")}
        >
          <Toggle
            label="启用起始资产"
            desc="把已有资产纳入自由时间计算"
            checked={useAssets}
            onChange={setUseAssets}
          />
          {useAssets && (
            <>
              <Field
                label="起始资产(¥)"
                hint="比如 50000"
              >
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft font-numeric">
                    ¥
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={initialAssets}
                    onChange={(e) => setInitialAssets(e.target.value)}
                    placeholder="50000"
                    className="input h-12 pl-9 font-numeric text-base"
                  />
                </div>
              </Field>
              <Field
                label={`折算比例 · ${(assetsRatio * 100).toFixed(0)}%`}
                hint="只把部分资产视作自由时间缓冲"
              >
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={assetsRatio}
                  onChange={(e) => setAssetsRatio(parseFloat(e.target.value))}
                  className="w-full h-12 accent-ember-500"
                  style={{ touchAction: "manipulation" }}
                />
              </Field>
            </>
          )}
        </Accordion>

        <Accordion
          title="数据规则覆盖"
          desc="高级选项"
          open={openSections.override}
          onToggle={() => toggle("override")}
        >
          <Field
            label="记账天数覆盖"
            hint="留空 = 自动 · 你希望按 30 天为基线就填 30"
          >
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={trackingDaysOverride}
              onChange={(e) => setTrackingDaysOverride(e.target.value)}
              placeholder="自动"
              className="input h-12 font-numeric text-base"
            />
          </Field>
          <Field
            label="日均花销覆盖(¥)"
            hint="留空 = 自动 · 用于「假如我一直保持这个日均」"
          >
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft font-numeric">
                ¥
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={avgOverride}
                onChange={(e) => setAvgOverride(e.target.value)}
                placeholder="自动"
                className="input h-12 pl-9 font-numeric text-base"
              />
            </div>
          </Field>
        </Accordion>

        <Accordion
          title="当前状态"
          desc="只读预览"
          open={openSections.status}
          onToggle={() => toggle("status")}
        >
          {stats ? (
            <div className="grid grid-cols-2 gap-2.5 text-[12.5px]">
              <KV k="已买自由" v={`${stats.lit_count} 天`} />
              <KV k="未来方格" v={`${stats.future_cells} 天`} />
              <KV k="平均日花销" v={fmtCNY(stats.avg_daily_expense)} />
              <KV k="已记账" v={`${stats.tracking_days} 天`} />
            </div>
          ) : (
            <p className="text-[12.5px] text-ink-400">暂无数据</p>
          )}
        </Accordion>

        {/* 移动端:反馈 + 固定底 CTA */}
        {error && (
          <div className="flex items-start gap-2 text-[12.5px] text-ember-700 bg-ember-50 border border-ember-200/60 rounded-lg px-3 py-2.5">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {savedAt && (
          <div className="flex items-start gap-2 text-[12.5px] text-moon-500 bg-moon-500/5 border border-moon-500/20 rounded-lg px-3 py-2.5">
            <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
            <span>已保存 · {savedAt}</span>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary w-full h-12 text-[15px] shadow-[0_4px_14px_rgba(60,50,30,0.18)] mt-2"
        >
          <Save size={16} />
          保存设置
        </button>
        <p className="text-[11px] text-ink-400 text-center">
          所有改动只影响本地数据库,不会上传
        </p>
      </form>

      {/* 桌面端:扁平展开 · FIX-5: 滚动遮罩 */}
      <form onSubmit={submit} className="hidden md:block paper-card p-6 space-y-7 scroll-fade-bottom">
        <Section title="人生参数" desc="确定你的人生方格总数">
          <div className="grid grid-cols-2 gap-5">
            <Field label="出生日期">
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="input"
                required
              />
            </Field>
            <Field label="目标年龄">
              <input
                type="number"
                min="1"
                max="150"
                value={targetAge}
                onChange={(e) => setTargetAge(parseInt(e.target.value || "0") || 80)}
                className="input font-numeric"
              />
            </Field>
          </div>
          <Toggle
            label="显示已度过的人生"
            desc="把过去的人生方格也展示出来,作为你的起点"
            checked={showPast}
            onChange={setShowPast}
          />
        </Section>

        <Divider />

        <Section title="资产参数" desc="是否纳入起始资产,以及按多少比例折算">
          <Toggle
            label="启用起始资产"
            desc="如果你希望在自由时间计算里纳入已有资产,打开这个开关"
            checked={useAssets}
            onChange={setUseAssets}
          />
          {useAssets && (
            <div className="grid grid-cols-2 gap-5">
              <Field label="起始资产(¥)">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={initialAssets}
                  onChange={(e) => setInitialAssets(e.target.value)}
                  placeholder="比如 50000"
                  className="input font-numeric"
                />
              </Field>
              <Field
                label={`资产折算比例 · ${(assetsRatio * 100).toFixed(0)}%`}
                hint="如果你只想把部分资产视作自由时间缓冲,可以调低"
              >
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={assetsRatio}
                  onChange={(e) => setAssetsRatio(parseFloat(e.target.value))}
                  className="w-full accent-ember-500"
                />
              </Field>
            </div>
          )}
        </Section>

        <Divider />

        <Section
          title="数据规则覆盖"
          desc="记账天数太短时,可以临时手动覆盖 · 高级选项"
        >
          <div className="grid grid-cols-2 gap-5">
            <Field
              label="记账天数覆盖(留空 = 自动)"
              hint="比如:你希望按 30 天为基线计算,这里就填 30"
            >
              <input
                type="number"
                min="0"
                value={trackingDaysOverride}
                onChange={(e) => setTrackingDaysOverride(e.target.value)}
                className="input font-numeric"
              />
            </Field>
            <Field
              label="日均花销覆盖(¥,留空 = 自动)"
              hint="适用于你想测试「假如我一直保持这个日均」"
            >
              <input
                type="number"
                step="0.01"
                min="0"
                value={avgOverride}
                onChange={(e) => setAvgOverride(e.target.value)}
                className="input font-numeric"
              />
            </Field>
          </div>
        </Section>

        <Divider />

        <Section title="当前状态" desc="只读预览">
          {stats && (
            <div className="grid grid-cols-4 gap-3 text-[12.5px]">
              <KV k="已买自由" v={`${stats.lit_count} 天`} />
              <KV k="未来方格" v={`${stats.future_cells} 天`} />
              <KV k="平均日花销" v={fmtCNY(stats.avg_daily_expense)} />
              <KV k="已记账" v={`${stats.tracking_days} 天`} />
            </div>
          )}
        </Section>

        {error && (
          <div className="text-[12.5px] text-ember-700 bg-ember-50 border border-ember-200/60 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        {savedAt && (
          <div className="text-[12.5px] text-moon-500 bg-moon-500/5 border border-moon-500/20 rounded-lg px-3 py-2">
            已保存 · {savedAt}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button type="submit" className="btn btn-primary">
            保存设置
          </button>
          <span className="text-[12px] text-ink-400">
            所有改动只影响本地数据库,不会上传
          </span>
        </div>
      </form>
    </div>
  );
}

/* ========== 折叠分组(移动端) ========== */
function Accordion({
  title,
  desc,
  open,
  onToggle,
  children,
}: {
  title: string;
  desc?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-paper-200 bg-paper-card overflow-hidden transition-shadow",
        open && "shadow-[0_4px_14px_rgba(60,50,30,0.06)]"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-paper-200/40 transition-colors min-h-[56px]"
      >
        <div className="flex-1 text-left">
          <div className="font-serif text-[15px] text-ink-strong">{title}</div>
          {desc && (
            <div className="text-[11.5px] text-ink-400 mt-0.5">{desc}</div>
          )}
        </div>
        <ChevronDown
          size={18}
          strokeWidth={1.7}
          className={cn(
            "text-ink-400 transition-transform shrink-0",
            open && "rotate-180 text-ember-700"
          )}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 space-y-4 border-t border-paper-200 fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

/* ========== 桌面分组 ========== */
function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <header>
        <h2 className="font-serif text-lg">{title}</h2>
        {desc && <p className="text-[12.5px] text-ink-400 mt-0.5">{desc}</p>}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[11px] text-ink-400 tracking-wider uppercase block">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="text-[11px] text-ink-400 mt-1.5">{hint}</p>}
    </div>
  );
}

/* ========== Toggle · 加大 touch target ========== */
function Toggle({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer py-1.5 min-h-[44px]">
      <span
        className={cn(
          "mt-0.5 w-12 h-7 rounded-full relative transition-colors shrink-0",
          checked ? "bg-ember-500" : "bg-paper-300"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-all",
            checked ? "left-[22px]" : "left-0.5"
          )}
        />
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
      </span>
      <span className="flex-1 pt-0.5">
        <span className="block text-[14px] text-ink-strong">{label}</span>
        {desc && (
          <span className="block text-[12px] text-ink-400 mt-0.5 leading-snug">
            {desc}
          </span>
        )}
      </span>
    </label>
  );
}

function Divider() {
  return <hr className="border-paper-200" />;
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="p-3 rounded-lg bg-paper-50 border hairline">
      <div className="text-[10.5px] text-ink-400 uppercase tracking-wider">
        {k}
      </div>
      <div className="font-numeric text-[14px] text-ink-strong mt-1">{v}</div>
    </div>
  );
}