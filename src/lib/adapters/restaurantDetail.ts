import type { BackendRestaurant } from "./restaurants";

export type BackendRestaurantDetail = BackendRestaurant & {
  primaryContact?: {
    name?: string;
    email?: string;
    phone?: string;
    designation?: string;
  };
  operatingCountry?: string;
  timezone?: string;
  status?: string;
  description?: string;
};

const placeholderImages = [
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1200&q=80",
];

const formatLocation = (restaurant: BackendRestaurantDetail) => {
  const parts = [
    restaurant.registeredAddress?.street,
    restaurant.registeredAddress?.city,
    restaurant.registeredAddress?.state,
    restaurant.registeredAddress?.country,
  ].filter(Boolean);
  return parts.join(", ") || "Location coming soon";
};

const formatPhone = (restaurant: BackendRestaurantDetail) => {
  return (
    restaurant.primaryContact?.phone ??
    restaurant.primaryContact?.email ??
    "Contact unavailable"
  );
};

const normalizeRating = (restaurant: BackendRestaurantDetail) => {
  const branchCount = restaurant._count?.branches ?? 1;
  return Math.min(5, 3 + branchCount * 0.2);
};

export type RestaurantDetailEntry = {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  location: string;
  phone: string;
  hours: string;
  description: string;
  images: string[];
  menu: { name: string; price: string; description: string }[];
  reviews: { author: string; rating: number; text: string }[];
  floorHighlights?: { label: string; value: string }[];
  floorTables?: {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    label: string;
    zone?: string;
    shape?: "Round" | "Square" | "Rectangle";
    seats?: number;
    rotation?: number;
  }[];
  upcoming?: { name: string; status: "Available" | "Limited" | "Full" }[];
};

export const mapDetailRestaurant = (
  restaurant: BackendRestaurantDetail,
  fallback?: RestaurantDetailEntry
): RestaurantDetailEntry => {
  return {
    id: restaurant.id,
    name: restaurant.brandName ?? restaurant.legalBusinessName ?? fallback?.name ?? "Restaurant",
    cuisine: restaurant.cuisineTypes?.[0] ?? fallback?.cuisine ?? "Multicuisine",
    rating: parseFloat((fallback?.rating ?? normalizeRating(restaurant)).toFixed(1)),
    location: formatLocation(restaurant),
    phone: formatPhone(restaurant),
    hours: fallback?.hours ?? "08:00 - 23:00",
    description:
      fallback?.description ??
      restaurant.description ??
      `${restaurant.brandName ?? "This restaurant"} is operating ${
        restaurant.operatingCountry ? `in ${restaurant.operatingCountry}` : "across multiple locations"
      }.`,
    images: fallback?.images ?? placeholderImages,
    menu: fallback?.menu ?? [],
    reviews: fallback?.reviews ?? [],
    floorHighlights: fallback?.floorHighlights,
    floorTables: fallback?.floorTables,
    upcoming: fallback?.upcoming,
  };
};
