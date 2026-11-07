import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";

/* ============================================================
 * CursorCanvasLayer · 多光标协同搭建
 * 机制移植自 LeiBox Multi Cursor Page Builder：
 *   intro(环绕) → burst(爆散) → board(拉框) → build(逐元素搭建) → fade(渐隐)
 * 12 只具名光标；每张卡、卡内每块内容、作品拼图的每张作品卡都是独立任务。
 * 文本块：先逐字打出，再由光标把文本框向下拉到位。
 * ============================================================ */

const PAL = [
  "#0D99FF",
  "#9747FF",
  "#FF24BD",
  "#14AE5C",
  "#FFA629",
  "#F24822",
  "#00B5CE",
  "#7B61FF",
  "#1BC47D",
];
const NAMES = ["Lei", "Ada", "Kai", "Momo", "Ren", "Yuki", "Sol", "Nova", "Jin"];

const TYPE_TEXT = "bento";
const TYPE_START = 2.32;
const TYPE_DUR = 0.7;

const T_INTRO = 1.1;
const T_BURST = 1.5;
const T_BOARD = 2.15;
const FRAME_DUR = 0.6;
const REVEAL_DUR = 0.5;
const WAVE_GAP = 0.45;
const TRAVEL = 0.36;
const T_TOTAL = 5.05;
const EXIT_FADE = 0.6;

const WORKER_COUNT = PAL.length;
const BOARD_CURSOR = WORKER_COUNT - 1;

const TYPE_SHARE = 0.7;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** 每只光标的漂移方向与速度（黄金角分散，避免排成一条线） */
const DRIFT_ANGLE = PAL.map((_, i) => (((i * 137.508) % 360) * Math.PI) / 180);
const DRIFT_SPEED = PAL.map((_, i) => 9 + (i % 4) * 2.5);

export type IntroPhase = "intro" | "burst" | "board" | "build";

type Tool = "arrow" | "ibeam";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface BuildJob extends Rect {
  el: HTMLElement;
  start: number;
  dur: number;
  kind: "frame" | "reveal";
  diagonal: boolean;
  /** 绘制方向：非对角线块用 ltr/rtl/ttb/btt，拼图块用 tl/tr/bl/br */
  dir: string;
  text: boolean;
  chars: number;
  cursor: number;
}

interface Scene {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  shell: HTMLElement;
  typing: HTMLElement | null;
  frame: Rect | null;
  jobs: BuildJob[];
  byCursor: BuildJob[][];
}

interface Pose {
  x: number;
  y: number;
  tool: Tool;
  down: boolean;
  alpha: number;
  rot: number;
  scale: number;
}

const TAG_WIDTHS = new Map<string, number>();
const FONT_TAG = '600 10.5px ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
const FONT_NUM = '500 10.5px ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function measureTag(name: string): number {
  const cached = TAG_WIDTHS.get(name);
  if (cached) return cached;
  const ctx = document.createElement("canvas").getContext("2d");
  let w = name.length * 6.4;
  if (ctx) {
    ctx.font = FONT_TAG;
    w = ctx.measureText(name).width;
  }
  const total = Math.ceil(w + 12);
  TAG_WIDTHS.set(name, total);
  return total;
}

function drawArrow(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 18);
  ctx.lineTo(4.8, 13.4);
  ctx.lineTo(7.7, 19.4);
  ctx.lineTo(10.2, 18.2);
  ctx.lineTo(7.4, 12.4);
  ctx.lineTo(13.2, 12.4);
  ctx.closePath();
}

function drawIBeam(ctx: CanvasRenderingContext2D) {
  for (const [w, color] of [
    [4, "#FFFFFF"],
    [1.6, "#111111"],
  ] as const) {
    ctx.lineWidth = w;
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-4, -10);
    ctx.quadraticCurveTo(0, -10, 0, -7);
    ctx.quadraticCurveTo(0, -10, 4, -10);
    ctx.moveTo(0, -7);
    ctx.lineTo(0, 7);
    ctx.moveTo(-4, 10);
    ctx.quadraticCurveTo(0, 10, 0, 7);
    ctx.quadraticCurveTo(0, 10, 4, 10);
    ctx.stroke();
  }
}

function drawPill(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  alpha: number,
) {
  ctx.globalAlpha = alpha;
  ctx.font = FONT_NUM;
  const w = ctx.measureText(text).width + 10;
  roundRect(ctx, x - w / 2, y, w, 17, 3);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(text, x - w / 2 + 5, y + 12.2);
  ctx.globalAlpha = 1;
}

function drawSelection(
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  alpha: number,
  label: string | null,
  size: string | null,
  placement: "outside" | "inside" = "outside",
) {
  const { x, y, w, h } = rect;
  if (w < 2 || h < 2 || alpha <= 0.01) return;
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = "#0D99FF";
  ctx.lineWidth = 1;
  ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(w), Math.round(h));

  if (w > 24 && h > 24) {
    ctx.fillStyle = "#FFFFFF";
    const corners: Array<[number, number]> = [
      [x, y],
      [x + w, y],
      [x, y + h],
      [x + w, y + h],
    ];
    for (const [cx, cy] of corners) {
      ctx.fillRect(Math.round(cx) - 3, Math.round(cy) - 3, 7, 7);
      ctx.strokeRect(Math.round(cx) - 2.5, Math.round(cy) - 2.5, 6, 6);
    }
  }

  if (label) {
    ctx.font = FONT_NUM;
    ctx.fillStyle = "#0D99FF";
    ctx.fillText(label, x, placement === "inside" ? y + 15 : y - 7);
  }
  ctx.globalAlpha = 1;
  if (size) {
    if (placement === "inside") {
      drawPill(ctx, size, x + w - 42, y + h - 26, "#0D99FF", alpha);
    } else {
      drawPill(ctx, size, x + w / 2, y + h + 8, "#0D99FF", alpha);
    }
  }
}

/** 红色测量线（文本拉框时的高度标尺） */
function drawMeasure(ctx: CanvasRenderingContext2D, x: number, y1: number, y2: number, alpha: number) {
  if (Math.abs(y2 - y1) < 8) return;
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = "#F24822";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(Math.round(x) + 0.5, y1);
  ctx.lineTo(Math.round(x) + 0.5, y2);
  ctx.moveTo(x - 3, y1 + 0.5);
  ctx.lineTo(x + 4, y1 + 0.5);
  ctx.moveTo(x - 3, y2 - 0.5);
  ctx.lineTo(x + 4, y2 - 0.5);
  ctx.stroke();
  ctx.globalAlpha = 1;
  drawPill(ctx, String(Math.round(y2 - y1)), x + 26, (y1 + y2) / 2 - 8, "#F24822", alpha);
}

/** 红色参考线 */
function drawGuide(ctx: CanvasRenderingContext2D, x: number, height: number, alpha: number) {
  ctx.globalAlpha = alpha * 0.55;
  ctx.strokeStyle = "#F24822";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(Math.round(x) + 0.5, 0);
  ctx.lineTo(Math.round(x) + 0.5, height);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawCursor(
  ctx: CanvasRenderingContext2D,
  pose: Pose,
  color: string,
  name: string | null,
  tagAlpha: number,
) {
  if (pose.alpha <= 0.02) return;
  ctx.save();
  ctx.globalAlpha = pose.alpha;
  ctx.translate(pose.x, pose.y);
  if (pose.rot) ctx.rotate(pose.rot);
  if (pose.scale !== 1) ctx.scale(pose.scale, pose.scale);

  ctx.shadowColor = "rgba(20, 20, 25, 0.26)";
  ctx.shadowBlur = pose.down ? 3 : 5;
  ctx.shadowOffsetY = pose.down ? 1 : 1.6;
  ctx.lineJoin = "round";

  if (pose.tool === "ibeam") {
    drawIBeam(ctx);
    ctx.shadowColor = "transparent";
  } else {
    if (pose.down) ctx.scale(0.93, 0.93);
    drawArrow(ctx);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = "#FFFFFF";
    ctx.stroke();
  }
  ctx.restore();

  if (name && tagAlpha > 0.03) {
    const w = measureTag(name);
    const tx = pose.x + 11;
    const ty = pose.y + 16;
    ctx.globalAlpha = pose.alpha * tagAlpha;
    roundRect(ctx, tx, ty, w, 18, 4);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.font = FONT_TAG;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(name, tx + 6, ty + 12.6);
    ctx.globalAlpha = 1;
  }
}

/* ------------------------------ 位置模型 ------------------------------ */
/**
 * 开场游走：光标只在屏幕正中的 50% 区域里随机漂浮
 * 每只光标的相位与频率由 index 派生的伪随机数决定，因此轨迹互不相同，
 * 又保持纯函数（可随滚轮回退复现）。
 */
function wanderPose(index: number, t: number, w: number, h: number) {
  const cx = w / 2;
  const cy = h / 2;
  const rw = w * 0.25;
  const rh = h * 0.25;

  const seed = (n: number) => {
    const v = Math.sin(index * 127.1 + n * 311.7) * 43758.5453;
    return v - Math.floor(v);
  };

  const a1 = seed(1) * Math.PI * 2;
  const a2 = seed(2) * Math.PI * 2;
  const a3 = seed(3) * Math.PI * 2;
  const f1 = 0.34 + seed(4) * 0.3;
  const f2 = 0.2 + seed(5) * 0.26;

  const x = cx + Math.sin(t * f1 + a1) * rw * 0.62 + Math.sin(t * f2 * 1.9 + a3) * rw * 0.2;
  const y = cy + Math.cos(t * f2 + a2) * rh * 0.62 + Math.cos(t * f1 * 1.4 + a3) * rh * 0.2;

  return {
    x: clamp(x, cx - rw, cx + rw),
    y: clamp(y, cy - rh, cy + rh),
    rot: 0,
  };
}

function homePose(index: number, w: number, h: number) {
  return {
    x: w * (0.12 + 0.76 * ((index * 0.37 + 0.13) % 1)),
    y: h * (0.2 + 0.62 * ((index * 0.61 + 0.21) % 1)),
  };
}

/** 空闲光标：各自以随机角度匀速漂移 */
function driftPose(index: number, base: { x: number; y: number }, t: number, since: number, w: number, h: number): Pose {
  const dt = Math.max(0, t - since);
  const x = base.x + Math.cos(DRIFT_ANGLE[index]) * DRIFT_SPEED[index] * dt;
  const y = base.y + Math.sin(DRIFT_ANGLE[index]) * DRIFT_SPEED[index] * dt;
  return {
    x: clamp(x, 24, w - 24),
    y: clamp(y, 24, h - 24),
    tool: "arrow",
    down: false,
    alpha: 1,
    rot: 0,
    scale: 1,
  };
}

const CORNERS = { tl: [0, 0], tr: [1, 0], bl: [0, 1], br: [1, 1] } as const;
const OPPOSITE: Record<string, string> = { tl: "br", tr: "bl", bl: "tr", br: "tl" };

function cornerPoint(job: BuildJob, key: string) {
  const [fx, fy] = CORNERS[(key as keyof typeof CORNERS) ?? "tl"] ?? CORNERS.tl;
  return { x: job.x + job.w * fx, y: job.y + job.h * fy };
}

function jobStartPose(job: BuildJob): { x: number; y: number } {
  if (job.kind === "frame") return { x: job.x + 3, y: job.y + 3 };
  if (job.diagonal) {
    const p = cornerPoint(job, job.dir);
    return { x: p.x + (p.x === job.x ? 3 : -3), y: p.y + (p.y === job.y ? 3 : -3) };
  }
  switch (job.dir) {
    case "rtl":
      return { x: job.x + job.w + 2, y: job.y + job.h / 2 };
    case "ttb":
      return { x: job.x + job.w / 2, y: job.y - 2 };
    case "btt":
      return { x: job.x + job.w / 2, y: job.y + job.h + 2 };
    default:
      return { x: job.x - 2, y: job.y + job.h / 2 };
  }
}

function jobEndPose(job: BuildJob): { x: number; y: number } {
  if (job.kind === "frame") return { x: job.x + job.w, y: job.y + job.h };
  if (job.diagonal) return cornerPoint(job, OPPOSITE[job.dir] ?? "br");
  switch (job.dir) {
    case "rtl":
      return { x: job.x, y: job.y + job.h / 2 };
    case "ttb":
      return { x: job.x + job.w / 2, y: job.y + job.h };
    case "btt":
      return { x: job.x + job.w / 2, y: job.y };
    default:
      return { x: job.x + job.w, y: job.y + job.h / 2 };
  }
}

/** 光标在绘制过程中的落点 */
function drawPoint(job: BuildJob, k: number): { x: number; y: number } {
  if (job.kind === "frame") return { x: job.x + job.w * k, y: job.y + job.h * k };
  if (job.diagonal) {
    const sx = job.dir === "tr" || job.dir === "br" ? 1 - k : k;
    const sy = job.dir === "bl" || job.dir === "br" ? 1 - k : k;
    return { x: job.x + job.w * sx, y: job.y + job.h * sy };
  }
  switch (job.dir) {
    case "rtl":
      return { x: job.x + job.w * (1 - k), y: job.y + job.h / 2 };
    case "ttb":
      return { x: job.x + job.w / 2, y: job.y + job.h * k };
    case "btt":
      return { x: job.x + job.w / 2, y: job.y + job.h * (1 - k) };
    default:
      return { x: job.x + job.w * k, y: job.y + job.h / 2 };
  }
}

/** 按方向生成 clip-path */
function clipFor(job: BuildJob, k: number): string {
  const radius = job.kind === "frame" ? 24 : 18;
  if (k <= 0) {
    if (job.kind === "frame" || job.diagonal) return `inset(0 100% 100% 0 round ${radius}px)`;
    return "inset(0 100% 0 0)";
  }
  if (k >= 1) return "";
  const r = `${(1 - k) * 100}%`;

  if (job.kind === "frame" || job.diagonal) {
    switch (job.dir) {
      case "tr":
        return `inset(0 0 ${r} ${r} round ${radius}px)`;
      case "bl":
        return `inset(${r} ${r} 0 0 round ${radius}px)`;
      case "br":
        return `inset(${r} 0 0 ${r} round ${radius}px)`;
      default:
        return `inset(0 ${r} ${r} 0 round ${radius}px)`;
    }
  }
  switch (job.dir) {
    case "rtl":
      return `inset(0 0 0 ${r})`;
    case "ttb":
      return `inset(0 0 ${r} 0)`;
    case "btt":
      return `inset(${r} 0 0 0)`;
    default:
      return `inset(0 ${r} 0 0)`;
  }
}

/* ------------------------------ 测量 ------------------------------ */
function measure(root: HTMLElement, canvas: HTMLCanvasElement): Scene | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const width = window.innerWidth;
  const height = window.innerHeight;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.textBaseline = "alphabetic";

  const shell = root.querySelector<HTMLElement>("[data-intro-shell]");
  if (!shell) return null;

  const cards = [...root.querySelectorAll<HTMLElement>("[data-bento-card]")]
    .map((el) => {
      const rect = el.getBoundingClientRect();
      const reveals = [...el.querySelectorAll<HTMLElement>("[data-reveal]")]
        .map((item) => {
          const r = item.getBoundingClientRect();
          const chars = (item.textContent ?? "").replace(/\s+/g, "").length;
          return {
            el: item,
            x: r.x,
            y: r.y,
            w: r.width,
            h: r.height,
            diagonal: item.hasAttribute("data-build-clip"),
            text: item.matches("h1, h2, h3, p"),
            chars,
          };
        })
        .sort((a, b) => (Math.abs(a.y - b.y) > 8 ? a.y - b.y : a.x - b.x));
      return { el, x: rect.x, y: rect.y, w: rect.width, h: rect.height, reveals };
    })
    .filter((card) => card.w > 0);

  const jobs: BuildJob[] = [];
  const BLOCK_DIRS = ["ltr", "rtl", "ttb", "btt"] as const;
  const CORNER_DIRS = ["tl", "tr", "bl", "br"] as const;
  const pickDir = (item: { text: boolean; diagonal: boolean; x: number; y: number }) => {
    if (item.text) return "ltr";
    const seed = Math.abs(Math.round(item.x / 7) + Math.round(item.y / 11));
    return item.diagonal ? CORNER_DIRS[seed % 4] : BLOCK_DIRS[(seed + 1) % 4];
  };

  const ordered = [...cards].sort((a, b) => b.reveals.length - a.reveals.length);
  ordered.forEach((card, order) => {
    const start = T_BOARD + order * 0.18;
    jobs.push({
      el: card.el,
      x: card.x,
      y: card.y,
      w: card.w,
      h: card.h,
      start,
      dur: FRAME_DUR,
      kind: "frame",
      diagonal: true,
      dir: "tl",
      text: false,
      chars: 0,
      cursor: -1,
    });

    card.reveals.forEach((item, index) => {
      const wave = Math.floor(index / 2);
      const dur = item.text ? clamp(0.55 + item.chars * 0.022, 0.6, 1.5) : REVEAL_DUR;
      jobs.push({
        el: item.el,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
        start: start + FRAME_DUR + 0.05 + wave * WAVE_GAP,
        dur,
        kind: "reveal",
        diagonal: item.diagonal,
        dir: pickDir(item),
        text: item.text,
        chars: item.chars,
        cursor: -1,
      });
    });
  });

  const headerReveals = [...shell.querySelectorAll<HTMLElement>("[data-reveal]")].filter(
    (el) => !el.closest("[data-bento-card]"),
  );
  headerReveals.forEach((el, index) => {
    const r = el.getBoundingClientRect();
    const chars = (el.textContent ?? "").replace(/\s+/g, "").length;
    jobs.push({
      el,
      x: r.x,
      y: r.y,
      w: r.width,
      h: r.height,
      start: T_BOARD + 0.05 + index * 0.12,
      dur: clamp(0.55 + chars * 0.022, 0.6, 1.5),
      kind: "reveal",
      diagonal: false,
      dir: "ltr",
      text: true,
      chars,
      cursor: -1,
    });
  });

  jobs.sort((a, b) => a.start - b.start);

  // 就近派活：在空闲光标里选「离目标最近 + 闲置最久」的一只；
  // 若全都忙，则顺延任务等最早空出来的那只，保证光标到位后才开始画。
  const freeAt = new Array(BOARD_CURSOR).fill(0);
  const lastPos: Array<{ x: number; y: number } | null> = new Array(BOARD_CURSOR).fill(null);

  for (const job of jobs) {
    const target = jobStartPose(job);
    let chosen = -1;
    let bestCost = Infinity;

    for (let c = 0; c < BOARD_CURSOR; c += 1) {
      if (freeAt[c] > job.start - TRAVEL) continue;
      const from = lastPos[c] ?? homePose(c, width, height);
      const dist = Math.hypot(from.x - target.x, from.y - target.y);
      const cost = dist + (job.start - freeAt[c]) * 60;
      if (cost < bestCost) {
        bestCost = cost;
        chosen = c;
      }
    }

    if (chosen < 0) {
      let earliest = 0;
      for (let c = 1; c < BOARD_CURSOR; c += 1) {
        if (freeAt[c] < freeAt[earliest]) earliest = c;
      }
      chosen = earliest;
      job.start = freeAt[chosen] + TRAVEL;
    }

    job.cursor = chosen;
    freeAt[chosen] = job.start + job.dur;
    lastPos[chosen] = jobEndPose(job);
  }

  const byCursor: BuildJob[][] = Array.from({ length: WORKER_COUNT }, () => []);
  for (const job of jobs) byCursor[job.cursor].push(job);

  const frameEl = root.querySelector<HTMLElement>("[data-page-frame]");
  const frameRect = frameEl?.getBoundingClientRect();
  const frame = frameRect
    ? { x: frameRect.x, y: frameRect.y, w: frameRect.width, h: frameRect.height }
    : null;

  return {
    ctx,
    width,
    height,
    shell,
    typing: root.querySelector<HTMLElement>("[data-type-target]"),
    frame,
    jobs,
    byCursor,
  };
}

/* ------------------------------ 光标姿态 ------------------------------ */
function cursorPose(scene: Scene, c: number, t: number): Pose {
  const list = scene.byCursor[c] ?? [];
  let active: BuildJob | null = null;
  let lastEnded: BuildJob | null = null;

  for (const job of list) {
    if (t >= job.start - TRAVEL && t <= job.start + job.dur) {
      active = job;
      break;
    }
    if (t > job.start + job.dur) lastEnded = job;
  }

  if (active) {
    if (t < active.start) {
      const k = easeOut(clamp01((t - (active.start - TRAVEL)) / TRAVEL));
      const from = lastEnded
        ? jobEndPose(lastEnded)
        : homePose(c, scene.width, scene.height);
      const to = jobStartPose(active);
      return {
        x: lerp(from.x, to.x, k),
        y: lerp(from.y, to.y, k),
        tool: "arrow",
        down: false,
        alpha: 1,
        rot: 0,
        scale: 1,
      };
    }

    const p = clamp01((t - active.start) / active.dur);

    if (active.kind === "frame" || active.diagonal) {
      const k = easeInOut(p);
      const point = drawPoint(active, k);
      return {
        x: point.x,
        y: point.y,
        tool: "arrow",
        down: true,
        alpha: 1,
        rot: 0,
        scale: 1,
      };
    }

    if (active.text) {
      if (p < TYPE_SHARE) {
        const typed = Math.ceil(clamp01(p / TYPE_SHARE) * Math.max(1, active.chars)) / Math.max(1, active.chars);
        return {
          x: active.x + active.w * typed,
          y: active.y + active.h / 2,
          tool: "ibeam",
          down: false,
          alpha: 1,
          rot: 0,
          scale: 1,
        };
      }
      const rp = clamp01((p - TYPE_SHARE) / (1 - TYPE_SHARE));
      const bottom = (1 - easeInOut(rp)) * 0.38;
      return {
        x: active.x + active.w * 0.5,
        y: active.y + active.h * (1 - bottom),
        tool: "arrow",
        down: true,
        alpha: 1,
        rot: 0,
        scale: 1,
      };
    }

    const k = easeInOut(p);
    const point = drawPoint(active, k);
    return {
      x: point.x,
      y: point.y,
      tool: "arrow",
      down: true,
      alpha: 1,
      rot: 0,
      scale: 1,
    };
  }

  if (lastEnded) {
    return driftPose(c, jobEndPose(lastEnded), t, lastEnded.start + lastEnded.dur, scene.width, scene.height);
  }

  return driftPose(c, homePose(c, scene.width, scene.height), t, T_BURST, scene.width, scene.height);
}

/* ------------------------------ 渲染 ------------------------------ */
function render(scene: Scene, t: number) {
  const { ctx, width: W, height: H, shell, typing, frame, jobs } = scene;

  /* 1. 桌面框 */
  const boardK = clamp01((t - T_BURST) / (T_BOARD - T_BURST));
  if (t < T_BURST) {
    shell.style.clipPath = "inset(0 100% 100% 0)";
  } else if (boardK >= 1) {
    shell.style.clipPath = "";
  } else {
    const k = easeInOut(boardK);
    shell.style.clipPath = `inset(0 ${(1 - k) * 100}% ${(1 - k) * 100}% 0)`;
  }

  /* 2. 逐元素搭建 */
  for (const job of jobs) {
    const p = clamp01((t - job.start) / job.dur);

    if (job.text) {
      const typeP = clamp01(p / TYPE_SHARE);
      const chars = Math.max(1, job.chars);
      const typed = Math.ceil(typeP * chars) / chars;
      const bottom = (1 - easeInOut(clamp01((p - TYPE_SHARE) / (1 - TYPE_SHARE)))) * 0.38;
      job.el.style.opacity = p <= 0 ? "0" : "1";
      job.el.style.transform = "";
      job.el.style.clipPath =
        p <= 0 ? "inset(0 100% 38% 0)" : typed >= 1 && bottom <= 0.002 ? "" : `inset(0 ${(1 - typed) * 100}% ${bottom * 100}% 0)`;
    } else {
      const k = easeInOut(p);
      job.el.style.opacity = k <= 0 ? "0" : "1";
      job.el.style.transform = "";
      job.el.style.clipPath = clipFor(job, k);
    }
  }

  /* 3. 字标打字 */
  if (typing) {
    const p = clamp01((t - TYPE_START) / TYPE_DUR);
    const text = TYPE_TEXT.slice(0, Math.round(TYPE_TEXT.length * p));
    if (typing.textContent !== text) typing.textContent = text;
  }

  /* 4. 画布 */
  ctx.clearRect(0, 0, W, H);

  /* 桌面框选框 */
  if (frame && t >= T_BURST && t < T_BOARD + 0.35) {
    const alpha = 1 - clamp01((t - T_BOARD) / 0.35);
    const k = easeInOut(boardK);
    const inset = 10;
    drawSelection(
      ctx,
      {
        x: frame.x + inset,
        y: frame.y + inset,
        w: (frame.w - inset * 2) * k,
        h: (frame.h - inset * 2) * k,
      },
      alpha,
      "Desktop",
      `${Math.round(frame.w * k)} × ${Math.round(frame.h * k)}`,
      "inside",
    );
  }

  /* 卡片选框 + 参考线 */
  for (const job of jobs) {
    if (job.kind !== "frame") continue;
    const s = t - job.start;
    if (s < 0 || s > 0.95) continue;
    const k = easeInOut(clamp01(s / job.dur));
    const alpha = 1 - clamp01((s - 0.78) / 0.17);
    drawSelection(
      ctx,
      { x: job.x, y: job.y, w: job.w * k, h: job.h * k },
      alpha,
      null,
      `${Math.round(job.w * k)} × ${Math.round(job.h * k)}`,
    );
    if (s < job.dur) drawGuide(ctx, job.x + job.w * k, H, alpha * 0.8);
  }

  /* 文本块：打字 + 拉框标尺 + 属性面板 */
  for (const job of jobs) {
    if (!job.text) continue;
    const s = t - job.start;
    if (s < 0 || s > job.dur) continue;
    const p = clamp01(s / job.dur);

    if (p >= TYPE_SHARE) {
      const rp = clamp01((p - TYPE_SHARE) / (1 - TYPE_SHARE));
      const bottom = (1 - easeInOut(rp)) * 0.38;
      const boxH = job.h * (1 - bottom);
      drawSelection(ctx, { x: job.x, y: job.y, w: job.w, h: boxH }, 0.9, null, null);
      drawMeasure(ctx, job.x + job.w + 8, job.y, job.y + boxH, 0.9);
    }
  }

  /* 光标 */
  for (let c = 0; c < WORKER_COUNT; c += 1) {
    let pose: Pose;

    if (t < T_INTRO) {
      const o = wanderPose(c, t, W, H);
      pose = { ...o, tool: "arrow", down: false, alpha: clamp01(t / 0.35), scale: 1 };
    } else if (t < T_BURST) {
      const a = wanderPose(c, T_INTRO, W, H);
      const home =
        c === BOARD_CURSOR && frame ? { x: frame.x + 10, y: frame.y + 10 } : homePose(c, W, H);
      const k = easeInOut((t - T_INTRO) / (T_BURST - T_INTRO));
      pose = {
        x: lerp(a.x, home.x, k),
        y: lerp(a.y, home.y, k),
        rot: 0,
        tool: "arrow",
        down: false,
        alpha: 1,
        scale: 1,
      };
    } else if (c === BOARD_CURSOR) {
      const base = frame ?? { x: 0, y: 0, w: W, h: H };
      const rect = typing?.getBoundingClientRect();
      if (t < T_BOARD + 0.12) {
        const k = easeInOut(boardK);
        const inset = 10;
        pose = {
          x: base.x + inset + (base.w - inset * 2) * k,
          y: base.y + inset + (base.h - inset * 2) * k,
          tool: "arrow",
          down: boardK < 1,
          alpha: 1,
          rot: 0,
          scale: 1,
        };
      } else if (rect) {
        const p = clamp01((t - TYPE_START) / TYPE_DUR);
        const from = { x: base.x + base.w - 10, y: base.y + base.h - 10 };
        if (t < TYPE_START) {
          const k = easeOut(clamp01((t - (TYPE_START - 0.34)) / 0.34));
          pose = {
            x: lerp(from.x, rect.x + 2, k),
            y: lerp(from.y, rect.y + rect.height / 2, k),
            tool: "arrow",
            down: false,
            alpha: 1,
            rot: 0,
            scale: 1,
          };
        } else if (t <= TYPE_START + TYPE_DUR + 0.3) {
          pose = {
            x: rect.x + rect.width * p + 2,
            y: rect.y + rect.height / 2,
            tool: "ibeam",
            down: false,
            alpha: 1,
            rot: 0,
            scale: 1,
          };
        } else {
          pose = driftPose(c, { x: rect.x + rect.width, y: rect.y + rect.height / 2 }, t, TYPE_START + TYPE_DUR, W, H);
        }
      } else {
        pose = driftPose(c, homePose(c, W, H), t, T_BURST, W, H);
      }
    } else {
      pose = cursorPose(scene, c, t);
    }

    drawCursor(ctx, pose, PAL[c], NAMES[c], 1);
  }
}

/* ============================== 组件 ============================== */
export interface CursorCanvasLayerProps {
  onIntroComplete: () => void;
  /** 播放 / 暂停搭建与光标运动 */
  playing?: boolean;
  /** 搭建速度倍数（0.25–2） */
  speed?: number;
  /** 跳过环绕与页面拉框，直接开始搭建 */
  skipIntro?: boolean;
  /** 阶段切换回调 */
  onPhaseChange?: (phase: IntroPhase) => void;
  /** 用户主动重播时触发 */
  onReplay?: () => void;
  /** 场景建议高度（本页锁定视口，仅作 API 对齐） */
  height?: number;
  /** 覆盖系统的减少动效偏好 */
  reducedMotion?: boolean;
}

function phaseOf(t: number): IntroPhase {
  if (t < T_INTRO) return "intro";
  if (t < T_BURST) return "burst";
  if (t < T_BOARD) return "board";
  return "build";
}

export function CursorCanvasLayer({
  onIntroComplete,
  playing = true,
  speed = 1,
  skipIntro = false,
  onPhaseChange,
  onReplay,
  height = 760,
  reducedMotion,
}: CursorCanvasLayerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const clockRef = useRef(skipIntro ? T_BOARD : 0);
  const lastTimeRef = useRef(0);
  const resumeAtRef = useRef(0);
  const exitingRef = useRef(false);
  const rafRef = useRef(0);
  const playingRef = useRef(playing);
  const speedRef = useRef(clamp(speed, 0.25, 2));
  const phaseRef = useRef<IntroPhase>(phaseOf(skipIntro ? T_BOARD : 0));
  const [exiting, setExiting] = useState(false);
  const exitedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(playing);

  const systemReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reduced = reducedMotion ?? systemReduced;

  playingRef.current = isPlaying;
  speedRef.current = clamp(speed, 0.25, 2);

  const finish = useCallback(() => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    setExiting(true);
  }, []);

  const completeExit = useCallback(() => {
    if (!exitingRef.current || exitedRef.current) return;
    exitedRef.current = true;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    onIntroComplete();
  }, [onIntroComplete]);

  const syncChrome = useCallback(
    (t: number) => {
      const next = phaseOf(t);
      if (next !== phaseRef.current) {
        phaseRef.current = next;
        onPhaseChange?.(next);
      }
    },
    [onPhaseChange],
  );

  const replay = useCallback(() => {
    clockRef.current = 0;
    exitingRef.current = false;
    exitedRef.current = false;
    setExiting(false);
    setIsPlaying(true);
    resumeAtRef.current = 0;
    onReplay?.();
    const scene = sceneRef.current;
    if (scene) {
      render(scene, 0);
      syncChrome(0);
    }
  }, [onReplay, syncChrome]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const scene = measure(root, canvas);
    if (!scene) return;
    sceneRef.current = scene;
    render(scene, clockRef.current);
    syncChrome(clockRef.current);
  }, [syncChrome]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    if (reduced) {
      clockRef.current = T_TOTAL;
      const scene = sceneRef.current;
      if (scene) render(scene, T_TOTAL);
      finish();
      return;
    }

    const step = (now: number) => {
      const scene = sceneRef.current;
      if (!scene || exitedRef.current) return;
      const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      if (playingRef.current && now > resumeAtRef.current) {
        // 退场期间时钟继续走，让空闲光标在渐隐中保持漂移
        clockRef.current += dt * speedRef.current;
      }
      render(scene, clockRef.current);
      syncChrome(Math.min(clockRef.current, T_TOTAL));

      if (clockRef.current >= T_TOTAL) finish();
      rafRef.current = requestAnimationFrame(step);
    };

    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(step);

    const onWheel = (event: WheelEvent) => {
      if (exitingRef.current) return;
      const scene = sceneRef.current;
      if (!scene) return;
      clockRef.current = Math.max(0, Math.min(T_TOTAL, clockRef.current + event.deltaY * 0.0016));
      resumeAtRef.current = performance.now() + 1600;
      render(scene, clockRef.current);
      syncChrome(clockRef.current);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        clockRef.current = T_TOTAL;
        const scene = sceneRef.current;
        if (scene) render(scene, T_TOTAL);
        finish();
        return;
      }
      if (event.key === " " || event.key === "p" || event.key === "P") {
        event.preventDefault();
        setIsPlaying((v) => !v);
        return;
      }
      if (event.key === "r" || event.key === "R") {
        replay();
      }
    };

    const onResize = () => {
      const next = measure(root, canvas);
      if (next) {
        sceneRef.current = next;
        render(next, clockRef.current);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [finish, reduced, replay, syncChrome]);

  return (
    <motion.div
      ref={rootRef}
      aria-hidden="true"
      role="presentation"
      initial={false}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: reduced ? 0.2 : EXIT_FADE, ease: "easeInOut" }}
      onAnimationComplete={() => {
        completeExit();
      }}
      data-scene-height={height}
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden bg-canvas"
    >
      <div className="absolute inset-0 bg-[radial-gradient(#E4DED4_1px,transparent_1px)] [background-size:26px_26px] opacity-60" />

      <div data-intro-shell="" className="absolute inset-0">
        <div data-page-frame="" className="h-full w-full">
          <PageShell />
        </div>
      </div>

      <canvas ref={canvasRef} className="absolute inset-0 z-20 h-full w-full" />
    </motion.div>
  );
}
