"use client";

import * as React from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  UserPlus,
  Eye,
  EyeOff,
  Phone,
  MapPin,
  BadgeCheck,
  CheckCircle2,
  GraduationCap,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  AuthShell,
  AuthField,
  authInputCls,
} from "@/components/app-shell/auth-shell";
import { CountryFlag } from "@/components/app-shell/switchers";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { getCourse } from "@/lib/formations/catalog";
import {
  DEFAULT_FORMATION_ROLE,
  FORMATION_ROLE_META,
} from "@/lib/formations/formation-roles";
import {
  decodeInviteToken,
  payloadStatus,
  queueEnrollIntent,
} from "@/lib/formations/enrollment-invite";
import { PhoneInput } from "@/components/forms/phone-input";
import { toNomCase, toPrenomCase } from "@/lib/format-name";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UN_COUNTRIES } from "@/config/un-countries";
import { registerSchema, type RegisterInput } from "@/lib/schemas/auth";
import { cn } from "@/lib/utils";

const RULES: { label: string; test: (v: string) => boolean }[] = [
  { label: "8 caractères minimum", test: (v) => v.length >= 8 },
  { label: "1 lettre majuscule (A–Z)", test: (v) => /[A-Z]/.test(v) },
  { label: "1 lettre minuscule (a–z)", test: (v) => /[a-z]/.test(v) },
  { label: "1 chiffre (0–9)", test: (v) => /[0-9]/.test(v) },
  { label: "1 caractère spécial (!@#…)", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

const STRENGTH = [
  { label: "", color: "bg-transparent" },
  { label: "Très faible", color: "bg-red-500" },
  { label: "Faible", color: "bg-ew-orange" },
  { label: "Moyen", color: "bg-ew-gold-500" },
  { label: "Bon", color: "bg-ew-green-600" },
  { label: "Excellent", color: "bg-ew-green-700" },
];

export default function RegisterPage() {
  const [show, setShow] = React.useState(false);
  // Vrai si l'inscription a échoué car le compte existe déjà : on a tout de
  // même déposé l'intention d'inscription aux cours (réclamée au prochain login).
  const [accountExists, setAccountExists] = React.useState(false);

  // Lien d'inscription : jeton auto-porteur lu dans l'URL (?invite=...).
  // Lecture APRÈS montage (useEffect) : un initialiseur useState lisant
  // window.location s'exécute au rendu serveur/statique (window indéfini) et
  // renverrait toujours null, neutralisant le lien d'invitation. L'effet ne
  // s'exécute que côté client, où le jeton est réellement disponible.
  const [inviteToken, setInviteToken] = React.useState<string | null>(null);
  React.useEffect(() => {
    setInviteToken(new URLSearchParams(window.location.search).get("invite"));
  }, []);
  const invite = React.useMemo(
    () => (inviteToken ? decodeInviteToken(inviteToken) : null),
    [inviteToken],
  );
  const inviteState = React.useMemo(() => payloadStatus(invite), [invite]);
  const inviteCourses = React.useMemo(
    () => (invite ? invite.c.map((id) => getCourse(id)).filter(Boolean) : []),
    [invite],
  );
  const inviteRoleLabel =
    FORMATION_ROLE_META[invite?.r ?? DEFAULT_FORMATION_ROLE].label;
  const invitePaid = invite?.p === 1;

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { country: "CI", acceptTerms: false },
  });

  const password = watch("password") ?? "";
  const selectedCountry = watch("country") ?? "CI";
  const score = RULES.filter((r) => r.test(password)).length;
  const strength = STRENGTH[score];

  // Enregistrements RHF + normalisation de la casse à la saisie
  const lastNameReg = register("lastName");
  const firstNameReg = register("firstName");

  // Dépose l'intention d'inscription aux cours du lien (consommée par le
  // tableau de bord à la première connexion). N'agit que si le lien est valide.
  const queueInviteEnrollment = (email: string) => {
    if (!invite || inviteState !== "valid") return;
    queueEnrollIntent({
      email,
      courseIds: invite.c,
      formationRole: invite.r,
      expiresAt: invite.e ?? null,
      paid: invite.p === 1,
      source: "Lien d'inscription",
      createdAt: new Date().toISOString(),
    });
  };

  const onSubmit = async (data: RegisterInput) => {
    if (isSupabaseConfigured()) {
      const { error } = await createClient().auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            country: data.country,
          },
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/login`
              : undefined,
        },
      });
      if (error) {
        const m = (error.message || "").toLowerCase();
        const already =
          m.includes("already") ||
          m.includes("registered") ||
          m.includes("exist");
        if (already) {
          // Le compte existe déjà : on dépose quand même l'intention
          // d'inscription aux cours du lien — matérialisée au prochain login.
          setAccountExists(true);
          queueInviteEnrollment(data.email);
          return; // écran « ce compte existe déjà — connectez-vous »
        }
        toast.error("Inscription échouée", { description: error.message });
        throw error; // empêche l'écran de succès
      }
      setAccountExists(false);
      queueInviteEnrollment(data.email);
      return; // succès → écran « Compte créé / en attente de validation »
    }
    // Mode démo
    await new Promise((r) => setTimeout(r, 700));
    queueInviteEnrollment(data.email);
  };

  if (isSubmitSuccessful) {
    return (
      <AuthShell>
        <div className="py-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ew-green-100 text-ew-green-700">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-extrabold text-foreground">
            {accountExists ? "Ce compte existe déjà" : "Compte créé"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {accountExists ? (
              <>
                Un compte existe déjà avec cet e-mail.{" "}
                <strong>Connectez-vous</strong> : vous serez inscrit(e) aux cours
                du lien dès votre connexion.
              </>
            ) : (
              <>
                Votre compte est <strong>en attente de validation</strong> par un
                administrateur. Vous recevrez une notification dès son
                activation.
              </>
            )}
          </p>
          {invite && inviteState === "valid" && inviteCourses.length > 0 ? (
            <div className="mt-4 rounded-xl border border-ew-green-200 bg-ew-green-50/50 p-3 text-left text-sm">
              <p className="flex items-center gap-1.5 font-bold text-ew-green-800">
                <GraduationCap className="h-4 w-4" /> Inscription préparée
              </p>
              <p className="mt-1 text-foreground/90">
                Dès votre première connexion, vous serez inscrit(e) à :{" "}
                <strong>
                  {inviteCourses.map((c) => c!.shortTitle).join(", ")}
                </strong>
                .
              </p>
            </div>
          ) : invite && inviteState !== "valid" ? (
            <div className="mt-4 rounded-xl border border-ew-gold-200 bg-ew-gold-50/60 p-3 text-left text-sm">
              <p className="flex items-center gap-1.5 font-bold text-ew-gold-700">
                <AlertTriangle className="h-4 w-4" /> Inscription non appliquée
              </p>
              <p className="mt-1 text-foreground/90">
                Votre lien d&apos;invitation était{" "}
                {inviteState === "expired" ? "expiré" : "invalide"} : votre
                compte est créé, mais sans inscription automatique à la
                formation. Contactez l&apos;administrateur pour obtenir un
                nouveau lien.
              </p>
            </div>
          ) : null}
          <Button asChild className="mt-5 h-12 w-full">
            <Link href="/login">Retour à la connexion</Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      {inviteToken ? (
        inviteState === "valid" && inviteCourses.length > 0 ? (
          <div className="mb-4 rounded-xl border border-ew-green-200 bg-ew-green-50/50 p-3 text-sm">
            <p className="flex items-center gap-1.5 font-bold text-ew-green-800">
              <GraduationCap className="h-4 w-4" /> Invitation à une formation
            </p>
            <p className="mt-1 text-foreground/90">
              En créant votre compte, vous serez inscrit(e) à :{" "}
              <strong>
                {inviteCourses.map((c) => c!.shortTitle).join(", ")}
              </strong>{" "}
              <span className="text-muted-foreground">
                (rôle : {inviteRoleLabel})
              </span>
              .
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {invitePaid
                ? "Lien payant : le règlement des cours payants se fera à l'accès au cours."
                : "Inscription offerte : aucun paiement ne vous sera demandé."}
            </p>
          </div>
        ) : (
          <div className="mb-4 rounded-xl border border-ew-gold-200 bg-ew-gold-50/60 p-3 text-sm">
            <p className="flex items-center gap-1.5 font-bold text-ew-gold-700">
              <AlertTriangle className="h-4 w-4" /> Lien d&apos;invitation{" "}
              {inviteState === "expired" ? "expiré" : "invalide"}
            </p>
            <p className="mt-1 text-foreground/90">
              Vous pouvez tout de même créer votre compte ; l&apos;inscription
              automatique à la formation ne sera pas appliquée. Contactez
              l&apos;administrateur pour un nouveau lien.
            </p>
          </div>
        )
      ) : null}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AuthField
          label="Pays"
          required
          icon={MapPin}
          error={errors.country?.message}
          badge={
            <span className="flex items-center gap-1 rounded-full bg-ew-green-100 px-2 py-0.5 text-[11px] font-semibold text-ew-green-700">
              <BadgeCheck className="h-3 w-3" /> Détecté automatiquement
            </span>
          }
        >
          <Controller
            control={control}
            name="country"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className={authInputCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {UN_COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      <span className="flex items-center gap-2">
                        <CountryFlag code={c.code} />
                        {c.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </AuthField>

        <div className="grid grid-cols-2 gap-3">
          <AuthField label="Nom" required error={errors.lastName?.message}>
            <Input
              className={cn(authInputCls, "uppercase placeholder:normal-case")}
              placeholder="ZORO"
              autoComplete="family-name"
              {...lastNameReg}
              onChange={(e) => {
                e.target.value = toNomCase(e.target.value);
                lastNameReg.onChange(e);
              }}
            />
          </AuthField>
          <AuthField
            label="Prénom(s)"
            required
            error={errors.firstName?.message}
          >
            <Input
              className={authInputCls}
              placeholder="Elogne Guessan"
              autoComplete="given-name"
              {...firstNameReg}
              onChange={(e) => {
                e.target.value = toPrenomCase(e.target.value);
                firstNameReg.onChange(e);
              }}
            />
          </AuthField>
        </div>

        <AuthField
          label="Téléphone"
          required
          icon={Phone}
          error={errors.phone?.message}
        >
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <PhoneInput
                countryCode={selectedCountry}
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="07 XX XX XX XX"
              />
            )}
          />
        </AuthField>

        <AuthField label="Email" required error={errors.email?.message}>
          <Input
            className={authInputCls}
            type="email"
            placeholder="vous@exemple.com"
            {...register("email")}
          />
        </AuthField>

        <AuthField
          label="Mot de passe"
          required
          error={errors.password?.message}
        >
          <div className="relative">
            <Input
              type={show ? "text" : "password"}
              className={cn(authInputCls, "pr-11")}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={show ? "Masquer" : "Afficher"}
            >
              {show ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Force du mot de passe + conditions — affichées dès la première frappe */}
          {password.length > 0 && (
            <>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      strength.color,
                    )}
                    style={{ width: `${(score / 5) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  {strength.label}
                </span>
              </div>

              <div className="mt-3 rounded-xl border border-border bg-muted/30 p-3.5">
                <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  Le mot de passe doit contenir :
                </p>
                <ul className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
                  {RULES.map((r) => {
                    const ok = r.test(password);
                    return (
                      <li
                        key={r.label}
                        className={cn(
                          "flex items-center gap-2 text-xs transition-colors",
                          ok
                            ? "font-medium text-ew-green-700"
                            : "text-muted-foreground/70",
                        )}
                      >
                        <CheckCircle2
                          className={cn(
                            "h-4 w-4 shrink-0",
                            ok
                              ? "text-ew-green-600"
                              : "text-muted-foreground/30",
                          )}
                        />
                        {r.label}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </>
          )}
        </AuthField>

        <AuthField
          label="Confirmer le mot de passe"
          required
          error={errors.confirmPassword?.message}
        >
          <Input
            type="password"
            className={authInputCls}
            {...register("confirmPassword")}
          />
        </AuthField>

        <div>
          <label className="flex items-start gap-2.5 text-sm text-foreground">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-ew-green-700"
              {...register("acceptTerms")}
            />
            <span>
              J&apos;accepte les{" "}
              <a className="font-semibold text-ew-green-700 underline" href="#">
                conditions d&apos;utilisation
              </a>{" "}
              et la{" "}
              <a className="font-semibold text-ew-green-700 underline" href="#">
                politique de confidentialité
              </a>{" "}
              d&apos;EduWeb Planner.
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="mt-1 text-xs text-red-600">
              {errors.acceptTerms.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="h-12 w-full text-base"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <UserPlus className="h-5 w-5" />
          )}
          Créer mon compte
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Déjà inscrit ?{" "}
        <Link
          href="/login"
          className="font-bold text-ew-green-700 hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </AuthShell>
  );
}
