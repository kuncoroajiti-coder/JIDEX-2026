"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Container } from "@/components/layout/container";
import {
  type Language,
  useLanguage,
} from "@/components/i18n/language-provider";
import { Button } from "@/components/ui/button";

const labels: Record<
  Language,
  {
    about: string;
    program: string;
    news: string;
    login: string;
    register: string;
    menu: string;
    close: string;
  }
> = {
  id: {
    about: "Tentang",
    program: "Program",
    news: "Berita",
    login: "Masuk",
    register: "Daftar",
    menu: "Buka menu navigasi",
    close: "Tutup menu navigasi",
  },
  en: {
    about: "About",
    program: "Program",
    news: "News",
    login: "Login",
    register: "Register",
    menu: "Open navigation menu",
    close: "Close navigation menu",
  },
};

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className="inline-flex items-center rounded-full border border-jidex-blue-light/70 bg-white/95 p-1 shadow-sm"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLanguage("id")}
        aria-pressed={language === "id"}
        className={`inline-flex min-w-[58px] items-center justify-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
          language === "id"
            ? "bg-jidex-navy text-white shadow-sm"
            : "text-jidex-text-muted hover:text-jidex-navy"
        }`}
      >
        <span aria-hidden="true" className="text-sm leading-none">
          🇮🇩
        </span>
        <span>ID</span>
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
        className={`inline-flex min-w-[58px] items-center justify-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
          language === "en"
            ? "bg-jidex-navy text-white shadow-sm"
            : "text-jidex-text-muted hover:text-jidex-navy"
        }`}
      >
        <span aria-hidden="true" className="text-sm leading-none">
          🇬🇧
        </span>
        <span>EN</span>
      </button>
    </div>
  );
}

export function SiteHeader() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = labels[language];
  const [open, setOpen] = useState(false);

  const go = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-jidex-border/60 bg-white/95 backdrop-blur-xl">
      <Container>
        <nav className="flex min-h-[70px] items-center justify-between gap-5">
          <Link href="/" aria-label="JIDEX 2026" className="shrink-0">
            <Image
              src="/assets/jidex-monocolor.png"
              alt="JIDEX 2026"
              width={180}
              height={90}
              className="h-auto w-[55px] object-contain sm:w-[63px]"
              priority
            />
          </Link>

          <div className="hidden items-center gap-5 md:flex">
            <div className="flex items-center gap-6 text-sm font-medium text-jidex-navy">
              <Link href="/about" className="transition-colors hover:text-jidex-orange">
                {t.about}
              </Link>
              <Link href="/program" className="transition-colors hover:text-jidex-orange">
                {t.program}
              </Link>
              <Link href="/news" className="transition-colors hover:text-jidex-orange">
                {t.news}
              </Link>
            </div>

            <div className="h-6 w-px bg-jidex-border" />
            <LanguageSwitcher />

            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => go("/login")}
            >
              {t.login}
            </Button>
            <Button
              size="sm"
              type="button"
              onClick={() => go("/register")}
            >
              {t.register}
            </Button>
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <LanguageSwitcher />
            <button
              type="button"
              aria-label={open ? t.close : t.menu}
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-jidex-border text-jidex-navy"
            >
              <span className="flex w-4 flex-col gap-1">
                <span className="h-px w-full bg-current" />
                <span className="h-px w-full bg-current" />
                <span className="h-px w-full bg-current" />
              </span>
            </button>
          </div>
        </nav>

        {open && (
          <div className="border-t border-jidex-border/60 py-4 md:hidden">
            <div className="grid gap-2 text-sm font-semibold text-jidex-navy">
              <Link
                href="/about"
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 hover:bg-jidex-surface"
              >
                {t.about}
              </Link>
              <Link
                href="/program"
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 hover:bg-jidex-surface"
              >
                {t.program}
              </Link>
              <Link
                href="/news"
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 hover:bg-jidex-surface"
              >
                {t.news}
              </Link>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  className="w-full"
                  onClick={() => go("/login")}
                >
                  {t.login}
                </Button>
                <Button
                  size="sm"
                  type="button"
                  className="w-full"
                  onClick={() => go("/register")}
                >
                  {t.register}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}
