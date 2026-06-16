"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LogIn, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { AuthShell, AuthField, authInputCls } from "@/components/app-shell/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { loginSchema, type LoginInput } from "@/lib/schemas/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [show, setShow] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "elognezoro@gmail.com", password: "demodemo" },
  });

  const onSubmit = async (data: LoginInput) => {
    if (isSupabaseConfigured()) {
      const { error } = await createClient().auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) {
        toast.error("Connexion échouée", { description: error.message });
        return;
      }
      toast.success("Connexion réussie", { description: "Bienvenue sur EduWeb Planner." });
      router.push("/dashboard");
      router.refresh();
      return;
    }
    // Mode démo
    await new Promise((r) => setTimeout(r, 500));
    toast.success("Connexion réussie", { description: "Bienvenue sur EduWeb Planner." });
    router.push("/dashboard");
  };

  return (
    <AuthShell>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AuthField label="Email" required error={errors.email?.message}>
          <Input type="email" autoComplete="email" className={authInputCls} {...register("email")} />
        </AuthField>

        <AuthField label="Mot de passe" required error={errors.password?.message}>
          <div className="relative">
            <Input
              type={show ? "text" : "password"}
              autoComplete="current-password"
              className={cn(authInputCls, "pr-11")}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={show ? "Masquer" : "Afficher"}
            >
              {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </AuthField>

        <div className="text-right">
          <Link href="/reset-password" className="text-sm font-semibold text-ew-green-700 hover:underline">
            Identifiant ou mot de passe oublié ?
          </Link>
        </div>

        <label className="flex items-center gap-2.5 text-sm text-foreground">
          <input type="checkbox" defaultChecked className="h-4 w-4 accent-ew-green-700" />
          Mémoriser les paramètres de connexion
        </label>

        <Button type="submit" size="lg" className="h-12 w-full text-base" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
          Se connecter
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link href="/register" className="font-bold text-ew-green-700 hover:underline">
          Créer un compte
        </Link>
      </p>
    </AuthShell>
  );
}
