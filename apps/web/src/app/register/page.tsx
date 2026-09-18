"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { register } from "@/lib/api";
import { useLanguage } from "@/components/i18n/language-provider";

export default function Page() {
  const { language } = useLanguage();
  const isId = language === "id";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const text = {
    eyebrow: "JIDEX 2026",
    heroTitle: isId
      ? "Menghubungkan Ide, Budaya dan Masa Depan."
      : "Connecting Ideas, Cultures and Futures.",
    heroDescription: isId
      ? "Buat akun peserta untuk mengakses informasi acara dan layanan registrasi JIDEX 2026."
      : "Create your participant account to access JIDEX 2026 event information and registration services.",
    title: isId ? "Daftar sebagai Peserta" : "Register as Participant",
    description: isId
      ? "Buat akun untuk melanjutkan proses registrasi JIDEX 2026."
      : "Create your account to continue with JIDEX 2026.",
    fullName: isId ? "Nama Lengkap" : "Full Name",
    fullNamePlaceholder: isId ? "Masukkan nama lengkap" : "Your full name",
    email: isId ? "Alamat Email" : "Email Address",
    emailPlaceholder: isId ? "nama@contoh.com" : "you@example.com",
    password: "Password",
    passwordPlaceholder: isId
      ? "Minimal 8 karakter"
      : "Minimum 8 characters",
    confirmPassword: isId ? "Konfirmasi Password" : "Confirm Password",
    confirmPasswordPlaceholder: isId
      ? "Ulangi password"
      : "Repeat your password",
    submit: isId
      ? "Buat Akun Peserta"
      : "Create Participant Account",
    submitting: isId ? "Membuat Akun..." : "Creating Account...",
    alreadyAccount: isId
      ? "Sudah memiliki akun?"
      : "Already have an account?",
    login: isId ? "Masuk" : "Login",
    errorName: isId
      ? "Nama minimal 2 karakter."
      : "Name must be at least 2 characters.",
    errorPassword: isId
      ? "Password minimal 8 karakter."
      : "Password must be at least 8 characters.",
    errorConfirm: isId
      ? "Konfirmasi password tidak sama."
      : "Password confirmation does not match.",
    errorDefault: isId
      ? "Registrasi gagal. Silakan coba lagi."
      : "Registration failed. Please try again.",
    success: isId
      ? "Registrasi berhasil. Mengarahkan ke halaman utama..."
      : "Registration successful. Redirecting to the homepage...",
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (name.trim().length < 2) {
      setError(text.errorName);
      return;
    }

    if (password.length < 8) {
      setError(text.errorPassword);
      return;
    }

    if (password !== confirmPassword) {
      setError(text.errorConfirm);
      return;
    }

    setLoading(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      setSuccess(text.success);

      window.setTimeout(() => {
        window.location.assign("/");
      }, 800);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : text.errorDefault,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-white px-5 py-12 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_520px] lg:items-center">
        <section className="hidden lg:block">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-orange-500">
            {text.eyebrow}
          </p>

          <h1 className="max-w-xl font-[var(--font-jidex-display)] text-6xl leading-[0.98] text-[#182f55]">
            {text.heroTitle}
          </h1>

          <p className="mt-7 max-w-lg text-base leading-7 text-slate-600">
            {text.heroDescription}
          </p>

          <div className="mt-10 h-px w-28 bg-orange-400" />
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_20px_60px_rgba(24,47,85,0.08)] sm:p-10">
          <div className="mb-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-orange-500">
              {text.eyebrow}
            </p>

            <h2 className="font-[var(--font-jidex-display)] text-4xl text-[#182f55]">
              {text.title}
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {text.description}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-[#182f55]"
              >
                {text.fullName}
              </label>

              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                minLength={2}
                maxLength={120}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={text.fullNamePlaceholder}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#182f55] focus:bg-white focus:ring-4 focus:ring-[#182f55]/10"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#182f55]"
              >
                {text.email}
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={text.emailPlaceholder}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#182f55] focus:bg-white focus:ring-4 focus:ring-[#182f55]/10"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[#182f55]"
              >
                {text.password}
              </label>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={text.passwordPlaceholder}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#182f55] focus:bg-white focus:ring-4 focus:ring-[#182f55]/10"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-[#182f55]"
              >
                {text.confirmPassword}
              </label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder={text.confirmPasswordPlaceholder}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#182f55] focus:bg-white focus:ring-4 focus:ring-[#182f55]/10"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700"
              >
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#182f55] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#102543] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? text.submitting : text.submit}
            </button>
          </form>

          <div className="mt-7 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
            {text.alreadyAccount}{" "}
            <Link
              href="/login"
              className="font-semibold text-[#182f55] hover:underline"
            >
              {text.login}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
