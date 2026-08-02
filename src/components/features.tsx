import { BarChart3, Search, TrendingUp, Users, Lock, Globe } from "lucide-react";

const features = [
  { name: "Revenue Estimation", description: "AI-powered revenue predictions based on traffic, product pricing, and market trends.", icon: BarChart3 },
  { name: "SEO Deep Dive", description: "Complete technical SEO audit with actionable recommendations to outrank competitors.", icon: Search },
  { name: "Traffic Analysis", description: "Estimate visitor volumes, traffic sources, and geographic distribution.", icon: TrendingUp },
  { name: "Competitor Tracking", description: "Monitor top competitors and benchmark your store against industry leaders.", icon: Users },
  { name: "Product Intelligence", description: "Discover best-selling products, pricing strategies, and inventory insights.", icon: Lock },
  { name: "Global Markets", description: "Analyze stores from 50+ countries with localized market insights.", icon: Globe },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Everything you need to win</h2>
          <p className="mt-4 text-lg text-slate-600">Powerful tools designed for serious Shopify entrepreneurs.</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.name} className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100">
              <f.icon className="h-10 w-10 text-indigo-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900">{f.name}</h3>
              <p className="mt-2 text-slate-600">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
