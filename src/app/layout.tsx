import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import { Fraunces, Urbanist } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { resolveAppUrl } from "@/lib/env";
import "./globals.css";

const urbanist = Urbanist({ variable: "--font-urbanist", subsets: ["latin"], display: "swap" });
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT"],
  weight: "variable",
});

export const metadata: Metadata = {
  metadataBase: new URL(resolveAppUrl()),
  title: { default: "Foodzinder — Dónde comer hoy, sin dar vueltas", template: "%s | Foodzinder" },
  description:
    "Directorio de restaurantes con cartas completas, alérgenos declarados, mapa y reseñas honestas. Madrid, Barcelona, Valencia y Sevilla.",
  openGraph: { type: "website", locale: "es_ES", siteName: "Foodzinder" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      localization={esES}
      appearance={{ variables: { colorPrimary: "#c9305f", colorText: "#2d3436", borderRadius: "0.75rem", fontFamily: "var(--font-urbanist), sans-serif" } }}
    >
      <html lang="es" className={`${urbanist.variable} ${fraunces.variable} h-full antialiased`}>
        <body className="flex min-h-full flex-col font-sans">
          <TooltipProvider>{children}</TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
