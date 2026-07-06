import type { Metadata } from "next";
import Customizer from "@/components/customizer/Customizer";

export const metadata: Metadata = {
  title: "Design Studio",
  description:
    "Design your own premium acrylic nameplate live — choose shape, size, colours, borders, icons and bilingual text, then order instantly.",
};

export default function CustomizePage() {
  return <Customizer />;
}
