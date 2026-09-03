/**
 * Datos de demostración: usuarios, restaurantes, cartas, platos y reseñas.
 * Todo es ficticio. Las coordenadas son reales (centros de cada ciudad con
 * pequeños desplazamientos) para que "cerca de mí" y el mapa funcionen.
 *
 * Los ids de usuario imitan el formato de Clerk (`user_...`) pero no existen en
 * Clerk: sirven para mostrar autores de reseñas y dueños en el directorio.
 * Los restaurantes de demo se reasignan a un owner real desde el panel de admin.
 */

export type SeedUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "OWNER" | "USER";
  points?: number;
};

export type SeedDish = {
  name: string;
  price: number;
  category: "entrantes" | "principales" | "postres" | "bebidas" | "tapas";
  allergens?: string[]; // slugs de taxonomías MENU_ALLERGEN
  presentation?: string; // slug de MENU_PRESENTATION
  description?: string;
  featured?: boolean;
  image?: string;
};

export type SeedRestaurant = {
  slug: string;
  name: string;
  ownerId: string;
  description: string;
  address: string;
  city: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  phone: string;
  website?: string;
  priceRange: "CHEAP" | "MODERATE" | "EXPENSIVE" | "LUXURY";
  status: "APPROVED" | "PENDING" | "REJECTED";
  rejectionReason?: string;
  taxonomies: string[]; // slugs de taxonomías RESTAURANT
  menu: { title: string; description: string; price?: number; dishes: SeedDish[] };
};

export type SeedReview = {
  restaurant: string; // slug
  user: string; // id
  comment: string;
  ratings: [number, number, number, number]; // AMBIANCE, SERVICE, FOOD, VALUE
  daysAgo: number;
};

export const users: SeedUser[] = [
  { id: "user_seed_admin", email: "admin@foodzinder.dev", firstName: "Marta", lastName: "Admin", role: "ADMIN" },
  { id: "user_seed_owner_1", email: "lucia@casaterral.es", firstName: "Lucía", lastName: "Terral", role: "OWNER" },
  { id: "user_seed_owner_2", email: "pol@grupomarina.cat", firstName: "Pol", lastName: "Ribas", role: "OWNER" },
  { id: "user_seed_owner_3", email: "amparo@arrocesdelturia.es", firstName: "Amparo", lastName: "Soler", role: "OWNER" },
  { id: "user_seed_owner_4", email: "curro@tabernaelarenal.es", firstName: "Curro", lastName: "Montes", role: "OWNER" },
  { id: "user_seed_user_1", email: "nerea@example.com", firstName: "Nerea", lastName: "G.", role: "USER", points: 340 },
  { id: "user_seed_user_2", email: "iker@example.com", firstName: "Iker", lastName: "M.", role: "USER", points: 120 },
  { id: "user_seed_user_3", email: "carla@example.com", firstName: "Carla", lastName: "P.", role: "USER", points: 610 },
  { id: "user_seed_user_4", email: "hugo@example.com", firstName: "Hugo", lastName: "R.", role: "USER", points: 60 },
  { id: "user_seed_user_5", email: "aitana@example.com", firstName: "Aitana", lastName: "V.", role: "USER", points: 1050 },
  { id: "user_seed_user_6", email: "mateo@example.com", firstName: "Mateo", lastName: "L.", role: "USER", points: 30 },
  { id: "user_seed_user_7", email: "olivia@example.com", firstName: "Olivia", lastName: "S.", role: "USER", points: 220 },
  { id: "user_seed_user_8", email: "dani@example.com", firstName: "Dani", lastName: "F.", role: "USER", points: 480 },
];

export const restaurants: SeedRestaurant[] = [
  // ---------------- MADRID ----------------
  {
    slug: "casa-terral",
    name: "Casa Terral",
    ownerId: "user_seed_owner_1",
    description:
      "Cocina castellana de cuchara en una casa de comidas del barrio de las Letras. Guisos de temporada, pan de hogaza y vino de la sierra. Sin reservas: se entra y se espera en la barra.",
    address: "Calle de las Huertas, 34",
    city: "Madrid",
    postalCode: "28014",
    latitude: 40.4141,
    longitude: -3.6989,
    phone: "+34 910 234 567",
    website: "https://casaterral.example",
    priceRange: "MODERATE",
    status: "APPROVED",
    taxonomies: ["espanola", "restaurante", "menu-del-dia", "apto-celiacos", "wifi"],
    menu: {
      title: "Carta de temporada",
      description: "Cambia cada dos meses según lo que llega del mercado de Antón Martín.",
      dishes: [
        { name: "Cocido madrileño en dos vuelcos", price: 18.5, category: "principales", allergens: ["apio"], presentation: "plato", description: "Sopa con fideos primero, garbanzos, verdura y carnes después.", featured: true, image: "cocido-madrileno" },
        { name: "Callos a la madrileña", price: 12, category: "principales", allergens: [], presentation: "racion", description: "Con morro y chorizo, picantes en su punto." },
        { name: "Croquetas de jamón", price: 9, category: "entrantes", allergens: ["gluten", "lacteos", "huevos"], presentation: "racion", description: "Seis unidades, bechamel fina y jamón ibérico." },
        { name: "Ensalada de escarola con granada", price: 8.5, category: "entrantes", allergens: [], presentation: "plato" },
        { name: "Torrija de brioche", price: 6, category: "postres", allergens: ["gluten", "lacteos", "huevos"], presentation: "plato", description: "Empapada en leche con canela y tostada al momento." },
        { name: "Leche frita", price: 5.5, category: "postres", allergens: ["gluten", "lacteos", "huevos"], presentation: "plato" },
      ],
    },
  },
  {
    slug: "kaiseki-ronda",
    name: "Kaiseki Ronda",
    ownerId: "user_seed_owner_1",
    description:
      "Barra japonesa de doce plazas en Chamberí. Menú omakase de diez pases con pescado del día y arroz de Niigata. Reserva obligatoria con dos turnos por noche.",
    address: "Calle de Ponzano, 71",
    city: "Madrid",
    postalCode: "28003",
    latitude: 40.4395,
    longitude: -3.7017,
    phone: "+34 913 456 789",
    website: "https://kaisekironda.example",
    priceRange: "LUXURY",
    status: "APPROVED",
    taxonomies: ["japonesa", "restaurante", "cena-romantica", "reserva-online"],
    menu: {
      title: "Omakase",
      description: "Diez pases decididos por el itamae según la lonja del día.",
      price: 95,
      dishes: [
        { name: "Nigiri de toro", price: 9, category: "principales", allergens: ["pescado"], presentation: "pintxo", featured: true, image: "nigiri-toro" },
        { name: "Nigiri de vieira flambeada", price: 7.5, category: "principales", allergens: ["moluscos"], presentation: "pintxo" },
        { name: "Chawanmushi de setas", price: 8, category: "entrantes", allergens: ["huevos", "soja"], presentation: "plato", description: "Flan salado al vapor con shiitake y trufa." },
        { name: "Tempura de langostino", price: 11, category: "entrantes", allergens: ["crustaceos", "gluten"], presentation: "racion" },
        { name: "Mochi de té matcha", price: 6, category: "postres", allergens: ["soja"], presentation: "plato" },
      ],
    },
  },
  {
    slug: "la-tasquita-de-lavapies",
    name: "La Tasquita de Lavapiés",
    ownerId: "user_seed_owner_1",
    description:
      "Tapas de siempre con producto de ahora. Barra de mármol, cañas bien tiradas y una terraza pequeña en la plaza. Mucho ruido, mucha vida.",
    address: "Calle de Argumosa, 9",
    city: "Madrid",
    postalCode: "28012",
    latitude: 40.4082,
    longitude: -3.7017,
    phone: "+34 915 678 901",
    priceRange: "CHEAP",
    status: "APPROVED",
    taxonomies: ["tapas", "bar", "terraza", "tapas-amigos", "opciones-veganas"],
    menu: {
      title: "Tapas y raciones",
      description: "Para compartir en la barra o en la terraza.",
      dishes: [
        { name: "Bravas con alioli de ajo negro", price: 6.5, category: "tapas", allergens: ["huevos"], presentation: "racion", featured: true, image: "bravas" },
        { name: "Tortilla de patata con cebolla", price: 3.5, category: "tapas", allergens: ["huevos"], presentation: "tapa", description: "Poco cuajada, a la vista en la barra." },
        { name: "Boquerones en vinagre", price: 7, category: "tapas", allergens: ["pescado"], presentation: "racion" },
        { name: "Hummus de remolacha con crudités", price: 6, category: "tapas", allergens: ["sesamo"], presentation: "racion", description: "Vegano." },
        { name: "Bocadillo de calamares", price: 5.5, category: "principales", allergens: ["moluscos", "gluten"], presentation: "bocadillo" },
        { name: "Caña de Mahou", price: 2.2, category: "bebidas", allergens: ["gluten"] },
      ],
    },
  },
  // ---------------- BARCELONA ----------------
  {
    slug: "marina-blava",
    name: "Marina Blava",
    ownerId: "user_seed_owner_2",
    description:
      "Arroces y pescado de lonja frente a la playa de la Barceloneta. Comedor con ventanales al mar y una terraza que se llena los domingos. Los arroces se piden para dos.",
    address: "Passeig de Joan de Borbó, 44",
    city: "Barcelona",
    postalCode: "08003",
    latitude: 41.3778,
    longitude: 2.1897,
    phone: "+34 932 210 345",
    website: "https://marinablava.example",
    priceRange: "EXPENSIVE",
    status: "APPROVED",
    taxonomies: ["mediterranea", "restaurante", "terraza", "reserva-online", "accesible"],
    menu: {
      title: "Carta de mar",
      description: "Pescado según subasta de la mañana en el Port de Barcelona.",
      dishes: [
        { name: "Arroz negro con sepia y alioli", price: 22, category: "principales", allergens: ["moluscos", "huevos"], presentation: "plato", description: "Precio por persona, mínimo dos.", featured: true, image: "arroz-negro" },
        { name: "Fideuà de gambas", price: 21, category: "principales", allergens: ["crustaceos", "gluten"], presentation: "plato" },
        { name: "Lubina a la sal", price: 28, category: "principales", allergens: ["pescado"], presentation: "plato" },
        { name: "Mejillones al vapor con limón", price: 11, category: "entrantes", allergens: ["moluscos"], presentation: "racion" },
        { name: "Esqueixada de bacalao", price: 13, category: "entrantes", allergens: ["pescado"], presentation: "plato" },
        { name: "Crema catalana", price: 6.5, category: "postres", allergens: ["lacteos", "huevos"], presentation: "plato" },
      ],
    },
  },
  {
    slug: "vermuteria-el-born",
    name: "Vermutería El Born",
    ownerId: "user_seed_owner_2",
    description:
      "Vermut de grifo, conservas buenas y bravas discutibles. Local pequeño con barriles por mesa y música a volumen razonable. Abre a las doce para el aperitivo.",
    address: "Carrer de l'Argenteria, 62",
    city: "Barcelona",
    postalCode: "08003",
    latitude: 41.3846,
    longitude: 2.1806,
    phone: "+34 933 101 202",
    priceRange: "CHEAP",
    status: "APPROVED",
    taxonomies: ["tapas", "bar", "tapas-amigos", "comida-rapida"],
    menu: {
      title: "Aperitivo",
      description: "Conservas, encurtidos y algo caliente.",
      dishes: [
        { name: "Vermut de la casa", price: 3.5, category: "bebidas", allergens: ["sulfitos"], featured: true, image: "vermut" },
        { name: "Anchoas de L'Escala con pan con tomate", price: 9.5, category: "tapas", allergens: ["pescado", "gluten"], presentation: "racion" },
        { name: "Gildas", price: 2.5, category: "tapas", allergens: ["pescado"], presentation: "pintxo", description: "Anchoa, piparra y oliva. Una unidad." },
        { name: "Patatas bravas", price: 5.5, category: "tapas", allergens: ["huevos"], presentation: "racion" },
        { name: "Bomba de la Barceloneta", price: 3.8, category: "tapas", allergens: ["gluten", "huevos", "lacteos"], presentation: "tapa", description: "Bola de patata rellena de carne, picante." },
      ],
    },
  },
  {
    slug: "gracia-verde",
    name: "Gràcia Verde",
    ownerId: "user_seed_owner_2",
    description:
      "Cocina vegetal de proximidad en el barrio de Gràcia. Menú del día con tres opciones y carta corta por la noche. Todo sin gluten salvo el pan, que se avisa.",
    address: "Carrer de Verdi, 18",
    city: "Barcelona",
    postalCode: "08012",
    latitude: 41.4036,
    longitude: 2.1571,
    phone: "+34 932 375 511",
    website: "https://graciaverde.example",
    priceRange: "MODERATE",
    status: "PENDING",
    taxonomies: ["mediterranea", "restaurante", "opciones-veganas", "apto-celiacos", "brunch", "menu-del-dia"],
    menu: {
      title: "Carta vegetal",
      description: "Verdura de la cooperativa del Maresme, cambia cada semana.",
      dishes: [
        { name: "Bowl de quinoa, calabaza asada y tahini", price: 12.5, category: "principales", allergens: ["sesamo"], presentation: "plato", featured: true, image: "bowl-quinoa" },
        { name: "Berenjena a la brasa con miso", price: 11, category: "principales", allergens: ["soja"], presentation: "plato" },
        { name: "Crema fría de guisantes y menta", price: 7.5, category: "entrantes", allergens: [], presentation: "plato" },
        { name: "Tarta de zanahoria sin gluten", price: 5.5, category: "postres", allergens: ["frutos-de-cascara", "huevos"], presentation: "plato" },
      ],
    },
  },
  // ---------------- VALENCIA ----------------
  {
    slug: "arroces-del-turia",
    name: "Arroces del Turia",
    ownerId: "user_seed_owner_3",
    description:
      "Paella a leña de naranjo, como se hace en la huerta. Comedor familiar junto al antiguo cauce del Turia. Los arroces se encargan al reservar; el resto se decide en la mesa.",
    address: "Carrer de Cavanilles, 21",
    city: "Valencia",
    postalCode: "46020",
    latitude: 39.4766,
    longitude: -0.3626,
    phone: "+34 963 610 908",
    website: "https://arrocesdelturia.example",
    priceRange: "MODERATE",
    status: "APPROVED",
    taxonomies: ["espanola", "mediterranea", "restaurante", "parking", "reserva-online", "accesible"],
    menu: {
      title: "Arroces a leña",
      description: "Mínimo dos personas por arroz. Cuarenta minutos de espera, avisados.",
      dishes: [
        { name: "Paella valenciana", price: 17, category: "principales", allergens: [], presentation: "plato", description: "Pollo, conejo, garrofó, judía verde y caracoles. Precio por persona.", featured: true, image: "paella-valenciana" },
        { name: "Arroz a banda", price: 18, category: "principales", allergens: ["pescado", "crustaceos"], presentation: "plato" },
        { name: "Arroz al horno", price: 16, category: "principales", allergens: [], presentation: "plato", description: "Con garbanzos, morcilla y patata. Solo jueves." },
        { name: "Esgarraet", price: 8, category: "entrantes", allergens: ["pescado"], presentation: "racion", description: "Pimiento asado y bacalao desmigado." },
        { name: "Clóchinas al vapor", price: 12, category: "entrantes", allergens: ["moluscos"], presentation: "racion", description: "Solo en temporada, de mayo a agosto." },
        { name: "Horchata con fartons", price: 5, category: "postres", allergens: ["gluten", "huevos"], presentation: "plato" },
      ],
    },
  },
  {
    slug: "taqueria-ruzafa",
    name: "Taquería Ruzafa",
    ownerId: "user_seed_owner_3",
    description:
      "Tacos de guiso en tortilla de maíz nixtamalizado hecha en casa. Salsas de tres picantes, agua de horchata y cerveza mexicana. Local pequeño y ruidoso en el corazón de Ruzafa.",
    address: "Carrer de Sueca, 45",
    city: "Valencia",
    postalCode: "46006",
    latitude: 39.4612,
    longitude: -0.3742,
    phone: "+34 960 044 331",
    priceRange: "CHEAP",
    status: "APPROVED",
    taxonomies: ["mexicana", "restaurante", "comida-rapida", "takeaway", "delivery", "apto-celiacos"],
    menu: {
      title: "Tacos y antojitos",
      description: "Todo con tortilla de maíz, sin gluten. Se avisa si alguna salsa lleva cacahuete.",
      dishes: [
        { name: "Taco de cochinita pibil", price: 3.8, category: "principales", allergens: [], presentation: "tapa", description: "Con cebolla morada encurtida y habanero.", featured: true, image: "taco-cochinita" },
        { name: "Taco de birria con consomé", price: 4.5, category: "principales", allergens: ["lacteos"], presentation: "tapa" },
        { name: "Taco de coliflor al pastor", price: 3.5, category: "principales", allergens: [], presentation: "tapa", description: "Vegano." },
        { name: "Guacamole con totopos", price: 7, category: "entrantes", allergens: [], presentation: "racion" },
        { name: "Salsa de cacahuete y chile de árbol", price: 1, category: "entrantes", allergens: ["cacahuetes"], presentation: "tapa" },
        { name: "Agua de horchata", price: 3, category: "bebidas", allergens: [] },
      ],
    },
  },
  {
    slug: "cafe-de-les-arts",
    name: "Café de les Arts",
    ownerId: "user_seed_owner_3",
    description:
      "Cafetería de especialidad con brunch hasta las cuatro. Tostadas de masa madre, huevos de corral y café de tueste propio. Muchos portátiles entre semana, muchos perros el fin de semana.",
    address: "Carrer de Císcar, 30",
    city: "Valencia",
    postalCode: "46005",
    latitude: 39.4653,
    longitude: -0.3701,
    phone: "+34 963 812 700",
    website: "https://cafedelesarts.example",
    priceRange: "MODERATE",
    status: "APPROVED",
    taxonomies: ["americana", "cafeteria", "brunch", "wifi", "terraza", "opciones-veganas"],
    menu: {
      title: "Brunch",
      description: "De 9:00 a 16:00 todos los días.",
      dishes: [
        { name: "Huevos benedictinos con salmón", price: 12.5, category: "principales", allergens: ["huevos", "pescado", "gluten", "lacteos"], presentation: "plato", featured: true, image: "huevos-benedictinos" },
        { name: "Tostada de aguacate y tomate seco", price: 8.5, category: "principales", allergens: ["gluten", "sesamo"], presentation: "plato", description: "Vegana con pan de masa madre." },
        { name: "Pancakes de plátano", price: 9, category: "principales", allergens: ["gluten", "huevos", "lacteos"], presentation: "plato" },
        { name: "Flat white", price: 2.8, category: "bebidas", allergens: ["lacteos"] },
        { name: "Zumo de naranja valenciana", price: 3.5, category: "bebidas", allergens: [] },
        { name: "Tarta de queso al horno", price: 5.5, category: "postres", allergens: ["lacteos", "huevos", "gluten"], presentation: "plato" },
      ],
    },
  },
  // ---------------- SEVILLA ----------------
  {
    slug: "taberna-el-arenal",
    name: "Taberna El Arenal",
    ownerId: "user_seed_owner_4",
    description:
      "Taberna de barrio con azulejos de 1920 y jamones colgando. Montaditos, frituras y manzanilla fría. Muy cerca de la Maestranza; los días de toros no cabe un alfiler.",
    address: "Calle Arfe, 11",
    city: "Sevilla",
    postalCode: "41001",
    latitude: 37.3856,
    longitude: -5.9982,
    phone: "+34 954 224 190",
    priceRange: "CHEAP",
    status: "APPROVED",
    taxonomies: ["tapas", "espanola", "bar", "tapas-amigos"],
    menu: {
      title: "Tapas de taberna",
      description: "Media ración o ración. Lo de la pizarra manda sobre la carta.",
      dishes: [
        { name: "Montadito de pringá", price: 2.8, category: "tapas", allergens: ["gluten"], presentation: "bocadillo", description: "Lo que queda del puchero, en pan de telera.", featured: true, image: "montadito-pringa" },
        { name: "Cazón en adobo", price: 8, category: "tapas", allergens: ["pescado", "gluten"], presentation: "media-racion" },
        { name: "Espinacas con garbanzos", price: 3.5, category: "tapas", allergens: ["gluten"], presentation: "tapa" },
        { name: "Solomillo al whisky", price: 4.2, category: "tapas", allergens: ["sulfitos"], presentation: "tapa" },
        { name: "Jamón ibérico de bellota", price: 14, category: "tapas", allergens: [], presentation: "media-racion" },
        { name: "Manzanilla de Sanlúcar", price: 2.5, category: "bebidas", allergens: ["sulfitos"] },
      ],
    },
  },
  {
    slug: "asador-triana",
    name: "Asador Triana",
    ownerId: "user_seed_owner_4",
    description:
      "Carne a la brasa de encina en la orilla trianera del Guadalquivir. Chuletón de vaca vieja madurado cuarenta días, verduras de la huerta de Alcalá y vinos de la sierra. Terraza con vistas a la Torre del Oro.",
    address: "Calle Betis, 68",
    city: "Sevilla",
    postalCode: "41010",
    latitude: 37.3826,
    longitude: -6.0037,
    phone: "+34 954 337 455",
    website: "https://asadortriana.example",
    priceRange: "EXPENSIVE",
    status: "APPROVED",
    taxonomies: ["asador", "restaurante", "terraza", "cena-romantica", "reserva-online", "parking"],
    menu: {
      title: "Brasa",
      description: "Todo a la parrilla de encina. Los pesos son en crudo.",
      dishes: [
        { name: "Chuletón de vaca vieja (1 kg)", price: 58, category: "principales", allergens: [], presentation: "racion", description: "Para dos. Madurado 40 días.", featured: true, image: "chuleton" },
        { name: "Presa ibérica con pimientos de Padrón", price: 21, category: "principales", allergens: [], presentation: "plato" },
        { name: "Verduras de temporada a la brasa", price: 12, category: "entrantes", allergens: [], presentation: "racion", description: "Vegano." },
        { name: "Ensalada de tomate rosa con ventresca", price: 13, category: "entrantes", allergens: ["pescado"], presentation: "plato" },
        { name: "Tarta de queso a la brasa", price: 7, category: "postres", allergens: ["lacteos", "huevos"], presentation: "plato" },
      ],
    },
  },
  {
    slug: "bao-house-alameda",
    name: "Bao House Alameda",
    ownerId: "user_seed_owner_4",
    description:
      "Baos al vapor y ramen en la Alameda de Hércules. Cocina abierta, mesas corridas y cola en la puerta a partir de las nueve. Solo para llevar al mediodía.",
    address: "Alameda de Hércules, 85",
    city: "Sevilla",
    postalCode: "41002",
    latitude: 37.3990,
    longitude: -5.9938,
    phone: "+34 955 118 260",
    priceRange: "MODERATE",
    status: "REJECTED",
    rejectionReason: "La dirección no coincide con el local de las fotos. Corrige la dirección o sube fotos actuales y vuelve a enviar.",
    taxonomies: ["china", "tailandesa", "restaurante", "takeaway", "delivery", "comida-rapida"],
    menu: {
      title: "Baos y ramen",
      description: "Los baos se hacen al momento; el caldo del ramen lleva dieciocho horas.",
      dishes: [
        { name: "Bao de panceta glaseada", price: 4.5, category: "principales", allergens: ["gluten", "soja", "sesamo"], presentation: "tapa", featured: true, image: "bao-panceta" },
        { name: "Bao de tofu crujiente", price: 4, category: "principales", allergens: ["gluten", "soja"], presentation: "tapa", description: "Vegano." },
        { name: "Tonkotsu ramen", price: 13.5, category: "principales", allergens: ["gluten", "huevos", "soja"], presentation: "plato" },
        { name: "Edamame con sal de yuzu", price: 4.5, category: "entrantes", allergens: ["soja"], presentation: "racion" },
      ],
    },
  },
];

export const reviews: SeedReview[] = [
  { restaurant: "casa-terral", user: "user_seed_user_1", comment: "El cocido es de los mejores que he comido fuera de casa de mi abuela. Esperamos veinte minutos en la barra, pero con una caña se lleva bien.", ratings: [4, 4, 5, 5], daysAgo: 3 },
  { restaurant: "casa-terral", user: "user_seed_user_3", comment: "Cocina honesta y precio justo. El local es ruidoso y las mesas están muy juntas; para una cena tranquila no lo recomiendo.", ratings: [3, 4, 5, 4], daysAgo: 12 },
  { restaurant: "casa-terral", user: "user_seed_user_5", comment: "Volví por la torrija. Solo por la torrija.", ratings: [4, 4, 5, 4], daysAgo: 30 },
  { restaurant: "kaiseki-ronda", user: "user_seed_user_3", comment: "Diez pases sin un solo fallo. El toro se deshace. Caro, sí, pero cada euro está en el plato.", ratings: [5, 5, 5, 4], daysAgo: 7 },
  { restaurant: "kaiseki-ronda", user: "user_seed_user_7", comment: "Muy bueno, aunque el segundo turno empieza tarde y el ritmo entre pases fue lento esa noche.", ratings: [5, 3, 5, 3], daysAgo: 21 },
  { restaurant: "la-tasquita-de-lavapies", user: "user_seed_user_2", comment: "Bravas correctas, tortilla espectacular, terraza imposible en fin de semana. Ir entre semana.", ratings: [4, 3, 4, 5], daysAgo: 2 },
  { restaurant: "la-tasquita-de-lavapies", user: "user_seed_user_4", comment: "Nos atendieron regular, había demasiada gente para el personal que tenían. La comida bien.", ratings: [3, 2, 4, 4], daysAgo: 9 },
  { restaurant: "la-tasquita-de-lavapies", user: "user_seed_user_6", comment: "El hummus de remolacha es lo mejor de la carta y soy carnívoro.", ratings: [4, 4, 4, 5], daysAgo: 40 },
  { restaurant: "marina-blava", user: "user_seed_user_1", comment: "El arroz negro tarda lo que tiene que tardar y llega perfecto. Pedimos terraza y nos dieron interior sin avisar.", ratings: [4, 3, 5, 3], daysAgo: 5 },
  { restaurant: "marina-blava", user: "user_seed_user_5", comment: "Lubina a la sal impecable. Vistas al mar, servicio atento, cuenta acorde.", ratings: [5, 5, 5, 3], daysAgo: 18 },
  { restaurant: "marina-blava", user: "user_seed_user_8", comment: "Bien pero no para repetir a ese precio. La fideuà venía algo pasada.", ratings: [4, 4, 3, 2], daysAgo: 33 },
  { restaurant: "vermuteria-el-born", user: "user_seed_user_2", comment: "Vermut de grifo muy bueno, anchoas de verdad. Las bravas, olvidables.", ratings: [4, 4, 4, 4], daysAgo: 1 },
  { restaurant: "vermuteria-el-born", user: "user_seed_user_7", comment: "Ideal para el aperitivo del sábado. Se llena rápido, ir a las doce en punto.", ratings: [5, 4, 4, 5], daysAgo: 15 },
  { restaurant: "arroces-del-turia", user: "user_seed_user_3", comment: "Paella a leña con socarrat de verdad. Hay que reservar el arroz al hacer la reserva, cosa que no leí y casi nos quedamos sin.", ratings: [4, 4, 5, 5], daysAgo: 4 },
  { restaurant: "arroces-del-turia", user: "user_seed_user_4", comment: "Comida de domingo con la familia. Parking al lado, acceso sin escalones, camareros pacientes con los niños.", ratings: [4, 5, 5, 5], daysAgo: 11 },
  { restaurant: "arroces-del-turia", user: "user_seed_user_8", comment: "El arroz al horno del jueves merece organizar la semana alrededor.", ratings: [4, 4, 5, 5], daysAgo: 27 },
  { restaurant: "taqueria-ruzafa", user: "user_seed_user_1", comment: "Tortillas hechas en casa, se nota. La cochinita pica lo justo. Se come de pie, no esperes otra cosa.", ratings: [3, 4, 5, 5], daysAgo: 6 },
  { restaurant: "taqueria-ruzafa", user: "user_seed_user_6", comment: "Tres tacos y una horchata por doce euros. Repetiré.", ratings: [3, 4, 4, 5], daysAgo: 14 },
  { restaurant: "taqueria-ruzafa", user: "user_seed_user_5", comment: "Avisé de alergia a cacahuete y me trataron con mucho cuidado. Se agradece.", ratings: [3, 5, 4, 5], daysAgo: 22 },
  { restaurant: "cafe-de-les-arts", user: "user_seed_user_7", comment: "Café muy bueno y tostadas generosas. Wifi estable, enchufes en casi todas las mesas.", ratings: [5, 4, 4, 4], daysAgo: 3 },
  { restaurant: "cafe-de-les-arts", user: "user_seed_user_2", comment: "Los pancakes llegaron fríos y tardaron media hora. Mal día, supongo.", ratings: [4, 2, 2, 3], daysAgo: 8 },
  { restaurant: "taberna-el-arenal", user: "user_seed_user_4", comment: "Pringá de libro. Azulejos preciosos. Un día de toros no cabía nadie y aun así nos sacaron sitio en la barra.", ratings: [5, 5, 5, 5], daysAgo: 2 },
  { restaurant: "taberna-el-arenal", user: "user_seed_user_8", comment: "Cazón en su punto, manzanilla fría. Lo de siempre bien hecho.", ratings: [5, 4, 4, 5], daysAgo: 19 },
  { restaurant: "asador-triana", user: "user_seed_user_5", comment: "Chuletón excepcional y la terraza al río es de las mejores de Sevilla. Cuenta alta, esperada.", ratings: [5, 5, 5, 3], daysAgo: 10 },
  { restaurant: "asador-triana", user: "user_seed_user_1", comment: "Las verduras a la brasa son un plato principal por sí solas. Servicio algo distante.", ratings: [5, 3, 5, 4], daysAgo: 25 },
];
