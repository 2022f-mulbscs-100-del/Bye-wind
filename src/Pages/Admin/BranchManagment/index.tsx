import { useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiMapPin,
  FiPhone,
  FiPlus,
  FiXCircle,
} from "react-icons/fi";

const TABS = ["Live", "Draft/Pending"] as const;

type BranchStatus = "live" | "draft" | "pending";

type Branch = {
  id: string;
  legalBusinessName: string;
  brandName: string;
  registeredAddress: string;
  operatingCountry: string;
  timezone: string;
  cuisineTypes: string;
  gstVat: string;
  primaryContact: string;
  businessLogoUrl: string;
  address: string;
  phone: string;
  manager: string;
  hours: string;
  seatingInventory: string;
  reservationRules: string;
  status: BranchStatus;
  description: string;
};

const initialBranches: Branch[] = [
  {
    id: "b1",
    legalBusinessName: "ByeWind Restaurant Group LLC",
    brandName: "ByeWind Downtown",
    registeredAddress: "214 Market St, San Francisco, CA",
    operatingCountry: "United States",
    timezone: "America/Los_Angeles",
    cuisineTypes: "Modern American, Seafood",
    gstVat: "N/A",
    primaryContact: "ava.collins@byewind.com",
    businessLogoUrl: "https://i.pravatar.cc/64?img=12",
    address: "214 Market St, San Francisco, CA",
    phone: "(415) 555-2033",
    manager: "Ava Collins",
    hours: "10:00 AM - 11:00 PM",
    seatingInventory: "48 tables",
    reservationRules: "1-10 guests, 2h window",
    status: "live",
    description: "Flagship location with patio seating.",
  },
  {
    id: "b2",
    legalBusinessName: "ByeWind Restaurant Group LLC",
    brandName: "ByeWind Uptown",
    registeredAddress: "98 Oak Ave, San Francisco, CA",
    operatingCountry: "United States",
    timezone: "America/Los_Angeles",
    cuisineTypes: "Italian, Wine Bar",
    gstVat: "N/A",
    primaryContact: "liam.patel@byewind.com",
    businessLogoUrl: "https://i.pravatar.cc/64?img=32",
    address: "98 Oak Ave, San Francisco, CA",
    phone: "(415) 555-8192",
    manager: "Liam Patel",
    hours: "11:00 AM - 10:00 PM",
    seatingInventory: "32 tables",
    reservationRules: "1-8 guests, 90 min",
    status: "pending",
    description: "New location pending checklist approval.",
  },
  {
    id: "b3",
    legalBusinessName: "ByeWind Restaurant Group LLC",
    brandName: "ByeWind Marina",
    registeredAddress: "425 Harbor Dr, San Francisco, CA",
    operatingCountry: "United States",
    timezone: "America/Los_Angeles",
    cuisineTypes: "Seafood, Grill",
    gstVat: "N/A",
    primaryContact: "maya.brooks@byewind.com",
    businessLogoUrl: "https://i.pravatar.cc/64?img=48",
    address: "425 Harbor Dr, San Francisco, CA",
    phone: "(415) 555-7788",
    manager: "Maya Brooks",
    hours: "10:00 AM - 9:00 PM",
    seatingInventory: "28 tables",
    reservationRules: "1-6 guests, 2h",
    status: "draft",
    description: "In draft, collecting required info.",
  },
];

const emptyBranch: Branch = {
  id: "new",
  legalBusinessName: "",
  brandName: "",
  registeredAddress: "",
  operatingCountry: "",
  timezone: "",
  cuisineTypes: "",
  gstVat: "",
  primaryContact: "",
  businessLogoUrl: "",
  address: "",
  phone: "",
  manager: "",
  hours: "",
  seatingInventory: "",
  reservationRules: "",
  status: "draft",
  description: "",
};

const isChecklistComplete = (branch: Branch) =>
  Boolean(
    branch.legalBusinessName &&
      branch.brandName &&
      branch.registeredAddress &&
      branch.operatingCountry &&
      branch.timezone &&
      branch.cuisineTypes &&
      branch.primaryContact &&
      branch.businessLogoUrl &&
      branch.address &&
      branch.phone &&
      branch.manager &&
      branch.hours &&
      branch.seatingInventory &&
      branch.reservationRules
  );

const BranchManagment = () => {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Live");
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [selectedId, setSelectedId] = useState<string>(initialBranches[0].id);
  const [isCreating, setIsCreating] = useState(false);

  const selectedBranch = useMemo(() => {
    if (isCreating) return emptyBranch;
    return branches.find((branch) => branch.id === selectedId) ?? branches[0];
  }, [branches, selectedId, isCreating]);

  const filteredBranches = useMemo(() => {
    if (tab === "Live") return branches.filter((b) => b.status === "live");
    return branches.filter((b) => b.status !== "live");
  }, [branches, tab]);

  const handleSave = (next: Branch) => {
    if (isCreating) {
      const created = {
        ...next,
        id: `b${branches.length + 1}`,
        status: isChecklistComplete(next) ? "pending" : "draft",
      };
      setBranches((prev) => [created, ...prev]);
      setSelectedId(created.id);
      setIsCreating(false);
      return;
    }
    setBranches((prev) => prev.map((branch) => (branch.id === next.id ? next : branch)));
  };

  const handleMakeLive = (branch: Branch) => {
    if (!isChecklistComplete(branch)) return;
    setBranches((prev) =>
      prev.map((item) => (item.id === branch.id ? { ...item, status: "live" } : item))
    );
    setTab("Live");
  };

  const handleDraft = (branch: Branch) => {
    setBranches((prev) =>
      prev.map((item) => (item.id === branch.id ? { ...item, status: "draft" } : item))
    );
    setTab("Draft/Pending");
  };

  if (!selectedBranch) return null;

  const checklistReady = isChecklistComplete(selectedBranch);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Branches
          </div>
          <div className="text-2xl font-semibold text-slate-900">Branches Managment</div>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsCreating(true);
            setSelectedId("new");
          }}
          className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
        >
          <FiPlus /> Create New Branch
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              tab === item
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_2fr]">
        <div className="space-y-3">
          {filteredBranches.map((branch) => (
            <button
              key={branch.id}
              type="button"
              onClick={() => {
                setIsCreating(false);
                setSelectedId(branch.id);
              }}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                branch.id === selectedId && !isCreating
                  ? "border-slate-900 bg-white shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{branch.brandName}</div>
                  <div className="text-xs text-slate-500">{branch.legalBusinessName}</div>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${
                    branch.status === "live"
                      ? "bg-emerald-50 text-emerald-600"
                      : branch.status === "pending"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {branch.status}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <FiMapPin className="text-slate-400" /> {branch.address}
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {selectedBranch.businessLogoUrl ? (
                <img
                  src={selectedBranch.businessLogoUrl}
                  alt="Business Logo"
                  className="h-12 w-12 rounded-xl border border-slate-200 object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-xl border border-dashed border-slate-300 bg-slate-50" />
              )}
              <div>
                <div className="text-xs font-semibold uppercase text-slate-400">Branch Profile</div>
                <div className="text-xl font-semibold text-slate-900">
                  {isCreating ? "New Branch" : selectedBranch.brandName}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {!isCreating && (
                <button
                  type="button"
                  onClick={() => handleDraft(selectedBranch)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <FiEdit3 /> Move to Draft
                </button>
              )}
              <button
                type="button"
                onClick={() => handleMakeLive(selectedBranch)}
                disabled={!checklistReady}
                className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ${
                  checklistReady
                    ? "bg-emerald-600 text-white hover:bg-emerald-500"
                    : "bg-slate-200 text-slate-500 cursor-not-allowed"
                }`}
              >
                <FiCheckCircle /> Make Live
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              { label: "Legal Business Name", key: "legalBusinessName" },
              { label: "Brand Name", key: "brandName" },
              { label: "Registered Address", key: "registeredAddress" },
              { label: "Operating Country", key: "operatingCountry" },
              { label: "Timezone", key: "timezone" },
              { label: "Cuisine Type(s)", key: "cuisineTypes" },
              { label: "GST/VAT Details", key: "gstVat" },
              { label: "Primary Contact Details", key: "primaryContact" },
              { label: "Business Logo URL", key: "businessLogoUrl" },
              { label: "Branch Address", key: "address" },
              { label: "Phone", key: "phone" },
              { label: "Manager", key: "manager" },
              { label: "Hours", key: "hours" },
              { label: "Seating Inventory", key: "seatingInventory" },
              { label: "Reservation Rules", key: "reservationRules" },
            ].map((field) => (
              <label key={field.key} className="space-y-1 text-xs font-semibold text-slate-500">
                {field.label}
                <input
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  value={(selectedBranch as any)[field.key]}
                  onChange={(event) =>
                    handleSave({ ...selectedBranch, [field.key]: event.target.value } as Branch)
                  }
                />
              </label>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              Go-Live Checklist & Validation
              {checklistReady ? (
                <FiCheckCircle className="text-emerald-500" />
              ) : (
                <FiClock className="text-amber-500" />
              )}
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-600">
              {[
                { label: "Legal business name", ready: Boolean(selectedBranch.legalBusinessName) },
                { label: "Brand name", ready: Boolean(selectedBranch.brandName) },
                { label: "Registered address", ready: Boolean(selectedBranch.registeredAddress) },
                { label: "Operating country", ready: Boolean(selectedBranch.operatingCountry) },
                { label: "Timezone", ready: Boolean(selectedBranch.timezone) },
                { label: "Cuisine type(s)", ready: Boolean(selectedBranch.cuisineTypes) },
                { label: "Primary contact", ready: Boolean(selectedBranch.primaryContact) },
                { label: "Business logo", ready: Boolean(selectedBranch.businessLogoUrl) },
                { label: "Branch address", ready: Boolean(selectedBranch.address) },
                { label: "Phone number", ready: Boolean(selectedBranch.phone) },
                { label: "Manager assigned", ready: Boolean(selectedBranch.manager) },
                { label: "Hours", ready: Boolean(selectedBranch.hours) },
                { label: "Seating inventory", ready: Boolean(selectedBranch.seatingInventory) },
                { label: "Reservation rules", ready: Boolean(selectedBranch.reservationRules) },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  {item.ready ? (
                    <FiCheckCircle className="text-emerald-500" />
                  ) : (
                    <FiXCircle className="text-rose-400" />
                  )}
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchManagment;
