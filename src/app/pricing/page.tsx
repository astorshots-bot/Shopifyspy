import { Navbar } from "@/components/navbar";
import { Pricing } from "@/components/pricing";
import { Footer } from "@/components/footer";

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
