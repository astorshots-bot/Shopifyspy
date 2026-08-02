import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

export const PLANS: Record<string, any> = {
  free: {
    name: "Free",
    description: "Perfect for getting started",
    price: 0,
    stripePriceId: undefined,
    features: [
      "1 store analysis per month",
      "Basic metrics",
      "SEO overview",
      "Community support",
    ],
    limits: { analysesPerMonth: 1, stores: 1 },
  },
  starter: {
    name: "Starter",
    description: "For growing e-commerce businesses",
    price: 29,
    stripePriceId: process.env.STRIPE_PRICE_ID_BASIC,
    features: [
      "10 store analyses per month",
      "Advanced metrics & charts",
      "Competitor analysis",
      "SEO deep dive",
      "Email support",
    ],
    limits: { analysesPerMonth: 10, stores: 5 },
  },
  pro: {
    name: "Pro",
    description: "For serious Shopify entrepreneurs",
    price: 79,
    stripePriceId: process.env.STRIPE_PRICE_ID_PRO,
    features: [
      "Unlimited store analyses",
      "Full competitor tracking",
      "Revenue estimation",
      "Traffic analysis",
      "Priority support",
      "API access",
    ],
    limits: { analysesPerMonth: -1, stores: -1 },
  },
  enterprise: {
    name: "Enterprise",
    description: "For agencies and large teams",
    price: 199,
    stripePriceId: process.env.STRIPE_PRICE_ID_ENTERPRISE,
    features: [
      "Everything in Pro",
      "White-label reports",
      "Team collaboration",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    limits: { analysesPerMonth: -1, stores: -1 },
  },
};

export type PlanKey = keyof typeof PLANS;
