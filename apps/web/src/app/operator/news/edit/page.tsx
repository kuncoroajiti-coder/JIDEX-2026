"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  deleteAdminNews,
  getAdminNewsById,
  translateAdminNews,
  updateAdminNews,
  type AdminNewsItem,
} from "@/lib/api";

type FormState = {
  slug: string;
  coverImage: string;
  titleId: string;
  excerptId: string;
  contentId: string;
  titleEn: string;
  excerptEn: string;
  contentEn: string;
  publishedAt: string;
};

function toLocalDateTimeValue(value: string | null | undefined): string {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

function toIsoDateTime(value: string): string | null {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function itemToForm(item: AdminNewsItem): FormState {
  return {
    slug: item.slug,
    coverImage: item.coverImage ?? "",
    titleId: item.titleId,
    excerptId: item.excerptId ?? "",
    contentId: item.contentId,
    titleEn: item.titleEn,
    excerptEn: item.excerptEn ?? "",
    contentEn: item.contentEn,
    publishedAt: toLocalDateTimeValue(item.publishedAt),
  };
}

export default function EditNewsPage() {
  const searchParams = useSearchParams();
  const requestedId = searchParams.get("id") ?? "";

  const [id, setId] = useState("");
  const [item, setItem] = useState<AdminNewsItem | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!requestedId) {
        setError("ID berita tidak ditemukan.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        setSuccess("");
        setId(requestedId);

        const data = await getAdminNewsById(requestedId);

        if (cancelled) return;

        setItem(data);
        setForm(itemToForm(data));
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Gagal memuat berita.",
          );
          setItem(null);
          setForm(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [requestedId]);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current,
    );

    setSuccess("");
    setError("");
  }

  async function handleGenerateEnglish() {
    if (!form || !id) return;

    if (!form.titleId.trim()) {
      setError("Judul Bahasa Indonesia wajib diisi.");
      return;
    }

    if (!form.contentId.trim()) {
      setError("Konten Bahasa Indonesia wajib diisi.");
      return;
    }

    setTranslating(true);
    setError("");
    setSuccess("");

    try {
      const result = await translateAdminNews(id, {
        titleId: form.titleId,
        excerptId: form.excerptId || null,
        contentId: form.contentId,
      });

      setForm((current) =>
        current
          ? {
              ...current,
              titleEn: result.titleEn,
              excerptEn: result.excerptEn ?? "",
              contentEn: result.contentEn,
            }
          : current,
      );

      setSuccess(
        "English berhasil dibuat. Silakan review sebelum menyimpan.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal membuat versi English.",
      );
    } finally {
      setTranslating(false);
    }
  }

  async function handleSave(status: "DRAFT" | "PUBLISHED") {
    if (!form || !id) return;

    if (!form.slug.trim()) {
      setError("Slug wajib diisi.");
      return;
    }

    if (!form.titleId.trim()) {
      setError("Judul Bahasa Indonesia wajib diisi.");
      return;
    }

    if (!form.contentId.trim()) {
      setError("Konten Bahasa Indonesia wajib diisi.");
      return;
    }

    if (!form.titleEn.trim()) {
      setError(
        "Versi English belum tersedia. Klik Generate English terlebih dahulu.",
      );
      return;
    }

    if (!form.contentEn.trim()) {
      setError(
        "Konten English belum tersedia. Klik Generate English terlebih dahulu.",
      );
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updated = await updateAdminNews(id, {
        slug: form.slug.trim(),
        coverImage: form.coverImage.trim() || null,
        titleId: form.titleId.trim(),
        excerptId: form.excerptId.trim() || null,
        contentId: form.contentId.trim(),
        titleEn: form.titleEn.trim(),
        excerptEn: form.excerptEn.trim() || null,
        contentEn: form.contentEn.trim(),
        status,
        publishedAt:
          status === "PUBLISHED"
            ? toIsoDateTime(form.publishedAt) ??
              new Date().toISOString()
            : null,
      });

      setItem(updated);
      setForm(itemToForm(updated));

      setSuccess(
        status === "PUBLISHED"
          ? "Berita berhasil dipublikasikan."
          : "Draft berhasil disimpan.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menyimpan berita.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;

    const confirmed = window.confirm(
      "Hapus berita ini secara permanen?",
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      await deleteAdminNews(id);
      window.location.href = "/operator/news";
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menghapus berita.",
      );
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-32">
        <div className="mx-auto max-w-5xl text-slate-500">
          Memuat berita...
        </div>
      </main>
    );
  }

  if (!form || !item) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-32">
        <div className="mx-auto max-w-5xl">
          <p className="text-red-600">
            {error || "Berita tidak ditemukan."}
          </p>

          <Link
            href="/operator/news"
            className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold !text-white"
          >
            Kembali ke News CMS
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-28 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/operator/news"
              className="text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              ← News CMS
            </Link>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Edit Berita
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Kelola konten Bahasa Indonesia dan English.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700">
              {item.status}
            </span>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || saving || translating}
              className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? "Menghapus..." : "Hapus"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Metadata
              </p>

              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                Informasi berita
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Slug
                </span>

                <input
                  value={form.slug}
                  onChange={(event) =>
                    updateField("slug", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Cover Image URL
                </span>

                <input
                  value={form.coverImage}
                  onChange={(event) =>
                    updateField("coverImage", event.target.value)
                  }
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Published At
                </span>

                <input
                  type="datetime-local"
                  value={form.publishedAt}
                  onChange={(event) =>
                    updateField("publishedAt", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </label>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Bahasa Indonesia
                </p>

                <h2 className="mt-2 text-xl font-semibold text-slate-950">
                  Konten utama
                </h2>
              </div>

              <div className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Judul
                  </span>

                  <input
                    value={form.titleId}
                    onChange={(event) =>
                      updateField("titleId", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Ringkasan
                  </span>

                  <textarea
                    value={form.excerptId}
                    onChange={(event) =>
                      updateField("excerptId", event.target.value)
                    }
                    rows={4}
                    className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Konten
                  </span>

                  <textarea
                    value={form.contentId}
                    onChange={(event) =>
                      updateField("contentId", event.target.value)
                    }
                    rows={14}
                    className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    English
                  </p>

                  <h2 className="mt-2 text-xl font-semibold text-slate-950">
                    English version
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Generate otomatis dari konten Bahasa Indonesia,
                    lalu review sebelum disimpan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateEnglish}
                  disabled={translating || saving || deleting}
                  className="shrink-0 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold !text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {translating ? "Generating..." : "Generate English"}
                </button>
              </div>

              <div className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Title
                  </span>

                  <input
                    value={form.titleEn}
                    onChange={(event) =>
                      updateField("titleEn", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Excerpt
                  </span>

                  <textarea
                    value={form.excerptEn}
                    onChange={(event) =>
                      updateField("excerptEn", event.target.value)
                    }
                    rows={4}
                    className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Content
                  </span>

                  <textarea
                    value={form.contentEn}
                    onChange={(event) =>
                      updateField("contentEn", event.target.value)
                    }
                    rows={14}
                    className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </label>
              </div>
            </section>
          </div>

          <section className="flex flex-col-reverse gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <Link
              href="/operator/news"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Batal
            </Link>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => handleSave("DRAFT")}
                disabled={saving || translating || deleting}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Simpan Draft"}
              </button>

              <button
                type="button"
                onClick={() => handleSave("PUBLISHED")}
                disabled={saving || translating || deleting}
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold !text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Publikasikan"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
