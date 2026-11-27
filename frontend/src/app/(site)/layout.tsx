import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FacebookPixel from "@/components/FacebookPixel";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <FacebookPixel />
      </Suspense>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
