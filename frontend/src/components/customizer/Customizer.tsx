"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowRight,
  Ban,
  Bold,
  Check,
  Download,
  Flower2,
  Home,
  Loader2,
  MoonStar,
  Plus,
  ShoppingCart,
  Sparkles,
  Trash2,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/store/cart";
import type { CustomDesign, DesignConfig, TextLine } from "@/lib/types";
import PlatePreview from "./PlatePreview";
import {
  FONT_OPTIONS,
  LETTER_COLORS,
  LINE_PLACEHOLDERS,
  MAX_LINES,
  PLATE_COLORS,
  PRESETS,
  SIZE_OPTIONS,
  defaultConfig,
  makeLine,
  priceForConfig,
  type BorderStyle,
  type IconStyle,
  type Shape,
} from "./constants";

/* ------------------------------------------------------------------ */
/* SVG -> PNG serialization                                            */
/* ------------------------------------------------------------------ */

async function svgToPngDataUri(
  svg: SVGSVGElement,
  targetWidth = 1000
): Promise<string | undefined> {
  try {
    const vb = svg.viewBox.baseVal;
    if (!vb || vb.width === 0) return undefined;
    const width = Math.round(targetWidth);
    const height = Math.round((vb.height / vb.width) * targetWidth);

    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", String(width));
    clone.setAttribute("height", String(height));

    const svgString = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    return await new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas 2D context unavailable");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/png"));
        } catch (err) {
          reject(err);
        } finally {
          URL.revokeObjectURL(url);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to rasterize SVG preview"));
      };
      img.src = url;
    });
  } catch {
    return undefined;
  }
}

/* ------------------------------------------------------------------ */
/* Small UI helpers                                                    */
/* ------------------------------------------------------------------ */

function Section({
  title,
  titleBn,
  children,
}: {
  title: string;
  titleBn: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-4 sm:p-5">
      <h3 className="mb-3 flex items-baseline gap-2 text-sm font-semibold uppercase tracking-wide text-ink-800">
        {title}
        <span className="font-bengali text-xs font-medium normal-case tracking-normal text-ink-400">
          {titleBn}
        </span>
      </h3>
      {children}
    </section>
  );
}

function OptionButton({
  active,
  onClick,
  children,
  className = "",
  title,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded-xl border-2 px-3 py-2 text-sm font-medium transition ${
        active
          ? "border-gold-500 bg-gold-50 text-ink-900 shadow-sm"
          : "border-ink-200 bg-white text-ink-600 hover:border-gold-300"
      } ${className}`}
    >
      {children}
    </button>
  );
}

/** Mini plate glyphs for the shape picker. */
function ShapeGlyph({ shape }: { shape: Shape }) {
  return (
    <svg viewBox="0 0 48 32" className="h-8 w-12" aria-hidden="true">
      {shape === "rectangle" && (
        <rect x={10} y={3} width={28} height={26} rx={4} fill="currentColor" />
      )}
      {shape === "wide" && <rect x={3} y={8} width={42} height={16} rx={4} fill="currentColor" />}
      {shape === "round" && <circle cx={24} cy={16} r={13} fill="currentColor" />}
    </svg>
  );
}

/** Mini border-style glyphs. */
function BorderGlyph({ border }: { border: BorderStyle }) {
  const common = { fill: "none", stroke: "currentColor" } as const;
  return (
    <svg viewBox="0 0 48 32" className="h-8 w-12" aria-hidden="true">
      <rect x={2} y={2} width={44} height={28} rx={4} strokeWidth={2} {...common} />
      {border === "frame" && <rect x={8} y={7} width={32} height={18} rx={2} strokeWidth={1.5} {...common} />}
      {border === "double" && (
        <>
          <rect x={7} y={6} width={34} height={20} rx={2} strokeWidth={1.5} {...common} />
          <rect x={11} y={9} width={26} height={14} rx={1.5} strokeWidth={1} {...common} />
        </>
      )}
      {border === "corners" && (
        <g strokeWidth={1.8} strokeLinecap="round" {...common}>
          <path d="M8 12 C8 9 10 7 13 7" />
          <path d="M40 12 C40 9 38 7 35 7" />
          <path d="M8 20 C8 23 10 25 13 25" />
          <path d="M40 20 C40 23 38 25 35 25" />
        </g>
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

const BORDER_OPTIONS: { value: BorderStyle; label: string; labelBn: string }[] = [
  { value: "none", label: "None", labelBn: "নেই" },
  { value: "frame", label: "Frame", labelBn: "ফ্রেম" },
  { value: "corners", label: "Corners", labelBn: "কর্নার" },
  { value: "double", label: "Double", labelBn: "ডাবল" },
];

const ICON_OPTIONS: { value: IconStyle; label: string; labelBn: string }[] = [
  { value: "none", label: "None", labelBn: "নেই" },
  { value: "house", label: "House", labelBn: "বাড়ি" },
  { value: "bismillah", label: "Bismillah", labelBn: "বিসমিল্লাহ" },
  { value: "mosque", label: "Mosque", labelBn: "মসজিদ" },
  { value: "flower", label: "Flower", labelBn: "ফুল" },
];

function IconGlyph({ icon }: { icon: IconStyle }) {
  switch (icon) {
    case "none":
      return <Ban className="h-5 w-5" />;
    case "house":
      return <Home className="h-5 w-5" />;
    case "bismillah":
      return <span className="text-lg leading-none">﷽</span>;
    case "mosque":
      return <MoonStar className="h-5 w-5" />;
    case "flower":
      return <Flower2 className="h-5 w-5" />;
  }
}

export default function Customizer() {
  const [config, setConfig] = useState<DesignConfig>(defaultConfig);
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [savedDesignId, setSavedDesignId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const addItem = useCart((s) => s.addItem);

  const price = priceForConfig(config);
  const derivedTitle = config.lines.find((l) => l.text.trim())?.text.trim() || "Custom Nameplate";

  const update = (patch: Partial<DesignConfig>) => {
    setSavedDesignId(null);
    setConfig((c) => ({ ...c, ...patch }));
  };

  const setShape = (shape: Shape) => {
    if (shape === config.shape) return;
    update({ shape, sizeLabel: SIZE_OPTIONS[shape][0].label });
  };

  const updateLine = (id: string, patch: Partial<TextLine>) => {
    setSavedDesignId(null);
    setConfig((c) => ({
      ...c,
      lines: c.lines.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }));
  };

  const addLine = () => {
    if (config.lines.length >= MAX_LINES) return;
    update({ lines: [...config.lines, makeLine()] });
  };

  const removeLine = (id: string) => {
    if (config.lines.length <= 1) return;
    update({ lines: config.lines.filter((l) => l.id !== id) });
  };

  const applyPreset = (build: () => DesignConfig) => {
    setSavedDesignId(null);
    setConfig(build());
  };

  const handleAddToCart = async () => {
    if (submitting) return;
    if (!config.lines.some((l) => l.text.trim())) {
      toast.error("Please add at least one text line — অন্তত একটি লাইন লিখুন");
      return;
    }
    setSubmitting(true);
    try {
      const previewImage = svgRef.current
        ? await svgToPngDataUri(svgRef.current, 1000)
        : undefined;
      const design = await apiFetch<CustomDesign>("/api/designs", {
        method: "POST",
        body: JSON.stringify({
          title: derivedTitle,
          config,
          previewImage,
          status: "SUBMITTED",
        }),
      });
      addItem({
        key: `design::${design.id}`,
        designId: design.id,
        name: `Custom: ${derivedTitle}`,
        image: previewImage ?? null,
        price,
        size: config.sizeLabel,
        customization: config,
        isCustom: true,
      });
      setSavedDesignId(design.id);
      toast.success("Design added to cart! কার্টে যোগ হয়েছে");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not save design. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async () => {
    if (downloading || !svgRef.current) return;
    setDownloading(true);
    try {
      const dataUri = await svgToPngDataUri(svgRef.current, 1400);
      if (!dataUri) throw new Error("Could not render preview image");
      const a = document.createElement("a");
      a.href = dataUri;
      a.download = "nameplate-preview.png";
      a.click();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-ink-50/50">
      {/* Header strip */}
      <div className="bg-ink-950 py-10 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">
            <Sparkles className="h-3.5 w-3.5" /> Live Customizer
          </p>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            <span className="gold-gradient-text">Design Studio</span>
            <span className="mx-3 text-ink-600">—</span>
            <span className="font-bengali text-white">ডিজাইন স্টুডিও</span>
          </h1>
          <p className="mt-3 text-sm text-ink-300">
            Design your own premium acrylic nameplate and watch it come to life instantly.{" "}
            <span className="font-bengali">
              নিজের নেমপ্লেট নিজেই ডিজাইন করুন — সাথে সাথে প্রিভিউ দেখুন।
            </span>
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* ------------ Live preview (left / top) ------------ */}
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-24">
              <div className="rounded-3xl bg-ink-950 p-4 shadow-2xl shadow-ink-950/30 sm:p-8">
                <div className="mx-auto flex min-h-[280px] max-w-2xl items-center justify-center">
                  <PlatePreview
                    config={config}
                    svgRef={svgRef}
                    className="h-auto w-full drop-shadow-[0_18px_28px_rgba(0,0,0,0.55)]"
                  />
                </div>
                <p className="mt-4 text-center text-xs text-ink-400">
                  Live preview · {config.sizeLabel} ·{" "}
                  <span className="font-bengali">প্রকৃত পণ্যের রঙ সামান্য ভিন্ন হতে পারে</span>
                </p>
              </div>

              {/* Price + actions */}
              <div className="card mt-5 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-ink-500">
                      Estimated Price{" "}
                      <span className="font-bengali text-xs text-ink-400">আনুমানিক মূল্য</span>
                    </p>
                    <p className="font-display text-3xl font-bold text-ink-900">
                      {formatPrice(price)}
                    </p>
                    <p className="mt-1 font-bengali text-xs text-ink-400">
                      চূড়ান্ত মূল্য অর্ডার কনফার্মের সময় জানানো হবে
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleDownload}
                      disabled={downloading}
                      className="btn-dark px-5 py-2.5 text-sm disabled:opacity-60"
                    >
                      {downloading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      Download Preview
                    </button>
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={submitting}
                      className="btn-gold px-5 py-2.5 text-sm disabled:opacity-60"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ShoppingCart className="h-4 w-4" />
                      )}
                      Add to Cart — <span className="font-bengali">কার্টে যোগ করুন</span>
                    </button>
                  </div>
                </div>
                {savedDesignId && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                    <span className="inline-flex items-center gap-2">
                      <Check className="h-4 w-4" /> Design saved and added to your cart.
                    </span>
                    <Link
                      href="/cart"
                      className="inline-flex items-center gap-1 font-semibold text-green-900 underline underline-offset-2 hover:text-green-700"
                    >
                      View Cart <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ------------ Controls (right / bottom) ------------ */}
          <div className="lg:col-span-2">
            <div className="thin-scroll space-y-5 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-2">
              {/* Templates */}
              <section className="card border-gold-200 bg-gradient-to-br from-gold-50 to-white p-4 sm:p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-800">
                  <Sparkles className="h-4 w-4 text-gold-500" />
                  Quick Start{" "}
                  <span className="font-bengali text-xs font-medium normal-case tracking-normal text-ink-400">
                    টেমপ্লেট
                  </span>
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => applyPreset(p.build)}
                      className="rounded-xl border-2 border-ink-200 bg-white px-2 py-2.5 text-center transition hover:border-gold-400 hover:bg-gold-50"
                    >
                      <span className="block text-xs font-semibold text-ink-800">{p.name}</span>
                      <span className="block font-bengali text-[11px] text-ink-400">
                        {p.nameBn}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* 1. Shape */}
              <Section title="Shape" titleBn="আকৃতি">
                <div className="grid grid-cols-3 gap-2">
                  {(["rectangle", "wide", "round"] as const).map((shape) => (
                    <OptionButton
                      key={shape}
                      active={config.shape === shape}
                      onClick={() => setShape(shape)}
                      className="flex flex-col items-center gap-1 py-3"
                    >
                      <span className={config.shape === shape ? "text-gold-600" : "text-ink-400"}>
                        <ShapeGlyph shape={shape} />
                      </span>
                      <span className="capitalize">{shape}</span>
                    </OptionButton>
                  ))}
                </div>
              </Section>

              {/* 2. Size */}
              <Section title="Size" titleBn="সাইজ">
                <div className="flex flex-wrap gap-2">
                  {SIZE_OPTIONS[config.shape].map((opt) => (
                    <OptionButton
                      key={opt.label}
                      active={config.sizeLabel === opt.label}
                      onClick={() => update({ sizeLabel: opt.label })}
                      className="flex-1 py-2.5 text-center"
                    >
                      <span className="block font-semibold">{opt.label}</span>
                      <span
                        className={`block text-xs ${
                          config.sizeLabel === opt.label ? "text-gold-700" : "text-ink-400"
                        }`}
                      >
                        {formatPrice(opt.price)}
                      </span>
                    </OptionButton>
                  ))}
                </div>
              </Section>

              {/* 3. Plate colour */}
              <Section title="Plate Colour" titleBn="প্লেটের রং">
                <div className="grid grid-cols-4 gap-2">
                  {PLATE_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      title={c.name}
                      onClick={() => update({ bgColor: c.value })}
                      className="group flex flex-col items-center gap-1.5"
                    >
                      <span
                        style={{ backgroundColor: c.value }}
                        className={`h-11 w-full rounded-lg border shadow-inner transition ${
                          config.bgColor === c.value
                            ? "border-gold-500 ring-2 ring-gold-400/60 ring-offset-2"
                            : "border-ink-200 group-hover:ring-2 group-hover:ring-gold-200"
                        }`}
                      />
                      <span className="text-center text-[11px] leading-tight text-ink-500">
                        {c.name}
                        <span className="block font-bengali text-[10px] text-ink-400">
                          {c.nameBn}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </Section>

              {/* 4. Letter colour */}
              <Section title="Letter Colour" titleBn="অক্ষরের রং">
                <div className="grid grid-cols-4 gap-2">
                  {LETTER_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      title={c.name}
                      onClick={() => update({ textColor: c.value })}
                      className="group flex flex-col items-center gap-1.5"
                    >
                      <span
                        style={{
                          background: `linear-gradient(180deg, ${c.value}, ${c.value}cc)`,
                        }}
                        className={`h-11 w-full rounded-lg border shadow-inner transition ${
                          config.textColor === c.value
                            ? "border-gold-500 ring-2 ring-gold-400/60 ring-offset-2"
                            : "border-ink-200 group-hover:ring-2 group-hover:ring-gold-200"
                        }`}
                      />
                      <span className="text-center text-[11px] leading-tight text-ink-500">
                        {c.name}
                        <span className="block font-bengali text-[10px] text-ink-400">
                          {c.nameBn}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </Section>

              {/* 5. Border style */}
              <Section title="Border Style" titleBn="বর্ডার">
                <div className="grid grid-cols-4 gap-2">
                  {BORDER_OPTIONS.map((b) => (
                    <OptionButton
                      key={b.value}
                      active={config.border === b.value}
                      onClick={() => update({ border: b.value })}
                      className="flex flex-col items-center gap-1 px-1 py-2.5"
                    >
                      <span className={config.border === b.value ? "text-gold-600" : "text-ink-400"}>
                        <BorderGlyph border={b.value} />
                      </span>
                      <span className="text-xs">{b.label}</span>
                      <span className="font-bengali text-[10px] text-ink-400">{b.labelBn}</span>
                    </OptionButton>
                  ))}
                </div>
              </Section>

              {/* 6. Top icon */}
              <Section title="Top Icon" titleBn="আইকন">
                <div className="grid grid-cols-5 gap-2">
                  {ICON_OPTIONS.map((opt) => (
                    <OptionButton
                      key={opt.value}
                      active={config.icon === opt.value}
                      onClick={() => update({ icon: opt.value })}
                      title={opt.label}
                      className="flex flex-col items-center gap-1 px-1 py-2.5"
                    >
                      <span className={config.icon === opt.value ? "text-gold-600" : "text-ink-400"}>
                        <IconGlyph icon={opt.value} />
                      </span>
                      <span className="text-[10px]">{opt.label}</span>
                    </OptionButton>
                  ))}
                </div>
              </Section>

              {/* 7. Text lines */}
              <Section title="Text Lines" titleBn="লেখা">
                <div className="space-y-3">
                  {config.lines.map((line, idx) => (
                    <div key={line.id} className="rounded-xl border border-ink-200 bg-ink-50/60 p-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={line.text}
                          onChange={(e) => updateLine(line.id, { text: e.target.value })}
                          placeholder={LINE_PLACEHOLDERS[idx % LINE_PLACEHOLDERS.length]}
                          className="input font-bengali"
                          maxLength={60}
                          aria-label={`Line ${idx + 1} text`}
                        />
                        <button
                          type="button"
                          onClick={() => removeLine(line.id)}
                          disabled={config.lines.length <= 1}
                          title="Delete line"
                          className="shrink-0 rounded-lg border border-ink-200 p-2 text-ink-400 transition hover:border-red-300 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <select
                          value={line.font}
                          onChange={(e) => updateLine(line.id, { font: e.target.value })}
                          className="input w-auto flex-1 py-1.5 text-xs"
                          aria-label={`Line ${idx + 1} font`}
                        >
                          {FONT_OPTIONS.map((f) => (
                            <option key={f.value} value={f.value}>
                              {f.label}
                            </option>
                          ))}
                        </select>
                        <label className="flex flex-1 items-center gap-2 text-xs text-ink-500">
                          <span className="shrink-0">Size</span>
                          <input
                            type="range"
                            min={1}
                            max={10}
                            step={1}
                            value={line.size}
                            onChange={(e) =>
                              updateLine(line.id, { size: Number(e.target.value) })
                            }
                            className="h-1.5 w-full min-w-[70px] cursor-pointer accent-gold-500"
                            aria-label={`Line ${idx + 1} size`}
                          />
                          <span className="w-5 text-center font-semibold text-ink-700">
                            {line.size}
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => updateLine(line.id, { bold: !line.bold })}
                          title="Bold"
                          aria-pressed={line.bold}
                          className={`shrink-0 rounded-lg border p-1.5 transition ${
                            line.bold
                              ? "border-gold-500 bg-gold-100 text-gold-700"
                              : "border-ink-200 text-ink-400 hover:border-gold-300"
                          }`}
                        >
                          <Bold className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addLine}
                    disabled={config.lines.length >= MAX_LINES}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-300 py-2.5 text-sm font-medium text-ink-500 transition hover:border-gold-400 hover:text-gold-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                    Add Line — <span className="font-bengali">লাইন যোগ করুন</span>
                    <span className="text-xs text-ink-400">
                      ({config.lines.length}/{MAX_LINES})
                    </span>
                  </button>
                </div>
              </Section>

              {/* 8. Price summary */}
              <section className="card border-gold-300 bg-ink-950 p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-ink-400">
                      Total Estimate{" "}
                      <span className="font-bengali normal-case">মোট আনুমানিক</span>
                    </p>
                    <p className="mt-1 text-sm text-ink-300">
                      {config.shape === "round" ? "Round" : config.shape === "wide" ? "Wide" : "Rectangle"}{" "}
                      · {config.sizeLabel}
                    </p>
                  </div>
                  <p className="gold-gradient-text font-display text-3xl font-bold">
                    {formatPrice(price)}
                  </p>
                </div>
                <p className="mt-3 border-t border-ink-800 pt-3 font-bengali text-xs text-ink-400">
                  চূড়ান্ত মূল্য অর্ডার কনফার্মের সময় জানানো হবে
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
