"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createAdminNews,
  type NewsInput,
} from "@/lib/api";

type SaveMode = "DRAFT" | "PUBLISHED";

type FormState = {
  slug: string;
  titleId: string;
  titleEn: string;
  excerptId: string;
  excerptEn: string;
  contentId: string;
  contentEn: string;
  coverImage: string;
  publishedAt: string;
};

const initialForm: FormState = {
  slug: "",
  titleId: "",
  titleEn: "",
  excerptId: "",
  excerptEn: "",
  contentId: "",
  contentEn: "",
  coverImage: "",
  publishedAt: "",
};

function toIsoDate(value: string): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

export default function NewNewsPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const [saveMode, setSaveMode] = useState<SaveMode | null>(null);
  const [error, setError] = useState("");

  function updateField(
    field: keyof FormState,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function validate(): string {
    if (!form.slug.trim()) {
      return "Slug wajib diisi.";
    }

    if (!form.titleId.trim()) {
      return "Judul Bahasa Indonesia wajib diisi.";
    }

    if (!form.titleEn.trim()) {
      return "Judul English wajib diisi.";
    }

    if (!form.contentId.trim()) {
      return "Konten Bahasa Indonesia wajib diisi.";
    }

    if (!form.contentEn.trim()) {
      return "Konten English wajib diisi.";
    }

    if (form.publishedAt && !toIsoDate(form.publishedAt)) {
      return "Tanggal publikasi tidak valid.";
    }

    return "";
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
    mode: SaveMode,
  ) {
    event.preventDefault();

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setSaveMode(mode);
      setError("");

      const input: NewsInput = {
        slug: form.slug.trim(),
        titleId: form.titleId.trim(),
        titleEn: form.titleEn.trim(),
        excerptId: form.excerptId.trim() || null,
        excerptEn: form.excerptEn.trim() || null,
        contentId: form.contentId.trim(),
        contentEn: form.contentEn.trim(),
        coverImage: form.coverImage.trim() || null,
        status: mode,
        publishedAt:
          mode === "PUBLISHED"
            ? toIsoDate(form.publishedAt) ?? new Date().toISOString()
            : null,
      };

      await createAdminNews(input);

      router.push("/operator/news");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menyimpan berita.",
      );
    } finally {
      setSaving(false);
      setSaveMode(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.push("/operator/news")}
            className="mb-5 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
          >
            ← Kembali ke News Management
          </button>

          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
            JIDEX 2026
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            Tambah Berita
          </h1>

          <p className="mt-2 text-slate-600">
            Buat berita dalam Bahasa Indonesia dan English.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <p className="font-semibold">
              Gagal menyimpan berita
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        )}

        <form className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Informasi Utama
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Identitas berita yang digunakan pada website.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="slug"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Slug
                </label>

                <input
                  id="slug"
                  type="text"
                  value={form.slug}
                  onChange={(event) =>
                    updateField("slug", event.target.value)
                  }
                  placeholder="jidex-2026-resmi-dibuka"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Gunakan huruf kecil dan tanda hubung untuk URL.
                </p>
              </div>

              <div>
                <label
                  htmlFor="coverImage"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Cover Image URL
                </label>

                <input
                  id="coverImage"
                  type="url"
                  value={form.coverImage}
                  onChange={(event) =>
                    updateField("coverImage", event.target.value)
                  }
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Upload media akan kita integrasikan pada tahap Media Management.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Bahasa Indonesia
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Konten yang ditampilkan ketika bahasa ID dipilih.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="titleId"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Judul *
                </label>

                <input
                  id="titleId"
                  type="text"
                  value={form.titleId}
                  onChange={(event) =>
                    updateField("titleId", event.target.value)
                  }
                  placeholder="Judul berita"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div>
                <label
                  htmlFor="excerptId"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Ringkasan
                </label>

                <textarea
                  id="excerptId"
                  value={form.excerptId}
                  onChange={(event) =>
                    updateField("excerptId", event.target.value)
                  }
                  rows={4}
                  placeholder="Ringkasan singkat berita"
                  className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div>
                <label
                  htmlFor="contentId"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Konten *
                </label>

                <textarea
                  id="contentId"
                  value={form.contentId}
                  onChange={(event) =>
                    updateField("contentId", event.target.value)
                  }
                  rows={12}
                  placeholder="Tulis isi berita dalam Bahasa Indonesia..."
                  className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900">
                English
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Content displayed when English is selected.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="titleEn"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Title *
                </label>

                <input
                  id="titleEn"
                  type="text"
                  value={form.titleEn}
                  onChange={(event) =>
                    updateField("titleEn", event.target.value)
                  }
                  placeholder="News title"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div>
                <label
                  htmlFor="excerptEn"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Excerpt
                </label>

                <textarea
                  id="excerptEn"
                  value={form.excerptEn}
                  onChange={(event) =>
                    updateField("excerptEn", event.target.value)
                  }
                  rows={4}
                  placeholder="Short news summary"
                  className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div>
                <label
                  htmlFor="contentEn"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Content *
                </label>

                <textarea
                  id="contentEn"
                  value={form.contentEn}
                  onChange={(event) =>
                    updateField("contentEn", event.target.value)
                  }
                  rows={12}
                  placeholder="Write the news content in English..."
                  className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Publikasi
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Atur waktu publikasi jika berita akan langsung ditampilkan.
              </p>
            </div>

            <div className="max-w-md">
              <label
                htmlFor="publishedAt"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Tanggal & waktu publikasi
              </label>

              <input
                id="publishedAt"
                type="datetime-local"
                value={form.publishedAt}
                onChange={(event) =>
                  updateField("publishedAt", event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />

              <p className="mt-2 text-xs text-slate-500">
                Kosongkan untuk menggunakan waktu saat berita dipublikasikan.
              </p>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => router.push("/operator/news")}
              disabled={saving}
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold !text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Batal
            </button>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={(event) =>
                  void handleSubmit(
                    event as unknown as FormEvent<HTMLFormElement>,
                    "DRAFT",
                  )
                }
                disabled={saving}
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold !text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving && saveMode === "DRAFT"
                  ? "Menyimpan..."
                  : "Simpan Draft"}
              </button>

              <button
                type="button"
                onClick={(event) =>
                  void handleSubmit(
                    event as unknown as FormEvent<HTMLFormElement>,
                    "PUBLISHED",
                  )
                }
                disabled={saving}
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold !text-white shadow-sm transition hover:bg-slate-700 hover:!text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving && saveMode === "PUBLISHED"
                  ? "Mempublikasikan..."
                  : "Publikasikan"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
