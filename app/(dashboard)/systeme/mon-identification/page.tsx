"use client";

import { BadgeCheck, Mail, Phone, Globe, Building2, CalendarDays, Clock, ShieldCheck, Eye, IdCard, Fingerprint } from "lucide-react";
import { ModulePage, SectionCard } from "@/components/modules/module-page";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RoleBadge } from "@/components/app-shell/role-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { useApp } from "@/components/app-shell/app-context";
import { getRole } from "@/lib/roles";
import { roleProfileSection } from "@/lib/role-profile";
import { ETABLISSEMENTS } from "@/lib/mock-data";
import { formatDate, initials } from "@/lib/utils";

export default function MonIdentificationPage() {
  const { user, effectiveRole, isPreview, country } = useApp();
  const role = getRole(effectiveRole);
  const region = country.academicRegions.find((r) => r.code === user.academicRegionCode);
  const etab = ETABLISSEMENTS.find((e) => e.id === user.etablissementId) ?? ETABLISSEMENTS[0];
  const profile = roleProfileSection(effectiveRole, { etablissement: etab.name, region: region?.name ?? "Direction nationale" });

  const rows: { icon: typeof Mail; label: string; value: React.ReactNode }[] = [
    {
      icon: Fingerprint,
      label: "Identifiant technique",
      value: <span className="font-mono text-xs">{user.id}</span>,
    },
    { icon: Mail, label: "Adresse e-mail", value: user.email },
    { icon: Phone, label: "Téléphone", value: user.phone ?? "—" },
    { icon: Globe, label: "Pays", value: `${country.flag} ${country.nameFr}` },
    { icon: Building2, label: "Structure de rattachement", value: region?.name ?? "Direction nationale" },
    { icon: CalendarDays, label: "Date de création", value: formatDate(user.createdAt) },
    { icon: Clock, label: "Dernière connexion", value: user.lastLoginAt ? formatDate(user.lastLoginAt) : "—" },
  ];

  return (
    <ModulePage
      title="Mon Identification"
      description="Récapitulatif de votre identité et de votre rattachement sur la plateforme."
      icon={BadgeCheck}
      permission="system:manage_profile"
      sections={[
        { id: "profil", label: "Profil" },
        { id: "informations", label: "Informations" },
        { id: "role", label: "Spécifique au rôle" },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard id="profil" className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-xl">{initials(user.displayName)}</AvatarFallback>
            </Avatar>
            <h2 className="mt-3 text-lg font-bold text-foreground">{user.displayName}</h2>
            <p className="text-sm text-muted-foreground">{isPreview ? role.label : user.jobTitle}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <RoleBadge role={effectiveRole} />
              <StatusBadge status={user.status} />
              {isPreview && (
                <Badge tone="gold">
                  <Eye className="h-3 w-3" /> Aperçu de rôle
                </Badge>
              )}
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-ew-green-50 px-3 py-2 text-sm text-ew-green-800">
              <ShieldCheck className="h-4 w-4" /> Compte vérifié
            </div>
          </div>
        </SectionCard>

        <SectionCard id="informations" title="Informations" className="lg:col-span-2">
          <dl className="divide-y divide-border">
            {rows.map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.label} className="flex items-center justify-between gap-3 py-3">
                  <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon className="h-4 w-4" /> {r.label}
                  </dt>
                  <dd className="text-sm font-semibold text-foreground">{r.value}</dd>
                </div>
              );
            })}
          </dl>
          <div className="mt-4 flex items-center justify-between rounded-lg border border-border p-3">
            <span className="text-sm text-muted-foreground">Identifiant technique du rôle</span>
            <Badge tone="slate">{role.id}</Badge>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        id="role"
        title={profile.title}
        description="Informations propres à votre rôle sur la plateforme."
        action={
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ew-green-100 text-ew-green-700">
            <IdCard className="h-4 w-4" />
          </span>
        }
      >
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {profile.fields.map((f) => (
            <div key={f.label} className="border-b border-border pb-3">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">{f.label}</dt>
              <dd className="mt-0.5 text-sm font-semibold text-foreground">{f.value}</dd>
            </div>
          ))}
        </dl>
        {isPreview && (
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Eye className="h-3.5 w-3.5 shrink-0" /> Affiché en aperçu du rôle « {role.label} » — changez de rôle via « Aperçu de rôle » dans le bandeau.
          </p>
        )}
      </SectionCard>
    </ModulePage>
  );
}
