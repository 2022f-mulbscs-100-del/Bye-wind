import type { Restaurant } from "@/Pages/Public/Restaurants/types";

export type BackendRestaurant = {
  id: string;
  brandName?: string;
  legalBusinessName?: string;
  cuisineTypes?: string[];
  registeredAddress?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  logoUrl?: string;
  branches?: { id: string; name?: string }[];
  status?: string;
  isActive?: boolean;
  _count?: {
    branches?: number;
    staff?: number;
  };
};

const placeholderImage =
  "https://images.unsplash.com/photo-1447078806655-40579c2520d6?auto=format&fit=crop&w=1200&q=80";

const formatLocation = (address?: BackendRestaurant["registeredAddress"]) => {
  const parts = [
    address?.street,
    address?.city,
    address?.state,
    address?.country,
  ].filter(Boolean);
  return parts.join(", ") || "Unknown location";
};

export const mapRestaurant = (item: BackendRestaurant): Restaurant => {
  const baseRating = Math.min(5, 3 + (item._count?.branches ?? 1) * 0.3);
  const tags = new Set<string>();
  tags.add(item.status ?? "LIVE");
  (item.cuisineTypes ?? ["Global"]).forEach((tag) => tags.add(tag));
  tags.add(`${item._count?.branches ?? 1} branches`);

  return {
    id: item.id,
    name: item.brandName ?? item.legalBusinessName ?? "Restaurant",
    cuisine: item.cuisineTypes?.[0] ?? "Multicuisine",
    rating: parseFloat(baseRating.toFixed(1)),
    location: formatLocation(item.registeredAddress),
    price: `$${20 + ((item._count?.branches ?? 0) % 3) * 10} per person`,
    nextSlot: item.branches?.[0]
      ? `Next seat at ${item.branches[0].name ?? "branch"}`
      : "Slots opening soon",
    tags: Array.from(tags),
    image: item.logoUrl || placeholderImage,
  };
};

export const expandBranches = (restaurants: BackendRestaurant[]): Restaurant[] => {
  const expanded: Restaurant[] = [];
  
  restaurants.forEach((restaurant) => {
    const baseRestaurant = mapRestaurant(restaurant);
    const branches = restaurant.branches ?? [];
    
    // If no branches, show the restaurant as is
    if (branches.length === 0) {
      expanded.push(baseRestaurant);
      return;
    }
    
    // Expand each branch as a separate item
    branches.forEach((branch) => {
      expanded.push({
        ...baseRestaurant,
        id: restaurant.id, // Use RESTAURANT ID for API calls
        name: branch.name 
          ? `${baseRestaurant.name} (${branch.name})` 
          : baseRestaurant.name,
        parentRestaurantId: restaurant.id,
        branchId: branch.id, // Store branch ID for reference
      });
    });
  });
  
  return expanded;
};

export const buildFilters = (restaurants: Restaurant[]) => {
  const filterSet = new Set<string>();
  restaurants.forEach((restaurant) => {
    filterSet.add(restaurant.cuisine);
    restaurant.tags.forEach((tag) => filterSet.add(tag));
  });
  const extras = Array.from(filterSet).slice(0, 8);
  return ["All", "Open now", ...extras];
};

export const buildFeaturedAreas = (restaurants: Restaurant[]) => {
  const counts: Record<string, number> = {};
  restaurants.forEach((item) => {
    const city = item.location.split(",")[0] || "Unknown";
    counts[city] = (counts[city] ?? 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
};
