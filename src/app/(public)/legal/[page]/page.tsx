import type { Metadata } from "next";
import { notFound } from "next/navigation";

const PAGES = {
  terms: {
    title: "Términos de uso",
    updated: "3 de septiembre de 2026",
    sections: [
      ["Qué es Foodzinder", "Foodzinder es un directorio de restaurantes desarrollado como proyecto académico. Los restaurantes, cartas, reseñas y usuarios de ejemplo son ficticios. No se presta ningún servicio comercial ni se realizan cobros reales."],
      ["Cuentas", "Para publicar un restaurante, guardar platos o escribir reseñas hace falta una cuenta. La autenticación la gestiona Clerk. Eres responsable de la actividad realizada con tu cuenta."],
      ["Contenido de los dueños", "El dueño de un restaurante garantiza que la información publicada, en especial los alérgenos declarados, es veraz. Un administrador revisa cada ficha antes de publicarla y puede rechazarla indicando el motivo."],
      ["Reseñas", "Solo puede escribirse una reseña por usuario y restaurante, y no se puede reseñar el propio local. El administrador puede retirar reseñas que incumplan estas normas."],
      ["Alérgenos", "La información sobre alérgenos la declara cada restaurante y puede contener errores. Si tienes una alergia grave, confirma siempre con el establecimiento."],
    ],
  },
  privacy: {
    title: "Política de privacidad",
    updated: "3 de septiembre de 2026",
    sections: [
      ["Datos que tratamos", "Nombre, correo e imagen de perfil procedentes de tu proveedor de identidad; tus preferencias y alérgenos si los guardas; las reseñas y platos que guardes; y, si eres dueño, los datos de tu restaurante y de facturación."],
      ["Para qué", "Para mostrar tu perfil, filtrar cartas según tus alérgenos, calcular puntos e insignias, y notificar a los dueños de las reseñas recibidas. No se ceden datos a terceros con fines comerciales."],
      ["Geolocalización", "La función «cerca de mí» usa la posición del navegador solo para calcular distancias en la búsqueda. No se almacena."],
      ["Automatizaciones", "Algunos eventos (alta de restaurante, nueva reseña) se envían firmados a sistemas de automatización propios para avisar a administradores y dueños."],
      ["Tus derechos", "Puedes pedir acceso, rectificación o supresión escribiendo a soporte@foodzinder.dev. Al eliminar tu cuenta en Clerk se borran tus datos en Foodzinder."],
    ],
  },
  cookies: {
    title: "Política de cookies",
    updated: "3 de septiembre de 2026",
    sections: [
      ["Cookies técnicas", "Clerk usa cookies de sesión imprescindibles para mantenerte identificado. No requieren consentimiento."],
      ["Analítica", "Esta versión no carga Google Tag Manager ni Microsoft Clarity. Si se activaran, se pediría consentimiento antes."],
      ["Mapas", "Las teselas del mapa se sirven desde OpenStreetMap, que puede registrar tu dirección IP al servirlas. Consulta su política en openstreetmap.org."],
    ],
  },
} as const;

type Key = keyof typeof PAGES;

export function generateStaticParams() {
  return (Object.keys(PAGES) as Key[]).map((page) => ({ page }));
}

export async function generateMetadata({ params }: { params: Promise<{ page: string }> }): Promise<Metadata> {
  const { page } = await params;
  const p = PAGES[page as Key];
  return p ? { title: p.title, robots: { index: false } } : {};
}

export default async function LegalPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  const p = PAGES[page as Key];
  if (!p) notFound();
  return (
    <article className="container-page max-w-3xl py-10 lg:py-14">
      <h1 className="font-display text-h1">{p.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Última actualización: {p.updated}</p>
      <div className="mt-8 space-y-8">
        {p.sections.map(([title, text]) => (
          <section key={title}>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">{text}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
