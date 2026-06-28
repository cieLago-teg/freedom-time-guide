/** 数字/日期/货币格式化工具 */

export function fmtCNY(n: number | null | undefined): string {
  const v = Number(n || 0);
  return "¥" + v.toLocaleString("zh-CN", { maximumFractionDigits: 2 });
}

export function fmtInt(n: number | null | undefined): string {
  return Number(n || 0).toLocaleString("zh-CN");
}

export function fmtPct(n: number | null | undefined, digits = 1): string {
  return Number(n || 0).toFixed(digits) + "%";
}

export function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function fmtDate(iso?: string | null): string {
  if (!iso) return "—";
  return iso;
}

export function fmtDateLong(iso?: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return `${y} 年 ${m} 月 ${d} 日`;
}

/** 把年/月/日合并成中文长格式 */
export function pluralDays(n: number): string {
  const v = Math.abs(n);
  if (v >= 365) return `${(v / 365).toFixed(1)} 年`;
  if (v >= 30) return `${Math.round(v / 30)} 个月`;
  return `${v} 天`;
}
