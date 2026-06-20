import { NextResponse } from "next/server";
import {
  isWaveWebhookConfigured,
  verifyWaveSignature,
  type WaveWebhookEvent,
} from "@/lib/payments/wave";
import { confirmPaymentAndEnroll, failPayment } from "@/lib/payments/server";

/**
 * Webhook Wave. Tant que WAVE_WEBHOOK_SECRET n'est pas renseigné, répond 200
 * sans traiter (mode démo). Sinon vérifie la signature `Wave-Signature` puis
 * confirme le paiement et inscrit l'utilisateur (idempotent).
 */
export async function POST(request: Request) {
  const secret = process.env.WAVE_WEBHOOK_SECRET;
  const signature = request.headers.get("wave-signature");

  if (!isWaveWebhookConfigured() || !signature) {
    return NextResponse.json({
      received: true,
      note: "Wave non configuré (mode démo).",
    });
  }

  const raw = await request.text();
  if (!verifyWaveSignature(raw, signature, secret!)) {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  let event: WaveWebhookEvent;
  try {
    event = JSON.parse(raw) as WaveWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const ref = event.data?.client_reference;
  try {
    if (event.type === "checkout.session.completed" && ref) {
      await confirmPaymentAndEnroll(ref);
    } else if (
      (event.type === "checkout.session.payment_failed" ||
        event.type === "checkout.session.expired") &&
      ref
    ) {
      await failPayment(ref);
    }
  } catch {
    return NextResponse.json({ error: "Traitement échoué" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
