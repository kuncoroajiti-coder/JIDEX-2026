"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useLanguage, type Language } from "@/components/i18n/language-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";

const copy: Record<
  Language,
  {
    title: string;
    description: string;
    email: string;
    password: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    submit: string;
    submitting: string;
    registerPrompt: string;
    registerLink: string;
    home: string;
    loading: string;
    invalid: string;
  }
> = {
  id: {
    title: "Masuk",
    description:
      "Masuk ke akun JIDEX 2026 sebagai peserta, operator, atau admin.",
    email: "Email",
    password: "Password",
    emailPlaceholder: "nama@email.com",
    passwordPlaceholder: "Masukkan password",
    submit: "Masuk",
    submitting: "Memproses...",
    registerPrompt: "Belum memiliki akun?",
    registerLink: "Daftar sebagai Peserta",
    home: "Kembali ke Beranda",
    loading: "Memeriksa sesi...",
    invalid: "Email atau password tidak valid.",
  },
  en: {
    title: "Login",
    description:
      "Sign in to your JIDEX 2026 account as a participant, operator, or administrator.",
    email: "Email",
    password: "Password",
    emailPlaceholder: "name@email.com",
    passwordPlaceholder: "Enter your password",
    submit: "Login",
    submitting: "Signing in...",
    registerPrompt: "Don't have an account?",
    registerLink: "Register as Participant",
    home: "Back to Home",
    loading: "Checking session...",
    invalid: "Invalid email or password.",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { user, loading, login } = useAuth();

  const t = copy[language];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading || !user) {
      return;
    }

    if (user.role === "OPERATOR" || user.role === "ADMIN") {
      router.replace("/operator/news");
      return;
    }

    router.replace("/");
  }, [loading, user, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password) {
      setError(t.invalid);
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const loggedInUser = await login(
        email.trim(),
        password,
      );

      if (
        loggedInUser.role === "OPERATOR" ||
        loggedInUser.role === "ADMIN"
      ) {
        router.replace("/operator/news");
      } else {
        router.replace("/");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t.invalid,
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || user) {
    return (
      <main className="min-h-[calc(100vh-70px)] bg-jidex-background">
        <section className="section-jidex">
          <div className="container-jidex">
            <div className="mx-auto max-w-2xl rounded-[28px] border border-jidex-border bg-white p-8 shadow-jidex-soft sm:p-12">
              <p className="text-sm text-jidex-text-muted">
                {t.loading}
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-70px)] bg-jidex-background">
      <section className="section-jidex">
        <div className="container-jidex">
          <div className="mx-auto max-w-2xl rounded-[28px] border border-jidex-border bg-white p-8 shadow-jidex-soft sm:p-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-jidex-orange">
              JIDEX 2026
            </p>

            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-jidex-navy sm:text-5xl">
              {t.title}
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-jidex-text-muted sm:text-base">
              {t.description}
            </p>

            {error && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-jidex-navy"
                >
                  {t.email}
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder={t.emailPlaceholder}
                  disabled={submitting}
                  required
                  className="w-full rounded-xl border border-jidex-border bg-white px-4 py-3 text-jidex-navy outline-none transition placeholder:text-slate-400 focus:border-jidex-navy focus:ring-2 focus:ring-jidex-navy/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-jidex-navy"
                >
                  {t.password}
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder={t.passwordPlaceholder}
                  disabled={submitting}
                  required
                  className="w-full rounded-xl border border-jidex-border bg-white px-4 py-3 text-jidex-navy outline-none transition placeholder:text-slate-400 focus:border-jidex-navy focus:ring-2 focus:ring-jidex-navy/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full"
              >
                {submitting ? t.submitting : t.submit}
              </Button>
            </form>

            <div className="mt-7 border-t border-jidex-border pt-6 text-center">
              <p className="text-sm text-jidex-text-muted">
                {t.registerPrompt}{" "}
                <Link
                  href="/register"
                  className="font-semibold text-jidex-navy hover:underline"
                >
                  {t.registerLink}
                </Link>
              </p>

              <div className="mt-5">
                <Link href="/">
                  <Button variant="outline">
                    {t.home}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
