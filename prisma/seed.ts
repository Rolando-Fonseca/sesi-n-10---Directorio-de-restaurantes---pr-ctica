import { PrismaClient, TaxonomyScope } from "@prisma/client";
import { seedDemo } from "./seed-demo";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ============================================
  // TAXONOMIES
  // ============================================

  // Restaurant taxonomies
  const restaurantTaxonomies = [
    { scope: TaxonomyScope.RESTAURANT, name: "Italiana", slug: "italiana", icon: "🍕", order: 1 },
    { scope: TaxonomyScope.RESTAURANT, name: "Japonesa", slug: "japonesa", icon: "🍣", order: 2 },
    { scope: TaxonomyScope.RESTAURANT, name: "Mexicana", slug: "mexicana", icon: "🌮", order: 3 },
    { scope: TaxonomyScope.RESTAURANT, name: "Española", slug: "espanola", icon: "🥘", order: 4 },
    { scope: TaxonomyScope.RESTAURANT, name: "India", slug: "india", icon: "🍛", order: 5 },
    { scope: TaxonomyScope.RESTAURANT, name: "China", slug: "china", icon: "🥡", order: 6 },
    { scope: TaxonomyScope.RESTAURANT, name: "Mediterránea", slug: "mediterranea", icon: "🫒", order: 7 },
    { scope: TaxonomyScope.RESTAURANT, name: "Americana", slug: "americana", icon: "🍔", order: 8 },
    { scope: TaxonomyScope.RESTAURANT, name: "Tailandesa", slug: "tailandesa", icon: "🍜", order: 9 },
    { scope: TaxonomyScope.RESTAURANT, name: "Peruana", slug: "peruana", icon: "🦪", order: 10 },
    { scope: TaxonomyScope.RESTAURANT, name: "Tapas", slug: "tapas", icon: "🫕", order: 11 },
    { scope: TaxonomyScope.RESTAURANT, name: "Asador", slug: "asador", icon: "🥩", order: 12 },
  ];

  // Establishment types
  const establishmentTypes = [
    { scope: TaxonomyScope.RESTAURANT, name: "Restaurante", slug: "restaurante", icon: "🍽️", order: 20 },
    { scope: TaxonomyScope.RESTAURANT, name: "Bar", slug: "bar", icon: "🍺", order: 21 },
    { scope: TaxonomyScope.RESTAURANT, name: "Cafetería", slug: "cafeteria", icon: "☕", order: 22 },
    { scope: TaxonomyScope.RESTAURANT, name: "Food Truck", slug: "food-truck", icon: "🚚", order: 23 },
    { scope: TaxonomyScope.RESTAURANT, name: "Pub", slug: "pub", icon: "🍻", order: 24 },
  ];

  // Restaurant features
  const features = [
    { scope: TaxonomyScope.RESTAURANT, name: "Terraza", slug: "terraza", icon: "☀️", order: 30 },
    { scope: TaxonomyScope.RESTAURANT, name: "WiFi", slug: "wifi", icon: "📶", order: 31 },
    { scope: TaxonomyScope.RESTAURANT, name: "Parking", slug: "parking", icon: "🅿️", order: 32 },
    { scope: TaxonomyScope.RESTAURANT, name: "Accesible", slug: "accesible", icon: "♿", order: 33 },
    { scope: TaxonomyScope.RESTAURANT, name: "Reserva online", slug: "reserva-online", icon: "📱", order: 34 },
    { scope: TaxonomyScope.RESTAURANT, name: "Delivery", slug: "delivery", icon: "🛵", order: 35 },
    { scope: TaxonomyScope.RESTAURANT, name: "Takeaway", slug: "takeaway", icon: "🥡", order: 36 },
    { scope: TaxonomyScope.RESTAURANT, name: "Apto celíacos", slug: "apto-celiacos", icon: "🌾", order: 37 },
    { scope: TaxonomyScope.RESTAURANT, name: "Opciones veganas", slug: "opciones-veganas", icon: "🌱", order: 38 },
  ];

  // Preferences ("Soy más de")
  const preferences = [
    { scope: TaxonomyScope.RESTAURANT, name: "Tapas con amigos", slug: "tapas-amigos", icon: "🥂", order: 40 },
    { scope: TaxonomyScope.RESTAURANT, name: "Cena romántica", slug: "cena-romantica", icon: "❤️", order: 41 },
    { scope: TaxonomyScope.RESTAURANT, name: "Comida rápida", slug: "comida-rapida", icon: "⚡", order: 42 },
    { scope: TaxonomyScope.RESTAURANT, name: "Brunch", slug: "brunch", icon: "🥞", order: 43 },
    { scope: TaxonomyScope.RESTAURANT, name: "Menú del día", slug: "menu-del-dia", icon: "📋", order: 44 },
  ];

  // Menu presentations
  const presentations = [
    { scope: TaxonomyScope.MENU_PRESENTATION, name: "Ración", slug: "racion", icon: "🍽️", order: 1 },
    { scope: TaxonomyScope.MENU_PRESENTATION, name: "Tapa", slug: "tapa", icon: "🫕", order: 2 },
    { scope: TaxonomyScope.MENU_PRESENTATION, name: "Media ración", slug: "media-racion", icon: "🍽️", order: 3 },
    { scope: TaxonomyScope.MENU_PRESENTATION, name: "Pintxo", slug: "pintxo", icon: "🥖", order: 4 },
    { scope: TaxonomyScope.MENU_PRESENTATION, name: "Plato", slug: "plato", icon: "🥘", order: 5 },
    { scope: TaxonomyScope.MENU_PRESENTATION, name: "Bocadillo", slug: "bocadillo", icon: "🥪", order: 6 },
  ];

  // Allergens (EU regulation 1169/2011)
  const allergens = [
    { scope: TaxonomyScope.MENU_ALLERGEN, name: "Gluten", slug: "gluten", icon: "🌾", order: 1 },
    { scope: TaxonomyScope.MENU_ALLERGEN, name: "Crustáceos", slug: "crustaceos", icon: "🦐", order: 2 },
    { scope: TaxonomyScope.MENU_ALLERGEN, name: "Huevos", slug: "huevos", icon: "🥚", order: 3 },
    { scope: TaxonomyScope.MENU_ALLERGEN, name: "Pescado", slug: "pescado", icon: "🐟", order: 4 },
    { scope: TaxonomyScope.MENU_ALLERGEN, name: "Cacahuetes", slug: "cacahuetes", icon: "🥜", order: 5 },
    { scope: TaxonomyScope.MENU_ALLERGEN, name: "Soja", slug: "soja", icon: "🫘", order: 6 },
    { scope: TaxonomyScope.MENU_ALLERGEN, name: "Lácteos", slug: "lacteos", icon: "🥛", order: 7 },
    { scope: TaxonomyScope.MENU_ALLERGEN, name: "Frutos de cáscara", slug: "frutos-de-cascara", icon: "🌰", order: 8 },
    { scope: TaxonomyScope.MENU_ALLERGEN, name: "Apio", slug: "apio", icon: "🥬", order: 9 },
    { scope: TaxonomyScope.MENU_ALLERGEN, name: "Mostaza", slug: "mostaza", icon: "🟡", order: 10 },
    { scope: TaxonomyScope.MENU_ALLERGEN, name: "Sésamo", slug: "sesamo", icon: "⚪", order: 11 },
    { scope: TaxonomyScope.MENU_ALLERGEN, name: "Sulfitos", slug: "sulfitos", icon: "🍷", order: 12 },
    { scope: TaxonomyScope.MENU_ALLERGEN, name: "Altramuces", slug: "altramuces", icon: "🌺", order: 13 },
    { scope: TaxonomyScope.MENU_ALLERGEN, name: "Moluscos", slug: "moluscos", icon: "🦪", order: 14 },
  ];

  // Menu categories (global templates, owners create local versions)
  const menuCategories = [
    { scope: TaxonomyScope.MENU_CATEGORY, name: "Entrantes", slug: "entrantes", icon: "🥗", order: 1 },
    { scope: TaxonomyScope.MENU_CATEGORY, name: "Principales", slug: "principales", icon: "🥘", order: 2 },
    { scope: TaxonomyScope.MENU_CATEGORY, name: "Postres", slug: "postres", icon: "🍰", order: 3 },
    { scope: TaxonomyScope.MENU_CATEGORY, name: "Bebidas", slug: "bebidas", icon: "🥤", order: 4 },
    { scope: TaxonomyScope.MENU_CATEGORY, name: "Tapas", slug: "tapas", icon: "🫕", order: 5 },
    { scope: TaxonomyScope.MENU_CATEGORY, name: "Ensaladas", slug: "ensaladas", icon: "🥬", order: 6 },
    { scope: TaxonomyScope.MENU_CATEGORY, name: "Carnes", slug: "carnes", icon: "🥩", order: 7 },
    { scope: TaxonomyScope.MENU_CATEGORY, name: "Pescados", slug: "pescados", icon: "🐟", order: 8 },
    { scope: TaxonomyScope.MENU_CATEGORY, name: "Arroces", slug: "arroces", icon: "🍚", order: 9 },
  ];

  const allTaxonomies = [
    ...restaurantTaxonomies,
    ...establishmentTypes,
    ...features,
    ...preferences,
    ...presentations,
    ...allergens,
    ...menuCategories,
  ];

  for (const taxonomy of allTaxonomies) {
    await prisma.taxonomy.upsert({
      where: { scope_slug: { scope: taxonomy.scope, slug: taxonomy.slug } },
      update: taxonomy,
      create: taxonomy,
    });
  }

  console.log(`Created ${allTaxonomies.length} taxonomies`);

  // ============================================
  // PLANS
  // ============================================

  const plans = [
    {
      name: "Básico",
      slug: "basico",
      description: "Ideal para empezar a dar visibilidad a tu restaurante",
      priceMonthly: 14.99,
      priceAnnual: 149.99,
      maxRestaurants: 1,
      maxMenus: 3,
      maxDishesPerMenu: 30,
      features: {
        basicListing: true,
        menuManagement: true,
        photos: true,
        reviews: true,
        analytics: false,
        featuredListing: false,
        prioritySupport: false,
      },
    },
    {
      name: "Pro",
      slug: "pro",
      description: "Para restaurantes que quieren destacar",
      priceMonthly: 29.99,
      priceAnnual: 299.99,
      maxRestaurants: 3,
      maxMenus: 10,
      maxDishesPerMenu: 50,
      features: {
        basicListing: true,
        menuManagement: true,
        photos: true,
        reviews: true,
        analytics: true,
        featuredListing: false,
        prioritySupport: true,
      },
    },
    {
      name: "Premium",
      slug: "premium",
      description: "Máxima visibilidad y todas las funcionalidades",
      priceMonthly: 49.99,
      priceAnnual: 499.99,
      maxRestaurants: 10,
      maxMenus: 20,
      maxDishesPerMenu: 100,
      features: {
        basicListing: true,
        menuManagement: true,
        photos: true,
        reviews: true,
        analytics: true,
        featuredListing: true,
        prioritySupport: true,
      },
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    });
  }

  console.log(`Created ${plans.length} subscription plans`);

  // ============================================
  // BADGES
  // ============================================

  const badges = [
    { slug: "first-review", name: "Primer Opinión", description: "Escribe tu primera reseña", threshold: 1, category: "REVIEWS", iconUrl: "⭐" },
    { slug: "reviewer-5", name: "Catador", description: "Escribe 5 reseñas", threshold: 5, category: "REVIEWS", iconUrl: "🌟" },
    { slug: "reviewer-25", name: "Crítico Gastronómico", description: "Escribe 25 reseñas", threshold: 25, category: "REVIEWS", iconUrl: "💫" },
    { slug: "photographer", name: "Fotógrafo Foodie", description: "Sube fotos en 10 reseñas", threshold: 10, category: "REVIEWS", iconUrl: "📸" },
    { slug: "explorer-10", name: "Explorador", description: "Añade 10 platos a tu wishlist", threshold: 10, category: "EXPLORATION", iconUrl: "🗺️" },
    { slug: "explorer-50", name: "Viajero Gastronómico", description: "Añade 50 platos a tu wishlist", threshold: 50, category: "EXPLORATION", iconUrl: "✈️" },
    { slug: "profile-complete", name: "Perfil Completo", description: "Completa tu perfil al 100%", threshold: 1, category: "SOCIAL", iconUrl: "👤" },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { slug: badge.slug },
      update: badge,
      create: badge,
    });
  }

  console.log(`Created ${badges.length} badges`);

  // Datos de demostración (restaurantes, cartas, reseñas). Se omiten con SEED_DEMO=false.
  if (process.env.SEED_DEMO !== "false") {
    await seedDemo(prisma);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
