import Link from "next/link";
import {
  ClipboardCheck,
  NotebookText,
  ClipboardList,
  BookMarked,
  SearchCheck,
  BarChart3,
  CalendarDays,
  GraduationCap,
  MessagesSquare,
  LogIn,
  UserPlus,
  ShieldCheck,
  Globe,
  FileText,
  ArrowRight,
  Building2,
  Users,
  Network,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/app-shell/logo";
import { Reveal } from "@/components/marketing/reveal";
import { CountUp } from "@/components/marketing/count-up";

export const metadata = {
  title: "EduWeb Planner — Portail de pilotage scolaire",
};

const MODULE_ICONS = [
  ClipboardCheck, NotebookText, ClipboardList, BookMarked, SearchCheck, BarChart3, CalendarDays, GraduationCap, MessagesSquare,
];
const AUDIENCE_ICONS = [Building2, Users, GraduationCap, SearchCheck, Globe, Network];
const ATOUT_ICONS = [ShieldCheck, FileText, Globe];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-ew-green-700">
      <span className="h-px w-7 bg-ew-green-600/50" />
      {children}
    </span>
  );
}

/** Pied de page (tagline international + année). */
function FooterTagline() {
  const tCommon = useTranslations();
  return (
    <>
      {tCommon("footer.tagline")} · © {new Date().getFullYear()}
    </>
  );
}

export default function HomePage() {
  const t = useTranslations("home");
  return (
    <div className="flex min-h-full flex-col bg-background">
      {/* Hero — bannière pleine largeur (image fournie) + accès rapide.
          Repli gracieux : si /brand/hero-cover.{png,jpg} est absent, le SVG s'affiche. */}
      <section className="relative w-full overflow-hidden bg-ew-green-950">
        <div
          className="aspect-[16/9] max-h-[92vh] w-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/brand/hero-cover.png'), url('/brand/hero-cover.jpg'), url('/brand/hero.svg')",
          }}
          role="img"
          aria-label="EduWeb Planner — Planifiez mieux, enseignez sereinement"
        />
        <div className="absolute right-4 top-4 z-10 flex items-center gap-2 sm:right-6 sm:top-6">
          <Link
            href="/register"
            className="hidden rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-ew-green-800 shadow-sm backdrop-blur transition-colors hover:bg-white sm:inline-flex"
          >
            {t("createAccount")}
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-ew-green-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:bg-ew-green-800"
          >
            <LogIn className="h-4 w-4" /> {t("login")}
          </Link>
        </div>
      </section>

      {/* Chiffres */}
      <section id="chiffres" className="mx-auto mt-14 w-full max-w-5xl scroll-mt-20 px-4 sm:mt-20 sm:px-6">
        <Reveal>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-xl sm:grid-cols-4">
            {([
              { to: 9, suffix: "", labelKey: "stat1" },
              { to: 13, suffix: "", labelKey: "stat2" },
              { to: 193, suffix: "", labelKey: "stat3" },
              { to: 100, suffix: " %", labelKey: "stat4" },
            ] as const).map((s) => (
              <div key={s.labelKey} className="bg-card px-5 py-7 text-center">
                <p className="font-display text-3xl font-extrabold text-ew-green-700 sm:text-4xl">
                  <CountUp to={s.to} suffix={s.suffix} />
                </p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">{t(s.labelKey)}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Fonctionnalités */}
      <section id="fonctionnalites" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6 sm:py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>{t("eyebrowFunctionalities")}</Eyebrow>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{t("modulesTitle")}</h2>
          <p className="mt-3 text-muted-foreground">{t("modulesSubtitle")}</p>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MODULE_ICONS.map((Icon, i) => {
            const titleKey = `module${i + 1}Title` as const;
            const descKey = `module${i + 1}Desc` as const;
            return (
              <Reveal key={i} delay={(i % 3) * 90} className="h-full">
                <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-ew-green-600/40 hover:shadow-xl">
                  <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-ew-green-600 to-ew-gold-500 transition-transform duration-300 group-hover:scale-x-100" />
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-ew-green-100 to-ew-green-50 text-ew-green-700 ring-1 ring-inset ring-ew-green-600/10 transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-foreground">{t(titleKey)}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t(descKey)}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Publics */}
      <section id="publics" className="scroll-mt-20 border-y border-border bg-gradient-to-b from-ew-green-50/60 to-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Eyebrow>{t("eyebrowAudiences")}</Eyebrow>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{t("audiencesTitle")}</h2>
            <p className="mt-3 text-muted-foreground">{t("audiencesSubtitle")}</p>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {AUDIENCE_ICONS.map((Icon, i) => {
              const labelKey = `audience${i + 1}` as const;
              return (
                <Reveal key={i} delay={(i % 6) * 70}>
                  <div className="flex h-full flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ew-gold-100 text-ew-gold-600">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="text-sm font-semibold leading-snug text-foreground">{t(labelKey)}</span>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Atouts */}
      <section id="atouts" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6 sm:py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>{t("eyebrowAtouts")}</Eyebrow>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{t("atoutsTitle")}</h2>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {ATOUT_ICONS.map((Icon, i) => {
            const titleKey = `atout${i + 1}Title` as const;
            const descKey = `atout${i + 1}Desc` as const;
            return (
              <Reveal key={i} delay={i * 110} className="h-full">
                <div className="h-full rounded-2xl border border-border bg-card p-7 shadow-sm transition-all duration-300 hover:shadow-lg">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ew-green-700 text-white shadow-sm">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-foreground">{t(titleKey)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(descKey)}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Appel à l'action */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
        <Reveal>
          <div className="ew-mesh relative overflow-hidden rounded-3xl px-6 py-14 text-center text-white sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-ew-gold-500/15 blur-3xl ew-pulse-soft" />
            <h2 className="relative font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{t("ctaTitle")}</h2>
            <p className="relative mx-auto mt-3 max-w-xl text-white/75">{t("ctaSubtitle")}</p>
            <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/login" className="group inline-flex items-center gap-2 rounded-xl bg-ew-gold-500 px-7 py-3.5 text-base font-bold text-ew-green-950 shadow-lg transition-transform hover:scale-[1.03]">
                {t("login")} <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/register" className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/5 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10">
                <UserPlus className="h-5 w-5" /> {t("createAccount")}
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Pied de page */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo tone="dark" />
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">{t("audiencesSubtitle")}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{t("footerProduct")}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="#fonctionnalites" className="hover:text-ew-green-700">{t("navFonctionnalites")}</a></li>
              <li><a href="#publics" className="hover:text-ew-green-700">{t("navPublics")}</a></li>
              <li><a href="#atouts" className="hover:text-ew-green-700">{t("navAtouts")}</a></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{t("footerCompany")}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-ew-green-700">{t("login")}</Link></li>
              <li><Link href="/register" className="hover:text-ew-green-700">{t("createAccount")}</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border">
          <p className="mx-auto max-w-6xl px-4 py-5 text-center text-xs text-muted-foreground sm:px-6">
            <FooterTagline />
          </p>
        </div>
      </footer>

      {/* Bouton flottant : diagnostic de maturité numérique CERTEL (EduWebBooking).
          Oriente le visiteur vers un niveau de formation. Ouvre booking.eduweb.ci. */}
      <a
        href="https://booking.eduweb.ci/certel/diagnostic"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Test de niveau CERTEL — diagnostic de maturité numérique (gratuit)"
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 px-4 py-3 text-white shadow-xl ring-1 ring-white/10 transition-transform hover:scale-[1.03] hover:shadow-2xl"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
          <GraduationCap className="h-5 w-5" />
        </span>
        <span className="text-left leading-tight">
          <span className="block text-sm font-bold">Test de niveau</span>
          <span className="block text-[11px] text-white/80">CERTEL · gratuit</span>
        </span>
      </a>
    </div>
  );
}
