import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CTA() {
  return (
    <section className="py-24 bg-indigo-600">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to dominate your niche?</h2>
        <p className="mt-4 text-lg text-indigo-100">Join 10,000+ Shopify entrepreneurs using ShopifySpy.</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/auth/signup"><Button size="lg" variant="secondary" className="bg-white text-indigo-600 hover:bg-slate-100">Start Free Trial</Button></Link>
          <Link href="/pricing"><Button size="lg" variant="outline" className="border-white text-white hover:bg-indigo-700">View Pricing</Button></Link>
        </div>
      </div>
    </section>
  );
}
