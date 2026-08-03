export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInsights, generateRecommendations } from "@/lib/openai";
import { sendReportEmail } from "@/lib/resend";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stores = await prisma.monitoredStore.findMany({
      where: { isActive: true },
      include: { user: true, products: true },
    });

    const results = [];

    for (const store of stores) {
      try {
        const response = await fetch(`https://${store.storeUrl}/products.json?limit=250`, {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
        });

        if (!response.ok) continue;

        const data = await response.json();
        const products = data.products || [];

        const previousProducts = await prisma.priceHistory.findMany({
          where: { product: { storeId: store.id } },
          orderBy: { recordedAt: "desc" },
          distinct: ["productId"],
        });

        const previousMap = new Map(previousProducts.map((p) => [p.productId, p]));
        let newProducts = 0;
        let priceChanges = 0;
        let stockChanges = 0;

        for (const p of products) {
          const price = parseFloat(p.variants?.[0]?.price || "0");
          const comparePrice = p.variants?.[0]?.compare_at_price ? parseFloat(p.variants[0].compare_at_price) : null;
          const inventory = p.variants?.[0]?.inventory_quantity || 0;

          const existing = await prisma.product.findUnique({
            where: { storeId_shopifyId: { storeId: store.id, shopifyId: p.id.toString() } },
          });

          if (!existing) {
            newProducts++;
          } else {
            const prev = previousMap.get(existing.id);
            if (prev && prev.price !== price) priceChanges++;
            if (prev && prev.inventory !== inventory) stockChanges++;
          }

          await prisma.product.upsert({
            where: { storeId_shopifyId: { storeId: store.id, shopifyId: p.id.toString() } },
            update: {
              title: p.title,
              price,
              comparePrice,
              inventory,
              isAvailable: p.variants?.some((v: any) => v.available) ?? true,
              lastSeen: new Date(),
            },
            create: {
              storeId: store.id,
              shopifyId: p.id.toString(),
              title: p.title,
              handle: p.handle,
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
        }

        const allProducts = await prisma.product.findMany({ where: { storeId: store.id } });
        for (const product of allProducts) {
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

        await prisma.monitoredStore.update({
          where: { id: store.id },
          data: { lastScraped: new Date() },
        });

        if (newProducts > 0 || priceChanges > 0 || stockChanges > 0) {
          const insights = await generateInsights(allProducts, { newProducts: [], priceChanges: [], stockChanges: [] });
          const recommendations = await generateRecommendations(insights);

          const report = await prisma.report.create({
            data: {
              userId: store.userId,
              storeId: store.id,
              type: "daily",
              title: `Daily Report: ${store.storeName || store.storeUrl}`,
              summary: `${newProducts} new products, ${priceChanges} price changes, ${stockChanges} stock changes`,
              newProducts,
              priceChanges,
              stockChanges,
              aiInsights: insights,
              aiRecommendations: recommendations,
            },
          });

          if (store.user?.email) {
            const emailHtml = `
              <h2>ShopifySpy AI - Daily Report</h2>
              <h3>${store.storeName || store.storeUrl}</h3>
              <p><strong>New products:</strong> ${newProducts}</p>
              <p><strong>Price changes:</strong> ${priceChanges}</p>
              <p><strong>Stock changes:</strong> ${stockChanges}</p>
              <h4>AI Insights:</h4>
              <p>${insights}</p>
              <h4>Recommendations:</h4>
              <p>${recommendations}</p>
            `;
            await sendReportEmail(store.user.email, `Changes detected: ${store.storeName || store.storeUrl}`, emailHtml);
            await prisma.report.update({ where: { id: report.id }, data: { sentEmail: true } });
          }

          results.push({ store: store.storeUrl, newProducts, priceChanges, stockChanges });
        }
      } catch (error) {
        console.error(`Error processing ${store.storeUrl}:`, error);
      }
    }

    return NextResponse.json({ success: true, processed: results.length, results });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
