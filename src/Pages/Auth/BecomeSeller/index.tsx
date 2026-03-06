import { useState } from "react";
import { FiCheckCircle, FiMapPin, FiPhone } from "react-icons/fi";

const BecomeSeller = () => {
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = () => {
    setShowToast(true);
    window.setTimeout(() => setShowToast(false), 2200);
  };

  return (
    <div className="min-h-screen  bg-slate-100 px-4 py-10">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Become a Seller
              </div>
              <div className="mt-2 text-3xl font-semibold text-slate-900">
                Register your restaurant profile
              </div>
              <p className="mt-3 text-sm text-slate-500">
                Create a professional listing, manage reservations, and launch your
                online booking widget.
              </p>
              <div className="mt-6 grid gap-3 text-sm text-slate-600">
                {[
                  "Instant booking widget setup",
                  "Centralized guest CRM",
                  "Multi-branch management",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <FiCheckCircle className="text-emerald-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <div className="text-sm font-semibold text-slate-900">
                Submission Checklist
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                {[
                  "Business registration",
                  "Menu & pricing",
                  "Contact & location",
                  "Branding assets",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <FiCheckCircle className="text-emerald-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="text-sm font-semibold text-slate-900">Restaurant Info</div>
              {[
                { label: "Restaurant name", placeholder: "ByeWind Bistro" },
                { label: "Cuisine type", placeholder: "Mediterranean, Grill" },
              ].map((field) => (
                <label key={field.label} className="block text-xs font-semibold text-slate-500">
                  {field.label}
                  <input
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                    placeholder={field.placeholder}
                  />
                </label>
              ))}
            </div>

            <div className="space-y-4">
              <div className="text-sm font-semibold text-slate-900">Contact & Location</div>
              <label className="block text-xs font-semibold text-slate-500">
                Owner/Contact person name
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  placeholder="John Doe"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-500">
                Address
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <FiMapPin className="text-slate-400" />
                  <input
                    className="w-full bg-transparent text-sm text-slate-700 focus:outline-none"
                    placeholder="214 Market St, San Francisco, CA"
                  />
                </div>
              </label>
              <label className="block text-xs font-semibold text-slate-500">
                Phone number
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <FiPhone className="text-slate-400" />
                  <input
                    className="w-full bg-transparent text-sm text-slate-700 focus:outline-none"
                    placeholder="(415) 555-2033"
                  />
                </div>
              </label>
              <label className="block text-xs font-semibold text-slate-500">
                Email
                <input
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  placeholder="owner@restaurant.com"
                />
              </label>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              onClick={handleSubmit}
              className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Submit for review
            </button>
          </div>
        </div>
      </div>
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl">
          Submitted for review
        </div>
      )}
    </div>
  );
};

export default BecomeSeller;
