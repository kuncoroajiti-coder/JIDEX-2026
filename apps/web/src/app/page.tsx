"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Container } from "@/components/layout/container";
import {
  type Language,
  useLanguage,
} from "@/components/i18n/language-provider";
import { Button } from "@/components/ui/button";
import { getNews, type NewsItem } from "@/lib/api";

const content = {
  id: {
    about: "Tentang",
    program: "Program",
    news: "Berita",
    login: "Masuk",
    register: "Daftar",
    eyebrow: "Jakarta International Design Exhibition 2026",
    heroDescription:
      "Menghubungkan Ide, Budaya, dan Masa Depan melalui desain, kreativitas, pendidikan, dan kolaborasi global.",
    date: "5–16 Oktober 2026",
    location: "Jakarta, Indonesia",
    participant: "Daftar sebagai Peserta",
    explore: "Jelajahi JIDEX",
    visualAlt: "Visual pameran, desain, dan fashion JIDEX 2026",
    countdownLabel: "Menuju JIDEX 2026",
    days: "Hari",
    hours: "Jam",
    minutes: "Menit",
    seconds: "Detik",
    aboutEyebrow: "Tentang JIDEX",
    aboutTitle: "Ruang bertemunya ide, desain, dan kolaborasi.",
    aboutDescription:
      "JIDEX 2026 menghadirkan pengalaman lintas disiplin yang mempertemukan karya, gagasan, pengetahuan, dan jejaring kreatif dalam satu perhelatan internasional.",
    exhibitionTitle: "Exhibition",
    exhibitionDescription:
      "Menampilkan karya dan gagasan desain dalam pengalaman pameran yang terbuka, dinamis, dan lintas disiplin.",
    conferenceTitle: "Conference & FGD",
    conferenceDescription:
      "Forum pertukaran perspektif melalui konferensi, diskusi, dan Focus Group Discussion bersama para pemangku kepentingan.",
    fashionTitle: "Fashion Show",
    fashionDescription:
      "Perayaan kreativitas fashion melalui presentasi karya, identitas visual, dan eksplorasi material serta bentuk.",
    programEyebrow: "Program",
    programTitle: "Satu rangkaian, banyak perspektif.",
    programDescription: "Jelajahi rangkaian kegiatan utama JIDEX 2026.",
    programExhibition: "Pameran JIDEX",
    programExhibitionDate: "5–16 Oktober 2026",
    programConference: "Conference & FGD",
    programConferenceDate: "7–9 Oktober 2026",
    programFashion: "Fashion Show",
    programFashionDate: "11 Oktober 2026",
    newsEyebrow: "News & Updates",
    newsTitle: "Berita dan informasi terbaru.",
    newsDescription:
      "Ikuti perkembangan program, pengumuman, dan cerita di balik JIDEX 2026.",
    readMore: "Baca selengkapnya",
    comingSoon: "Segera hadir",
    newsOneTitle: "JIDEX 2026 membuka ruang kolaborasi kreatif.",
    newsOneExcerpt:
      "Temukan gagasan, karya, dan perspektif baru dalam perhelatan desain internasional di Jakarta.",
    newsTwoTitle: "Rangkaian program JIDEX 2026.",
    newsTwoExcerpt:
      "Pameran, konferensi, FGD, dan fashion show hadir dalam satu ekosistem kreatif.",
    newsThreeTitle: "Bersiap menjadi bagian dari JIDEX.",
    newsThreeExcerpt:
      "Informasi pendaftaran dan partisipasi akan diperbarui secara berkala.",
    ctaEyebrow: "Be part of JIDEX",
    ctaTitle: "Mari bawa ide melampaui batas.",
    ctaDescription:
      "Daftarkan diri Anda dan menjadi bagian dari pertemuan desain, kreativitas, pendidikan, dan kolaborasi global.",
    ctaButton: "Daftar sebagai Peserta",
    footerDescription:
      "Jakarta International Design Exhibition 2026 — ruang bertemunya ide, budaya, desain, dan masa depan.",
    organizer: "Diselenggarakan oleh",
    developer: "Website dikembangkan oleh",
    developerName: "Unit Penunjang Akademik Desain dan Periklanan",
    address: "Jakarta, Indonesia",
    rights: "Hak cipta dilindungi.",
  },
  en: {
    about: "About",
    program: "Program",
    news: "News",
    login: "Login",
    register: "Register",
    eyebrow: "Jakarta International Design Exhibition 2026",
    heroDescription:
      "Connecting Ideas, Cultures and Futures through design, creativity, education, and global collaboration.",
    date: "5–16 October 2026",
    location: "Jakarta, Indonesia",
    participant: "Register as Participant",
    explore: "Explore JIDEX",
    visualAlt: "JIDEX 2026 exhibition, design and fashion visual",
    countdownLabel: "Until JIDEX 2026",
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
    aboutEyebrow: "About JIDEX",
    aboutTitle: "Where ideas, design, and collaboration meet.",
    aboutDescription:
      "JIDEX 2026 creates a cross-disciplinary experience bringing together works, ideas, knowledge, and creative networks in an international gathering.",
    exhibitionTitle: "Exhibition",
    exhibitionDescription:
      "Presenting design works and ideas through an open, dynamic, and cross-disciplinary exhibition experience.",
    conferenceTitle: "Conference & FGD",
    conferenceDescription:
      "A forum for exchanging perspectives through conferences, discussions, and Focus Group Discussions with stakeholders.",
    fashionTitle: "Fashion Show",
    fashionDescription:
      "A celebration of fashion creativity through works, visual identity, material exploration, and form.",
    programEyebrow: "Program",
    programTitle: "One program, many perspectives.",
    programDescription: "Explore the main program of JIDEX 2026.",
    programExhibition: "JIDEX Exhibition",
    programExhibitionDate: "5–16 October 2026",
    programConference: "Conference & FGD",
    programConferenceDate: "7–9 October 2026",
    programFashion: "Fashion Show",
    programFashionDate: "11 October 2026",
    newsEyebrow: "News & Updates",
    newsTitle: "Latest news and information.",
    newsDescription:
      "Follow program updates, announcements, and stories behind JIDEX 2026.",
    readMore: "Read more",
    comingSoon: "Coming soon",
    newsOneTitle: "JIDEX 2026 opens a space for creative collaboration.",
    newsOneExcerpt:
      "Discover new ideas, works, and perspectives at the international design gathering in Jakarta.",
    newsTwoTitle: "The JIDEX 2026 program.",
    newsTwoExcerpt:
      "Exhibition, conference, FGD, and fashion show come together in one creative ecosystem.",
    newsThreeTitle: "Get ready to be part of JIDEX.",
    newsThreeExcerpt:
      "Registration and participation information will be updated regularly.",
    ctaEyebrow: "Be part of JIDEX",
    ctaTitle: "Take ideas beyond boundaries.",
    ctaDescription:
      "Register and become part of a gathering of design, creativity, education, and global collaboration.",
    ctaButton: "Register as Participant",
    footerDescription:
      "Jakarta International Design Exhibition 2026 — where ideas, cultures, design, and futures meet.",
    organizer: "Organized by",
    developer: "Website developed by",
    developerName: "Academic Support Unit Design and Advertising",
    address: "Jakarta, Indonesia",
    rights: "All rights reserved.",
  },
} satisfies Record<Language, Record<string, string>>;

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className="inline-flex items-center rounded-full border border-jidex-blue-light/70 bg-white/80 p-1 shadow-sm"
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
        <span aria-hidden="true" className="text-sm leading-none">🇮🇩</span>
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
        <span aria-hidden="true" className="text-sm leading-none">🇬🇧</span>
        <span>EN</span>
      </button>
    </div>
  );
}

function Countdown({ language }: { language: Language }) {
  const t = content[language];

  const target = new Date("2026-10-05T00:00:00+07:00").getTime();
  const [remaining, setRemaining] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () => setRemaining(Math.max(target - Date.now(), 0));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const items = [
    { value: days, label: t.days },
    { value: hours, label: t.hours },
    { value: minutes, label: t.minutes },
    { value: seconds, label: t.seconds },
  ];

  return (
    <section className="relative z-20 -mt-8 px-4 sm:px-6">
      <Container>
        <div className="mx-auto max-w-3xl rounded-[24px] border border-white/90 bg-white/95 px-5 py-6 shadow-jidex-soft backdrop-blur-xl sm:px-8">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.28em] text-jidex-orange sm:text-xs">
            {t.countdownLabel}
          </p>
          <div className="mx-auto mt-4 grid max-w-2xl grid-cols-4 divide-x divide-jidex-border/70">
            {items.map((item) => (
              <div key={item.label} className="px-2 text-center sm:px-5">
                <div className="font-display text-3xl font-medium leading-none text-jidex-navy sm:text-5xl">
                  {mounted ? String(item.value).padStart(2, "0") : "--"}
                </div>
                <div className="mt-2 text-[9px] font-bold uppercase tracking-[0.15em] text-jidex-text-muted sm:text-[10px]">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function Home() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = content[language];
  const [apiNews, setApiNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    let active = true;

    getNews()
      .then((items) => {
        if (active && items.length > 0) setApiNews(items.slice(0, 3));
      })
      .catch(() => {
        // Keep the approved static homepage news when the API is unavailable.
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-jidex-background">


      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_78%_38%,rgba(209,221,235,0.9),transparent_36%),linear-gradient(112deg,#ffffff_0%,#fbfcfd_42%,#edf5fb_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute -right-[18rem] -top-[14rem] -z-10 h-[48rem] w-[48rem] rounded-full border border-white/90"
        />
        <div
          aria-hidden="true"
          className="absolute -right-[12rem] -top-[6rem] -z-10 h-[38rem] w-[38rem] rounded-full border border-jidex-blue/10"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-52 left-[-12rem] -z-10 h-[34rem] w-[34rem] rounded-full bg-jidex-mauve-light/10 blur-3xl"
        />

        <Container className="relative">
          <div className="grid min-h-[575px] items-center gap-0 py-6 md:min-h-[605px] lg:grid-cols-[0.72fr_1.28fr] lg:py-3 xl:min-h-[625px]">
            <div className="relative z-20 max-w-[610px]">
              <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.32em] text-jidex-orange sm:text-xs">
                {t.eyebrow}
              </p>
              <div className="max-w-[520px]">
                <Image
                  src="/assets/jidex-full-color-hd.png"
                  alt="JIDEX 2026"
                  width={520}
                  height={260}
                  priority
                  className="h-auto w-[245px] object-contain object-left sm:w-[305px]"
                />
                <div className="mt-4 max-w-[480px] border-l-2 border-jidex-orange pl-4">
                  <p className="text-lg font-semibold uppercase leading-tight tracking-[0.12em] text-jidex-navy sm:text-2xl">
                    Connecting Ideas,
                    <br />
                    Cultures and Futures
                  </p>
                </div>
                <p className="mt-5 max-w-[520px] text-sm leading-6 text-jidex-text-muted sm:text-base sm:leading-7">
                  {t.heroDescription}
                </p>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-bold uppercase tracking-[0.08em] text-jidex-navy sm:text-xs">
                <span>{t.date}</span>
                <span className="h-1 w-1 rounded-full bg-jidex-orange" />
                <span>{t.location}</span>
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button size="lg" type="button" onClick={() => router.push("/register")}>
                  {t.participant}
                </Button>
                <Button variant="outline" size="lg" type="button" onClick={() => router.push("/about")}>
                  {t.explore}
                </Button>
              </div>
            </div>

            <div className="relative -mr-[10%] min-h-[370px] sm:min-h-[455px] lg:-mr-[16%] lg:min-h-[560px]">
              <div
                aria-hidden="true"
                className="absolute left-[10%] top-[9%] h-[78%] w-[78%] rounded-full bg-white/55 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="absolute left-[14%] top-[11%] h-[74%] w-[74%] rounded-full border border-white/80"
              />
              <div
                aria-hidden="true"
                className="absolute left-[20%] top-[17%] h-[62%] w-[62%] rounded-full border border-jidex-blue/15"
              />
              <div className="absolute inset-x-0 bottom-0 top-0 overflow-visible">
                <Image
                  src="/assets/jidex-hero-visual.jpg"
                  alt={t.visualAlt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 62vw"
                  className="object-contain object-center mix-blend-multiply opacity-100 scale-[0.88] sm:scale-[0.9] lg:scale-[0.92]"
                  style={{
                    maskImage:
                      "linear-gradient(90deg, transparent 0%, rgba(0,0,0,.5) 9%, black 22%, black 88%, transparent 100%)",
                    WebkitMaskImage:
                      "linear-gradient(90deg, transparent 0%, rgba(0,0,0,.5) 9%, black 22%, black 88%, transparent 100%)",
                  }}
                />
              </div>
            </div>
          </div>
        </Container>

        <div aria-hidden="true" className="relative h-14 sm:h-16">
          <svg
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
            className="absolute bottom-0 h-full w-full"
          >
            <path
              d="M0 58 C180 10 275 86 450 51 C620 17 710 78 880 48 C1060 16 1180 76 1440 28 L1440 100 L0 100 Z"
              fill="rgba(233,241,248,0.78)"
            />
            <path
              d="M0 54 C180 6 275 82 450 47 C620 13 710 74 880 44 C1060 12 1180 72 1440 24"
              fill="none"
              stroke="rgba(229,138,79,0.8)"
              strokeWidth="1.5"
            />
            <path
              d="M0 66 C180 18 275 94 450 59 C620 25 710 86 880 56 C1060 24 1180 84 1440 36"
              fill="none"
              stroke="rgba(111,143,174,0.4)"
              strokeWidth="1.2"
            />
          </svg>
        </div>
      </section>

      <Countdown language={language} />

      <section id="about" className="section-jidex bg-jidex-surface-blue/45">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
            <div className="max-w-xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-jidex-orange">
                {t.aboutEyebrow}
              </p>
              <h2 className="mt-3 text-balance text-3xl font-semibold leading-tight tracking-[-0.045em] text-jidex-navy sm:text-4xl">
                {t.aboutTitle}
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-6 text-jidex-text-muted">
                {t.aboutDescription}
              </p>
              <button
                type="button"
                onClick={() => router.push("/about")}
                className="mt-5 rounded-full border border-jidex-blue-light bg-white px-5 py-2 text-xs font-semibold text-jidex-navy shadow-sm transition-colors hover:border-jidex-navy hover:text-jidex-navy"
              >
                {language === "id" ? "Pelajari lebih lanjut" : "Learn more"} →
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  id: "exhibition",
                  title: t.exhibitionTitle,
                  description: t.exhibitionDescription,
                  icon: "▧",
                  accent: "bg-jidex-orange",
                },
                {
                  id: "conference",
                  title: t.conferenceTitle,
                  description: t.conferenceDescription,
                  icon: "●",
                  accent: "bg-jidex-blue",
                },
                {
                  id: "fashion",
                  title: t.fashionTitle,
                  description: t.fashionDescription,
                  icon: "♙",
                  accent: "bg-jidex-mauve",
                },
              ].map((item) => (
                <article
                  key={item.id}
                  className="rounded-[20px] border border-white bg-white/90 p-5 shadow-jidex-soft"
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-lg text-white ${item.accent}`}
                  >
                    {item.icon}
                  </span>
                  <h3 className="mt-4 text-base font-bold text-jidex-navy">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-jidex-text-muted">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section id="program" className="section-jidex bg-white">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-jidex-orange">
                {t.programEyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-jidex-navy sm:text-4xl">
                {t.programTitle}
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-jidex-text-muted">
                {t.programDescription}
              </p>
            </div>

            <div className="relative pt-4">
              <div
                aria-hidden="true"
                className="absolute left-[8%] right-[8%] top-9 hidden h-px bg-jidex-blue/35 sm:block"
              />
              <div className="grid gap-5 sm:grid-cols-3">
                {[
                  {
                    title: t.programExhibition,
                    date: t.programExhibitionDate,
                    accent: "bg-jidex-orange",
                  },
                  {
                    title: t.programConference,
                    date: t.programConferenceDate,
                    accent: "bg-jidex-blue",
                  },
                  {
                    title: t.programFashion,
                    date: t.programFashionDate,
                    accent: "bg-jidex-mauve",
                  },
                ].map((item) => (
                  <article key={item.title} className="relative text-center">
                    <div className="relative z-10 mx-auto flex h-11 w-11 items-center justify-center rounded-full border-4 border-white shadow-sm">
                      <span className={`h-3 w-3 rounded-full ${item.accent}`} />
                    </div>
                    <h3 className="mt-3 text-sm font-bold text-jidex-navy">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-[11px] text-jidex-text-muted">
                      {item.date}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section id="news" className="section-jidex bg-jidex-surface">
        <Container>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-jidex-orange">
                {t.newsEyebrow}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-jidex-navy sm:text-4xl">
                {t.newsTitle}
              </h2>
              <p className="mt-3 text-sm leading-6 text-jidex-text-muted">
                {t.newsDescription}
              </p>
            </div>
            <span className="text-xs font-semibold text-jidex-mauve">
              {t.comingSoon}
            </span>
          </div>

          <div className="mt-7 grid gap-3 md:grid-cols-3">
            {(apiNews.length > 0
              ? apiNews.map((item, index) => ({
                  number: String(index + 1).padStart(2, "0"),
                  title: language === "id" ? item.titleId : item.titleEn,
                  excerpt:
                    language === "id"
                      ? item.excerptId || ""
                      : item.excerptEn || "",
                }))
              : [
                  { number: "01", title: t.newsOneTitle, excerpt: t.newsOneExcerpt },
                  { number: "02", title: t.newsTwoTitle, excerpt: t.newsTwoExcerpt },
                  { number: "03", title: t.newsThreeTitle, excerpt: t.newsThreeExcerpt },
                ]
            ).map((item) => (
              <button
                key={item.number}
                type="button"
                onClick={() => router.push("/news")}
                className="group rounded-[18px] border border-white bg-white p-5 text-left shadow-sm transition-transform hover:-translate-y-1"
              >
                <div className="flex gap-4">
                  <span className="font-display text-3xl italic text-jidex-mauve">
                    {item.number}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold leading-5 text-jidex-navy">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs leading-5 text-jidex-text-muted">
                      {item.excerpt}
                    </p>
                    <span className="mt-3 inline-block text-[9px] font-bold uppercase tracking-[0.14em] text-jidex-orange">
                      {t.readMore}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Container>
      </section>

      <section id="register" className="section-jidex py-5 sm:py-7">
        <Container>
          <div className="relative overflow-hidden rounded-[22px] bg-jidex-navy px-6 py-7 text-white shadow-jidex-soft sm:flex sm:items-center sm:justify-between sm:px-9">
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-24 h-52 w-52 rounded-full border border-white/10"
            />
            <div className="relative max-w-2xl">
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-jidex-yellow">
                {t.ctaEyebrow}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
                {t.ctaTitle}
              </h2>
              <p className="mt-2 text-xs leading-5 text-white/70 sm:text-sm">
                {t.ctaDescription}
              </p>
            </div>
            <div className="relative mt-5 shrink-0 sm:mt-0">
              <Button variant="accent" size="lg" type="button" onClick={() => router.push("/register")}>
                {t.ctaButton} →
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <footer id="contact" className="border-t border-jidex-border bg-white">
        <Container>
          <div className="grid gap-8 py-10 md:grid-cols-[1.25fr_0.8fr_0.95fr_0.65fr] md:items-center">
            <div>
              <Image
                src="/assets/jidex-monocolor.png"
                alt="JIDEX 2026"
                width={180}
                height={90}
                className="h-auto w-[100px] object-contain"
              />
              <p className="mt-3 max-w-sm text-xs leading-5 text-jidex-text-muted">
                {t.footerDescription}
              </p>
              <p className="mt-3 text-xs font-medium text-jidex-navy">
                {t.address}
              </p>
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-jidex-orange">
                {t.organizer}
              </p>
              <Image
                src="/assets/polimedia-official-transparent.png"
                alt="Politeknik Negeri Media Kreatif"
                width={320}
                height={100}
                className="mt-4 h-auto w-[190px] object-contain object-left"
              />
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-jidex-orange">
                {t.developer}
              </p>
              <p className="mt-4 max-w-[220px] text-xs font-semibold leading-5 text-jidex-navy">
                {language === "id" ? (
                  <>
                    Unit Penunjang Akademik
                    <br />
                    Desain dan Periklanan
                  </>
                ) : (
                  <>
                    Academic Support Unit
                    <br />
                    Design and Advertising
                  </>
                )}
              </p>
            </div>

            <div className="text-xs leading-5 text-jidex-text-muted md:text-right">
              <p className="font-semibold text-jidex-navy">{t.address}</p>
              <p className="mt-1">JIDEX 2026 © 2026</p>
              <p>{t.rights}</p>
            </div>
          </div>
        </Container>
      </footer>
    </main>
  );
}
