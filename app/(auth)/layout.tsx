/**
 * Mise en page d'authentification : photo d'établissement teintée vert en fond
 * plein écran, carte d'authentification centrée (style planning.eduweb.ci).
 * Pour votre propre photo : déposez-la dans public/auth-bg.jpg et adaptez l'URL.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen w-full bg-ew-green-900 bg-cover bg-fixed bg-center"
      style={{
        backgroundImage:
          "linear-gradient(rgba(11,59,37,0.80), rgba(6,44,27,0.88)), url('https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1920&q=70')",
      }}
    >
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
