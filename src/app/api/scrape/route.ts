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
      return NextResponse.json({ error: "Store URL required" }, { status: 400 });
    }

    const cleanUrl = storeUrl.replace(/\/$/, "").replace(/^https?:\/\//, "");
    const domain = cleanUrl.split("/")[0];

    const response = await fetch(`https://${domain}/products.json?limit=250`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch store data" }, { status: 400 });
    }

    const data = await response.json();
    const products = data.products || [];

    let store = await prisma.monitoredStore.findUnique({
      where: { userId_storeUrl: { userId: (session.user as any).id, storeUrl: domain } },
    });

    if (!store) {
      store = await prisma.monitoredStore.create({
        data: {
          userId: (session.user as any).id,
          storeUrl: domain,
          storeName: domain.replace(".myshopify.com", ""),
        },
      });
    }

    const savedProducts = [];
    for (const p of products) {
      const price = parseFloat(p.variants?.[0]?.price || "0");
      const comparePrice = p.variants?.[0]?.compare_at_price
        ? parseFloat(p.variants[0].compare_at_price)
        : null;
      const inventory = p.variants?.[0]?.inventory_quantity || 0;

      const product = await prisma.product.upsert({
        where: { storeId_shopifyId: { storeId: store.id, shopifyId: p.id.toString() } },
        update: {
          title: p.title,
          handle: p.handle,
          productType: p.product_type || null,
          vendor: p.vendor || null,
          price,
          comparePrice,
          inventory,
          images: p.images?.map((i: any) => i.src) || [],
          description: p.body_html || null,
          tags: p.tags || [],
          variants: p.variants || [],
          isAvailable: p.variants?.some((v: any) => v.available) ?? true,
          lastSeen: new Date(),
        },
        create: {
          storeId: store.id,
          shopifyId: p.id.toString(),
          title: p.title,
          handle: p.handle,
          productType: p.product_type || null,
          vendor: p.vendor || null,
          price,
          comparePrice,
          inventory,
          images: p.images?.map((i: any) => i.src) || [],
          description: p.body_html || null,
          tags: p.tags || [],
          variants: p.variants || [],
          isAvailable: p.variants?.some((v: any) => v.available) ?? true,
        },
      });
      savedProducts.push(product);
    }

    await prisma.monitoredStore.update({
      where: { id: store.id },
      data: { lastScraped: new Date() },
    });

    return NextResponse.json({
      success: true,
      store: { id: store.id, name: store.storeName, url: domain },
      productsCount: savedProducts.length,
    });
  } catch (error) {
    console.error("Scrape error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
