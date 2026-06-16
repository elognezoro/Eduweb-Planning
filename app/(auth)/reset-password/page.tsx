"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AuthShell, AuthField, authInputCls } from "@/components/app-shell/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetSchema, type ResetInput } from "@/lib/schemas/auth";

export default function ResetPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ResetInput>({ resolver: zodResolver(resetSchema) });

  const onSubmit = async (_data: ResetInput) => {
    await new Promise((r) => setTimeout(r, 600));
    toast.success("E-mail envoyé", { description: "Consultez votre boîte de réception." });
  };

  return (
    <AuthShell>
      <div className="text-center">
        <h2 className="text-lg font-extrabold text-foreground">Mot de passe oublié</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Saisissez votre adresse e-mail pour recevoir un lien de réinitialisation.
        </p>
      </div>

      {isSubmitSuccessful ? (
        <div className="mt-6 rounded-xl border border-ew-green-100 bg-ew-green-50 p-5 text-sm text-ew-green-800">
          Si un compte est associé à cette adresse, un lien de réinitialisation vient d&apos;être envoyé.
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <AuthField label="Email" required error={errors.email?.message}>
            <Input type="email" autoComplete="email" className={authInputCls} {...register("email")} />
          </AuthField>
          <Button type="submit" size="lg" className="h-12 w-full text-base" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mail className="h-5 w-5" />}
            Envoyer le lien
          </Button>
        </form>
      )}

      <Link
        href="/login"
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ew-green-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Retour à la connexion
      </Link>
    </AuthShell>
  );
}
