/* ============================================================================
   Paiement Mobile Money des cours (manuel / semi-automatique).

   Faute de couche serveur de paiement partagée (Phase 2), le paiement est
   géré sans agrégateur :
   - l'administrateur publie, par opérateur, un NUMÉRO MARCHAND et des
     instructions ;
   - l'utilisateur paie depuis son téléphone, puis saisit la RÉFÉRENCE de la
     transaction ;
   - selon le réglage, le paiement est validé automatiquement (confiance) ou
     mis EN ATTENTE d'une validation par l'administrateur.

   Un point d'intégration agrégateur (CinetPay / PayDunya / Wave) pourra
   remplacer ce flux manuel à la Phase 2 sans changer le modèle de données.
   ========================================================================== */

/** Opérateurs Mobile Money pris en charge (Côte d'Ivoire et zone UEMOA). */
export type MobileMoneyOperator = "orange" | "mtn" | "moov" | "wave";

export const MOBILE_MONEY_OPERATORS: MobileMoneyOperator[] = [
  "orange",
  "mtn",
  "moov",
  "wave",
];

export const MM_OPERATOR_META: Record<
  MobileMoneyOperator,
  { label: string; short: string; hint: string }
> = {
  orange: {
    label: "Orange Money",
    short: "OM",
    hint: "#144# ou appli Orange Money",
  },
  mtn: { label: "MTN MoMo", short: "MoMo", hint: "*133# ou appli MoMo" },
  moov: {
    label: "Moov Money",
    short: "Moov",
    hint: "*155# ou appli Moov Money",
  },
  wave: { label: "Wave", short: "Wave", hint: "Appli Wave (QR ou numéro)" },
};

/** Configuration d'un opérateur (numéro marchand où l'utilisateur paie). */
export interface MobileMoneyOperatorConfig {
  key: MobileMoneyOperator;
  enabled: boolean;
  /** Numéro marchand / compte recevant les paiements. */
  merchantNumber: string;
  /** Nom du compte marchand (affiché à l'utilisateur pour confiance). */
  merchantName: string;
}

/** Réglages globaux du paiement Mobile Money (paramétrés par l'admin). */
export interface PaymentSettings {
  /** Active le paiement par Mobile Money sur la plateforme. */
  mobileMoneyEnabled: boolean;
  /**
   * Validation automatique : si vrai, la saisie d'une référence inscrit
   * immédiatement (confiance) ; sinon le paiement attend la validation admin.
   */
  autoValidate: boolean;
  /** Instructions générales affichées à l'utilisateur au moment de payer. */
  instructions: string;
  operators: MobileMoneyOperatorConfig[];
}

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  mobileMoneyEnabled: false,
  autoValidate: false,
  instructions:
    "Effectuez le paiement vers le numéro marchand de l'opérateur choisi, puis saisissez la référence de la transaction reçue par SMS.",
  operators: MOBILE_MONEY_OPERATORS.map((key) => ({
    key,
    enabled: false,
    merchantNumber: "",
    merchantName: "",
  })),
};

/** Statut d'un paiement de cours. */
export type CoursePaymentStatus = "pending" | "confirmed" | "rejected";

export const PAYMENT_STATUS_LABEL: Record<CoursePaymentStatus, string> = {
  pending: "En attente de validation",
  confirmed: "Confirmé",
  rejected: "Refusé",
};

/** Paiement d'un cours déposé par un utilisateur. */
export interface CoursePayment {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  /** Montant attendu au moment du paiement (FCFA). */
  amountFcfa: number;
  operator: MobileMoneyOperator;
  /** Référence de la transaction saisie par l'utilisateur. */
  reference: string;
  /** Numéro de téléphone payeur (facultatif). */
  payerNumber?: string;
  status: CoursePaymentStatus;
  /** ISO timestamp de dépôt. */
  submittedAt: string;
  /** Auteur de la décision (admin ou « Validation automatique »). */
  decidedBy?: string;
  /** ISO timestamp de la décision. */
  decidedAt?: string;
  /** Motif de refus / note. */
  note?: string;
}

/** Opérateurs activés et correctement configurés (numéro marchand renseigné). */
export function enabledOperators(
  settings: PaymentSettings,
): MobileMoneyOperatorConfig[] {
  return settings.operators.filter(
    (o) => o.enabled && o.merchantNumber.trim().length > 0,
  );
}

/** Le paiement Mobile Money est opérationnel (activé + au moins un opérateur). */
export function isMobileMoneyOperational(settings: PaymentSettings): boolean {
  return settings.mobileMoneyEnabled && enabledOperators(settings).length > 0;
}

/** Récupère la config d'un opérateur. */
export function getOperatorConfig(
  settings: PaymentSettings,
  key: MobileMoneyOperator,
): MobileMoneyOperatorConfig | undefined {
  return settings.operators.find((o) => o.key === key);
}

/** Paiement en attente d'un utilisateur pour un cours (le plus récent). */
export function pendingPaymentFor(
  userId: string,
  courseId: string,
  payments: CoursePayment[],
): CoursePayment | null {
  return (
    payments.find(
      (p) =>
        p.userId === userId &&
        p.courseId === courseId &&
        p.status === "pending",
    ) ?? null
  );
}
