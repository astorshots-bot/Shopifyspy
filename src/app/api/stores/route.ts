export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stores = await prisma.monitoredStore.findMany({
      where: { userId: (session.user as any).id },
      include: {
        _count: { select: { products: true, reports: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ stores });
  } catch (error) {
    console.error("Stores error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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

    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      include: { subscription: true, _count: { select: { stores: true } } },
    });

    const plan = user?.subscription?.plan || "free";
    const limits: Record<string, number> = { free: 1, pro: 5, agency: 20 };

    if (user?._count.stores >= limits[plan]) {
      return NextResponse.json({ error: "Store limit reached. Upgrade your plan." }, { status: 403 });
    }

    const store = await prisma.monitoredStore.create({
      data: {
        userId: (session.user as any).id,
        storeUrl: domain,
        storeName: domain.replace(".myshopify.com", ""),
      },
    });

    return NextResponse.json({ success: true, store });
  } catch (error) {
    console.error("Create store error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
