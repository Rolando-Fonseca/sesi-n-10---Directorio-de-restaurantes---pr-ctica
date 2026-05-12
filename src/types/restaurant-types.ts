export type RestaurantWithRelations = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  city: string | null;
  latitude: number;
  longitude: number;
  priceRange: string | null;
  averageRating: number | null;
  reviewCount: number;
  logoUrl: string | null;
  coverUrl: string | null;
  status: string;
  taxonomies: { id: string; name: string; scope: string }[];
};

export type RestaurantSearchParams = {
  query?: string;
  city?: string;
  priceRange?: string[];
  cuisineIds?: string[];
  featureIds?: string[];
  lat?: number;
  lng?: number;
  radius?: number;
  page?: number;
  limit?: number;
};
