export type Booking = {
  id: string;
  restaurantName: string;
  date: string;
  time: string;
  guests: number;
  status: "confirmed" | "pending" | "seated" | "completed" | "cancelled" | "no_show";
  table: string;
  paymentStatus: "paid" | "pay_later" | "pending" | "partial" | "refunded";
  paymentMethod: string;
  amount: number;
  reference: string;
};

export type SavedRestaurant = {
  id: string;
  restaurantId: string;
  name: string;
  cuisine: string;
  rating: number;
  priceRange: string;
};

export type GuestProfileData = {
  profile: {
    name: string;
    email: string;
    phone: string;
    location: string;
    memberSince: string;
    totalBookings: number;
    avatar?: string;
  };
  upcomingBookings: Booking[];
  savedRestaurants: SavedRestaurant[];
  recentVisits: {
    restaurantName: string;
    visitDate: string;
    rating?: number;
  }[];
  preferences: {
    dietaryRestrictions: string[];
    favoriteCuisines: string[];
  };
};
