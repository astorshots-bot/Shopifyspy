export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const PLAN_PRICES: Record<string, string | undefined> = {
  free: undefined,
  starter: process.env.STRIPE_PRICE_ID_BASIC,
  pro: process.env.STRIPE_PRICE_ID_PRO,
  enterprise: process.env.STRIPE_PRICE_ID_ENTERPRISE,
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await req.json();
    const stripePriceId = PLAN_PRICES[plan];
    
    if (!stripePriceId) {
      return NextResponse.json({ error: "Invalid plan or missing price ID" }, { status: 400 });
    }

    let subscription = await prisma.subscription.findUnique({
      where: { userId: (session.user as any).id },
    });

    let customerId = subscription?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email!,
        name: session.user.name || undefined,
      });
      customerId = customer.id;
      
      if (!subscription) {
        await prisma.subscription.create({
          data: {
            userId: (session.user as any).id,
            stripeCustomerId: customerId,
            plan: "free",
          },
        });
      }
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: stripePriceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: { userId: (session.user as any).id, plan },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
