"use client";

import { useId } from "react";
import type { DesignConfig, TextLine } from "@/lib/types";
import { VIEWBOX, fontFamilyFor, gradientStops, type Shape } from "./constants";

interface PlatePreviewProps {
  config: DesignConfig;
  svgRef?: React.Ref<SVGSVGElement>;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Layout helpers                                                      */
/* ------------------------------------------------------------------ */

function fontSizeFor(line: TextLine, shape: Shape): number {
  const size = Math.min(10, Math.max(1, line.size));
  switch (shape) {
    case "rectangle":
      return 18 + size * 7;
    case "wide":
      return 14 + size * 6;
    case "round":
      return 16 + size * 6;
  }
}

/** Rough width estimate so overly long lines get compressed via textLength. */
function estimateWidth(line: TextLine, fontSize: number): number {
  const factor = line.font === "script" ? 0.5 : line.font === "bengali" ? 0.62 : 0.6;
  return line.text.length * fontSize * factor * (line.bold ? 1.05 : 1);
}

function usableWidth(shape: Shape, yCenter: number): number {
  if (shape === "round") {
    const { w, h } = VIEWBOX.round;
    const cx = w / 2;
    const cy = h / 2;
    const rInner = cx - 20 - 46; // plate radius minus inner padding
    const dy = yCenter - cy;
    return 2 * Math.sqrt(Math.max(0, rInner * rInner - dy * dy)) * 0.94;
  }
  const { w } = VIEWBOX[shape];
  return w - 170;
}

/* ------------------------------------------------------------------ */
/* Decorative corner flourish (drawn for a top-left corner at 0,0)     */
/* ------------------------------------------------------------------ */

const FLOURISH_ARC = "M6 78 C6 38 38 6 78 6";
const FLOURISH_SWIRL_A =
  "M6 78 C12 52 26 38 50 34 C62 32 70 36 72 44 C74 52 66 58 59 55 C52 52 52 43 59 39";
const FLOURISH_SWIRL_B =
  "M78 6 C52 12 38 26 34 50 C32 62 36 70 44 72 C52 74 58 66 55 59 C52 52 43 52 39 59";

function Flourish({ gradId }: { gradId: string }) {
  return (
    <g stroke={`url(#${gradId})`} strokeWidth={3.5} fill="none" strokeLinecap="round">
      <path d={FLOURISH_ARC} />
      <path d={FLOURISH_SWIRL_A} />
      <path d={FLOURISH_SWIRL_B} />
      <circle cx={70} cy={70} r={3.5} fill={`url(#${gradId})`} stroke="none" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Icons (each drawn in a 100x100 box)                                 */
/* ------------------------------------------------------------------ */

function HouseIcon({ gradId }: { gradId: string }) {
  return (
    <g
      stroke={`url(#${gradId})`}
      strokeWidth={5}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 52 L50 18 L88 52" />
      <path d="M68 30 V14 H78 V39" />
      <path d="M24 48 V86 H76 V48" />
      <path d="M42 86 V66 A8 8 0 0 1 58 66 V86" />
    </g>
  );
}

function MosqueIcon({ gradId, bgColor }: { gradId: string; bgColor: string }) {
  return (
    <g fill={`url(#${gradId})`}>
      {/* finial + dome */}
      <rect x={48.5} y={8} width={3} height={10} rx={1.5} />
      <circle cx={50} cy={7} r={3} />
      <path d="M50 16 C32 28 26 42 26 52 H74 C74 42 68 28 50 16 Z" />
      {/* base */}
      <rect x={20} y={56} width={60} height={30} rx={2} />
      {/* minarets */}
      <rect x={6} y={42} width={8} height={44} rx={2} />
      <path d="M10 30 L15 42 H5 Z" />
      <rect x={86} y={42} width={8} height={44} rx={2} />
      <path d="M90 30 L95 42 H85 Z" />
      {/* door cut-out */}
      <path d="M43 86 V70 A7 7 0 0 1 57 70 V86 Z" fill={bgColor} />
    </g>
  );
}

function FlowerIcon({ gradId, bgColor }: { gradId: string; bgColor: string }) {
  return (
    <g>
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <ellipse
          key={angle}
          cx={50}
          cy={26}
          rx={11}
          ry={22}
          fill={`url(#${gradId})`}
          transform={`rotate(${angle} 50 50)`}
        />
      ))}
      <circle cx={50} cy={50} r={9} fill={bgColor} stroke={`url(#${gradId})`} strokeWidth={3} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function PlatePreview({ config, svgRef, className }: PlatePreviewProps) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gradId = `nzGrad${rawId}`;
  const sheenId = `nzSheen${rawId}`;

  const { shape, bgColor, textColor, border, icon } = config;
  const vb = VIEWBOX[shape];
  const cx = vb.w / 2;
  const cy = vb.h / 2;
  const stops = gradientStops(textColor);

  const isRound = shape === "round";
  const plateInset = 20;
  const radius = isRound ? cx - plateInset : 0;

  /* ----- vertical layout of icon + text lines ----- */
  const visibleLines = config.lines.filter((l) => l.text.trim().length > 0);
  const lineHeights = visibleLines.map((l) => fontSizeFor(l, shape) * 1.32);
  const iconSize = icon === "none" ? 0 : icon === "bismillah" ? (shape === "wide" ? 54 : 64) : shape === "wide" ? 76 : 92;
  const iconGap = icon === "none" ? 0 : 20;
  const totalH = iconSize + iconGap + lineHeights.reduce((a, b) => a + b, 0);
  let cursorY = Math.max((vb.h - totalH) / 2, plateInset + 34);

  const iconCenterY = cursorY + iconSize / 2;
  if (icon !== "none") cursorY += iconSize + iconGap;

  const lineNodes = visibleLines.map((line, i) => {
    const fs = fontSizeFor(line, shape);
    const h = lineHeights[i];
    const yCenter = cursorY + h / 2;
    cursorY += h;
    const maxW = usableWidth(shape, yCenter);
    const est = estimateWidth(line, fs);
    const squeeze = est > maxW;
    return (
      <text
        key={line.id}
        x={cx}
        y={yCenter}
        textAnchor="middle"
        dominantBaseline="central"
        fill={`url(#${gradId})`}
        fontSize={fs}
        fontWeight={line.bold ? 700 : 400}
        fontFamily={fontFamilyFor(line.font)}
        {...(squeeze ? { textLength: maxW, lengthAdjust: "spacingAndGlyphs" as const } : {})}
      >
        {line.text}
      </text>
    );
  });

  /* ----- border decorations ----- */
  const frameInset = plateInset + 16;
  const borderNodes: React.ReactNode[] = [];
  if (border === "frame" || border === "double") {
    borderNodes.push(
      isRound ? (
        <circle key="f1" cx={cx} cy={cy} r={radius - 16} fill="none" stroke={`url(#${gradId})`} strokeWidth={2.5} />
      ) : (
        <rect
          key="f1"
          x={frameInset}
          y={frameInset}
          width={vb.w - frameInset * 2}
          height={vb.h - frameInset * 2}
          rx={10}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={2.5}
        />
      )
    );
  }
  if (border === "double") {
    const inset2 = plateInset + 28;
    borderNodes.push(
      isRound ? (
        <circle key="f2" cx={cx} cy={cy} r={radius - 28} fill="none" stroke={`url(#${gradId})`} strokeWidth={1.5} />
      ) : (
        <rect
          key="f2"
          x={inset2}
          y={inset2}
          width={vb.w - inset2 * 2}
          height={vb.h - inset2 * 2}
          rx={6}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={1.5}
        />
      )
    );
  }
  if (border === "corners") {
    if (isRound) {
      const d = (radius - 26) * 0.7071;
      borderNodes.push(
        ...[0, 90, 180, 270].map((angle) => (
          <g key={`c${angle}`} transform={`rotate(${angle} ${cx} ${cy}) translate(${cx - d} ${cy - d})`}>
            <Flourish gradId={gradId} />
          </g>
        ))
      );
    } else {
      const o = plateInset + 14;
      const transforms = [
        `translate(${o} ${o})`,
        `translate(${vb.w - o} ${o}) scale(-1 1)`,
        `translate(${o} ${vb.h - o}) scale(1 -1)`,
        `translate(${vb.w - o} ${vb.h - o}) scale(-1 -1)`,
      ];
      borderNodes.push(
        ...transforms.map((t, i) => (
          <g key={`c${i}`} transform={t}>
            <Flourish gradId={gradId} />
          </g>
        ))
      );
    }
  }

  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${vb.w} ${vb.h}`}
      className={className}
      role="img"
      aria-label="Nameplate live preview"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stops.top} />
          <stop offset="50%" stopColor={stops.mid} />
          <stop offset="100%" stopColor={stops.bottom} />
        </linearGradient>
        <linearGradient id={sheenId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.16} />
          <stop offset="48%" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity={0.05} />
        </linearGradient>
      </defs>

      {/* Plate */}
      {isRound ? (
        <>
          <circle cx={cx} cy={cy} r={radius} fill={bgColor} stroke={`url(#${gradId})`} strokeWidth={3} />
          <circle cx={cx} cy={cy} r={radius - 1.5} fill={`url(#${sheenId})`} />
        </>
      ) : (
        <>
          <rect
            x={plateInset}
            y={plateInset}
            width={vb.w - plateInset * 2}
            height={vb.h - plateInset * 2}
            rx={18}
            fill={bgColor}
            stroke={`url(#${gradId})`}
            strokeWidth={3}
          />
          <rect
            x={plateInset + 1.5}
            y={plateInset + 1.5}
            width={vb.w - plateInset * 2 - 3}
            height={vb.h - plateInset * 2 - 3}
            rx={17}
            fill={`url(#${sheenId})`}
          />
        </>
      )}

      {borderNodes}

      {/* Top icon */}
      {icon === "bismillah" && (
        <text
          x={cx}
          y={iconCenterY}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={iconSize * 0.78}
          fontFamily="'Playfair Display', 'Times New Roman', serif"
          fill={`url(#${gradId})`}
        >
          {"﷽"}
        </text>
      )}
      {icon !== "none" && icon !== "bismillah" && (
        <g
          transform={`translate(${cx - iconSize / 2} ${iconCenterY - iconSize / 2}) scale(${iconSize / 100})`}
        >
          {icon === "house" && <HouseIcon gradId={gradId} />}
          {icon === "mosque" && <MosqueIcon gradId={gradId} bgColor={bgColor} />}
          {icon === "flower" && <FlowerIcon gradId={gradId} bgColor={bgColor} />}
        </g>
      )}

      {/* Text lines */}
      {lineNodes}
    </svg>
  );
}
