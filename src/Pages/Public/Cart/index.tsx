import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "../../../Components/Public/PublicNavbar";

type CartItem = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  itemName: string;
  price: number;
  image?: string;
  quantity: number;
};

const CART_KEY = "guest_cart";

const CartPage = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [checkoutMessage, setCheckoutMessage] = useState("");

  const loadCart = () => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      setItems(stored ? (JSON.parse(stored) as CartItem[]) : []);
    } catch {
      setItems([]);
    }
  };

  const persistCart = (next: CartItem[]) => {
    localStorage.setItem(CART_KEY, JSON.stringify(next));
    setItems(next);
  };

  useEffect(() => {
    loadCart();
  }, []);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const incrementItem = (id: string) => {
    const next = items.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    persistCart(next);
  };

  const decrementItem = (id: string) => {
    const next = items
      .map((item) =>
        item.id === id ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item
      )
      .filter((item) => item.quantity > 0);
    persistCart(next);
  };

  const removeItem = (id: string) => {
    const next = items.filter((item) => item.id !== id);
    persistCart(next);
  };

  const clearCart = () => {
    persistCart([]);
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    clearCart();
    setCheckoutMessage("Order placed successfully.");
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="w-full max-w-none space-y-6 px-6 py-6 md:px-10 md:py-8">
        <PublicNavbar />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">Your cart</h1>
          <Link
            to="/restaurants"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Browse restaurants
          </Link>
        </div>

        {checkoutMessage ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {checkoutMessage}
          </div>
        ) : null}

        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-sm text-slate-500">Your cart is empty.</p>
            <Link
              to="/restaurants"
              className="mt-4 inline-flex rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
            >
              Start adding items
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_1fr]">
            <section className="space-y-3">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start gap-3 sm:flex-nowrap">
                    <img
                      src={
                        item.image ||
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=260&h=200&fit=crop"
                      }
                      alt={item.itemName}
                      className="h-20 w-full rounded-xl object-cover sm:w-28"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="truncate text-sm font-semibold text-slate-900">
                            {item.itemName}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {item.restaurantName}
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-slate-800">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                          <button
                            type="button"
                            onClick={() => decrementItem(item.id)}
                            className="h-6 w-6 rounded-full bg-white text-sm font-semibold text-slate-700"
                          >
                            -
                          </button>
                          <span className="min-w-4 text-center text-xs font-semibold text-slate-700">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => incrementItem(item.id)}
                            className="h-6 w-6 rounded-full bg-white text-sm font-semibold text-slate-700"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Order summary</div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Items</span>
                  <span>{totalItems}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-900 font-semibold border-t border-slate-100 pt-2">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCheckout}
                className="mt-4 w-full rounded-full bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white"
              >
                Checkout
              </button>
              <button
                type="button"
                onClick={clearCart}
                className="mt-2 w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600"
              >
                Clear cart
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
