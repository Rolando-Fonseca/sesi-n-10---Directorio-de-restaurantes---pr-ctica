import Link from "next/link";
import Image from "next/image";

const COLUMNS = [
  {
    title: "Descubrir",
    links: [
      { href: "/explore", label: "Todos los restaurantes" },
      { href: "/explore?city=Madrid", label: "Madrid" },
      { href: "/explore?city=Barcelona", label: "Barcelona" },
      { href: "/explore?city=Valencia", label: "Valencia" },
      { href: "/explore?city=Sevilla", label: "Sevilla" },
    ],
  },
  {
    title: "Restaurantes",
    links: [
      { href: "/pricing", label: "Planes y precios" },
      { href: "/sign-up?role=owner", label: "Publicar mi restaurante" },
      { href: "/dashboard/owner", label: "Panel de dueño" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/terms", label: "Términos de uso" },
      { href: "/legal/privacy", label: "Privacidad" },
      { href: "/legal/cookies", label: "Cookies" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-cream">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <Image src="/logo-color.svg" alt="Foodzinder" width={150} height={19} className="h-[19px] w-auto" />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Cartas completas, alérgenos declarados y reseñas de gente que ha pagado la cuenta. Sin patrocinados en los primeros puestos.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h2 className="text-sm font-semibold tracking-wide uppercase">{col.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground transition-colors duration-(--duration-fast) hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Foodzinder. Proyecto académico; los restaurantes y las reseñas son ficticios.</p>
          <p>
            Mapas © colaboradores de{" "}
            <a href="https://www.openstreetmap.org/copyright" className="underline underline-offset-2 hover:text-foreground" rel="noopener noreferrer" target="_blank">
              OpenStreetMap
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
