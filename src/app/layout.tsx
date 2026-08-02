import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ShopifySpy - Advanced Shopify Store Analytics",
  description: "Deep analytics for any Shopify store. Revenue estimates, traffic data, product insights, and SEO analysis.",
  keywords: "shopify analytics, shopify spy, ecommerce analysis, competitor research, dropshipping tools",
  openGraph: {
    title: "ShopifySpy - Advanced Shopify Store Analytics",
    description: "Uncover your competitors' secrets with deep Shopify store analytics.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
