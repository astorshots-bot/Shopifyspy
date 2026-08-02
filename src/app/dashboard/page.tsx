"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Search, TrendingUp, DollarSign, Users, Package, Zap, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [storeUrl, setStoreUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") redirect("/auth/signin");
    if (status === "authenticated") fetchHistory();
  }, [status]);

  const fetchHistory = async () => {
    const res = await fetch("/api/analyses");
    const data = await res.json();
    if (data.analyses) setHistory(data.analyses);
  };

  const handleAnalyze = async () => {
    if (!storeUrl) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeUrl }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setAnalysis(data.analysis);
        fetchHistory();
      }
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  };

  if (status === "loading") return <div className="p-8">Loading...</div>;

  const revenueData = analysis ? [
    { name: "Jan", value: analysis.totalRevenue * 0.08 },
    { name: "Feb", value: analysis.totalRevenue * 0.09 },
    { name: "Mar", value: analysis.totalRevenue * 0.1 },
    { name: "Apr", value: analysis.totalRevenue * 0.085 },
    { name: "May", value: analysis.totalRevenue * 0.11 },
    { name: "Jun", value: analysis.totalRevenue * 0.12 },
  ] : [];

  const topProducts = analysis?.topProducts ? JSON.parse(analysis.topProducts) : [];
  const recommendations = analysis?.recommendations ? JSON.parse(analysis.recommendations) : [];
  const competitors = analysis?.competitors ? JSON.parse(analysis.competitors) : [];

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600">Analyze any Shopify store in seconds.</p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Input
                placeholder="https://store.myshopify.com"
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAnalyze} disabled={loading}>
                {loading ? "Analyzing..." : <><Search className="h-4 w-4 mr-2" /> Analyze</>}
              </Button>
            </div>
            {error && (
              <div className="mt-4 flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}
          </CardContent>
        </Card>

        {analysis && (
          <Tabs defaultValue="overview" className="mb-8">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="competitors">Competitors</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard title="Est. Revenue" value={`$${(analysis.totalRevenue / 1000).toFixed(0)}k`} icon={DollarSign} />
                <MetricCard title="Products" value={analysis.productsCount} icon={Package} />
                <MetricCard title="Traffic/mo" value={`${(analysis.trafficEstimate / 1000).toFixed(0)}k`} icon={Users} />
                <MetricCard title="Avg Price" value={`$${analysis.avgPrice}`} icon={TrendingUp} />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle className="text-base">Revenue Trend</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">Store Health</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>SEO Score</span>
                        <span>{analysis.seoScore}/100</span>
                      </div>
                      <Progress value={analysis.seoScore} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Speed Score</span>
                        <span>{analysis.speedScore}/100</span>
                      </div>
                      <Progress value={analysis.speedScore} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Conversion Rate</span>
                        <span>{analysis.conversionRate}%</span>
                      </div>
                      <Progress value={analysis.conversionRate * 20} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="products">
              <Card>
                <CardHeader><CardTitle>Top Products</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topProducts.map((p: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-sm text-slate-500">{p.sales} sales</p>
                        </div>
                        <Badge>${p.price}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="competitors">
              <Card>
                <CardHeader><CardTitle>Similar Stores</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {competitors.map((c: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                        <span className="font-medium">{c.name}</span>
                        <Badge variant="secondary">{Math.round(c.similarity * 100)}% match</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations">
              <Card>
                <CardHeader><CardTitle>AI Recommendations</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recommendations.map((r: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-slate-50">
                        <Zap className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        <Card>
          <CardHeader><CardTitle>Recent Analyses</CardTitle></CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No analyses yet. Analyze your first store!</p>
            ) : (
              <div className="space-y-3">
                {history.slice(0, 5).map((h) => (
                  <div key={h.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{h.storeName || h.storeUrl}</p>
                      <p className="text-xs text-slate-500">{new Date(h.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="outline">{h.productsCount} products</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function MetricCard({ title, value, icon: Icon }: { title: string; value: string | number; icon: any }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Icon className="h-5 w-5 text-indigo-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
  }
