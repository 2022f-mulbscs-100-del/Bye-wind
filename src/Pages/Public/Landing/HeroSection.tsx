import { Link } from "react-router-dom";
import { FiArrowRight, FiBarChart2, FiCalendar, FiShield, FiUsers } from "react-icons/fi";

const HeroSection = () => {
  return (
    <div className="flex py-10 items-center">
      <section className="grid w-full gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-lg lg:grid-cols-[1.3fr_1fr]">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Restaurant Operating System
          </div>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">
            Run reservations, staffing, and guest CRM from one dashboard.
          </h1>
          <p className="mt-4 text-sm text-slate-500">
            ByeWind helps multi-location restaurants manage bookings, floor plans,
            payments, and loyalty with real-time visibility.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/signup"
              className="flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm"
            >
              Get started
              <FiArrowRight />
            </Link>
            <Link
              to="/restaurants"
              className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600"
            >
              Browse restaurants
            </Link>
            <Link
              to="/register-restaurant"
              className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600"
            >
              Become a seller
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { label: "Reservations", value: "2.3k/mo" },
              { label: "Avg. Rating", value: "4.9★" },
              { label: "Locations", value: "18" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-slate-50 px-4 py-3">
                <div className="text-xs text-slate-400">{item.label}</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 shadow-sm dark:from-[#121212] dark:via-[#121212] dark:to-[#121212]">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              Core modules
            </div>
            <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Updated
            </span>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {[
              { icon: FiCalendar, label: "Smart booking & waitlist" },
              { icon: FiUsers, label: "Guest CRM + loyalty" },
              { icon: FiBarChart2, label: "Performance analytics" },
              { icon: FiShield, label: "Payments & compliance" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 transition hover:border-slate-300 hover:bg-white"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                  <item.icon />
                </div>
                <div className="flex-1 text-sm font-medium text-slate-700">
                  {item.label}
                </div>
                <FiArrowRight className="text-slate-300" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeroSection;
