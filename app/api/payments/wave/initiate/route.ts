import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createWaveCheckout, isWaveConfigured } from "@/lib/payments/wave";
import {
  attachSessionId,
  createPendingPayment,
  getServerCoursePrice,
} from "@/lib/payments/server";

/**
 * Initie un paiement Wave pour un cours.
 * - Refuse (503) si Wave n'est pas configuré.
 * - Exige un utilisateur authentifié.
 * - Le MONTANT fait foi côté serveur (table course_prices) — jamais transmis
 *   par le client.
 * Renvoie l'URL de paiement hébergée Wave vers laquelle rediriger.
 */
export async function POST(request: Request) {
  if (!isWaveConfigured()) {
    return NextResponse.json(
      { error: "Paiement Wave non configuré." },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    courseId?: unknown;
  };
  const courseId = typeof body.courseId === "string" ? body.courseId : "";
  if (!courseId) {
    return NextResponse.json({ error: "courseId requis." }, { status: 400 });
  }

  try {
    const amount = await getServerCoursePrice(courseId);
    if (amount <= 0) {
      return NextResponse.json(
        { error: "Tarif serveur non défini pour ce cours." },
        { status: 400 },
      );
    }

    const origin = request.headers.get("origin") ?? new URL(request.url).origin;
    const paymentId = await createPendingPayment({
      userId: user.id,
      courseId,
      amountFcfa: amount,
    });
    const successUrl = `${origin}/aide/paiement/retour?p=${paymentId}`;
    const errorUrl = `${origin}/aide/paiement/retour?p=${paymentId}&echec=1`;

    const session = await createWaveCheckout({
      amountFcfa: amount,
      successUrl,
      errorUrl,
      clientReference: paymentId,
    });
    await attachSessionId(paymentId, session.id);

    return NextResponse.json({ url: session.launchUrl, paymentId });
  } catch {
    return NextResponse.json(
      { error: "Échec de l'initiation du paiement." },
      { status: 502 },
    );
  }
}
