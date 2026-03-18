import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiSearch, FiUsers } from "react-icons/fi";
import { getJson } from "@/lib/api";
import { isSessionActive } from "@/lib/auth";

type UserRow = {
  name: string;
  role: string;
  tenant: string;
  status: "Active" | "Suspended" | "Pending";
};

type StaffEntry = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  restaurantId?: string | null;
  isActive: boolean;
};

const formatUser = (staff: StaffEntry): UserRow => {
  const name = [staff.firstName, staff.lastName].filter(Boolean).join(" ") || staff.email;
  const role = staff.role.replace("_", " ");
  const tenant = staff.restaurantId ? `Restaurant ${staff.restaurantId}` : "Platform";
  return {
    name,
    role,
    tenant,
    status: staff.isActive ? "Active" : "Suspended",
  };
};

const UserRoleManagement = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [draftUser, setDraftUser] = useState<UserRow>({
    name: "",
    role: "",
    tenant: "",
    status: "Active",
  });

  useEffect(() => {
    let mounted = true;

    const loadDummy = () => {
      return fetch("/DummyApis/user-role-management.json")
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (!mounted || !json) return;
          setUsers((json as { users: UserRow[] }).users ?? []);
        })
        .catch(() => null);
    };

    if (!isSessionActive()) {
      loadDummy().finally(() => {
        if (mounted) setLoading(false);
      });
      return () => {
        mounted = false;
      };
    }

    getJson<{ data: StaffEntry[] }>("/staff")
      .then((response) => {
        if (!mounted) return;
        const list = (response.data ?? []).map(formatUser);
        setUsers(list);
      })
      .catch(() => {
        if (mounted) loadDummy();
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const visibleUsers = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(needle) ||
        user.role.toLowerCase().includes(needle) ||
        user.tenant.toLowerCase().includes(needle) ||
        user.status.toLowerCase().includes(needle)
    );
  }, [users, search]);

  const openCreateModal = () => {
    setDraftUser({ name: "", role: "", tenant: "", status: "Active" });
    setEditingKey(null);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (user: UserRow) => {
    setDraftUser({ ...user });
    setEditingKey(`${user.name}__${user.tenant}`);
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingKey(null);
    setFormError("");
  };

  const saveUser = () => {
    const next: UserRow = {
      ...draftUser,
      name: draftUser.name.trim(),
      role: draftUser.role.trim(),
      tenant: draftUser.tenant.trim(),
    };

    if (!next.name || !next.role || !next.tenant) {
      setFormError("Name, role, and tenant are required.");
      return;
    }

    const duplicate = users.some(
      (user) =>
        `${user.name}__${user.tenant}`.toLowerCase() === `${next.name}__${next.tenant}`.toLowerCase() &&
        `${user.name}__${user.tenant}` !== editingKey
    );
    if (duplicate) {
      setFormError("A user with same name and tenant already exists.");
      return;
    }

    if (editingKey) {
      setUsers((prev) =>
        prev.map((user) =>
          `${user.name}__${user.tenant}` === editingKey ? next : user
        )
      );
    } else {
      setUsers((prev) => [next, ...prev]);
    }
    closeModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            User & Role Management
          </div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">Admin and staff users</div>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
        >
          <FiPlus /> Invite user
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <FiUsers /> Users
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
            <FiSearch />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="bg-transparent text-xs text-slate-600 focus:outline-none"
              placeholder="Search users"
            />
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-400">
              <tr>
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Tenant</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              {visibleUsers.map((user) => (
                <tr key={user.name} className="border-t border-slate-100">
                  <td className="py-3 font-medium text-slate-900">{user.name}</td>
                  <td className="py-3">{user.role}</td>
                  <td className="py-3">{user.tenant}</td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        user.status === "Active"
                          ? "bg-emerald-50 text-emerald-600"
                          : user.status === "Suspended"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-sky-50 text-sky-600"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <button
                      type="button"
                      onClick={() => openEditModal(user)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && visibleUsers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              No users matched your search.
            </div>
          ) : null}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-base font-semibold text-slate-900">
                {editingKey ? "Edit User" : "Invite User"}
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                value={draftUser.name}
                onChange={(event) =>
                  setDraftUser((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Full name"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              />
              <input
                value={draftUser.role}
                onChange={(event) =>
                  setDraftUser((prev) => ({ ...prev, role: event.target.value }))
                }
                placeholder="Role"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              />
              <input
                value={draftUser.tenant}
                onChange={(event) =>
                  setDraftUser((prev) => ({ ...prev, tenant: event.target.value }))
                }
                placeholder="Tenant"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              />
              <select
                value={draftUser.status}
                onChange={(event) =>
                  setDraftUser((prev) => ({
                    ...prev,
                    status: event.target.value as UserRow["status"],
                  }))
                }
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              >
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            {formError ? (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                {formError}
              </div>
            ) : null}

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveUser}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Save user
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRoleManagement;
