import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex flex-1 flex-col items-center justify-center py-24 text-center">
      <p className="text-sm font-semibold tracking-wide text-primary uppercase">Error 404</p>
      <h1 className="mt-2 font-display text-h1">Aquí no hay nada que comer</h1>
      <p className="mt-3 max-w-md text-muted-foreground">La página que buscas no existe o ha cambiado de sitio.</p>
      <Button asChild size="lg" className="mt-8 h-11">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}
