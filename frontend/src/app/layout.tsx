import type { Metadata } from "next";
import { Poppins, Playfair_Display, Hind_Siliguri, Great_Vibes } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-display",
});

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-bengali",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-script",
});

export const metadata: Metadata = {
  title: {
    default: "Nameplate Zone — Premium Custom Nameplates",
    template: "%s | Nameplate Zone",
  },
  description:
    "Premium custom acrylic nameplates with golden mirror lettering. Design your own nameplate online with live preview — house nameplates, Islamic calligraphy plates, round logo plates and office signs.",
  keywords: ["nameplate", "custom nameplate", "house nameplate", "acrylic nameplate", "Bangladesh"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${playfair.variable} ${hindSiliguri.variable} ${greatVibes.variable} font-sans antialiased`}
      >
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: { background: "#1a1b20", color: "#f6df94", border: "1px solid #96561466" },
          }}
        />
      </body>
    </html>
  );
}
