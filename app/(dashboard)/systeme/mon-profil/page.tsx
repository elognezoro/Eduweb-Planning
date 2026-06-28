"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserCog, Save, Bell, Lock } from "lucide-react";
import { toast } from "sonner";
import { ModulePage, SectionCard, TwoColumn } from "@/components/modules/module-page";
import { ProfilePhotoUploader } from "@/components/forms/avatar-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/components/app-shell/app-context";
import { PhoneInput } from "@/components/forms/phone-input";
import { CountrySearchSelect } from "@/components/forms/country-select";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { profileSchema, type ProfileInput } from "@/lib/schemas/auth";
import { toNomCase, toPrenomCase } from "@/lib/format-name";
import { initials } from "@/lib/utils";

const NOTIFS = [
  { id: "absence", label: "Absences et retards" },
  { id: "grades", label: "Notes publiées" },
  { id: "reports", label: "Bulletins disponibles" },
  { id: "appointments", label: "Rendez-vous" },
];

export default function MonProfilPage() {
  const t = useTranslations();
  const { user } = useApp();
  // Pays de l'utilisateur (profiles.country_code), modifiable ici.
  const [profileCountry, setProfileCountry] = React.useState((user.countryCode || "CI").toUpperCase());
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone ?? "",
      jobTitle: user.jobTitle ?? "",
      bio: "",
      preferredLocale: user.preferredLocale,
    },
  });

  const onSubmit = async (data: ProfileInput) => {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: auth } = await supabase.auth.getUser();
        const uid = auth.user?.id;
        if (!uid) {
          toast.error("Session introuvable", { description: "Reconnectez-vous puis réessayez." });
          return;
        }
        const { error } = await supabase
          .from("profiles")
          .update({
            first_name: data.firstName,
            last_name: data.lastName,
            display_name: `${data.firstName} ${data.lastName}`.trim() || null,
            phone: data.phone || null,
            job_title: data.jobTitle || null,
            bio: data.bio || null,
            preferred_locale: data.preferredLocale,
            country_code: profileCountry,
            updated_at: new Date().toISOString(),
          })
          .eq("id", uid);
        if (error) {
          toast.error("Enregistrement refusé", { description: error.message });
          return;
        }
        toast.success("Profil mis à jour", { description: "Vos modifications ont été enregistrées." });
        return;
      } catch (e) {
        toast.error("Enregistrement impossible", {
          description: e instanceof Error ? e.message : undefined,
        });
        return;
      }
    }
    // Mode démo : pas de backend.
    await new Promise((r) => setTimeout(r, 400));
    toast.success("Profil mis à jour", { description: "Les modifications ont été enregistrées." });
  };

  // Normalisation de la casse à la saisie (NOM majuscules / Prénom title-case)
  const firstNameReg = register("firstName");
  const lastNameReg = register("lastName");

  return (
    <ModulePage title={t("pages.systemeMonProfil.title")} description={t("pages.systemeMonProfil.description")}
      icon={UserCog}
      permission="system:manage_profile"
      sections={[
        { id: "photo", label: "Photo de profil" },
        { id: "personnelles", label: "Infos personnelles" },
        { id: "professionnelles", label: "Infos professionnelles" },
        { id: "preferences", label: "Préférences & sécurité" },
      ]}
      actions={
        <Button form="profile-form" type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4" /> Enregistrer
        </Button>
      }
    >
      <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <SectionCard id="photo" title="Photo de profil">
          <ProfilePhotoUploader initials={initials(user.displayName)} />
        </SectionCard>

        <SectionCard id="personnelles" title="Informations personnelles">
          <TwoColumn className="lg:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Prénom</Label>
              <Input
                {...firstNameReg}
                onChange={(e) => {
                  e.target.value = toPrenomCase(e.target.value);
                  firstNameReg.onChange(e);
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Nom</Label>
              <Input
                {...lastNameReg}
                className="uppercase placeholder:normal-case"
                onChange={(e) => {
                  e.target.value = toNomCase(e.target.value);
                  lastNameReg.onChange(e);
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Adresse e-mail</Label>
              <Input type="email" {...register("email")} />
            </div>
            <div className="space-y-1.5">
              <Label>Pays</Label>
              <CountrySearchSelect
                value={profileCountry}
                onChange={(c) => setProfileCountry(c.toUpperCase())}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Téléphone</Label>
              <PhoneInput
                variant="field"
                countryCode={profileCountry}
                value={watch("phone") ?? ""}
                onChange={(v) => setValue("phone", v, { shouldDirty: true })}
              />
            </div>
          </TwoColumn>
        </SectionCard>

        <SectionCard id="professionnelles" title="Informations professionnelles">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Fonction</Label>
              <Input {...register("jobTitle")} />
            </div>
            <div className="space-y-1.5">
              <Label>Biographie</Label>
              <Textarea {...register("bio")} placeholder="Quelques mots sur votre fonction…" />
            </div>
            <div className="space-y-1.5">
              <Label>Langue préférée</Label>
              <Select value={watch("preferredLocale")} onValueChange={(v) => setValue("preferredLocale", v as "fr" | "en")}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">🇫🇷 Français</SelectItem>
                  <SelectItem value="en">🇬🇧 English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </SectionCard>

        <TwoColumn id="preferences">
          <SectionCard title="Préférences de notification" description="Choisissez les alertes que vous souhaitez recevoir.">
            <div className="space-y-3">
              {NOTIFS.map((n) => (
                <div key={n.id} className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 font-normal">
                    <Bell className="h-4 w-4 text-muted-foreground" /> {n.label}
                  </Label>
                  <Switch defaultChecked={n.id !== "reports"} />
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Sécurité du compte">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nouveau mot de passe</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-1.5">
                <Label>Confirmer le mot de passe</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 font-normal">
                  <Lock className="h-4 w-4 text-muted-foreground" /> Authentification à deux facteurs
                </Label>
                <Switch />
              </div>
            </div>
          </SectionCard>
        </TwoColumn>
      </form>
    </ModulePage>
  );
}
