import { useState, useRef } from "react";
import {
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  X,
  FileUp,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";

type PreviewResult = Awaited<ReturnType<typeof api.importCsvPreview>>;

export default function ImportExportPage() {
  const [csvText, setCsvText] = useState("");
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [committing, setCommitting] = useState(false);
  const [commitResult, setCommitResult] = useState<{
    inserted: number;
    error_count: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onFile = async (file: File) => {
    setError(null);
    setCommitResult(null);
    setPreview(null);
    const text = await file.text();
    setCsvText(text);
    try {
      const r = await api.importCsvPreview(text);
      setPreview(r);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const onFilePick = () => {
    fileInputRef.current?.click();
  };

  const clearFile = () => {
    setCsvText("");
    setPreview(null);
    setCommitResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const commit = async () => {
    if (!preview?.rows?.length) return;
    setCommitting(true);
    setError(null);
    try {
      const r = await api.importCsvCommit(preview.rows);
      setCommitResult({ inserted: r.inserted, error_count: r.error_count });
      setPreview(null);
      setCsvText("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCommitting(false);
    }
  };

  const exportJson = () => {
    window.location.href = api.exportJsonUrl();
  };

  const sample = preview?.sample || [];
  const validCount = preview?.valid_count || 0;
  const errorCount = preview?.error_count || 0;
  const hasErrors = errorCount > 0;

  return (
    <div className="space-y-5 md:space-y-7 fade-in max-w-3xl">
      <header>
        <h1 className="font-serif text-2xl lg:text-3xl">导入导出</h1>
        <p className="text-[13px] md:text-sm text-ink-400 mt-1">
          你的数据永远是你的 · 所有操作都在本地完成
        </p>
      </header>

      {/* ====== 移动端 ====== */}
      <div className="md:hidden space-y-3">
        {/* Step 1: 选择文件 */}
        <div className="paper-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-ember-100 text-ember-700 flex items-center justify-center shrink-0">
              <FileUp size={16} strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-serif text-[15px] text-ink-strong">
                从 CSV 导入交易
              </div>
              <div className="text-[11.5px] text-ink-400 mt-0.5">
                type · amount · occurred_on 三列必备
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            className="hidden"
          />

          {!csvText ? (
            <button
              type="button"
              onClick={onFilePick}
              className="w-full h-28 rounded-2xl border-2 border-dashed border-paper-300 bg-paper-50 flex flex-col items-center justify-center gap-1.5 active:bg-paper-200/60 transition-colors"
            >
              <Upload
                size={22}
                strokeWidth={1.6}
                className="text-ember-700"
              />
              <div className="text-[13.5px] text-ink-strong font-medium">
                点击选择 CSV 文件
              </div>
              <div className="text-[11px] text-ink-soft">.csv · 本地处理</div>
            </button>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-paper-50 border hairline">
              <FileSpreadsheet
                size={18}
                className="text-moon-500 shrink-0"
                strokeWidth={1.7}
              />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] text-ink-strong truncate">
                  {csvText.split("\n")[0].slice(0, 60)}
                  {csvText.length > 60 && "…"}
                </div>
                <div className="text-[11px] text-ink-soft mt-0.5 font-numeric">
                  {csvText.split("\n").filter(Boolean).length - 1} 行数据
                </div>
              </div>
              <button
                type="button"
                onClick={clearFile}
                aria-label="清除"
                className="w-9 h-9 rounded-full flex items-center justify-center text-ink-soft active:bg-paper-200"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Step 2: 预览结果 */}
        {preview && (
          <div className="paper-card p-4 fade-in">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="chip chip-ember">预览</span>
                <span className="font-numeric text-[13px] text-ink-strong">
                  {validCount} 合法 · {errorCount} 错误
                </span>
              </div>
              {hasErrors && (
                <span className="text-[11px] text-ember-700 flex items-center gap-1">
                  <AlertCircle size={11} />
                  有错误行
                </span>
              )}
            </div>

            {/* 简化预览:只显示前 3 条 */}
            {sample.length > 0 && (
              <div className="rounded-xl bg-paper-50 border hairline overflow-hidden">
                <table className="w-full text-[12px]">
                  <thead className="bg-paper-200/50">
                    <tr className="text-ink-soft">
                      <th className="text-left px-3 py-2 font-medium">日期</th>
                      <th className="text-left px-3 py-2 font-medium">类型</th>
                      <th className="text-right px-3 py-2 font-medium">
                        金额
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-numeric">
                    {sample.slice(0, 3).map((s, i) => (
                      <tr
                        key={i}
                        className="border-t border-paper-200 text-ink-strong"
                      >
                        <td className="px-3 py-2">
                          {String(s.occurred_on || "")}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={cn(
                              "px-1.5 py-0.5 rounded text-[10.5px]",
                              s.type === "income"
                                ? "bg-ember-100 text-ember-700"
                                : "bg-moon-500/15 text-moon-500"
                            )}
                          >
                            {String(s.type || "")}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          {String(s.amount || "")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {sample.length > 3 && (
                  <div className="px-3 py-1.5 text-[11px] text-ink-soft border-t border-paper-200 text-center">
                    还有 {validCount - 3} 条…
                  </div>
                )}
              </div>
            )}

            {/* 错误折叠 */}
            {preview.errors && preview.errors.length > 0 && (
              <details className="mt-2">
                <summary className="text-[12px] text-ember-700 cursor-pointer py-1.5">
                  查看 {errorCount} 条错误
                </summary>
                <ul className="mt-1 space-y-1 max-h-32 overflow-auto text-[11px] text-ink-soft">
                  {preview.errors.slice(0, 10).map((e, i) => (
                    <li key={i} className="font-mono">
                      第 {e.row} 行: {e.error}
                    </li>
                  ))}
                </ul>
              </details>
            )}

            {/* 反馈 */}
            {commitResult && (
              <div className="mt-3 flex items-center gap-2 text-[12.5px] text-moon-500 bg-moon-500/5 border border-moon-500/20 rounded-lg px-3 py-2">
                <CheckCircle2 size={13} />
                <span>
                  已写入 {commitResult.inserted} 条
                  {commitResult.error_count > 0 &&
                    ` · ${commitResult.error_count} 条失败`}
                </span>
              </div>
            )}
            {error && (
              <div className="mt-3 flex items-start gap-2 text-[12.5px] text-ember-700 bg-ember-50 border border-ember-200/60 rounded-lg px-3 py-2">
                <AlertCircle size={13} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={commit}
              disabled={committing || !validCount}
              className="btn btn-primary w-full h-12 text-[14.5px] mt-3"
            >
              <Upload size={15} />
              {committing
                ? "导入中…"
                : validCount > 0
                ? `导入 ${validCount} 条`
                : "无可导入数据"}
            </button>
          </div>
        )}

        {/* JSON 导出 */}
        <div className="paper-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-moon-500/15 text-moon-500 flex items-center justify-center shrink-0">
              <FileJson size={16} strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-serif text-[15px] text-ink-strong">
                导出全量数据
              </div>
              <div className="text-[11.5px] text-ink-400 mt-0.5">
                settings · transactions · goals
              </div>
            </div>
          </div>
          <button
            onClick={exportJson}
            className="btn btn-primary w-full h-12 text-[14.5px]"
          >
            <Download size={15} />
            下载 JSON
          </button>
        </div>
      </div>

      {/* ====== 桌面端:扁平展开 ====== */}
      <div className="hidden md:block space-y-5">
        <section className="paper-card p-6 space-y-4">
          <h2 className="font-serif text-lg flex items-center gap-2">
            <FileSpreadsheet size={17} className="text-ember-700" />
            从 CSV 导入交易
          </h2>
          <p className="text-[12.5px] text-ink-500 leading-relaxed">
            需要至少包含{" "}
            <code className="px-1.5 py-0.5 rounded bg-paper-200 text-[11.5px]">
              type
            </code>
            、
            <code className="px-1.5 py-0.5 rounded bg-paper-200 text-[11.5px]">
              amount
            </code>
            、
            <code className="px-1.5 py-0.5 rounded bg-paper-200 text-[11.5px]">
              occurred_on
            </code>{" "}
            三列(YYYY-MM-DD)。可选:category、note、is_major。
          </p>

          <label className="block">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) =>
                e.target.files?.[0] && onFile(e.target.files[0])
              }
              className="block w-full text-[13px] text-ink-500
                file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
                file:text-[13px] file:font-medium file:bg-paper-200 file:text-ink-strong
                hover:file:bg-ember-100"
            />
          </label>

          {preview && (
            <div className="rounded-lg border hairline bg-paper-50 p-4 text-[13px] space-y-2">
              <div className="flex items-center gap-3">
                <span className="chip chip-ember">预览</span>
                <span className="font-numeric text-ink-strong">
                  {preview.valid_count} 条合法 · {preview.error_count} 条错误
                </span>
              </div>
              {preview.error && (
                <div className="text-[12.5px] text-ember-700">
                  {preview.error}
                </div>
              )}
              {preview.errors && preview.errors.length > 0 && (
                <details className="text-[12px] text-ink-500">
                  <summary className="cursor-pointer">查看错误</summary>
                  <ul className="mt-2 space-y-1 max-h-40 overflow-auto">
                    {preview.errors.map((e, i) => (
                      <li key={i} className="font-mono text-[11px]">
                        第 {e.row} 行: {e.error}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
              <button
                onClick={commit}
                disabled={committing || !preview.rows?.length}
                className="btn btn-primary mt-1"
              >
                <Upload size={14} />
                {committing ? "导入中" : `导入 ${preview.valid_count} 条`}
              </button>
            </div>
          )}

          {commitResult && (
            <div className="text-[12.5px] text-moon-500 bg-moon-500/5 border border-moon-500/20 rounded-lg px-3 py-2">
              已写入 {commitResult.inserted} 条 · {commitResult.error_count} 条
              失败
            </div>
          )}
          {error && (
            <div className="text-[12.5px] text-ember-700 bg-ember-50 border border-ember-200/60 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </section>

        <section className="paper-card p-6 space-y-4">
          <h2 className="font-serif text-lg flex items-center gap-2">
            <FileJson size={17} className="text-ember-700" />
            导出全量数据(JSON)
          </h2>
          <p className="text-[12.5px] text-ink-500 leading-relaxed">
            包含 settings、transactions、goals · 用于备份或迁移到其他设备
          </p>
          <button onClick={exportJson} className="btn btn-primary">
            <Download size={14} />
            下载 JSON
          </button>
        </section>
      </div>
    </div>
  );
}