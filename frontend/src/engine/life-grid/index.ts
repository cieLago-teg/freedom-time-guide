/** 自由时间指南灯 · 人生方格引擎
 *
 * - 移植自 demo/frontend/grid.js 的核心仪式节奏
 * - 视觉色板改为「纸张黄东方简约」:
 *     unlit  → 深墨
 *     lit    → 暖宣纸金
 *     asset  → 月光冷灰
 *     past   → 浅墨
 *
 * 引擎只关心「数据 + 状态变化」,不耦合任何 React 组件。
 */
import type { Stats } from "@/lib/api";

// ---------- 色板(纸张黄东方简约) ----------
const C = {
  bg: "#FBF9F1",          // 卡片底
  paperLine: "rgba(60, 50, 30, 0.06)",
  past: "rgba(60, 50, 30, 0.05)",       // 已度过(灰墨)
  tracked: "rgba(232, 185, 96, 0.10)",  // 已度过且已记账
  unlit: "rgba(60, 50, 30, 0.12)",      // 未点亮
  unlitDim: "rgba(60, 50, 30, 0.07)",
  asset: "rgba(107, 126, 150, 0.78)",   // 资产段 · 月光
  assetSoft: "rgba(155, 177, 196, 1)",
  gold: "#D9A03E",        // 净储蓄段 · 宣纸金
  goldWarm: "#B6822C",
  goldBloom: "#FFE8B8",
  ember: "#A86A28",       // 熄灭瞬时闪烁
  ash: "rgba(60, 50, 30, 0.18)",
};

// ---------- 工具 ----------
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// 每格点亮间隔(delta 自适应)
function intervalFor(delta: number): number {
  if (delta <= 3) return 280;
  if (delta <= 8) return 200;
  if (delta <= 20) return 130;
  if (delta <= 60) return 70;
  if (delta <= 200) return 32;
  if (delta <= 800) return 12;
  return 5;
}

// 单格时长
const IGNITE_MS = 1100;
const EXTINGUISH_MS = 1400;
const CAMERA_SETTLE_MS = 600;

function pickScale(delta: number): number {
  if (delta >= 500) return 2.6;
  if (delta >= 100) return 3.5;
  if (delta >= 30) return 4.6;
  if (delta >= 10) return 5.4;
  return 6.4;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const RGB = {
  unlit: [60, 50, 30] as [number, number, number],
  gold: hexToRgb(C.gold),
  goldBloom: hexToRgb(C.goldBloom),
  ember: hexToRgb(C.ember),
};
function mixRGB(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [
    Math.round(lerp(a[0], b[0], t)),
    Math.round(lerp(a[1], b[1], t)),
    Math.round(lerp(a[2], b[2], t)),
  ];
}
function toRgb(a: [number, number, number]): string {
  return `rgb(${a[0]},${a[1]},${a[2]})`;
}

// ---------- 引擎 ----------
export interface LifeGridData {
  total_cells: number;
  past_cells: number;
  future_cells: number;
  tracked_past_cells: number;
  asset_lit: number;
  income_lit: number;
  lit_count: number;
  overflow: number;
  show_past: boolean | number;
}

type Phase = "idle" | "lighting" | "extinguishing" | "paused";

export class LifeGridEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private data: LifeGridData | null = null;
  private rafId: number | null = null;
  private camera = { x: 0, y: 0, scale: 1, tx: 0, ty: 0, ts: 1 };
  private phase: Phase = "idle";
  private cellSize = 6;
  private gap = 2;
  private cols = 60;
  private rows = 0;
  private dpr = 1;
  private width = 0;
  private height = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    this.ctx = ctx;
    this.dpr = window.devicePixelRatio || 1;
    this.resize();
    window.addEventListener("resize", this.resize);
  }

  destroy() {
    window.removeEventListener("resize", this.resize);
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  setData(s: Stats | LifeGridData | null) {
    if (!s) return;
    this.data = {
      total_cells: s.total_cells,
      past_cells: s.past_cells,
      future_cells: s.future_cells,
      tracked_past_cells: (s as Stats).tracked_past_cells ?? 0,
      asset_lit: s.asset_lit,
      income_lit: s.income_lit,
      lit_count: s.lit_count,
      overflow: s.overflow,
      show_past: !!s.show_past,
    };
    this.layout();
    this.camera = { x: 0, y: 0, scale: 1, tx: 0, ty: 0, ts: 1 };
    this.requestRender();
  }

  pause() {
    this.phase = "paused";
  }

  resume() {
    this.phase = "idle";
    this.requestRender();
  }

  /** 从 before 亮到 after(after > before) */
  async lightUp(before: number, after: number) {
    if (!this.data) return;
    this.phase = "lighting";
    const delta = after - before;
    const interval = prefersReducedMotion() ? 0 : intervalFor(delta);
    const targetScale = pickScale(delta);
    // 追焦到第 1 格目标位置
    await this.zoomToCell(before, targetScale, IGNITE_MS);
    for (let i = before; i < after; i++) {
      this.data.lit_count = i + 1;
      if (i < this.data.asset_lit) {
        // 资产段:占用前半段
      }
      this.requestRender();
      if (interval > 0) await sleep(interval);
      else if (i % 80 === 0) await sleep(8);
    }
    await this.zoomReset(IGNITE_MS + 200);
    this.phase = "idle";
  }

  /** 从 after 熄到 before(after < before) */
  async extinguish(after: number, before: number) {
    if (!this.data) return;
    this.phase = "extinguishing";
    const delta = before - after;
    const interval = prefersReducedMotion() ? 0 : intervalFor(delta) * 1.25;
    const targetScale = pickScale(delta);
    await this.zoomToCell(before, targetScale, EXTINGUISH_MS);
    for (let i = before; i > after; i--) {
      this.data.lit_count = i - 1;
      this.requestRender();
      if (interval > 0) await sleep(interval);
      else if (i % 80 === 0) await sleep(10);
    }
    await this.zoomReset(EXTINGUISH_MS + 200);
    this.phase = "idle";
  }

  // ---------- 内部 ----------
  private resize = () => {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = Math.floor(rect.width * this.dpr);
    this.canvas.height = Math.floor(rect.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.layout();
    this.requestRender();
  };

  private layout() {
    if (!this.data) return;
    const future = this.data.future_cells || 0;
    const past = this.data.show_past ? this.data.past_cells : 0;
    const total = past + future;
    if (total <= 0) {
      this.cols = 60;
      this.rows = 1;
      return;
    }
    // 估算列数(基于容器宽度)
    const w = Math.max(this.width, 320);
    const desiredCell = Math.max(4, Math.min(10, Math.floor(w / 100)));
    this.cellSize = desiredCell;
    this.gap = Math.max(1, Math.floor(desiredCell / 4));
    const cellStride = this.cellSize + this.gap;
    this.cols = Math.max(40, Math.floor(w / cellStride));
    this.rows = Math.ceil(total / this.cols);
  }

  private requestRender() {
    if (this.rafId) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.render();
    });
  }

  private render() {
    if (!this.data) return;
    const { ctx, width, height } = this;
    ctx.clearRect(0, 0, width, height);

    // 背景
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, width, height);

    const cs = this.cellSize;
    const gp = this.gap;
    const stride = cs + gp;
    const startX = (width - this.cols * stride + gp) / 2;
    const startY = (height - this.rows * stride + gp) / 2;

    ctx.save();
    ctx.translate(this.camera.x, this.camera.y);
    ctx.scale(this.camera.scale, this.camera.scale);

    const litAsset = this.data.asset_lit;
    const litIncome = this.data.income_lit;
    const litTotal = litAsset + litIncome;
    const pastCells = this.data.show_past ? this.data.past_cells : 0;
    const trackedPast = this.data.tracked_past_cells;

    // past 段(已度过,放在顶部)
    for (let i = 0; i < pastCells; i++) {
      const col = i % this.cols;
      const row = Math.floor(i / this.cols);
      const x = startX + col * stride;
      const y = startY + row * stride;
      ctx.fillStyle = i < trackedPast ? C.tracked : C.past;
      ctx.fillRect(x, y, cs, cs);
    }

    // future 段(待点亮)
    const futureStart = pastCells;
    const futureCells = this.data.future_cells;
    for (let i = 0; i < futureCells; i++) {
      const idx = futureStart + i;
      const col = idx % this.cols;
      const row = Math.floor(idx / this.cols);
      const x = startX + col * stride;
      const y = startY + row * stride;

      if (i < litAsset) {
        // 资产段
        ctx.fillStyle = C.asset;
        ctx.fillRect(x, y, cs, cs);
      } else if (i < litTotal && litTotal <= futureCells) {
        // 净储蓄段
        ctx.fillStyle = C.gold;
        ctx.fillRect(x, y, cs, cs);
      } else {
        ctx.fillStyle = i % 2 === 0 ? C.unlit : C.unlitDim;
        ctx.fillRect(x, y, cs, cs);
      }
    }

    // overflow 区(超出 lifetime 的额外自由)
    if (this.data.overflow > 0) {
      ctx.save();
      ctx.globalAlpha = 0.55;
      for (let i = 0; i < Math.min(this.data.overflow, 60); i++) {
        const col = (futureStart + futureCells + i) % this.cols;
        const row = Math.floor((futureStart + futureCells + i) / this.cols);
        const x = startX + col * stride;
        const y = startY + row * stride;
        ctx.fillStyle = C.goldBloom;
        ctx.fillRect(x, y, cs, cs);
      }
      ctx.restore();
    }

    ctx.restore();
  }

  private cellScreenPos(index: number): { x: number; y: number } {
    const stride = this.cellSize + this.gap;
    const startX = (this.width - this.cols * stride + this.gap) / 2;
    const startY = (this.height - this.rows * stride + this.gap) / 2;
    const col = index % this.cols;
    const row = Math.floor(index / this.cols);
    return { x: startX + col * stride, y: startY + row * stride };
  }

  private async zoomToCell(
    index: number,
    targetScale: number,
    duration: number
  ) {
    const past = this.data?.show_past ? this.data.past_cells || 0 : 0;
    const idx = past + Math.max(0, index);
    const { x, y } = this.cellScreenPos(idx);
    const cx = this.width / 2 - x * targetScale;
    const cy = this.height / 2 - y * targetScale;
    await this.tweenCamera(cx, cy, targetScale, duration);
  }

  private async zoomReset(duration: number) {
    await this.tweenCamera(0, 0, 1, duration);
  }

  private tweenCamera(
    tx: number,
    ty: number,
    ts: number,
    duration: number
  ): Promise<void> {
    return new Promise((resolve) => {
      const start = performance.now();
      const sx = this.camera.x;
      const sy = this.camera.y;
      const ss = this.camera.scale;
      const tick = () => {
        const t = Math.min(1, (performance.now() - start) / duration);
        const k = easeInOut(t);
        this.camera.x = lerp(sx, tx, k);
        this.camera.y = lerp(sy, ty, k);
        this.camera.scale = lerp(ss, ts, k);
        this.requestRender();
        if (t < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
  }
}
