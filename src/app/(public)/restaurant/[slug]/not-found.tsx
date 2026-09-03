import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RestaurantNotFound() {
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <p className="text-sm font-semibold tracking-wide text-primary uppercase">Error 404</p>
      <h1 className="mt-2 font-display text-h1">Este restaurante no está en la carta</h1>
      <p className="mt-3 max-w-md text-muted-foreground">Puede que aún esté pendiente de revisión, que su dueño lo haya archivado o que la dirección tenga una errata.</p>
      <Button asChild size="lg" className="mt-8 h-11">
        <Link href="/explore">Explorar restaurantes</Link>
      </Button>
    </div>
  );
}
