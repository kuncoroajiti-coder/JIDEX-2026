"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  getAdminNews,
  type AdminNewsItem,
} from "@/lib/api";

export default function OperatorNewsPage() {
  const [news, setNews] = useState<AdminNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadNews() {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminNews();
      setNews(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat berita.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadNews();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              JIDEX 2026
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              News Management
            </h1>

            <p className="mt-2 text-slate-600">
              Kelola berita JIDEX dalam Bahasa Indonesia dan English.
            </p>
          </div>

          <Link
            href="/operator/news/new"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold !text-white shadow-sm transition hover:bg-slate-700 hover:!text-white"
          >
            + Tambah Berita
          </Link>
        </div>

        {loading && (
          <div className="rounded-2xl border bg-white p-8 text-slate-600">
            Memuat berita...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            <p className="font-semibold">
              Gagal memuat berita
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>

            <button
              type="button"
              onClick={() => void loadNews()}
              className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold !text-white transition hover:bg-red-800"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {!loading && !error && news.length === 0 && (
          <div className="rounded-2xl border bg-white p-10 text-center">
            <h2 className="text-lg font-semibold text-slate-900">
              Belum ada berita
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Tambahkan berita pertama untuk JIDEX 2026.
            </p>
          </div>
        )}

        {!loading && !error && news.length > 0 && (
          <div className="overflow-hidden rounded-2xl border bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="border-b bg-slate-50">
                  <tr className="text-left text-sm text-slate-500">
                    <th className="px-5 py-4 font-semibold">
                      Judul
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Slug
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Status
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Updated
                    </th>

                    <th className="px-5 py-4 text-right font-semibold">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {news.map((item) => (
                    <tr key={item.id}>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">
                          {item.titleId}
                        </div>

                        <div className="mt-1 text-sm text-slate-500">
                          {item.titleEn}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {item.slug}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {item.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {new Date(item.updatedAt).toLocaleString("id-ID")}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/operator/news/edit?id=${item.id}`}
                          className="text-sm font-semibold text-slate-900 hover:underline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
