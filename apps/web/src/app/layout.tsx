import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jidex-sans",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-jidex-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "JIDEX 2026 — Jakarta International Design Exhibition",
  description:
    "JIDEX 2026 — Connecting Ideas, Cultures and Futures. Jakarta International Design Exhibition.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${jakartaSans.variable} ${cormorant.variable}`}
    >
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
