"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Sparkles, Globe, Zap, Shield } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function Hero() {
  const [url, setUrl] = useState("");

  return (
    <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 mb-8">
          <Sparkles className="h-4 w-4" />
          Trusted by 10,000+ entrepreneurs worldwide
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl max-w-4xl mx-auto">
          Uncover Your Competitors&apos;{" "}
          <span className="text-indigo-600">Secrets</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-600 max-w-2xl mx-auto">
          Deep analytics for any Shopify store. Revenue estimates, traffic data,
          product insights, and SEO analysis — all in one powerful platform.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
          <Input
            placeholder="Enter Shopify store URL..."
            className="h-12"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Link href={url ? `/dashboard?analyze=${encodeURIComponent(url)}` : "/auth/signup"}>
            <Button size="lg" className="h-12 px-8 gap-2 whitespace-nowrap">
              Analyze Now <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="mt-12 flex items-center justify-center gap-8 text-sm text-slate-500">
          <span className="flex items-center gap-1.5"><Globe className="h-4 w-4" /> Global Coverage</span>
          <span className="flex items-center gap-1.5"><Zap className="h-4 w-4" /> Real-time Data</span>
          <span className="flex items-center gap-1.5"><Shield className="h-4 w-4" /> GDPR Compliant</span>
        </div>
      </div>
    </section>
  );
}
