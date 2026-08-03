"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, Store, TrendingUp, Package, Bell, Loader2, AlertCircle, Eye } from "lucide-react";

interface Store {
  id: string;
  storeUrl: string;
  storeName: string | null;
  isActive: boolean;
  lastScraped: string | null;
  _count: { products: number; reports: number };
}

interface Report {
  id: string;
  title: string;
  summary: string;
  type: string;
  newProducts: number;
  priceChanges: number;
  stockChanges: number;
  aiInsights: string | null;
  aiRecommendations: string | null;
  createdAt: string;
  isRead: boolean;
  store: { storeName: string | null; storeUrl: string };
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [stores, setStores] = useState<Store[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [storeUrl, setStoreUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("stores");

  useEffect(() => {
    if (status === "unauthenticated") redirect("/auth/signin");
    if (status === "authenticated") {
      fetchStores();
      fetchReports();
    }
  }, [status]);

  const fetchStores = async () => {
    const res = await fetch("/api/stores");
    const data = await res.json();
    if (data.stores) setStores(data.stores);
  };

  const fetchReports = async () => {
    const res = await fetch("/api/reports");
    const data = await res.json();
    if (data.reports) setReports(data.reports);
  };

  const handleAddStore = async () => {
    if (!storeUrl) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeUrl }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setStoreUrl("");
        fetchStores();
        await handleScrape(data.store.id, data.store.storeUrl);
      }
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  };

  const handleScrape = async (storeId: string, url: string) => {
    setAnalyzing(storeId);
    try {
      await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeUrl: url }),
      });
      await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId }),
      });
      fetchStores();
      fetchReports();
    } catch (err) {
      console.error(err);
    }
    setAnalyzing(null);
  };

  if (status === "loading") return <div className="p-8">Loading...</div>;

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600">Monitor your competitors and get AI insights.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="stores"><Store className="h-4 w-4 mr-2" /> Stores ({stores.length})</TabsTrigger>
            <TabsTrigger value="reports"><Bell className="h-4 w-4 mr-2" /> Reports ({reports.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="stores" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Input
                    placeholder="https://store.myshopify.com"
                    value={storeUrl}
                    onChange={(e) => setStoreUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleAddStore} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-2" /> Add Store</>}
                  </Button>
                </div>
                {error && (
                  <div className="mt-4 flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" /> {error}
                  </div>
                )}
              </CardContent>
            </Card>

            {stores.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Store className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No stores monitored yet. Add your first competitor above.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stores.map((store) => (
                  <Card key={store.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{store.storeName || store.storeUrl}</CardTitle>
                        <Badge variant={store.isActive ? "default" : "secondary"}>
                          {store.isActive ? "Active" : "Paused"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Package className="h-4 w-4" />
                          {store._count.products} products
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Bell className="h-4 w-4" />
                          {store._count.reports} reports
                        </div>
                      </div>
                      <p className="text-xs text-slate-400">
                        Last checked: {store.lastScraped ? new Date(store.lastScraped).toLocaleString() : "Never"}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleScrape(store.id, store.storeUrl)}
                        disabled={analyzing === store.id}
                      >
                        {analyzing === store.id ? (
                          <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Analyzing...</>
                        ) : (
                          <><Search className="h-4 w-4 mr-2" /> Analyze Now</>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            {reports.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bell className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No reports yet. Analyze a store to generate your first report.</p>
                </CardContent>
              </Card>
            ) : (
              reports.map((report) => (
                <Card key={report.id} className={!report.isRead ? "border-indigo-300" : ""}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{report.title}</CardTitle>
                        <p className="text-sm text-slate-500">{report.store.storeName || report.store.storeUrl} · {new Date(report.createdAt).toLocaleString()}</p>
                      </div>
                      <Badge variant={report.type === "daily" ? "default" : "secondary"}>{report.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-600">{report.summary}</p>
                    <div className="flex gap-4 text-sm">
                      {report.newProducts > 0 && (
                        <span className="flex items-center gap-1 text-green-600">
                          <Plus className="h-3 w-3" /> {report.newProducts} new
                        </span>
                      )}
                      {report.priceChanges > 0 && (
                        <span className="flex items-center gap-1 text-amber-600">
                          <TrendingUp className="h-3 w-3" /> {report.priceChanges} price changes
                        </span>
                      )}
                      {report.stockChanges > 0 && (
                        <span className="flex items-center gap-1 text-blue-600">
                          <Package className="h-3 w-3" /> {report.stockChanges} stock changes
                        </span>
                      )}
                    </div>
                    {(report.aiInsights || report.aiRecommendations) && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Eye className="h-3 w-3" /> View AI Insights
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>AI Analysis Report</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {report.aiInsights && (
                              <div>
                                <h4 className="font-semibold mb-2">Insights</h4>
                                <div className="text-sm text-slate-600 whitespace-pre-wrap">{report.aiInsights}</div>
                              </div>
                            )}
                            {report.aiRecommendations && (
                              <div>
                                <h4 className="font-semibold mb-2">Recommendations</h4>
                                <div className="text-sm text-slate-600 whitespace-pre-wrap">{report.aiRecommendations}</div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
