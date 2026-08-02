"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { BarChart3, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <BarChart3 className="h-7 w-7 text-indigo-600" />
          <span className="text-xl font-bold text-slate-900">ShopifySpy</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/#features" className="text-sm font-medium text-slate-600 hover:text-slate-900">Features</Link>
          <Link href="/pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900">Pricing</Link>
          <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900">Dashboard</Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {session ? (
            <>
              <span className="text-sm text-slate-600">{session.user?.email}</span>
              <Button variant="outline" size="sm" onClick={() => signOut()}>Sign Out</Button>
            </>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t px-4 py-4 space-y-3">
          <Link href="/#features" className="block text-sm font-medium text-slate-600">Features</Link>
          <Link href="/pricing" className="block text-sm font-medium text-slate-600">Pricing</Link>
          <Link href="/dashboard" className="block text-sm font-medium text-slate-600">Dashboard</Link>
          {session ? (
            <Button variant="outline" className="w-full" onClick={() => signOut()}>Sign Out</Button>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/auth/signin"><Button variant="outline" className="w-full">Sign In</Button></Link>
              <Link href="/auth/signup"><Button className="w-full">Get Started</Button></Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
          }
