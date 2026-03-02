import { useEffect, useState } from "react";
import PublicNavbar from "../../../Components/Public/PublicNavbar";
import Loader from "../../../Components/loader";
import Placeholder from "../../../Components/placeholder";
import type { RestaurantsData } from "./types";
import HeaderSearch from "./HeaderSearch";
import FiltersBar from "./FiltersBar";
import RestaurantGrid from "./RestaurantGrid";
import FeaturedAreas from "./FeaturedAreas";
import Pagination from "./Pagination";
const Restaurants = () => {
  const [data, setData] = useState<RestaurantsData>({
      filters: [],
      restaurants: [],
      featuredAreas: []
  });
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/DummyApis/restaurants.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (mounted && json) setData(json);
      })
      .catch(() => null)
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

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

  const matchesSearch = (item: RestaurantsData["restaurants"][number]) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      item.name.toLowerCase().includes(term) ||
      item.cuisine.toLowerCase().includes(term) ||
      item.location.toLowerCase().includes(term) ||
      item.tags.some((tag) => tag.toLowerCase().includes(term))
    );
  };

  const filteredRestaurants = data.restaurants.filter(
    (item) => matchesFilter(item) && matchesSearch(item)
  );
  
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
  }, [activeFilter, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="w-full max-w-none px-10 py-8 space-y-8">
        <PublicNavbar />
        <HeaderSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          loading={loading}
        />

        <FiltersBar
          filters={data.filters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          loading={loading}
        />

        <RestaurantGrid
          restaurants={visibleRestaurants}
          loading={loading}
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
