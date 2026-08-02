import { Navbar } from "@/components/navbar";
import { Pricing } from "@/components/pricing";
import { BarChart3 } from "lucide-react";
import Link from "next/link";

function Footer() {
  return (
    <footer className="border-t bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-600" />
            <span className="text-lg font-bold">ShopifySpy</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-600">
            <Link href="/" className="hover:text-slate-900">Home</Link>
            <Link href="/pricing" className="hover:text-slate-900">Pricing</Link>
            <Link href="/dashboard" className="hover:text-slate-900">Dashboard</Link>
          </div>
          <p className="text-sm text-slate-500">ShopifySpy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16 pb-8 text-center">
        <h1 className="text-4xl font-bold text-slate-900">Pricing</h1>
        <p className="mt-4 text-lg text-slate-600">Choose the plan that fits your business.</p>
      </div>
      <Pricing />
      <Footer />
    </main>
  );
}
