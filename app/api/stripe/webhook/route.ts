import { NextResponse } from "next/server";

/**
 * Webhook Stripe. Tant que les clés ne sont pas configurées, l'endpoint répond
 * 200 sans traiter d'événement. Une fois STRIPE_SECRET_KEY et STRIPE_WEBHOOK_SECRET
 * renseignés, vérifier la signature et traiter les événements (paiements, abonnements).
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!secret || !webhookSecret || !signature) {
    return NextResponse.json({ received: true, note: "Stripe non configuré (mode démo)." });
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(secret);
    const body = await request.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    switch (event.type) {
      case "checkout.session.completed":
      case "invoice.paid":
        // TODO: enregistrer le paiement et activer l'abonnement (table paiements/abonnements).
        break;
      default:
        break;
    }
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }
}
