import { BarChart3 } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-600" />
            <span className="text-lg font-bold">ShopifySpy AI</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-600">
            <Link href="/" className="hover:text-slate-900">Home</Link>
            <Link href="/#features" className="hover:text-slate-900">Features</Link>
            <Link href="/#pricing" className="hover:text-slate-900">Pricing</Link>
          </div>
          <p className="text-sm text-slate-500">ShopifySpy AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
