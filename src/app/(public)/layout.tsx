import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Foodzinder - Descubre y reserva en los mejores restaurantes",
  description: "La plataforma definitiva para encontrar tu próximo plato favorito.",
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Navbar Placeholder */}
      <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-primary text-xl font-bold">Foodzinder</span>
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <a href="/" className="hover:text-primary transition-colors">
              Explorar
            </a>
            <a href="/precios" className="hover:text-primary transition-colors">
              Precios
            </a>
            <a href="/login" className="hover:text-primary text-muted-foreground transition-colors">
              Entrar
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-muted-foreground text-center text-sm leading-loose text-balance md:text-left">
            Built by Foodzinder Team. © 2026.
          </p>
        </div>
      </footer>
    </div>
  );
}
