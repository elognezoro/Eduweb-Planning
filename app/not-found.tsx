import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="ew-hero-gradient ew-mesh flex min-h-screen flex-col items-center justify-center px-6 text-center text-white">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
        <Compass className="h-8 w-8" />
      </div>
      <p className="mt-6 text-5xl font-extrabold">404</p>
      <h1 className="mt-2 font-display text-2xl font-bold">Page introuvable</h1>
      <p className="mt-2 max-w-md text-white/70">
        La page que vous recherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 font-semibold text-ew-green-800 transition-colors hover:bg-white/90"
      >
        <ArrowLeft className="h-4 w-4" /> Revenir au tableau de bord
      </Link>
    </div>
  );
}
