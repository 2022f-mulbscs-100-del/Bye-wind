import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { postJson } from "@/lib/api";
import { persistAuthSession, type StaffSummary } from "@/lib/auth";

interface RegisterRestaurantResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  restaurant: {
    id: string;
    brandName: string;
    legalBusinessName: string;
    status: string;
  };
  token: string;
}

interface RestaurantFormData {
  brandName: string;
  legalBusinessName: string;
  cuisineTypes: string[];
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  timezone: string;
  phone: string;
}

const RegisterRestaurant = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("auth_token");

  const [formData, setFormData] = useState<RestaurantFormData>({
    brandName: "",
    legalBusinessName: "",
    cuisineTypes: [],
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    timezone: "UTC",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);

  const cuisineOptions = [
    "Italian",
    "Chinese",
    "Indian",
    "Mexican",
    "Japanese",
    "Thai",
    "Mediterranean",
    "American",
    "French",
    "Seafood",
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCuisineToggle = (cuisine: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(cuisine)
        ? prev.filter((c) => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const validate = () => {
    if (!formData.brandName.trim()) return "Restaurant brand name is required";
    if (!formData.legalBusinessName.trim())
      return "Legal business name is required";
    if (selectedCuisines.length === 0)
      return "Select at least one cuisine type";
    if (!formData.street.trim()) return "Street address is required";
    if (!formData.city.trim()) return "City is required";
    if (!formData.state.trim()) return "State is required";
    if (!formData.country.trim()) return "Country is required";
    if (!formData.zipCode.trim()) return "Zip code is required";
    return "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!token) {
      setError("Authentication token not found. Please sign up again.");
      navigate("/signup");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await postJson<RegisterRestaurantResponse>(
        "/auth/register-restaurant",
        {
          ...formData,
          cuisineTypes: selectedCuisines,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data) {
        throw new Error("Unexpected response from server");
      }

      // Update stored data with new token and role using our helper
      const { user, restaurant, token: newToken } = response.data;
      persistAuthSession(newToken, {
        ...user,
        restaurantId: restaurant.id
      } as StaffSummary);

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-lg p-8 sm:p-10">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Restaurant Setup
        </div>
        <div className="mt-2 text-2xl font-semibold text-slate-900">
          Register your restaurant
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Complete your restaurant details to get started managing reservations.
        </p>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">
              Basic Information
            </h3>

            <label className="block text-xs font-semibold text-slate-500">
              Brand Name
              <input
                type="text"
                name="brandName"
                placeholder="e.g., Bella Italia"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
                value={formData.brandName}
                onChange={handleInputChange}
              />
            </label>

            <label className="block text-xs font-semibold text-slate-500">
              Legal Business Name
              <input
                type="text"
                name="legalBusinessName"
                placeholder="e.g., Bella Italia LLC"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
                value={formData.legalBusinessName}
                onChange={handleInputChange}
              />
            </label>
          </div>

          {/* Cuisine Types */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">
              Cuisine Types
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {cuisineOptions.map((cuisine) => (
                <label
                  key={cuisine}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 cursor-pointer hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedCuisines.includes(cuisine)}
                    onChange={() => handleCuisineToggle(cuisine)}
                    className="rounded"
                  />
                  <span className="text-sm text-slate-700">{cuisine}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">Address</h3>

            <label className="block text-xs font-semibold text-slate-500">
              Street Address
              <input
                type="text"
                name="street"
                placeholder="123 Main Street"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
                value={formData.street}
                onChange={handleInputChange}
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block text-xs font-semibold text-slate-500">
                City
                <input
                  type="text"
                  name="city"
                  placeholder="San Francisco"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-500">
                State
                <input
                  type="text"
                  name="state"
                  placeholder="CA"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  value={formData.state}
                  onChange={handleInputChange}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="block text-xs font-semibold text-slate-500">
                Country
                <input
                  type="text"
                  name="country"
                  placeholder="United States"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  value={formData.country}
                  onChange={handleInputChange}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-500">
                Zip Code
                <input
                  type="text"
                  name="zipCode"
                  placeholder="94102"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                />
              </label>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-4">
            <label className="block text-xs font-semibold text-slate-500">
              Timezone
              <select
                name="timezone"
                value={formData.timezone}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </label>

            <label className="block text-xs font-semibold text-slate-500">
              Phone Number (Optional)
              <input
                type="tel"
                name="phone"
                placeholder="+1 (415) 555-0100"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </label>
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Setting up..." : "Complete Registration"}
            <FiArrowRight />
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterRestaurant;
