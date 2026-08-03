export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateInsights, generateRecommendations } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { storeId } = await req.json();
    if (!storeId) {
      return NextResponse.json({ error: "Store ID required" }, { status: 400 });
    }

    const store = await prisma.monitoredStore.findFirst({
      where: { id: storeId, userId: (session.user as any).id },
      include: { products: true },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const previousProducts = await prisma.priceHistory.findMany({
      where: { product: { storeId } },
      orderBy: { recordedAt: "desc" },
      distinct: ["productId"],
    });

    const currentProducts = store.products;
    const previousMap = new Map(previousProducts.map((p) => [p.productId, p]));

    const changes = {
      newProducts: [] as any[],
      priceChanges: [] as any[],
      stockChanges: [] as any[],
    };

    for (const product of currentProducts) {
      const prev = previousMap.get(product.id);

      if (!prev) {
        changes.newProducts.push(product);
      } else {
        if (prev.price !== product.price) {
          changes.priceChanges.push({
            ...product,
            oldPrice: prev.price,
            newPrice: product.price,
          });
        }
        if (prev.inventory !== product.inventory) {
          changes.stockChanges.push({
            ...product,
            oldStock: prev.inventory,
            newStock: product.inventory,
          });
        }
      }

      await prisma.priceHistory.create({
        data: {
          productId: product.id,
          price: product.price,
          comparePrice: product.comparePrice,
          inventory: product.inventory,
          isAvailable: product.isAvailable,
        },
      });
    }

    const insights = await generateInsights(currentProducts, changes);
    const recommendations = await generateRecommendations(insights);

    const report = await prisma.report.create({
      data: {
        userId: (session.user as any).id,
        storeId: store.id,
        type: "analysis",
        title: `Analysis: ${store.storeName || store.storeUrl}`,
        summary: `Found ${changes.newProducts.length} new products, ${changes.priceChanges.length} price changes, ${changes.stockChanges.length} stock changes`,
        newProducts: changes.newProducts.length,
        priceChanges: changes.priceChanges.length,
        stockChanges: changes.stockChanges.length,
