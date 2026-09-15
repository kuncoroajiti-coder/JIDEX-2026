"use client";

import Link from "next/link";
import { useLanguage, type Language } from "@/components/i18n/language-provider";
import { Button } from "@/components/ui/button";

const copy: Record<Language, Record<string, string>> = {
  id: {
    aboutTitle: "Tentang JIDEX",
    aboutText: "Halaman informasi JIDEX 2026. Konten lengkap akan dikelola melalui CMS pada tahap integrasi konten.",
    programTitle: "Program JIDEX 2026",
    programText: "Temukan Exhibition, Conference & FGD, dan Fashion Show JIDEX 2026.",
    newsTitle: "News & Updates",
    newsText: "Informasi dan berita JIDEX 2026 akan tersedia di halaman ini.",
    loginTitle: "Masuk",
    loginText: "Halaman masuk peserta, operator, dan admin.",
    registerTitle: "Daftar sebagai Peserta",
    registerText: "Halaman pendaftaran peserta JIDEX 2026.",
    home: "Kembali ke Beranda",
  },
  en: {
    aboutTitle: "About JIDEX",
    aboutText: "JIDEX 2026 information page. Full content will be managed through the CMS in the content integration stage.",
    programTitle: "JIDEX 2026 Program",
    programText: "Explore the JIDEX 2026 Exhibition, Conference & FGD, and Fashion Show.",
    newsTitle: "News & Updates",
    newsText: "JIDEX 2026 news and information will be available on this page.",
    loginTitle: "Login",
    loginText: "Login page for participants, operators, and administrators.",
    registerTitle: "Register as Participant",
    registerText: "JIDEX 2026 participant registration page.",
    home: "Back to Home",
  },
};

type PageKind = "about" | "program" | "news" | "login" | "register";

export function BasicPage({ kind }: { kind: PageKind }) {
  const { language } = useLanguage();
  const t = copy[language];
  const title = t[`${kind}Title`];
  const text = t[`${kind}Text`];

  return (
    <main className="min-h-[calc(100vh-70px)] bg-jidex-background">
      <section className="section-jidex">
        <div className="container-jidex">
          <div className="max-w-3xl rounded-[28px] border border-jidex-border bg-white p-8 shadow-jidex-soft sm:p-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-jidex-orange">
              JIDEX 2026
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-jidex-navy sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-jidex-text-muted sm:text-base">
              {text}
            </p>
            <div className="mt-7">
              <Link href="/">
                <Button variant="outline">{t.home}</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
