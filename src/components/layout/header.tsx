import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "./mobile-nav";

export const NAV_LINKS = [
  { href: "/explore", label: "Explorar" },
  { href: "/categories", label: "Cocinas" },
  { href: "/pricing", label: "Para restaurantes" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2" aria-label="Foodzinder, inicio">
          <Image src="/logo-color.svg" alt="Foodzinder" width={150} height={19} priority style={{ height: 19, width: "auto" }} />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-(--duration-fast) hover:bg-muted hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <SignedOut>
            <Button asChild variant="ghost" size="lg" className="hidden sm:inline-flex">
              <Link href="/sign-in">Entrar</Link>
            </Button>
            <Button asChild size="lg" className="hidden sm:inline-flex">
              <Link href="/sign-up">Crear cuenta</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button asChild variant="outline" size="lg" className="hidden sm:inline-flex">
              <Link href="/dashboard">
                <LayoutDashboard data-icon="inline-start" />
                Mi panel
              </Link>
            </Button>
            <UserButton />
          </SignedIn>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
