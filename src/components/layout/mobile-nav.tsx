"use client";

import { useState } from "react";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const LINKS = [
  { href: "/explore", label: "Explorar restaurantes" },
  { href: "/categories", label: "Cocinas" },
  { href: "/pricing", label: "Para restaurantes" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-lg" className="md:hidden" aria-label="Abrir menú">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(88vw,22rem)]">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">Foodzinder</SheetTitle>
          <SheetDescription>Dónde comer hoy, sin dar vueltas.</SheetDescription>
        </SheetHeader>
        <nav aria-label="Menú móvil" className="flex flex-col gap-1 px-4">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-base font-medium hover:bg-muted">
              {l.label}
            </Link>
          ))}
          <div className="mt-4 flex flex-col gap-2 border-t pt-4">
            <SignedOut>
              <Button asChild size="lg" onClick={() => setOpen(false)}>
                <Link href="/sign-up">Crear cuenta</Link>
              </Button>
              <Button asChild variant="outline" size="lg" onClick={() => setOpen(false)}>
                <Link href="/sign-in">Entrar</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button asChild size="lg" onClick={() => setOpen(false)}>
                <Link href="/dashboard">Mi panel</Link>
              </Button>
            </SignedIn>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
