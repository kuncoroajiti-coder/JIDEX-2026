import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";

import { SiteHeader } from "@/components/layout/site-header";
import { LanguageProvider } from "@/components/i18n/language-provider";

import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jidex-sans",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-jidex-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "JIDEX 2026 — Jakarta International Design Exhibition",
  description:
    "Jakarta International Design Exhibition 2026 — connecting ideas, cultures and futures.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${jakarta.variable} ${cormorant.variable}`}>
        <LanguageProvider>
          <SiteHeader />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
