import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" as any })
  : null as any;

interface Plan {
  name: string;
  description: string;
  price: number;
  stripePriceId: string | undefined;
  features: string[];
  limits: { stores: number; reportsPerDay: number };
}

export const PLANS: Record<string, Plan> = {
  free: {
    name: "Free",
    description: "Perfect for getting started",
    price: 0,
    stripePriceId: undefined,
    features: ["1 store", "Daily reports", "Basic analytics", "Email alerts"],
    limits: { stores: 1, reportsPerDay: 1 },
  },
  pro: {
    name: "Pro",
    description: "For serious e-commerce entrepreneurs",
    price: 49,
    stripePriceId: process.env.STRIPE_PRICE_ID_PRO,
    features: ["5 stores", "Hourly monitoring", "AI insights", "Price alerts", "Competitor tracking", "API access"],
    limits: { stores: 5, reportsPerDay: 24 },
  },
  agency: {
    name: "Agency",
    description: "For agencies and large teams",
    price: 149,
    stripePriceId: process.env.STRIPE_PRICE_ID_AGENCY,
    features: ["20 stores", "Real-time monitoring", "White-label reports", "Team collaboration", "Priority support", "Custom integrations"],
    limits: { stores: 20, reportsPerDay: 100 },
  },
};

export type PlanKey = keyof typeof PLANS;
