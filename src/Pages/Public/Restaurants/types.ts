export type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  location: string;
  price: string;
  nextSlot: string;
  tags: string[];
  image: string;
  parentRestaurantId?: string;
  branchId?: string;
};

export type FeaturedArea = { name: string; count: number };

export type RestaurantsData = {
  filters: string[];
  restaurants: Restaurant[];
  featuredAreas: FeaturedArea[];
};
