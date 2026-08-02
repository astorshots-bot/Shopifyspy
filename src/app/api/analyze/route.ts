export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { storeUrl } = await req.json();
    if (!storeUrl) {
      return NextResponse.json({ error: "Store URL is required" }, { status: 400 });
    }

    const cleanUrl = storeUrl.replace(/\/$/, "");
    const domain = cleanUrl.replace(/^https?:\/\//, "").split("/")[0];

    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      include: { subscription: true },
    });

    const plan = user?.subscription?.plan || "free";
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const analysesThisMonth = await prisma.shopifyAnalysis.count({
      where: {
        userId: (session.user as any).id,
        createdAt: { gte: monthStart },
      },
    });

    const limits: Record<string, number> = { free: 1, starter: 10, pro: 9999, enterprise: 9999 };
    if (analysesThisMonth >= limits[plan]) {
      return NextResponse.json({ error: "Monthly limit reached. Upgrade your plan." }, { status: 403 });
    }

    const mockAnalysis = {
      storeUrl: cleanUrl,
      storeName: domain.replace(".myshopify.com", "").replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
      productsCount: Math.floor(Math.random() * 500) + 10,
      avgPrice: parseFloat((Math.random() * 200 + 20).toFixed(2)),
      totalRevenue: parseFloat((Math.random() * 5000000 + 50000).toFixed(2)),
      trafficEstimate: Math.floor(Math.random() * 500000) + 1000,
      seoScore: Math.floor(Math.random() * 40) + 60,
      speedScore: Math.floor(Math.random() * 50) + 50,
      conversionRate: parseFloat((Math.random() * 3 + 0.5).toFixed(2)),
      topProducts: JSON.stringify([
        { name: "Premium Product A", price: 89.99, sales: 1240 },
        { name: "Best Seller B", price: 49.99, sales: 980 },
        { name: "Trending C", price: 129.99, sales: 750 },
      ]),
      competitors: JSON.stringify([
        { name: "Competitor X", similarity: 0.85 },
        { name: "Competitor Y", similarity: 0.72 },
      ]),
      recommendations: JSON.stringify([
        "Optimize product images for faster loading",
        "Add customer reviews to increase conversion",
        "Implement abandoned cart recovery emails",
        "Improve mobile navigation UX",
        "Add video content to product pages",
      ]),
    };

    const analysis = await prisma.shopifyAnalysis.create({
      data: {
        userId: (session.user as any).id,
        ...mockAnalysis,
      },
    });

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
      }
