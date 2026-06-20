import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPaymentStatusFor } from "@/lib/payments/server";

/**
 * Statut d'un paiement (restreint à son propriétaire). Utilisé par la page de
 * retour pour sonder la confirmation après redirection depuis Wave.
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ status: null }, { status: 401 });
  }

  const paymentId = new URL(request.url).searchParams.get("p");
  if (!paymentId) {
    return NextResponse.json({ status: null }, { status: 400 });
  }

  const result = await getPaymentStatusFor(paymentId, user.id);
  return NextResponse.json({
    status: result?.status ?? null,
    courseId: result?.courseId ?? null,
  });
}
