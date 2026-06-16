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
import { Logo } from "@/components/app-shell/logo";

export const metadata = {
  title: "EduWeb Planner — Portail de pilotage scolaire",
};

const MODULES = [
  { icon: ClipboardCheck, title: "Registre d'appel", desc: "Présences, retards, justificatifs et alertes SMS aux parents." },
  { icon: NotebookText, title: "Cahier de texte", desc: "Séances, objectifs, contenus et devoirs, publiés en ligne." },
  { icon: ClipboardList, title: "Notes & bulletins", desc: "Saisie des notes, moyennes et bulletins officiels en un clic." },
  { icon: BookMarked, title: "Livret scolaire", desc: "Parcours, compétences et synthèses de l'élève." },
  { icon: SearchCheck, title: "Inspection & supervision", desc: "Grilles d'évaluation, rapports et recommandations." },
  { icon: BarChart3, title: "Statistiques & analytics", desc: "Réussite, assiduité, tendances et indicateurs croisés." },
  { icon: CalendarDays, title: "Emplois du temps", desc: "Génération et simulation des emplois du temps." },
  { icon: GraduationCap, title: "CAFOP & APFC", desc: "Formation initiale et continue des enseignants." },
  { icon: MessagesSquare, title: "Communication & rendez-vous", desc: "Annonces, convocations et messagerie interne." },
];

const AUDIENCES = [
  { icon: Building2, label: "Chefs d'établissement" },
  { icon: Users, label: "Enseignants & éducateurs" },
  { icon: GraduationCap, label: "Parents & élèves" },
  { icon: SearchCheck, label: "Inspecteurs & conseillers" },
  { icon: Globe, label: "DRENA & administration" },
  { icon: Network, label: "CAFOP & APFC" },
];

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col bg-background">
      {/* Barre de navigation */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Logo tone="dark" />
          <div className="flex items-center gap-2">
            <Link
              href="/register"
              className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-ew-green-800 transition-colors hover:bg-ew-green-50 sm:inline-flex"
            >
              Créer un compte
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-ew-green-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-ew-green-800"
            >
              <LogIn className="h-4 w-4" /> Connexion
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ew-green-900 via-ew-green-800 to-ew-green-900 text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-ew-gold-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-ew-green-600/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-ew-gold-500">
            <Globe className="h-3.5 w-3.5" /> Plateforme internationale de pilotage scolaire
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Pilotez, planifiez et accompagnez <span className="text-ew-gold-500">chaque parcours scolaire</span>.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
            EduWeb Planner réunit la vie scolaire, les évaluations, l&apos;inspection et le pilotage dans un seul espace
            numérique sécurisé — du primaire au secondaire, en passant par la formation des enseignants.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-ew-gold-500 px-6 py-3 text-base font-bold text-ew-green-950 shadow-lg transition-transform hover:scale-[1.02]"
            >
              <LogIn className="h-5 w-5" /> Accéder à mon espace
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10"
            >
              <UserPlus className="h-5 w-5" /> Créer un compte
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/60">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-ew-gold-500" /> Accès sécurisé par rôle</span>
            <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4 text-ew-gold-500" /> Multi-établissement</span>
            <span className="flex items-center gap-1.5"><Globe className="h-4 w-4 text-ew-gold-500" /> Multi-pays</span>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Un espace pour chaque mission</h2>
          <p className="mt-3 text-muted-foreground">
            Tous les outils du quotidien scolaire, intégrés et reliés entre eux.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.title}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ew-green-100 text-ew-green-700">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-bold text-foreground">{m.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{m.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pour qui ? */}
      <section className="border-y border-border bg-ew-green-50/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Pensé pour tous les acteurs de l&apos;école</h2>
            <p className="mt-3 text-muted-foreground">Chaque utilisateur accède à un espace adapté à son rôle.</p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {AUDIENCES.map((a) => {
              const Icon = a.icon;
              return (
                <div key={a.label} className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ew-gold-100 text-ew-gold-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-semibold text-foreground">{a.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Confiance */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Sécurité & rôles", desc: "Authentification, permissions par rôle et habilitations temporaires." },
            { icon: FileText, title: "Documents officiels", desc: "Bulletins, livrets et rapports exportables en PDF et Word, en-tête institutionnel." },
            { icon: Globe, title: "Adapté à votre pays", desc: "Devise, armoiries, régions académiques et régime scolaire configurables." },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="rounded-2xl border border-border bg-card p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ew-green-100 text-ew-green-700">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-bold text-foreground">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Appel à l'action */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ew-green-800 to-ew-green-900 px-6 py-12 text-center text-white sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-ew-gold-500/10 blur-3xl" />
          <h2 className="relative text-2xl font-extrabold tracking-tight sm:text-3xl">Prêt à accéder à votre espace ?</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-white/75">
            Connectez-vous pour retrouver votre tableau de bord, ou créez un compte pour rejoindre la plateforme.
          </p>
          <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-ew-gold-500 px-6 py-3 text-base font-bold text-ew-green-950 shadow-lg transition-transform hover:scale-[1.02]"
            >
              Connexion <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10"
            >
              <UserPlus className="h-5 w-5" /> Créer un compte
            </Link>
          </div>
        </div>
      </section>

      {/* Pied de page */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-center sm:flex-row sm:px-6 sm:text-left">
          <Logo tone="dark" />
          <p className="text-sm text-muted-foreground">
            EduWeb Planner — Plateforme internationale de pilotage scolaire · © 2026
          </p>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <Link href="/login" className="text-ew-green-700 hover:underline">Connexion</Link>
            <Link href="/register" className="text-ew-green-700 hover:underline">Créer un compte</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
