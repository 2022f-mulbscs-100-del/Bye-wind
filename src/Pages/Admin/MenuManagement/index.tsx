import { useState, useEffect } from "react";
import { toast } from "sonner";
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

export default function MenuManagement() {
  const { selectedBranchId } = useBranchContext();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [filterCategory, setFilterCategory] = useState("");

  const fetchMenuItems = async () => {
    if (!selectedBranchId) return;
    setIsLoading(true);
    try {
      const url = `/branches/${selectedBranchId}/menu-items${
        filterCategory ? `?category=${filterCategory}` : ""
      }`;
      const response = await getJson<{ data: MenuResponse }>(url);
      const data = response.data?.data ?? (response.data as unknown as MenuResponse);
      setMenuItems(data.items || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch menu items");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [selectedBranchId, filterCategory]);

  const handleAddMenuItem = async (formData: any) => {
    if (!selectedBranchId) return;
    try {
      await postJson(`/branches/${selectedBranchId}/menu-items`, formData);
      toast.success("Menu item added successfully");
      setShowForm(false);
      await fetchMenuItems();
    } catch (err: any) {
      toast.error(err.message || "Failed to add menu item");
    }
  };

  const handleUpdateMenuItem = async (formData: any) => {
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
    } catch (err: any) {
      toast.error(err.message || "Failed to update menu item");
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!selectedBranchId || !confirm("Are you sure?")) return;
    try {
      await deleteJson(`/branches/${selectedBranchId}/menu-items/${id}`);
      toast.success("Menu item deleted");
      await fetchMenuItems();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete menu item");
    }
  };

  if (!selectedBranchId) {
    return <div className="p-6 text-center text-gray-500">Please select a branch</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="mt-1 text-sm text-gray-500">Add and manage your restaurant menu items</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowForm(!showForm);
          }}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          {showForm ? "Cancel" : "+ Add Menu Item"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <MenuForm
          item={editingItem || undefined}
          onSubmit={editingItem ? handleUpdateMenuItem : handleAddMenuItem}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      )}

      {/* Filter */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Filter by category..."
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-lg border border-gray-200 px-4 py-2 w-64"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader size={32} />
        </div>
      )}

      {/* Menu Items List */}
      {!isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onEdit={() => {
                setEditingItem(item);
                setShowForm(true);
              }}
              onDelete={() => handleDeleteMenuItem(item.id)}
            />
          ))}
        </div>
      )}

      {!isLoading && menuItems.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center">
          <p className="text-gray-500">No menu items yet. Create your first one!</p>
        </div>
      )}
    </div>
  );
}

function MenuItemCard({
  item,
  onEdit,
  onDelete,
}: {
  item: MenuItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition">
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-40 w-full object-cover"
        />
      )}
      <div className="p-4">
        {/* Branch Tag - Show when branch info is available */}
        {item.branch && (
          <div className="mb-2">
            <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
              📍 {item.branch.name}
            </span>
          </div>
        )}
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{item.name}</h3>
            {item.category && (
              <p className="text-xs text-gray-500 mt-1">{item.category}</p>
            )}
            {item.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
          <p className="text-lg font-bold text-gray-900 ml-2">${item.price.toFixed(2)}</p>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 rounded bg-blue-50 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="flex-1 rounded bg-red-50 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
          >
            Delete
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs">
          <span
            className={`px-2 py-1 rounded-full ${
              item.isAvailable
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {item.isAvailable ? "Available" : "Unavailable"}
          </span>
        </div>
      </div>
    </div>
  );
}
