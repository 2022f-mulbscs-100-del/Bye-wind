import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicNavbar from "../../../Components/Public/PublicNavbar";
import Loader from "../../../Components/loader";
import Placeholder from "../../../Components/placeholder";
import type { RestaurantsData } from "./types";
import HeaderSearch from "./HeaderSearch";
import FiltersBar from "./FiltersBar";
import RestaurantGrid from "./RestaurantGrid";
import FeaturedAreas from "./FeaturedAreas";
import Pagination from "./Pagination";
import { getJson } from "@/lib/api";
import { isSessionActive } from "@/lib/auth";
import type { BackendRestaurant } from "@/lib/adapters/restaurants";
import { mapRestaurant, buildFilters, buildFeaturedAreas } from "@/lib/adapters/restaurants";

type FavoriteRestaurant = { id: string; name: string; cuisine: string };

const Restaurants = () => {
  const navigate = useNavigate();
  const isAuthenticated = isSessionActive();
  const [data, setData] = useState<RestaurantsData>({
      filters: [],
      restaurants: [],
      featuredAreas: []
  });
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const getFavorites = (): FavoriteRestaurant[] => {
    try {
      const stored = localStorage.getItem("favorite_restaurants");
      return stored ? (JSON.parse(stored) as FavoriteRestaurant[]) : [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    const ids = new Set(getFavorites().map((item) => item.id));
    setFavoriteIds(ids);
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const loadDummy = () => {
      return fetch("/DummyApis/restaurants.json")
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (!mounted || !json) return;
          setData(json);
        })
        .catch(() => null);
    };

    if (!isAuthenticated) {
      loadDummy().finally(() => {
        if (mounted) setLoading(false);
      });
      return () => {
        mounted = false;
      };
    }

    getJson<{ data: BackendRestaurant[] }>("/restaurants")
      .then((response) => {
        if (!mounted) return;
        const data = response.data ?? [];
        const restaurants = data.map(mapRestaurant);
        setData({
          restaurants,
          filters: buildFilters(restaurants),
          featuredAreas: buildFeaturedAreas(restaurants),
        });
      })
      .catch(() => {
        if (mounted) {
          loadDummy().finally(() => {
            if (mounted) setLoading(false);
          });
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const matchesFilter = (item: RestaurantsData["restaurants"][number]) => {
    if (activeFilter === "All" || activeFilter === "Open now") return true;
    const needle = activeFilter.toLowerCase();
    return (
      item.tags.some((tag) => tag.toLowerCase().includes(needle)) ||
      item.cuisine.toLowerCase().includes(needle) ||
      item.name.toLowerCase().includes(needle) ||
      item.location.toLowerCase().includes(needle)
    );
  };

  const filteredRestaurants = data.restaurants.filter((item) => matchesFilter(item));
  
  const totalPages = Math.max(1, Math.ceil(filteredRestaurants.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const visibleRestaurants = filteredRestaurants.slice(
    startIndex,
    startIndex + pageSize
  );

  const getAreaCount = (areaName: string) => {
    const needle = areaName.toLowerCase();
    return data.restaurants.filter((item) =>
      item.location.toLowerCase().includes(needle)
    ).length;
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  const handleToggleFavorite = (restaurant: RestaurantsData["restaurants"][number]) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const favorites = getFavorites();
    const exists = favorites.some((item) => item.id === restaurant.id);
    const next = exists
      ? favorites.filter((item) => item.id !== restaurant.id)
      : [...favorites, { id: restaurant.id, name: restaurant.name, cuisine: restaurant.cuisine }];

    localStorage.setItem("favorite_restaurants", JSON.stringify(next));
    setFavoriteIds(new Set(next.map((item) => item.id)));
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="w-full max-w-none space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <PublicNavbar />
        <HeaderSearch />

        <FiltersBar
          filters={data.filters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          loading={loading}
        />

        <RestaurantGrid
          restaurants={visibleRestaurants}
          loading={loading}
          favoriteIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
        />

        {!loading && filteredRestaurants.length > pageSize ? (
          <Pagination
            totalPages={totalPages}
            currentPage={safePage}
            onPageChange={setCurrentPage}
          />
        ) : null}

        <FeaturedAreas
          areas={data.featuredAreas}
          activeFilter={activeFilter}
          onSelectArea={setActiveFilter}
          getAreaCount={getAreaCount}
          loading={loading}
          Placeholder={Placeholder}
          Loader={Loader}
        />
      </div>
    </div>
  );
};

export default Restaurants;
