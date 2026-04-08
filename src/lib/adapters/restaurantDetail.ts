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
  branchesDetail?: Array<{
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    menuItems?: Array<{
      id: string;
      name: string;
      description: string;
      price: number;
      category: string;
      images?: string[];
    }>;
    businessHours?: Array<{
      dayOfWeek?: string;
      openTime?: string;
      closeTime?: string;
      isOpen?: boolean;
    }>;
    floorPlans?: Array<{
      id: string;
      label: string;
      width: number;
      height: number;
      tables?: Array<any>;
      layout?: any;
    }>;
  }>;
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

const formatBusinessHours = (restaurant: BackendRestaurantDetail, selectedBranchId?: string): string => {
  // Try to get business hours from a specific branch (if provided) or the first branch
  if (!restaurant.branchesDetail || restaurant.branchesDetail.length === 0) {
    return "00:00 - 00:00";
  }

  // Find the branch - either the selected one or the first one
  let targetBranch = selectedBranchId
    ? restaurant.branchesDetail.find((b) => b.id === selectedBranchId)
    : restaurant.branchesDetail[0];
  
  if (!targetBranch) {
    // If specific branch not found, fallback to first branch
    targetBranch = restaurant.branchesDetail[0];
  }

  if (!targetBranch.businessHours || targetBranch.businessHours.length === 0) {
    return "00:00 - 00:00";
  }

  // Get today's day of week
  const daysOfWeek = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const today = new Date();
  const todayDayName = daysOfWeek[today.getDay()];

  // Get today's hours
  const todayHours = targetBranch.businessHours.find(
    (h) => h.dayOfWeek?.toUpperCase() === todayDayName
  );

  if (!todayHours) {
    // If today not found, get the first available open day
    const firstOpenDay = targetBranch.businessHours.find((h) => h.isOpen !== false);
    if (!firstOpenDay) {
      return "Closed";
    }
    const openTime = firstOpenDay.openTime || "00:00";
    const closeTime = firstOpenDay.closeTime || "00:00";
    return `${openTime} - ${closeTime}`;
  }

  if (todayHours.isOpen === false) {
    return "Closed";
  }

  const openTime = todayHours.openTime || "00:00";
  const closeTime = todayHours.closeTime || "00:00";
  return `${openTime} - ${closeTime}`;
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
  images?: string[];
  menu?: { name: string; price: string; description: string }[];
  reviews?: { author: string; rating: number; text: string }[];
  businessHours?: Array<{
    dayOfWeek?: string;
    openTime?: string;
    closeTime?: string;
    isOpen?: boolean;
  }>;
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
  fallback?: RestaurantDetailEntry,
  selectedBranchId?: string
): RestaurantDetailEntry => {
  // Extract business hours from the selected branch or first branch
  const targetBranch = selectedBranchId
    ? restaurant.branchesDetail?.find((b) => b.id === selectedBranchId)
    : restaurant.branchesDetail?.[0];
  
  const businessHoursData = 
    fallback?.businessHours ?? 
    targetBranch?.businessHours;

  return {
    id: restaurant.id,
    name: restaurant.brandName ?? restaurant.legalBusinessName ?? fallback?.name ?? "Restaurant",
    cuisine: restaurant.cuisineTypes?.[0] ?? fallback?.cuisine ?? "Multicuisine",
    rating: parseFloat((fallback?.rating ?? normalizeRating(restaurant)).toFixed(1)),
    location: formatLocation(restaurant),
    phone: formatPhone(restaurant),
    hours: fallback?.hours ?? formatBusinessHours(restaurant, selectedBranchId),
    businessHours: businessHoursData,
    description:
      fallback?.description ??
      restaurant.description ??
      `${restaurant.brandName ?? "This restaurant"} is operating ${restaurant.operatingCountry ? `in ${restaurant.operatingCountry}` : "across multiple locations"
      }.`,
    images: fallback?.images ?? placeholderImages,
    menu: fallback?.menu ?? [],
    reviews: fallback?.reviews ?? [],
    floorHighlights: fallback?.floorHighlights,
    floorTables: fallback?.floorTables,
    upcoming: fallback?.upcoming,
  };
};
