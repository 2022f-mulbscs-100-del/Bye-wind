import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PublicNavbar from "../../../Components/Public/PublicNavbar";
import Loader from "../../../Components/loader";

type MenuItem = {
  name: string;
  price: string;
  description: string;
  image?: string;
};

type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  location: string;
  image?: string;
  menu?: MenuItem[];
};

type RestaurantDetailData = {
  restaurants: Restaurant[];
};

type CartItem = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  itemName: string;
  price: number;
  image?: string;
  quantity: number;
};

const RestaurantMenu = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RestaurantDetailData>({ restaurants: [] });
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addedItemName, setAddedItemName] = useState("");
  const [layoutMode, setLayoutMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/DummyApis/restaurant-detail.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (mounted && json) {
          setData(json);
        }
      })
      .catch(() => null)
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const restaurant = useMemo(
    () => data.restaurants.find((item) => item.id === id),
    [data.restaurants, id]
  );

  const getCartItems = (): CartItem[] => {
    try {
      const stored = localStorage.getItem("guest_cart");
      return stored ? (JSON.parse(stored) as CartItem[]) : [];
    } catch {
      return [];
    }
  };

  const refreshCartCount = () => {
    const cart = getCartItems();
    setCartItems(cart);
  };

  const parsePrice = (raw: string) => {
    const numeric = Number(raw.replace(/[^0-9.]/g, ""));
    return Number.isFinite(numeric) ? numeric : 0;
  };

  const handleAddToCart = (item: MenuItem) => {
    const cart = getCartItems();
    const cartId = `${restaurant.id}:${item.name}`;
    const existing = cart.find((entry) => entry.id === cartId);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: cartId,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        itemName: item.name,
        price: parsePrice(item.price),
        image: item.image || restaurant.image,
        quantity: 1,
      });
    }

    localStorage.setItem("guest_cart", JSON.stringify(cart));
    setAddedItemName(item.name);
    refreshCartCount();
  };

  const handleDecreaseFromCart = (item: MenuItem) => {
    const cart = getCartItems();
    const cartId = `${restaurant.id}:${item.name}`;
    const next = cart
      .map((entry) =>
        entry.id === cartId ? { ...entry, quantity: Math.max(0, entry.quantity - 1) } : entry
      )
      .filter((entry) => entry.quantity > 0);
    localStorage.setItem("guest_cart", JSON.stringify(next));
    refreshCartCount();
  };

  useEffect(() => {
    refreshCartCount();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Loader size={48} color="#0f172a" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Restaurant menu not found.
        </div>
      </div>
    );
  }

  const menuItems = restaurant.menu ?? [];
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const quantityByItem = new Map(
    cartItems
      .filter((item) => item.restaurantId === restaurant.id)
      .map((item) => [item.itemName, item.quantity] as const)
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="w-full max-w-none px-6 py-6 space-y-6 md:px-10 md:py-8">
        <PublicNavbar />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to={`/restaurants/${restaurant.id}`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
          >
            ← Back to profile
          </Link>
          <Link
            to={`/restaurants/${restaurant.id}`}
            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
          >
            Reserve a table
          </Link>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {restaurant.cuisine}
              </div>
              <h1 className="mt-1 text-2xl font-semibold text-slate-900 md:text-3xl">
                {restaurant.name} Menu
              </h1>
              <p className="mt-2 text-sm text-slate-500">{restaurant.location}</p>
            </div>
            <Link
              to="/cart"
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cart items: {cartCount}
            </Link>
          </div>
          {addedItemName ? (
            <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
              Added to cart: {addedItemName}
            </div>
          ) : null}
        </section>

        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-semibold text-slate-700">
              All menu items ({menuItems.length})
            </div>
            <div className="inline-flex rounded-full border border-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setLayoutMode("grid")}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  layoutMode === "grid"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                Grid
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode("list")}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  layoutMode === "list"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                List
              </button>
            </div>
          </div>

          <div
            className={
              layoutMode === "grid"
                ? "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
                : "grid grid-cols-1 gap-4"
            }
          >
            {menuItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">
                Menu is not available yet.
              </div>
            ) : (
              menuItems.map((item, index) => {
                const itemQty = quantityByItem.get(item.name) ?? 0;
                if (layoutMode === "list") {
                  return (
                    <article
                      key={item.name}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr]">
                        <img
                          src={
                            item.image ||
                            restaurant.image ||
                            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=500&fit=crop"
                          }
                          alt={item.name}
                          className="h-44 w-full object-cover sm:h-full"
                          loading="lazy"
                        />

                        <div className="flex min-h-[170px] flex-col justify-between p-4">
                          <div>
                            <h2 className="text-lg font-semibold text-slate-900">{item.name}</h2>
                            <p className="mt-1 text-sm text-slate-500">{item.description}</p>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                                Item #{index + 1}
                              </span>
                              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                                Fresh
                              </span>
                              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                                20-25 min
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <div className="rounded-lg bg-slate-900 px-3 py-1.5 text-base font-bold text-white">
                              {item.price}
                            </div>

                            <div className="inline-flex items-center rounded-full border border-slate-300 bg-white p-1 shadow-sm">
                              <button
                                type="button"
                                onClick={() => handleDecreaseFromCart(item)}
                                disabled={itemQty === 0}
                                className={`h-8 w-8 rounded-full text-base font-bold transition ${
                                  itemQty === 0
                                    ? "cursor-not-allowed text-slate-300"
                                    : "text-slate-700 hover:bg-slate-100"
                                }`}
                              >
                                -
                              </button>
                              <span className="min-w-8 text-center text-sm font-bold text-slate-900">
                                {itemQty}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleAddToCart(item)}
                                className="h-8 w-8 rounded-full bg-slate-900 text-base font-bold text-white transition hover:bg-slate-800"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                }

                return (
                  <article
                    key={item.name}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                  >
                    <img
                      src={
                        item.image ||
                        restaurant.image ||
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=500&fit=crop"
                      }
                      alt={item.name}
                      className="h-44 w-full object-cover"
                      loading="lazy"
                    />

                    <div className="space-y-2 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-lg font-semibold text-slate-900">{item.name}</h2>
                          <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {item.price}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                          Item #{index + 1}
                        </span>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                          Fresh
                        </span>
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                          20-25 min
                        </span>
                      </div>
                      <div className="mt-3 inline-flex items-center rounded-full border border-slate-300 bg-white p-1 shadow-sm">
                        <button
                          type="button"
                          onClick={() => handleDecreaseFromCart(item)}
                          disabled={itemQty === 0}
                          className={`h-8 w-8 rounded-full text-base font-bold transition ${
                            itemQty === 0
                              ? "cursor-not-allowed text-slate-300"
                              : "text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          -
                        </button>
                        <span className="min-w-8 text-center text-sm font-bold text-slate-900">
                          {itemQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddToCart(item)}
                          className="h-8 w-8 rounded-full bg-slate-900 text-base font-bold text-white transition hover:bg-slate-800"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default RestaurantMenu;
