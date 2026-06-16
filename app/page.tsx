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
  ChevronDown,
} from "lucide-react";
import { Logo } from "@/components/app-shell/logo";
import { Reveal } from "@/components/marketing/reveal";
import { CountUp } from "@/components/marketing/count-up";

export const metadata = {
  title: "EduWeb Planner — Portail de pilotage scolaire",
};

const MODULES = [
  { icon: ClipboardCheck, title: "Registre d'appel", desc: "Présences, retards, justificatifs et alertes SMS aux parents, en temps réel." },
  { icon: NotebookText, title: "Cahier de texte", desc: "Séances, objectifs, contenus et devoirs, publiés et accessibles en ligne." },
  { icon: ClipboardList, title: "Notes & bulletins", desc: "Saisie des notes, calcul des moyennes et bulletins officiels en un clic." },
  { icon: BookMarked, title: "Livret scolaire", desc: "Parcours, compétences et synthèses individualisées de chaque élève." },
  { icon: SearchCheck, title: "Inspection & supervision", desc: "Grilles d'évaluation, rapports d'inspection et suivi des recommandations." },
  { icon: BarChart3, title: "Statistiques & analytics", desc: "Réussite, assiduité, tendances et indicateurs croisés, par région." },
  { icon: CalendarDays, title: "Emplois du temps", desc: "Génération assistée et simulation des emplois du temps par classe." },
  { icon: GraduationCap, title: "CAFOP & APFC", desc: "Formation initiale et continue des enseignants, bulletins et activités." },
  { icon: MessagesSquare, title: "Communication & rendez-vous", desc: "Annonces, convocations, messagerie interne et notifications SMS." },
];

const AUDIENCES = [
  { icon: Building2, label: "Chefs d'établissement" },
  { icon: Users, label: "Enseignants & éducateurs" },
  { icon: GraduationCap, label: "Parents & élèves" },
  { icon: SearchCheck, label: "Inspecteurs & conseillers" },
  { icon: Globe, label: "DRENA & administration" },
  { icon: Network, label: "CAFOP & APFC" },
];

const STATS = [
  { to: 9, suffix: "", label: "Modules intégrés" },
  { to: 13, suffix: "", label: "Rôles & permissions" },
  { to: 193, suffix: "", label: "Pays pris en charge" },
  { to: 100, suffix: " %", label: "Accessible en ligne" },
];

const ATOUTS = [
  { icon: ShieldCheck, title: "Sécurité & rôles", desc: "Authentification, permissions par rôle et habilitations temporaires traçables." },
  { icon: FileText, title: "Documents officiels", desc: "Bulletins, livrets et rapports exportables en PDF et Word, avec en-tête institutionnel." },
  { icon: Globe, title: "Adapté à votre pays", desc: "Devise, armoiries, régions académiques et régime scolaire entièrement configurables." },
];

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] ${light ? "text-ew-gold-500" : "text-ew-green-700"}`}>
      <span className={`h-px w-7 ${light ? "bg-ew-gold-500/60" : "bg-ew-green-600/50"}`} />
      {children}
    </span>
  );
}

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col bg-background">
      {/* En-tête */}
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Logo tone="dark" />
          <nav className="hidden items-center gap-7 text-sm font-semibold text-muted-foreground md:flex">
            <a href="#fonctionnalites" className="transition-colors hover:text-ew-green-700">Fonctionnalités</a>
            <a href="#publics" className="transition-colors hover:text-ew-green-700">Publics</a>
            <a href="#atouts" className="transition-colors hover:text-ew-green-700">Atouts</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/register" className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-ew-green-800 transition-colors hover:bg-ew-green-50 sm:inline-flex">
              Créer un compte
            </Link>
            <Link href="/login" className="inline-flex items-center gap-2 rounded-lg bg-ew-green-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-ew-green-800 hover:shadow-md">
              <LogIn className="h-4 w-4" /> Connexion
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — image SVG en arrière-plan + voile + éléments flottants */}
      <section className="relative isolate overflow-hidden text-white">
        <div className="absolute inset-0 -z-20 bg-ew-green-950 bg-cover bg-center" style={{ backgroundImage: "url('/brand/hero.svg')" }} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ew-green-950/75 via-ew-green-900/55 to-ew-green-950/85" />
        {/* Orbes flottants */}
        <div className="pointer-events-none absolute -right-20 top-10 -z-10 h-72 w-72 rounded-full bg-ew-gold-500/15 blur-3xl ew-float" />
        <div className="pointer-events-none absolute -left-24 bottom-0 -z-10 h-80 w-80 rounded-full bg-ew-green-600/20 blur-3xl ew-float-slow" />

        <div className="mx-auto max-w-6xl px-4 pb-28 pt-20 sm:px-6 sm:pb-32 sm:pt-28">
          <div className="max-w-3xl">
            <div className="ew-rise" style={{ animationDelay: "60ms" }}>
              <Eyebrow light>Plateforme internationale de pilotage scolaire</Eyebrow>
            </div>
            <h1 className="ew-rise mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl" style={{ animationDelay: "140ms" }}>
              Pilotez, planifiez et accompagnez{" "}
              <span className="bg-gradient-to-r from-ew-gold-500 to-ew-gold-600 bg-clip-text text-transparent">chaque parcours scolaire</span>.
            </h1>
            <p className="ew-rise mt-6 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg" style={{ animationDelay: "220ms" }}>
              EduWeb Planner réunit la vie scolaire, les évaluations, l&apos;inspection et le pilotage dans un seul
              espace numérique sécurisé — du primaire au secondaire, jusqu&apos;à la formation des enseignants.
            </p>
            <div className="ew-rise mt-9 flex flex-wrap items-center gap-3" style={{ animationDelay: "300ms" }}>
              <Link href="/login" className="group inline-flex items-center gap-2 rounded-xl bg-ew-gold-500 px-7 py-3.5 text-base font-bold text-ew-green-950 shadow-lg shadow-ew-gold-500/20 transition-transform hover:scale-[1.03]">
                <LogIn className="h-5 w-5" /> Accéder à mon espace
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/register" className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10">
                <UserPlus className="h-5 w-5" /> Créer un compte
              </Link>
            </div>
            <div className="ew-rise mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/60" style={{ animationDelay: "380ms" }}>
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-ew-gold-500" /> Accès sécurisé par rôle</span>
              <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4 text-ew-gold-500" /> Multi-établissement</span>
              <span className="flex items-center gap-1.5"><Globe className="h-4 w-4 text-ew-gold-500" /> Multi-pays</span>
            </div>
          </div>
        </div>

        {/* Indicateur de défilement */}
        <a href="#chiffres" aria-label="Faire défiler" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-white/55 sm:block">
          <ChevronDown className="ew-bob h-6 w-6" />
        </a>
      </section>

      {/* Chiffres — carte flottante chevauchant le hero */}
      <section id="chiffres" className="relative z-10 mx-auto -mt-14 w-full max-w-5xl px-4 sm:px-6">
        <Reveal>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-xl sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-card px-5 py-7 text-center">
                <p className="font-display text-3xl font-extrabold text-ew-green-700 sm:text-4xl">
                  <CountUp to={s.to} suffix={s.suffix} />
                </p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Fonctionnalités */}
      <section id="fonctionnalites" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6 sm:py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>Fonctionnalités</Eyebrow>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Un espace pour chaque mission</h2>
          <p className="mt-3 text-muted-foreground">Tous les outils du quotidien scolaire, intégrés et reliés entre eux.</p>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m, i) => {
            const Icon = m.icon;
            return (
              <Reveal key={m.title} delay={(i % 3) * 90} className="h-full">
                <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-ew-green-600/40 hover:shadow-xl">
                  <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-ew-green-600 to-ew-gold-500 transition-transform duration-300 group-hover:scale-x-100" />
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-ew-green-100 to-ew-green-50 text-ew-green-700 ring-1 ring-inset ring-ew-green-600/10 transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-foreground">{m.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{m.desc}</p>
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
            <Eyebrow>Publics</Eyebrow>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Pensé pour tous les acteurs de l&apos;école</h2>
            <p className="mt-3 text-muted-foreground">Chaque utilisateur accède à un espace adapté à son rôle et à ses droits.</p>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {AUDIENCES.map((a, i) => {
              const Icon = a.icon;
              return (
                <Reveal key={a.label} delay={(i % 6) * 70}>
                  <div className="flex h-full flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ew-gold-100 text-ew-gold-600">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="text-sm font-semibold leading-snug text-foreground">{a.label}</span>
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
          <Eyebrow>Atouts</Eyebrow>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Conçu pour les systèmes éducatifs exigeants</h2>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {ATOUTS.map((f, i) => {
            const Icon = f.icon;
            return (
              <Reveal key={f.title} delay={i * 110} className="h-full">
                <div className="h-full rounded-2xl border border-border bg-card p-7 shadow-sm transition-all duration-300 hover:shadow-lg">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ew-green-700 text-white shadow-sm">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
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
            <h2 className="relative font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Prêt à piloter votre établissement ?</h2>
            <p className="relative mx-auto mt-3 max-w-xl text-white/75">
              Connectez-vous pour retrouver votre tableau de bord, ou créez un compte pour rejoindre la plateforme.
            </p>
            <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/login" className="group inline-flex items-center gap-2 rounded-xl bg-ew-gold-500 px-7 py-3.5 text-base font-bold text-ew-green-950 shadow-lg transition-transform hover:scale-[1.03]">
                Connexion <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/register" className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/5 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10">
                <UserPlus className="h-5 w-5" /> Créer un compte
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
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Plateforme internationale de gestion, de planification et de pilotage scolaire — du primaire au
              secondaire et à la formation des enseignants.
            </p>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Plateforme</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="#fonctionnalites" className="hover:text-ew-green-700">Fonctionnalités</a></li>
              <li><a href="#publics" className="hover:text-ew-green-700">Publics</a></li>
              <li><a href="#atouts" className="hover:text-ew-green-700">Atouts</a></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Accès</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-ew-green-700">Connexion</Link></li>
              <li><Link href="/register" className="hover:text-ew-green-700">Créer un compte</Link></li>
              <li><Link href="/reset-password" className="hover:text-ew-green-700">Mot de passe oublié</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border">
          <p className="mx-auto max-w-6xl px-4 py-5 text-center text-xs text-muted-foreground sm:px-6">
            EduWeb Planner — Plateforme internationale de pilotage scolaire · © 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
