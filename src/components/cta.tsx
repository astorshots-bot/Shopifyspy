"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24 bg-indigo-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to Outsmart Your Competition?</h2>
        <p className="mt-4 text-lg text-indigo-100 max-w-2xl mx-auto">
          Join thousands of e-commerce entrepreneurs who use ShopifySpy AI.
        </p>
        <Link href="/auth/signup">
          <Button size="lg" variant="secondary" className="mt-8 gap-2">
            Start Free Trial <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
