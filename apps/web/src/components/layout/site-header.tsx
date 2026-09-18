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
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";

const labels: Record<
  Language,
  {
    about: string;
    program: string;
    news: string;
    login: string;
    register: string;
    submissionForm: string;
    logout: string;
    participant: string;
    operator: string;
    admin: string;
    cms: string;
    portal: string;
    menu: string;
    close: string;
    loggingOut: string;
  }
> = {
  id: {
    about: "Tentang",
    program: "Program",
    news: "Berita",
    login: "Masuk",
    register: "Daftar",
    submissionForm: "Buka Formulir Pengajuan",
    logout: "Keluar",
    participant: "Peserta",
    operator: "Operator",
    admin: "Admin",
    cms: "CMS",
    portal: "Portal Peserta",
    menu: "Buka menu navigasi",
    close: "Tutup menu navigasi",
    loggingOut: "Keluar...",
  },
  en: {
    about: "About",
    program: "Program",
    news: "News",
    login: "Login",
    register: "Register",
    submissionForm: "Open Submission Form",
    logout: "Logout",
    participant: "Participant",
    operator: "Operator",
    admin: "Admin",
    cms: "CMS",
    portal: "Participant Portal",
    menu: "Open navigation menu",
    close: "Close navigation menu",
    loggingOut: "Signing out...",
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

function getRoleLabel(
  role: "PARTICIPANT" | "OPERATOR" | "ADMIN",
  t: (typeof labels)[Language],
) {
  if (role === "ADMIN") {
    return t.admin;
  }

  if (role === "OPERATOR") {
    return t.operator;
  }

  return t.participant;
}

function AccountInfo({
  name,
  email,
  roleLabel,
  mobile = false,
}: {
  name: string;
  email: string;
  roleLabel: string;
  mobile?: boolean;
}) {
  if (mobile) {
    return (
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-jidex-navy">
            {name}
          </p>

          <span className="shrink-0 rounded-full bg-jidex-surface px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-jidex-navy">
            {roleLabel}
          </span>
        </div>

        <p
          className="mt-1 truncate text-xs font-medium text-jidex-text-muted"
          title={email}
        >
          {email}
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-0 max-w-[230px]">
      <div className="flex items-center gap-2">
        <span
          className="truncate text-sm font-semibold text-jidex-navy"
          title={name}
        >
          {name}
        </span>

        <span className="shrink-0 rounded-full bg-jidex-surface px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-jidex-navy">
          {roleLabel}
        </span>
      </div>

      <p
        className="mt-0.5 truncate text-[11px] font-medium text-jidex-text-muted"
        title={email}
      >
        {email}
      </p>
    </div>
  );
}

export function SiteHeader() {
  const router = useRouter();
  const { language } = useLanguage();
  const { user, loading, logout } = useAuth();
  const t = labels[language];

  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const go = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    try {
      setLoggingOut(true);
      setOpen(false);
      await logout();
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  const isStaff =
    user?.role === "OPERATOR" ||
    user?.role === "ADMIN";

  const isParticipant = user?.role === "PARTICIPANT";
  const googleFormUrl =
    process.env.NEXT_PUBLIC_JIDEX_GOOGLE_FORM_URL || "";

  const roleLabel = user
    ? getRoleLabel(user.role, t)
    : "";

  return (
    <header className="sticky top-0 z-50 border-b border-jidex-border/60 bg-white/95 backdrop-blur-xl">
      <Container>
        <nav className="flex min-h-[70px] items-center justify-between gap-5">
          <Link
            href="/"
            aria-label="JIDEX 2026"
            className="shrink-0"
            onClick={() => setOpen(false)}
          >
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
              <Link
                href="/about"
                className="transition-colors hover:text-jidex-orange"
              >
                {t.about}
              </Link>

              <Link
                href="/program"
                className="transition-colors hover:text-jidex-orange"
              >
                {t.program}
              </Link>

              <Link
                href="/news"
                className="transition-colors hover:text-jidex-orange"
              >
                {t.news}
              </Link>
            </div>

            <div className="h-6 w-px bg-jidex-border" />

            <LanguageSwitcher />

            {loading ? (
              <div className="h-10 w-44 animate-pulse rounded-full bg-slate-100" />
            ) : user ? (
              <div className="flex items-center gap-2">
                {isParticipant ? (
                  <button
                    type="button"
                    onClick={() => go("/participant")}
                    title={t.portal}
                    className="rounded-full border border-jidex-border bg-white px-4 py-2 text-left transition hover:border-jidex-blue-light hover:bg-jidex-surface"
                  >
                    <AccountInfo
                      name={user.name}
                      email={user.email}
                      roleLabel={roleLabel}
                    />
                  </button>
                ) : (
                  <div className="rounded-full border border-jidex-border bg-white px-4 py-2">
                    <AccountInfo
                      name={user.name}
                      email={user.email}
                      roleLabel={roleLabel}
                    />
                  </div>
                )}

                {isStaff && (
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => go("/operator/news")}
                  >
                    {t.cms}
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => void handleLogout()}
                  disabled={loggingOut}
                >
                  {loggingOut ? t.loggingOut : t.logout}
                </Button>
              </div>
            ) : (
              <>
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
                  onClick={() => {
                    if (isParticipant && googleFormUrl) {
                      window.open(googleFormUrl, "_blank", "noopener,noreferrer");
                      return;
                    }
                    go("/register");
                  }}
                >
                  {isParticipant ? t.submissionForm : t.register}
                </Button>
              </>
            )}
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

              {!loading && user && (
                <div className="mt-2 rounded-2xl border border-jidex-border bg-jidex-surface/50 p-4">
                  <AccountInfo
                    name={user.name}
                    email={user.email}
                    roleLabel={roleLabel}
                    mobile
                  />

                  <div className="mt-3 grid gap-2">
                    {isParticipant && (
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        className="w-full"
                        onClick={() => go("/participant")}
                      >
                        {t.portal}
                      </Button>
                    )}

                    {isStaff && (
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        className="w-full"
                        onClick={() => go("/operator/news")}
                      >
                        {t.cms}
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      className="w-full"
                      onClick={() => void handleLogout()}
                      disabled={loggingOut}
                    >
                      {loggingOut ? t.loggingOut : t.logout}
                    </Button>
                  </div>
                </div>
              )}

              {!loading && !user && (
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
                    onClick={() => {
                      if (isParticipant && googleFormUrl) {
                        window.open(googleFormUrl, "_blank", "noopener,noreferrer");
                        setOpen(false);
                        return;
                      }
                      go("/register");
                    }}
                  >
                    {isParticipant ? t.submissionForm : t.register}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}
