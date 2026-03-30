import { useState, useEffect } from "react";
import { getJson, putJson } from "@/lib/api";
import { getStoredRestaurantId } from "@/lib/auth";
import Loader from "@/Components/loader";
import { FiSave, FiRotateCcw, FiImage, FiX } from "react-icons/fi";
import { toast } from "sonner";

type RestaurantData = {
  id: string;
  brandName: string;
  legalBusinessName: string;
  registeredAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  operatingCountry: string;
  timezone: string;
  cuisineTypes: string[];
  logoUrl?: string;
  primaryContact: {
    name: string;
    email: string;
    phone: string;
    designation: string;
  };
  status: "DRAFT" | "PENDING_REVIEW" | "LIVE" | "SUSPENDED";
  isActive: boolean;
  gstVatNumber?: string;
  gstVatApplicable: boolean;
  planTier?: string;
};

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Hong_Kong",
  "Asia/Tokyo",
  "Australia/Sydney",
];

const CUISINES = [
  "Italian",
  "Chinese",
  "Japanese",
  "Indian",
  "Mexican",
  "Thai",
  "French",
  "American",
  "Mediterranean",
  "Korean",
  "Vietnamese",
  "Spanish",
  "Middle Eastern",
  "California",
  "Seafood",
  "Contemporary",
  "Vegetarian",
  "Vegan",
];

export default function RestaurantSettings() {
  const restaurantId = getStoredRestaurantId();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<RestaurantData | null>(null);
  const [formData, setFormData] = useState<RestaurantData | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);

  useEffect(() => {
    if (!restaurantId) return;
    
    const fetchRestaurantData = async () => {
      try {
        setIsLoading(true);
        const response = await getJson<RestaurantData>(`/restaurants/${restaurantId}`, {
          headers: { "x-restaurant-id": restaurantId }
        });
        
        if (response.data) {
          setOriginalData(response.data);
          setFormData(response.data);
          setSelectedCuisines(response.data.cuisineTypes || []);
          setLogoPreview(response.data.logoUrl || "");
        }
      } catch (error) {
        console.error("Error fetching restaurant data:", error);
        toast.error("Failed to load restaurant data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurantData();
  }, [restaurantId]);

  const handleInputChange = (field: string, value: any) => {
    if (!formData) return;
    
    const updated = { ...formData };
    const keys = field.split(".");
    
    if (keys.length === 1) {
      (updated as any)[field] = value;
    } else {
      let obj = updated as any;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
    }
    
    setFormData(updated);
    setHasChanges(JSON.stringify(originalData) !== JSON.stringify(updated));
  };

  const handleCuisineToggle = (cuisine: string) => {
    const updated = selectedCuisines.includes(cuisine)
      ? selectedCuisines.filter(c => c !== cuisine)
      : [...selectedCuisines, cuisine];
    
    setSelectedCuisines(updated);
    handleInputChange("cuisineTypes", updated);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setLogoPreview(base64);
        handleInputChange("logoUrl", base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!formData || !restaurantId) return;
    
    try {
      setIsSaving(true);
      const response = await putJson(`/restaurants/${restaurantId}`, formData, {
        headers: { "x-restaurant-id": restaurantId }
      });
      
      if (response.data) {
        setOriginalData(response.data);
        setFormData(response.data);
        setHasChanges(false);
        toast.success("Restaurant settings updated successfully!");
      }
    } catch (error) {
      console.error("Error saving restaurant data:", error);
      toast.error("Failed to save restaurant settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (originalData) {
      setFormData(originalData);
      setSelectedCuisines(originalData.cuisineTypes || []);
      setLogoPreview(originalData.logoUrl || "");
      setHasChanges(false);
    }
  };

  if (isLoading || !formData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Master Config</div>
          <h1 className="text-2xl font-bold text-slate-900">Restaurant Settings</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-all"
          >
            <FiRotateCcw /> Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-30 shadow-xl shadow-slate-200 transition-all"
          >
            <FiSave /> {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Logo Section */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <FiImage className="text-indigo-500" /> Logo & Branding
            </h3>
            <div className="space-y-4">
              <div className="flex gap-6 items-start">
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
                    Restaurant Logo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  />
                  <p className="text-xs text-slate-400 mt-2">Supported formats: PNG, JPG, GIF (Max 5MB)</p>
                </div>
                {logoPreview && (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-24 w-24 rounded-2xl object-cover border border-slate-200 shadow-sm"
                    />
                    <button
                      onClick={() => {
                        setLogoPreview("");
                        handleInputChange("logoUrl", "");
                      }}
                      className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg hover:bg-rose-600"
                    >
                      <FiX />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Restaurant Info */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Restaurant Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => handleInputChange("brandName", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white"
                  placeholder="e.g., Northwind Table"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
                  Legal Business Name
                </label>
                <input
                  type="text"
                  value={formData.legalBusinessName}
                  onChange={(e) => handleInputChange("legalBusinessName", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white"
                  placeholder="Legal registered business name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
                  Operating Country
                </label>
                <input
                  type="text"
                  value={formData.operatingCountry}
                  onChange={(e) => handleInputChange("operatingCountry", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white"
                  placeholder="United States"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
                  Timezone
                </label>
                <select
                  value={formData.timezone}
                  onChange={(e) => handleInputChange("timezone", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white"
                >
                  <option value="">Select timezone</option>
                  {TIMEZONES.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Registered Address</h3>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
                Street Address
              </label>
              <input
                type="text"
                value={formData.registeredAddress.street}
                onChange={(e) => handleInputChange("registeredAddress.street", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white"
                placeholder="Street address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.registeredAddress.city}
                  onChange={(e) => handleInputChange("registeredAddress.city", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
                  State/Province
                </label>
                <input
                  type="text"
                  value={formData.registeredAddress.state}
                  onChange={(e) => handleInputChange("registeredAddress.state", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white"
                  placeholder="State"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.registeredAddress.country}
                  onChange={(e) => handleInputChange("registeredAddress.country", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white"
                  placeholder="Country"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
                  ZIP/Postal Code
                </label>
                <input
                  type="text"
                  value={formData.registeredAddress.zipCode}
                  onChange={(e) => handleInputChange("registeredAddress.zipCode", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white"
                  placeholder="ZIP code"
                />
              </div>
            </div>
          </div>

          {/* Cuisine Types */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Cuisine Types</h3>
            <p className="text-xs text-slate-500 font-medium">Select all that apply</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CUISINES.map(cuisine => (
                <label
                  key={cuisine}
                  className={`relative flex items-center gap-3 rounded-2xl border-2 px-4 py-3 cursor-pointer transition-all ${
                    selectedCuisines.includes(cuisine)
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCuisines.includes(cuisine)}
                    onChange={() => handleCuisineToggle(cuisine)}
                    className="sr-only peer"
                  />
                  <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                    selectedCuisines.includes(cuisine)
                      ? "border-indigo-500 bg-indigo-500"
                      : "border-slate-300 bg-white"
                  }`}>
                    {selectedCuisines.includes(cuisine) && (
                      <span className="text-white text-xs font-bold">✓</span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-slate-700">{cuisine}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Primary Contact */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Primary Contact</h3>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
                Name
              </label>
              <input
                type="text"
                value={formData.primaryContact.name}
                onChange={(e) => handleInputChange("primaryContact.name", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white"
                placeholder="Contact name"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.primaryContact.email}
                onChange={(e) => handleInputChange("primaryContact.email", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.primaryContact.phone}
                onChange={(e) => handleInputChange("primaryContact.phone", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white"
                placeholder="+1-555-0000"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
                Designation
              </label>
              <input
                type="text"
                value={formData.primaryContact.designation}
                onChange={(e) => handleInputChange("primaryContact.designation", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white"
                placeholder="Manager"
              />
            </div>
          </div>

          {/* Status & Settings */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Status & Configuration</h3>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-3">
                Restaurant Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white"
              >
                <option value="DRAFT">Draft</option>
                <option value="PENDING_REVIEW">Pending Review</option>
                <option value="LIVE">Live</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-3">
                Plan Tier
              </label>
              <p className="text-sm font-bold text-slate-700 bg-slate-50 rounded-xl px-4 py-2">
                {formData.planTier || "Starter"}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
                GST/VAT
              </label>
              <div className="flex items-center gap-3 mb-3">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.gstVatApplicable}
                    onChange={(e) => handleInputChange("gstVatApplicable", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-12 h-7 bg-slate-200 rounded-full peer peer-checked:bg-indigo-600 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                  <span className="ml-2 text-xs font-bold text-slate-600 group-hover:text-slate-700">
                    {formData.gstVatApplicable ? "Applicable" : "Not Applicable"}
                  </span>
                </label>
              </div>
              {formData.gstVatApplicable && (
                <input
                  type="text"
                  value={formData.gstVatNumber || ""}
                  onChange={(e) => handleInputChange("gstVatNumber", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white"
                  placeholder="GST/VAT number"
                />
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange("isActive", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-12 h-7 bg-slate-200 rounded-full peer peer-checked:bg-green-600 transition-colors"></div>
                <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                <span className="ml-2 text-xs font-bold text-slate-600 group-hover:text-slate-700">
                  {formData.isActive ? "Active" : "Inactive"}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
