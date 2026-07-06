import type { DesignConfig, TextLine } from "@/lib/types";

export type Shape = DesignConfig["shape"];
export type BorderStyle = DesignConfig["border"];
export type IconStyle = DesignConfig["icon"];

/* ------------------------------------------------------------------ */
/* Sizes & pricing                                                     */
/* ------------------------------------------------------------------ */

export interface SizeOption {
  label: string;
  price: number;
}

export const SIZE_OPTIONS: Record<Shape, SizeOption[]> = {
  rectangle: [
    { label: '12x18"', price: 2200 },
    { label: '15x22"', price: 3000 },
    { label: '18x26"', price: 3800 },
  ],
  wide: [
    { label: '18x36"', price: 4000 },
    { label: '22x44"', price: 5500 },
  ],
  round: [
    { label: '18" dia', price: 2800 },
    { label: '24" dia', price: 3600 },
  ],
};

export function priceForConfig(config: DesignConfig): number {
  const options = SIZE_OPTIONS[config.shape];
  return options.find((o) => o.label === config.sizeLabel)?.price ?? options[0].price;
}

/* ------------------------------------------------------------------ */
/* Colours                                                             */
/* ------------------------------------------------------------------ */

export interface ColorOption {
  name: string;
  nameBn: string;
  value: string;
}

export const PLATE_COLORS: ColorOption[] = [
  { name: "Jet Black", nameBn: "কালো", value: "#0b0b0e" },
  { name: "Deep Green", nameBn: "সবুজ", value: "#06251c" },
  { name: "Royal Blue", nameBn: "নীল", value: "#0a1836" },
  { name: "Maroon", nameBn: "মেরুন", value: "#2b0a10" },
];

export const LETTER_COLORS: ColorOption[] = [
  { name: "Golden", nameBn: "সোনালী", value: "#eab228" },
  { name: "Silver", nameBn: "সিলভার", value: "#c9ccd6" },
  { name: "Rose Gold", nameBn: "রোজ গোল্ড", value: "#e8a08a" },
  { name: "Pearl White", nameBn: "পার্ল", value: "#f2efe6" },
];

export interface GradientStops {
  top: string;
  mid: string;
  bottom: string;
}

/** Hand-tuned metallic gradients for the selectable letter colours. */
const LETTER_GRADIENTS: Record<string, GradientStops> = {
  "#eab228": { top: "#fdf0bd", mid: "#eab228", bottom: "#93610f" },
  "#c9ccd6": { top: "#ffffff", mid: "#c9ccd6", bottom: "#787e8e" },
  "#e8a08a": { top: "#fbe3d8", mid: "#e8a08a", bottom: "#a85843" },
  "#f2efe6": { top: "#ffffff", mid: "#f2efe6", bottom: "#aaa38c" },
};

function shadeHex(hex: string, amount: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const clamp = (v: number) => Math.min(255, Math.max(0, v));
  const r = clamp((n >> 16) + amount);
  const g = clamp(((n >> 8) & 0xff) + amount);
  const b = clamp((n & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export function gradientStops(color: string): GradientStops {
  return (
    LETTER_GRADIENTS[color.toLowerCase()] ?? {
      top: shadeHex(color, 72),
      mid: color,
      bottom: shadeHex(color, -72),
    }
  );
}

/* ------------------------------------------------------------------ */
/* Fonts                                                               */
/* ------------------------------------------------------------------ */

export interface FontOption {
  value: string;
  label: string;
  family: string;
}

export const FONT_OPTIONS: FontOption[] = [
  { value: "bengali", label: "Bengali — বাংলা", family: "'Hind Siliguri', sans-serif" },
  { value: "serif", label: "Serif — Playfair", family: "'Playfair Display', Georgia, serif" },
  { value: "script", label: "Script — Great Vibes", family: "'Great Vibes', cursive" },
  { value: "sans", label: "Sans — Poppins", family: "Poppins, sans-serif" },
];

export function fontFamilyFor(font: string): string {
  return FONT_OPTIONS.find((f) => f.value === font)?.family ?? FONT_OPTIONS[0].family;
}

/* ------------------------------------------------------------------ */
/* Geometry                                                            */
/* ------------------------------------------------------------------ */

export const VIEWBOX: Record<Shape, { w: number; h: number }> = {
  rectangle: { w: 800, h: 600 },
  wide: { w: 900, h: 440 },
  round: { w: 700, h: 700 },
};

/* ------------------------------------------------------------------ */
/* Lines, defaults & presets                                           */
/* ------------------------------------------------------------------ */

let lineSeq = 0;
export function newLineId(): string {
  lineSeq += 1;
  return `ln-${lineSeq}-${Date.now().toString(36)}`;
}

export function makeLine(partial: Partial<Omit<TextLine, "id">> = {}): TextLine {
  return {
    id: newLineId(),
    text: "",
    font: "bengali",
    size: 5,
    bold: false,
    ...partial,
  };
}

export const MAX_LINES = 7;

export const LINE_PLACEHOLDERS = [
  "প্রসূন ভিলা",
  "স্বত্বাধিকারী",
  "মোঃ রফিকুল ইসলাম",
  "বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা",
  "মোবাইল: ০১৭XXXXXXXX",
  "প্রতিষ্ঠিত ২০২০",
  "স্বাগতম",
];

/** Stable ids so the SSR pass and hydration render identical trees. */
export function defaultConfig(): DesignConfig {
  return {
    shape: "rectangle",
    sizeLabel: SIZE_OPTIONS.rectangle[0].label,
    bgColor: PLATE_COLORS[0].value,
    textColor: LETTER_COLORS[0].value,
    border: "frame",
    icon: "house",
    lines: [
      { id: "default-1", text: "প্রসূন ভিলা", font: "bengali", size: 9, bold: true },
      { id: "default-2", text: "স্বত্বাধিকারী", font: "bengali", size: 4, bold: false },
      { id: "default-3", text: "প্রকৌশলী আরিফুল ইসলাম", font: "bengali", size: 6, bold: false },
      { id: "default-4", text: "বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা", font: "bengali", size: 4, bold: false },
    ],
  };
}

export interface Preset {
  key: string;
  name: string;
  nameBn: string;
  build: () => DesignConfig;
}

export const PRESETS: Preset[] = [
  {
    key: "house-villa",
    name: "House Villa",
    nameBn: "হাউস ভিলা",
    build: () => ({
      shape: "rectangle",
      sizeLabel: SIZE_OPTIONS.rectangle[1].label,
      bgColor: "#0b0b0e",
      textColor: "#eab228",
      border: "frame",
      icon: "house",
      lines: [
        makeLine({ text: "প্রসূন ভিলা", font: "bengali", size: 9, bold: true }),
        makeLine({ text: "স্বত্বাধিকারী", font: "bengali", size: 4 }),
        makeLine({ text: "প্রকৌশলী আরিফুল ইসলাম", font: "bengali", size: 6 }),
        makeLine({ text: "বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা", font: "bengali", size: 4 }),
      ],
    }),
  },
  {
    key: "islamic",
    name: "Islamic",
    nameBn: "ইসলামিক",
    build: () => ({
      shape: "rectangle",
      sizeLabel: SIZE_OPTIONS.rectangle[1].label,
      bgColor: "#06251c",
      textColor: "#eab228",
      border: "double",
      icon: "bismillah",
      lines: [
        makeLine({ text: "আল-মদিনা ভিলা", font: "bengali", size: 9, bold: true }),
        makeLine({ text: "আলহাজ্ব মুহাম্মদ রফিকুল ইসলাম", font: "bengali", size: 5 }),
        makeLine({ text: "রোড ৩, সেকশন ৭, মিরপুর, ঢাকা", font: "bengali", size: 4 }),
      ],
    }),
  },
  {
    key: "business-round",
    name: "Business Round",
    nameBn: "বিজনেস রাউন্ড",
    build: () => ({
      shape: "round",
      sizeLabel: SIZE_OPTIONS.round[0].label,
      bgColor: "#2b0a10",
      textColor: "#f2efe6",
      border: "corners",
      icon: "flower",
      lines: [
        makeLine({ text: "Rahman & Co.", font: "serif", size: 8, bold: true }),
        makeLine({ text: "রহমান এন্ড কোং", font: "bengali", size: 5 }),
        makeLine({ text: "Since 1998", font: "script", size: 4 }),
      ],
    }),
  },
];
