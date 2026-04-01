import { useState } from "react";
import { FiCheckCircle, FiImage, FiTag, FiX } from "react-icons/fi";
import type { MenuItem } from "./types";

interface MenuFormProps {
  item?: MenuItem;
  onSubmit: (data: {
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    category: string;
    isAvailable: boolean;
  }) => Promise<void>;
  onCancel: () => void;
}

export default function MenuForm({ item, onSubmit, onCancel }: MenuFormProps) {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    description: item?.description || "",
    price: item?.price || "",
    imageUrl: item?.imageUrl || "",
    category: item?.category || "",
    isAvailable: item?.isAvailable ?? true,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      alert("Please fill in name and price");
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit({
        ...formData,
        price: parseFloat(String(formData.price)),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
      <div className="border-b border-slate-200 bg-white px-5 py-4 text-slate-900 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Menu Item
            </div>
            <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
              {item ? "Edit menu item" : "Create a new menu item"}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Update the item details in a cleaner, focused workspace.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 sm:flex">
              <FiCheckCircle className="text-emerald-500" />
              {item ? "Editing existing item" : "Ready to publish"}
            </div>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Close modal"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
            >
              <FiX />
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Item Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Margherita Pizza"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Price *
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                  $
                </span>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Category
              </label>
              <div className="relative">
                <FiTag className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Appetizer"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the menu item..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Image URL
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <label htmlFor="isAvailable" className="flex cursor-pointer items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-800">Available for order</div>
                  <div className="mt-1 text-sm text-slate-500">
                    Keep this item visible and ready for staff or guests to order.
                  </div>
                </div>
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) =>
                    setFormData({ ...formData, isAvailable: e.target.checked })
                  }
                  className="h-4.5 w-4.5 rounded border-slate-300 text-slate-900"
                />
              </label>
            </div>
          </div>

          <aside className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FiImage />
              Live preview
            </div>
            <div className="mt-3 overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-sm">
              <div className="relative h-36 bg-slate-100">
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt="preview"
                    className="h-full w-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                      <FiImage className="text-xl" />
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2 p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {formData.name || "Menu item name"}
                    </div>
                    <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                      {formData.category || "Category"}
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-900 px-2.5 py-1.5 text-sm font-semibold text-white">
                    ${Number(formData.price || 0).toFixed(2)}
                  </div>
                </div>
                <p className="min-h-10 text-sm leading-5 text-slate-600">
                  {formData.description || "A short dish description will appear here as you type."}
                </p>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    formData.isAvailable
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {formData.isAvailable ? "Available" : "Unavailable"}
                </span>
              </div>
            </div>
          </aside>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : item ? "Update Item" : "Add Item"}
          </button>
        </div>
      </form>
    </section>
  );
}
