const WhySection = () => {
  return (
    <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Why ByeWind
        </div>
        <div className="mt-2 text-2xl font-semibold text-slate-900">
          Built for multi-location restaurants
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Centralize booking, staffing, floor ops, and guest loyalty with a clean,
          modern experience for both teams and guests.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            {
              title: "Smart waitlist",
              body: "Auto-assign tables based on party size and availability.",
            },
            {
              title: "Live floor plan",
              body: "Drag and drop tables with spacing rules and zones.",
            },
            {
              title: "Revenue insights",
              body: "Track booking sources and high-value guests.",
            },
            {
              title: "Loyalty automation",
              body: "Trigger rewards and win-back campaigns automatically.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl bg-slate-50 px-4 py-4">
              <div className="text-sm font-semibold text-slate-900">{item.title}</div>
              <p className="mt-2 text-sm text-slate-500">{item.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Trusted by teams
        </div>
        <div className="mt-4 space-y-4">
          {[
            {
              quote:
                "We cut no-show rates by 18% and filled 2 more tables per night.",
              name: "Liam Patel",
              role: "General Manager",
            },
            {
              quote:
                "The floor plan tools keep our hosts aligned during peak hours.",
              name: "Maya Brooks",
              role: "Floor Lead",
            },
          ].map((item) => (
            <div key={item.name} className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-600">“{item.quote}”</p>
              <div className="mt-3 text-xs font-semibold text-slate-500">
                {item.name} · {item.role}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          Launch in under 7 days with onboarding support.
        </div>
      </div>
    </section>
  );
};

export default WhySection;
