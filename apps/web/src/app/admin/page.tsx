"use client";

import Link from "next/link";

import { AdminGuard } from "@/components/auth/admin-guard";
import { useAuth } from "@/components/auth/auth-provider";
import { useLanguage, type Language } from "@/components/i18n/language-provider";

const copy: Record<
  Language,
  {
    eyebrow: string;
    title: string;
    description: string;
    users: string;
    usersDescription: string;
    participants: string;
    participantsDescription: string;
    submissions: string;
    submissionsDescription: string;
    content: string;
    contentDescription: string;
    news: string;
    newsDescription: string;
  }
> = {
  id: {
    eyebrow: "JIDEX 2026",
    title: "Admin Dashboard",
    description:
      "Pusat pengelolaan akun, peserta, submission, dan konten JIDEX 2026.",
    users: "Manajemen Pengguna",
    usersDescription:
      "Kelola akun Admin, Operator, dan Participant.",
    participants: "Data Participant",
    participantsDescription:
      "Lihat dan kelola data profil peserta.",
    submissions: "Submission",
    submissionsDescription:
      "Kelola dan tinjau submission peserta.",
    content: "Content Management",
    contentDescription:
      "Kelola konten utama website JIDEX 2026.",
    news: "Berita",
    newsDescription:
      "Kelola berita dalam Bahasa Indonesia dan English.",
  },
  en: {
    eyebrow: "JIDEX 2026",
    title: "Admin Dashboard",
    description:
      "Central management for accounts, participants, submissions, and JIDEX 2026 content.",
    users: "User Management",
    usersDescription:
      "Manage Admin, Operator, and Participant accounts.",
    participants: "Participant Data",
    participantsDescription:
      "View and manage participant profile data.",
    submissions: "Submissions",
    submissionsDescription:
      "Manage and review participant submissions.",
    content: "Content Management",
    contentDescription:
      "Manage the main JIDEX 2026 website content.",
    news: "News",
    newsDescription:
      "Manage news in Indonesian and English.",
  },
};

function DashboardCard({
  title,
  description,
  href,
  disabled = false,
}: {
  title: string;
  description: string;
  href: string;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <div className="rounded-[24px] border border-jidex-border bg-slate-50 p-6">
        <h2 className="text-xl font-semibold tracking-[-0.02em] text-jidex-navy">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-jidex-text-muted">
          {description}
        </p>
        <span className="mt-5 inline-flex rounded-full border border-jidex-border px-3 py-1 text-xs font-semibold text-slate-400">
          Coming soon
        </span>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="group rounded-[24px] border border-jidex-border bg-white p-6 shadow-jidex-soft transition hover:-translate-y-0.5 hover:border-jidex-navy"
    >
      <h2 className="text-xl font-semibold tracking-[-0.02em] text-jidex-navy">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-jidex-text-muted">
        {description}
      </p>
      <span className="mt-5 inline-flex text-sm font-semibold text-jidex-navy group-hover:underline">
        Open →
      </span>
    </Link>
  );
}

export default function AdminPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = copy[language];

  return (
    <AdminGuard>
      <main className="min-h-[calc(100vh-70px)] bg-jidex-background">
        <section className="section-jidex">
          <div className="container-jidex">
            <div className="mb-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-jidex-orange">
                {t.eyebrow}
              </p>

              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-4xl font-semibold tracking-[-0.045em] text-jidex-navy sm:text-5xl">
                    {t.title}
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-jidex-text-muted sm:text-base">
                    {t.description}
                  </p>
                </div>

                {user && (
                  <div className="rounded-2xl border border-jidex-border bg-white px-5 py-4">
                    <p className="text-sm font-semibold text-jidex-navy">
                      {user.name}
                    </p>
                    <p className="mt-1 text-xs text-jidex-text-muted">
                      {user.email}
                    </p>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-jidex-orange">
                      {user.role}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <DashboardCard
                title={t.users}
                description={t.usersDescription}
                href="/admin/users"
                disabled
              />

              <DashboardCard
                title={t.participants}
                description={t.participantsDescription}
                href="/admin/participants"
                disabled
              />

              <DashboardCard
                title={t.submissions}
                description={t.submissionsDescription}
                href="/admin/submissions"
                disabled
              />

              <DashboardCard
                title={t.content}
                description={t.contentDescription}
                href="/operator/news"
              />

              <DashboardCard
                title={t.news}
                description={t.newsDescription}
                href="/operator/news"
              />
            </div>
          </div>
        </section>
      </main>
    </AdminGuard>
  );
}
