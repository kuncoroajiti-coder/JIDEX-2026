"use client";

import Link from "next/link";

const GOOGLE_FORM_URL =
  process.env.NEXT_PUBLIC_JIDEX_GOOGLE_FORM_URL || "";

export default function ParticipantSubmissionPage() {
  return (
    <main className="min-h-screen bg-[#f7f9fc]">
      <section className="mx-auto max-w-5xl px-6 py-16 md:px-8">
        <div className="mb-8">
          <Link
            href="/participant"
            className="text-sm font-medium text-[#263b72] hover:underline"
          >
            Back to Participant Portal
          </Link>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="bg-[#263b72] px-7 py-10 text-white md:px-10">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
              JIDEX 2026
            </p>

            <h1 className="font-[var(--font-jidex-display)] text-4xl leading-tight md:text-5xl">
              International Exhibition Submission
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-7 text-white/80">
              Submit your design work for consideration at Jakarta
              International Design Exhibition 2026.
            </p>
          </div>

          <div className="space-y-8 px-7 py-9 md:px-10">
            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                Before you submit
              </h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="font-semibold text-slate-900">
                    Participant Information
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Prepare your full name, professional position,
                    institution or organization, country, city, email, phone
                    number, and short biography.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="font-semibold text-slate-900">
                    Artwork Information
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    You may submit 1 to 3 artworks. Prepare the title, year,
                    category, medium, dimensions, materials, concept,
                    description, and technical or installation requirements.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="font-semibold text-slate-900">
                    Main Artwork File
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    The main artwork submission is collected as a PDF through
                    the official submission form.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="font-semibold text-slate-900">
                    Supporting Materials
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Additional views, sketches, prototypes, process material,
                    video, portfolio, and supporting documents can be uploaded
                    through the form.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[#e5dff1] bg-[#faf8fd] p-6 md:p-7">
              <h2 className="text-xl font-semibold text-slate-900">
                Official Submission Form
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Complete the official JIDEX 2026 exhibition submission form.
                Uploaded files will be collected through Google Forms and
                stored in the designated Google Drive.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {GOOGLE_FORM_URL ? (
                  <a
                    href={GOOGLE_FORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-full bg-[#263b72] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1d2f5c]"
                  >
                    Open Official Submission Form
                  </a>
                ) : (
                  <div className="rounded-full bg-slate-200 px-7 py-3.5 text-sm font-semibold text-slate-500">
                    Submission form is not configured
                  </div>
                )}

                <Link
                  href="/participant"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Return to Portal
                </Link>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                Important
              </h2>

              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <li>
                  Complete the official form carefully and use the same
                  participant identity throughout the submission.
                </li>
                <li>
                  Make sure every required artwork field is completed.
                </li>
                <li>
                  Upload the required main artwork PDF and relevant supporting
                  materials.
                </li>
                <li>
                  Review all declarations before submitting the Google Form.
                </li>
                <li>
                  Keep the Google Forms confirmation as evidence of submission.
                </li>
              </ul>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
