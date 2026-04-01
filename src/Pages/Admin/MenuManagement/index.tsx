import { useState, useEffect, type ReactNode } from "react";
import { toast } from "sonner";
import {
  FiBox,
  FiDollarSign,
  FiEdit2,
  FiGrid,
  FiImage,
  FiPackage,
  FiPlus,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";
import { useBranchContext } from "@/context/BranchContext";
import { postJson, getJson, putJson, deleteJson } from "@/lib/api";
import Loader from "@/Components/loader";
import MenuForm from "./MenuForm";
import type { MenuItem } from "./types";

type MenuResponse = {
  items: MenuItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

type MenuItemFormData = {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  isAvailable: boolean;
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export default function MenuManagement() {
  const { selectedBranchId } = useBranchContext();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [filterCategory, setFilterCategory] = useState("");

  // Determine if we're in master level (viewing all branches)
  const isMasterLevel = !selectedBranchId;
  const availableItemsCount = menuItems.filter((item) => item.isAvailable).length;
  const categoryCount = new Set(
    menuItems.map((item) => item.category?.trim()).filter(Boolean)
  ).size;

  const fetchMenuItems = async () => {
    setIsLoading(true);
    try {
      let url: string;
      if (isMasterLevel) {
        // Fetch from all branches
        url = `/menu-items${filterCategory ? `?category=${filterCategory}` : ""}`;
      } else {
        // Fetch from specific branch
        url = `/branches/${selectedBranchId}/menu-items${
          filterCategory ? `?category=${filterCategory}` : ""
        }`;
      }
      
      const response = await getJson<{ data: MenuResponse }>(url);
      const data = response.data?.data ?? (response.data as unknown as MenuResponse);
      setMenuItems(data.items || []);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to fetch menu items"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranchId, filterCategory]);

  const handleAddMenuItem = async (formData: MenuItemFormData) => {
    if (!selectedBranchId) return;
    try {
      await postJson(`/branches/${selectedBranchId}/menu-items`, formData);
      toast.success("Menu item added successfully");
      setShowForm(false);
      await fetchMenuItems();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to add menu item"));
    }
  };

  const handleUpdateMenuItem = async (formData: MenuItemFormData) => {
    if (!editingItem || !selectedBranchId) return;
    try {
      await putJson(
        `/branches/${selectedBranchId}/menu-items/${editingItem.id}`,
        formData
      );
      toast.success("Menu item updated successfully");
      setEditingItem(null);
      setShowForm(false);
      await fetchMenuItems();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to update menu item"));
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (isMasterLevel || !selectedBranchId || !confirm("Are you sure?")) return;
    try {
      await deleteJson(`/branches/${selectedBranchId}/menu-items/${id}`);
      toast.success("Menu item deleted");
      await fetchMenuItems();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete menu item"));
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <FiPackage className="text-slate-500" />
              Menu Control
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Menu Management
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
              {isMasterLevel
                ? "View and monitor menu items across every branch from one clean workspace."
                : "Manage dishes, prices, categories, and availability in a more structured layout."}
            </p>
          </div>
          {!isMasterLevel && (
            <button
              onClick={() => {
                setEditingItem(null);
                setShowForm(!showForm);
              }}
              className="inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <FiPlus />
              {showForm ? "Cancel" : "Add Menu Item"}
            </button>
          )}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<FiBox />}
            label="Total items"
            value={String(menuItems.length)}
          />
          <StatCard
            icon={<FiGrid />}
            label="Categories"
            value={String(categoryCount)}
          />
          <StatCard
            icon={<FiPackage />}
            label="Available now"
            value={String(availableItemsCount)}
          />
          <StatCard
            icon={<FiDollarSign />}
            label="Visibility"
            value={isMasterLevel ? "All branches" : "Single branch"}
          />
        </div>
      </section>

      {/* Form - Only show when in branch level */}
      {!isMasterLevel && showForm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close menu form"
            onClick={() => {
              setShowForm(false);
              setEditingItem(null);
            }}
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
          />
          <div className="relative z-10 max-h-[88vh] w-full max-w-4xl overflow-y-auto">
            <MenuForm
              item={editingItem || undefined}
              onSubmit={editingItem ? handleUpdateMenuItem : handleAddMenuItem}
              onCancel={() => {
                setShowForm(false);
                setEditingItem(null);
              }}
            />
          </div>
        </div>
      )}

      <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Menu items</h2>
              <p className="mt-1 text-sm text-slate-500">
                A structured table view for browsing and managing all menu entries.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative min-w-0 sm:w-80">
                <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by category..."
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:outline-none"
                />
              </div>
              {filterCategory && (
                <button
                  type="button"
                  onClick={() => setFilterCategory("")}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader size={32} />
          </div>
        )}

        {!isLoading && menuItems.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr className="text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Item
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Category
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Branch
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Price
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Status
                  </th>
                  {!isMasterLevel && (
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {menuItems.map((item) => (
                  <MenuTableRow
                    key={item.id}
                    item={item}
                    isMasterLevel={isMasterLevel}
                    onEdit={() => {
                      setEditingItem(item);
                      setShowForm(true);
                    }}
                    onDelete={() => handleDeleteMenuItem(item.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && menuItems.length === 0 && (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <FiImage className="text-2xl" />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-slate-900">No menu items found</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {filterCategory
                ? "No items match the current category filter. Try a different keyword or clear the filter."
                : "Your menu is still empty. Add the first item to start building a structured menu list."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-slate-500">{label}</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function MenuTableRow({
  item,
  isMasterLevel,
  onEdit,
  onDelete,
}: {
  item: MenuItem;
  isMasterLevel: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <tr className="align-top transition hover:bg-slate-50/80">
      <td className="px-6 py-4">
        <div className="flex min-w-[260px] items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <FiImage className="text-slate-400" />
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900">{item.name}</div>
            <div className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
              {item.description || "No description added"}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-slate-600">
        {item.category || "Uncategorized"}
      </td>
      <td className="px-6 py-4 text-sm text-slate-600">
        {item.branch?.name || "Current branch"}
      </td>
      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
        ${item.price.toFixed(2)}
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            item.isAvailable
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-200 text-slate-600"
          }`}
        >
          {item.isAvailable ? "Available" : "Unavailable"}
        </span>
      </td>
      {!isMasterLevel && (
        <td className="px-6 py-4">
          <div className="flex justify-end gap-2">
            <button
              onClick={onEdit}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <FiEdit2 />
              Edit
            </button>
            <button
              onClick={onDelete}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
            >
              <FiTrash2 />
              Delete
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}
