"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { Heart } from "lucide-react";
import { addToWishlistAction, removeFromWishlistAction } from "@/server/actions/wishlist";
import { cn } from "@/lib/utils";

type Props = { dishId: string; initialSaved: boolean; signedIn: boolean; dishName: string; className?: string };

/** Corazón para guardar un plato. Optimista; si no hay sesión lleva a entrar. */
export function WishlistButton({ dishId, initialSaved, signedIn, dishName, className }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [saved, setSaved] = useOptimistic(initialSaved);

  function toggle() {
    if (!signedIn) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    start(async () => {
      setSaved(!saved);
      const res = saved ? await removeFromWishlistAction({ dishId }) : await addToWishlistAction({ dishId, quantity: 1 });
      if (!res.success) setSaved(saved);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={saved}
      aria-label={saved ? `Quitar ${dishName} de tu lista` : `Guardar ${dishName} en tu lista`}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full border transition-[background-color,border-color,color] duration-(--duration-fast)",
        saved ? "border-primary bg-brand-soft text-primary" : "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary",
        className,
      )}
    >
      <Heart className={cn("size-4 transition-transform duration-(--duration-fast)", saved && "fill-current scale-110")} />
    </button>
  );
}
