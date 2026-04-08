import { Link } from "react-router-dom";

const CtaSection = () => {
  return (
    <section className="mt-6 rounded-3xl border border-slate-200 bg-[#121212] p-8 text-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-300">
            Ready to launch
          </div>
          <div className="mt-2 text-2xl font-semibold">
            Get your first bookings this week
          </div>
          <p className="mt-2 text-sm text-slate-300">
            Create an account or register your restaurant to go live.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/signup"
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900"
          >
            Start free
          </Link>
          <Link
            to="/register-restaurant"
            className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white"
          >
            Become a seller
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
