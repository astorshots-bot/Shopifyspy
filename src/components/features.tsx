"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, TrendingUp, Bell, Brain } from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "Store Monitoring",
    description: "Track any Shopify store 24/7. We monitor products, prices, inventory, and new arrivals automatically.",
  },
  {
    icon: TrendingUp,
    title: "Price Intelligence",
    description: "Get instant alerts when competitors change prices. Never miss a pricing opportunity again.",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Receive email notifications about new products, stock changes, and competitor moves.",
  },
  {
    icon: Brain,
    title: "AI Analysis",
    description: "Our AI analyzes competitor data and generates actionable recommendations for your business.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Everything You Need to Win</h2>
          <p className="mt-4 text-lg text-slate-600">Powerful tools to stay ahead of your competition.</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title} className="border-0 shadow-sm">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-indigo-600" />
                </div>
                <CardTitle className="text-lg">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
