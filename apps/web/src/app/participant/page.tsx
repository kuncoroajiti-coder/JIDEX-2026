"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getCurrentUser,
  getParticipantProfile,
  type AuthUser,
  type ParticipantProfile,
} from "@/lib/api";
import { useLanguage } from "@/components/i18n/language-provider";

const GOOGLE_FORM_URL =
  process.env.NEXT_PUBLIC_JIDEX_GOOGLE_FORM_URL || "";

export default function ParticipantPage() {
  const { language } = useLanguage();
  const isId = language === "id";

  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<ParticipantProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
          window.location.href = "/login?next=/participant";
          return;
        }

        if (currentUser.role !== "PARTICIPANT") {
          window.location.href = "/";
          return;
        }

        if (!active) return;
        setUser(currentUser);

        try {
          const profileData = await getParticipantProfile();

          if (!active) return;
          setProfile(profileData);
        } catch {
          if (!active) return;
          setProfile(null);
        }
      } catch {
        if (!active) return;
        setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8fafc] px-5 pb-24 pt-28 md:px-8 md:pt-32">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[28px] border border-jidex-border bg-white p-8 shadow-sm">
            <p className="text-sm text-slate-500">
              {isId ? "Memuat Portal Peserta..." : "Loading Participant Portal..."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = profile?.fullName || user.name;

  const text = isId
    ? {
        portalLabel: "JIDEX 2026 · Portal Peserta",
        welcome: `Selamat datang, ${displayName}`,
        intro:
          "Kelola informasi peserta dan persiapkan karya Anda untuk pameran internasional JIDEX 2026.",
        participant: "PESERTA",

        account: "Akun",
        profileTitle: "Profil Peserta",
        profileDescription:
          "Informasi yang terhubung dengan akun peserta JIDEX Anda.",
        name: "Nama",
        email: "Email",
        institution: "Institusi",
        editProfile: "Edit Profil · Segera Hadir",

        exhibition: "Pameran",
        submissionTitle: "Pengajuan Karya",
        submissionDescription:
          "Kirimkan karya Anda melalui formulir resmi JIDEX 2026. Setiap peserta dapat mengajukan 1–3 karya.",
        open: "DIBUKA",

        works: "Karya",
        worksValue: "1–3",
        worksDescription: "karya per peserta",

        mainFile: "File Utama",
        mainFileValue: "PDF",
        mainFileDescription: "dokumen karya utama",

        materials: "Materi",
        materialsValue: "Wajib",
        materialsDescription: "materi pendukung",

        beforeStart: "Sebelum Memulai",
        prepareInfo: "Siapkan informasi lengkap untuk setiap karya.",
        prepareFiles:
          "Siapkan PDF karya utama dan seluruh materi pendukung.",
        review:
          "Periksa kembali seluruh informasi sebelum mengirimkan formulir.",

        startSubmission: "Mulai Pengajuan ↗",
        viewProgram: "Lihat Program",
        formNewTab:
          "Formulir pengajuan resmi akan dibuka pada tab baru.",

        guide: "Panduan Pengajuan",
        threeSteps: "Tiga langkah untuk mengirimkan karya Anda",

        step1Title: "Persiapkan",
        step1Description:
          "Siapkan informasi karya, PDF utama, gambar, video, portofolio, dan materi pendukung lainnya.",

        step2Title: "Lengkapi Formulir",
        step2Description:
          "Lengkapi formulir resmi pengajuan JIDEX dengan teliti untuk setiap karya yang diajukan.",

        step3Title: "Kirim",
        step3Description:
          "Periksa jawaban, unggah seluruh materi yang diperlukan, kemudian kirimkan formulir.",

        ready: "Siap mempresentasikan karya Anda?",
        readyDescription:
          "Lanjutkan ke Formulir Pengajuan Karya JIDEX 2026 resmi.",
        openForm: "Buka Formulir Pengajuan ↗",
      }
    : {
        portalLabel: "JIDEX 2026 · Participant Portal",
        welcome: `Welcome, ${displayName}`,
        intro:
          "Manage your participant information and prepare your work for the JIDEX 2026 international exhibition.",
        participant: "PARTICIPANT",

        account: "Account",
        profileTitle: "Participant Profile",
        profileDescription:
          "Information associated with your JIDEX participant account.",
        name: "Name",
        email: "Email",
        institution: "Institution",
        editProfile: "Edit Profile · Coming Soon",

        exhibition: "Exhibition",
        submissionTitle: "Exhibition Submission",
        submissionDescription:
          "Submit your artwork through the official JIDEX 2026 submission form. Each participant may submit 1–3 artworks.",
        open: "OPEN",

        works: "Works",
        worksValue: "1–3",
        worksDescription: "artworks per participant",

        mainFile: "Main File",
        mainFileValue: "PDF",
        mainFileDescription: "main artwork document",

        materials: "Materials",
        materialsValue: "Required",
        materialsDescription: "supporting materials",

        beforeStart: "Before You Start",
        prepareInfo: "Prepare complete information for each artwork.",
        prepareFiles:
          "Prepare the main artwork PDF and supporting materials.",
        review: "Review all information before submitting the form.",

        startSubmission: "Start Submission ↗",
        viewProgram: "View Program",
        formNewTab:
          "The official submission form will open in a new tab.",

        guide: "Submission Guide",
        threeSteps: "Three steps to submit your work",

        step1Title: "Prepare",
        step1Description:
          "Prepare your artwork information, main PDF, images, video, portfolio, and other supporting materials.",

        step2Title: "Complete Form",
        step2Description:
          "Complete the official JIDEX submission form carefully for every artwork you submit.",

        step3Title: "Submit",
        step3Description:
          "Review your answers, upload the required materials, and submit the form.",

        ready: "Ready to present your work?",
        readyDescription:
          "Continue to the official JIDEX 2026 Exhibition Submission Form.",
        openForm: "Open Submission Form ↗",
      };

  return (
    <main className="min-h-screen bg-[#f8fafc] px-5 pb-24 pt-28 md:px-8 md:pt-32">
      <div className="mx-auto max-w-6xl">
        <section className="relative overflow-hidden rounded-[32px] border border-jidex-border bg-white px-7 py-9 shadow-sm md:px-10 md:py-11">
          <div className="absolute -right-24 -top-28 h-64 w-64 rounded-full bg-[#eee7f5] opacity-70" />
          <div className="absolute -bottom-32 left-1/3 h-56 w-56 rounded-full bg-[#fff0df] opacity-60" />

          <div className="relative">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f4b91]">
                  {text.portalLabel}
                </p>

                <h1 className="mt-3 font-[var(--font-jidex-display)] text-5xl leading-[0.95] text-[#17233c] md:text-6xl">
                  {text.welcome}
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                  {text.intro}
                </p>
              </div>

              <span className="w-fit rounded-full bg-[#17233c] px-4 py-2 text-xs font-semibold tracking-wide text-white">
                {text.participant}
              </span>
            </div>
          </div>
        </section>

        <div className="mt-7 grid gap-7 lg:grid-cols-[0.78fr_1.22fr]">
          <section className="rounded-[28px] border border-jidex-border bg-white p-7 shadow-sm md:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {text.account}
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-[#17233c]">
                {text.profileTitle}
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {text.profileDescription}
              </p>
            </div>

            <div className="mt-7 space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  {text.name}
                </p>
                <p className="mt-1.5 text-sm font-semibold text-[#17233c]">
                  {displayName}
                </p>
              </div>

              <div className="border-b border-slate-100 pb-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  {text.email}
                </p>
                <p className="mt-1.5 break-all text-sm font-semibold text-[#17233c]">
                  {user.email}
                </p>
              </div>

              {profile?.institution && (
                <div className="border-b border-slate-100 pb-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {text.institution}
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-[#17233c]">
                    {profile.institution}
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              disabled
              className="mt-7 w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold"
              style={{ color: "#94a3b8" }}
            >
              {text.editProfile}
            </button>
          </section>

          <section className="relative overflow-hidden rounded-[28px] border border-[#ddd3e8] bg-white p-7 shadow-sm md:p-8">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-bl-full bg-[#f4eef8]" />

            <div className="relative">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="max-w-xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e17b32]">
                    {text.exhibition}
                  </p>

                  <h2 className="mt-2 text-3xl font-semibold text-[#17233c]">
                    {text.submissionTitle}
                  </h2>

                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {text.submissionDescription}
                  </p>
                </div>

                <span className="w-fit shrink-0 rounded-full bg-[#f3edf7] px-4 py-2 text-xs font-semibold text-[#6f4b91]">
                  {text.open}
                </span>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-[#f8fafc] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {text.works}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[#17233c]">
                    {text.worksValue}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {text.worksDescription}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f8fafc] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {text.mainFile}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[#17233c]">
                    {text.mainFileValue}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {text.mainFileDescription}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f8fafc] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {text.materials}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[#17233c]">
                    {text.materialsValue}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {text.materialsDescription}
                  </p>
                </div>
              </div>

              <div className="mt-7 rounded-2xl border border-[#eadff1] bg-[#faf7fc] p-5">
                <p className="text-sm font-semibold text-[#17233c]">
                  {text.beforeStart}
                </p>

                <ul className="mt-3 space-y-2.5 text-sm leading-6 text-slate-600">
                  <li className="flex gap-2.5">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6f4b91]" />
                    {text.prepareInfo}
                  </li>

                  <li className="flex gap-2.5">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6f4b91]" />
                    {text.prepareFiles}
                  </li>

                  <li className="flex gap-2.5">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6f4b91]" />
                    {text.review}
                  </li>
                </ul>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                {GOOGLE_FORM_URL ? (
                  <a
                    href={GOOGLE_FORM_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-[#17233c] px-7 py-3 text-sm font-bold shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                    style={{ color: "#ffffff" }}
                  >
                    {text.startSubmission}
                  </a>
                ) : (
                  <span
                    className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-slate-200 px-7 py-3 text-sm font-bold"
                    style={{ color: "#64748b" }}
                  >
                    {isId
                      ? "Formulir Tidak Tersedia"
                      : "Submission Form Unavailable"}
                  </span>
                )}

                <Link
                  href="/program"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-7 py-3 text-sm font-semibold transition hover:bg-slate-50"
                  style={{ color: "#17233c" }}
                >
                  {text.viewProgram}
                </Link>
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-400">
                {text.formNewTab}
              </p>
            </div>
          </section>
        </div>

        <section className="mt-7 rounded-[28px] border border-jidex-border bg-white p-7 shadow-sm md:p-8">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {text.guide}
            </p>

            <h2 className="text-2xl font-semibold text-[#17233c]">
              {text.threeSteps}
            </h2>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-[#f8fafc] p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#17233c] text-sm font-bold text-white">
                01
              </span>
              <h3 className="mt-4 font-semibold text-[#17233c]">
                {text.step1Title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {text.step1Description}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-[#f8fafc] p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6f4b91] text-sm font-bold text-white">
                02
              </span>
              <h3 className="mt-4 font-semibold text-[#17233c]">
                {text.step2Title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {text.step2Description}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-[#f8fafc] p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e17b32] text-sm font-bold text-white">
                03
              </span>
              <h3 className="mt-4 font-semibold text-[#17233c]">
                {text.step3Title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {text.step3Description}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-7 flex flex-col gap-4 rounded-[28px] bg-[#17233c] px-7 py-7 shadow-sm md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="text-lg font-semibold text-white">
              {text.ready}
            </p>

            <p className="mt-1 text-sm leading-6 text-white/65">
              {text.readyDescription}
            </p>
          </div>

          {GOOGLE_FORM_URL && (
            <a
              href={GOOGLE_FORM_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-bold transition hover:-translate-y-0.5"
              style={{ color: "#17233c" }}
            >
              {text.openForm}
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
