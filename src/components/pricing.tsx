"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PLANS } from "@/lib/stripe";

export function Pricing() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSubscribe = async (plan: string) => {
    if (!session) { router.push("/auth/signin"); return; }
    if (plan === "free") return;
    const res = await fetch("/api/stripe/checkout", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  const order = ["free", "starter", "pro", "enterprise"] as const;

  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-4 text-lg text-slate-600">Start free, upgrade when you need more power.</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {order.map((key) => {
            const plan = PLANS[key];
            return (
              <Card key={key} className={key === "pro" ? "border-indigo-600 ring-1 ring-indigo-600" : ""}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4"><span className="text-4xl font-bold">${plan.price}</span><span className="text-slate-500">/mo</span></div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-600"><Check className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />{f}</li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant={key === "pro" ? "default" : "outline"} onClick={() => handleSubscribe(key)}>
                    {key === "free" ? "Get Started" : "Subscribe"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
