import type { GuestProfileData } from "./types";

type PreferencesProps = {
  preferences: GuestProfileData["preferences"];
};

const Preferences = ({ preferences }: PreferencesProps) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-semibold text-slate-900 mb-4">Dining Preferences</div>

      <div className="space-y-4">
        <div>
          <div className="text-xs font-medium text-slate-500 mb-2">
            Favorite Cuisines
          </div>
          <div className="flex flex-wrap gap-2">
            {preferences.favoriteCuisines.map((cuisine) => (
              <span
                key={cuisine}
                className="text-xs px-3 py-1 rounded-full bg-slate-50 text-slate-700"
              >
                {cuisine}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-medium text-slate-500 mb-2">Dietary Notes</div>
          <div className="space-y-1">
            {preferences.dietaryRestrictions.map((restriction) => (
              <div
                key={restriction}
                className="text-xs px-3 py-2 rounded-2xl bg-slate-50 text-slate-700"
              >
                {restriction}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preferences;
