"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { UserButton } from "@clerk/nextjs";
import { Bell, Menu, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type NavItem = { href: string; label: string; icon: LucideIcon; exact?: boolean };
export type NavGroup = { title: string; items: NavItem[] };

type Props = { groups: NavGroup[]; roleLabel: string; unread: number; children: ReactNode };

function NavList({ groups, onNavigate }: { groups: NavGroup[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = (item: NavItem) => (item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/"));
  return (
    <nav aria-label="Panel" className="flex flex-col gap-6">
      {groups.map((g) => (
        <div key={g.title}>
          <p className="px-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">{g.title}</p>
          <ul className="mt-1.5 space-y-0.5">
            {g.items.map((item) => {
              const Icon = item.icon;
              const isActive = active(item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-(--duration-fast)",
                      isActive ? "bg-brand-soft text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function DashboardShell({ groups, roleLabel, unread, children }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-background lg:flex">
        <div className="flex h-16 items-center border-b px-5">
          <Link href="/" aria-label="Foodzinder, inicio">
            <Image src="/logo-color.svg" alt="Foodzinder" width={130} height={16} style={{ height: 16, width: "auto" }} />
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <NavList groups={groups} />
        </div>
        <div className="border-t px-5 py-3 text-xs text-muted-foreground">{roleLabel}</div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-background/85 px-4 backdrop-blur-md lg:px-8">
          <div className="flex items-center gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon-lg" className="lg:hidden" aria-label="Abrir menú del panel">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle>
                    <Image src="/logo-color.svg" alt="Foodzinder" width={130} height={16} style={{ height: 16, width: "auto" }} />
                  </SheetTitle>
                  <SheetDescription>{roleLabel}</SheetDescription>
                </SheetHeader>
                <div className="px-3 pb-6">
                  <NavList groups={groups} onNavigate={() => setOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground lg:hidden">
              Foodzinder
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon-lg" className="relative" aria-label={unread ? `${unread} notificaciones sin leer` : "Notificaciones"}>
              <Link href="/dashboard/notifications">
                <Bell className="size-5" />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="hidden sm:inline-flex">
              <Link href="/">Ver el sitio</Link>
            </Button>
            <UserButton />
          </div>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
