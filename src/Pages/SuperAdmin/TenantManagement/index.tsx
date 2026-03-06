import { useEffect, useMemo, useState } from "react";
import { FiAlertTriangle, FiCheckCircle, FiPlus, FiSearch } from "react-icons/fi";

type Tenant = {
  name: string;
  outlets: number;
  status: "Active" | "Suspended" | "Pending";
  region: string;
  plan: string;
};

type TenantManagementData = {
  stats: {
    active: number;
    suspended: number;
    pending: number;
  };
  tenants: Tenant[];
  alerts: {
    count: number;
    message: string;
  };
  compliance: {
    message: string;
  };
};

const defaultData: TenantManagementData = {
  stats: { active: 0, suspended: 0, pending: 0 },
  tenants: [],
  alerts: { count: 0, message: "No alerts." },
  compliance: { message: "No compliance updates." },
};

const emptyTenant: Tenant = {
  name: "",
  outlets: 1,
  status: "Pending",
  region: "US",
  plan: "Starter",
};

const TenantManagement = () => {
  const [data, setData] = useState<TenantManagementData>(defaultData);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTenantName, setEditingTenantName] = useState<string | null>(null);
  const [draftTenant, setDraftTenant] = useState<Tenant>(emptyTenant);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let mounted = true;
    fetch("/DummyApis/tenant-management.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!mounted || !json) return;
        setData(json);
        setTenants(json.tenants ?? []);
      })
      .catch(() => null)
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const visibleTenants = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return tenants;
    return tenants.filter(
      (tenant) =>
        tenant.name.toLowerCase().includes(needle) ||
        tenant.plan.toLowerCase().includes(needle) ||
        tenant.region.toLowerCase().includes(needle) ||
        tenant.status.toLowerCase().includes(needle)
    );
  }, [tenants, search]);

  const stats = useMemo(() => {
    return tenants.reduce(
      (acc, tenant) => {
        if (tenant.status === "Active") acc.active += 1;
        if (tenant.status === "Suspended") acc.suspended += 1;
        if (tenant.status === "Pending") acc.pending += 1;
        return acc;
      },
      { active: 0, suspended: 0, pending: 0 }
    );
  }, [tenants]);

  const openCreateModal = () => {
    setDraftTenant(emptyTenant);
    setEditingTenantName(null);
    setFormError("");
    setIsCreateOpen(true);
  };

  const openManageModal = (tenant: Tenant) => {
    setDraftTenant({ ...tenant });
    setEditingTenantName(tenant.name);
    setFormError("");
    setIsCreateOpen(true);
  };

  const closeModal = () => {
    setIsCreateOpen(false);
    setEditingTenantName(null);
    setFormError("");
  };

  const saveTenant = () => {
    const normalized: Tenant = {
      ...draftTenant,
      name: draftTenant.name.trim(),
      plan: draftTenant.plan.trim(),
      region: draftTenant.region.trim().toUpperCase(),
      outlets: Math.max(1, Number(draftTenant.outlets) || 1),
    };

    if (!normalized.name || !normalized.plan || !normalized.region) {
      setFormError("Name, plan, and region are required.");
      return;
    }

    const duplicate = tenants.some(
      (tenant) =>
        tenant.name.toLowerCase() === normalized.name.toLowerCase() &&
        tenant.name !== editingTenantName
    );
    if (duplicate) {
      setFormError("Tenant with this name already exists.");
      return;
    }

    if (editingTenantName) {
      setTenants((prev) =>
        prev.map((tenant) => (tenant.name === editingTenantName ? normalized : tenant))
      );
    } else {
      setTenants((prev) => [normalized, ...prev]);
    }
    closeModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Tenant / Restaurant Management
          </div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">Manage tenants & outlets</div>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
        >
          <FiPlus /> Create tenant
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs uppercase text-slate-400">Active</div>
          <div className="mt-3 text-2xl font-semibold text-slate-900">{loading ? "-" : stats.active}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs uppercase text-slate-400">Suspended</div>
          <div className="mt-3 text-2xl font-semibold text-slate-900">{loading ? "-" : stats.suspended}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs uppercase text-slate-400">Pending</div>
          <div className="mt-3 text-2xl font-semibold text-slate-900">{loading ? "-" : stats.pending}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-900">Tenants</div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
            <FiSearch />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="bg-transparent text-xs text-slate-600 focus:outline-none"
              placeholder="Search tenants"
            />
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-400">
              <tr>
                <th className="pb-3 font-medium">Tenant</th>
                <th className="pb-3 font-medium">Plan</th>
                <th className="pb-3 font-medium">Outlets</th>
                <th className="pb-3 font-medium">Region</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              {visibleTenants.map((tenant) => (
                <tr key={tenant.name} className="border-t border-slate-100">
                  <td className="py-3 font-medium text-slate-900">{tenant.name}</td>
                  <td className="py-3">{tenant.plan}</td>
                  <td className="py-3">{tenant.outlets}</td>
                  <td className="py-3">{tenant.region}</td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        tenant.status === "Active"
                          ? "bg-emerald-50 text-emerald-600"
                          : tenant.status === "Suspended"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-sky-50 text-sky-600"
                      }`}
                    >
                      {tenant.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <button
                      type="button"
                      onClick={() => openManageModal(tenant)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && visibleTenants.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              No tenants matched your search.
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Alerts</div>
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
            <FiAlertTriangle className="text-amber-500" />
            {loading ? "Loading alerts..." : data.alerts.message}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Compliance</div>
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
            <FiCheckCircle className="text-emerald-500" />
            {loading ? "Loading compliance..." : data.compliance.message}
          </div>
        </div>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-base font-semibold text-slate-900">
                {editingTenantName ? "Manage Tenant" : "Create Tenant"}
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
                value={draftTenant.name}
                onChange={(event) =>
                  setDraftTenant((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Tenant name"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              />
              <input
                value={draftTenant.plan}
                onChange={(event) =>
                  setDraftTenant((prev) => ({ ...prev, plan: event.target.value }))
                }
                placeholder="Plan"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              />
              <input
                type="number"
                min={1}
                value={draftTenant.outlets}
                onChange={(event) =>
                  setDraftTenant((prev) => ({ ...prev, outlets: Number(event.target.value) }))
                }
                placeholder="Outlets"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              />
              <input
                value={draftTenant.region}
                onChange={(event) =>
                  setDraftTenant((prev) => ({ ...prev, region: event.target.value }))
                }
                placeholder="Region"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              />
              <select
                value={draftTenant.status}
                onChange={(event) =>
                  setDraftTenant((prev) => ({
                    ...prev,
                    status: event.target.value as Tenant["status"],
                  }))
                }
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 sm:col-span-2"
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
                onClick={saveTenant}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Save tenant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantManagement;
