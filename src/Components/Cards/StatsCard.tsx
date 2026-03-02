import type { ReactNode } from "react";

type StatsCardProps = {
  title: string;
  value: string;
  change: string;
  trend?: "up" | "down";
  icon?: ReactNode;
  tone?: "blue" | "violet" | "indigo" | "sky";
};

const toneStyles: Record<
  NonNullable<StatsCardProps["tone"]>,
  { surface: string; ring: string; icon: string; accent: string }
> = {
  blue: {
    surface: "bg-blue-50/70",
    ring: "border-blue-100",
    icon: "text-blue-700 bg-blue-100",
    accent: "bg-blue-500",
  },
  violet: {
    surface: "bg-violet-50/70",
    ring: "border-violet-100",
    icon: "text-violet-700 bg-violet-100",
    accent: "bg-violet-500",
  },
  indigo: {
    surface: "bg-indigo-50/70",
    ring: "border-indigo-100",
    icon: "text-indigo-700 bg-indigo-100",
    accent: "bg-indigo-500",
  },
  sky: {
    surface: "bg-sky-50/70",
    ring: "border-sky-100",
    icon: "text-sky-700 bg-sky-100",
    accent: "bg-sky-500",
  },
};

const StatsCard = ({ title, value, change, trend = "up", icon, tone = "blue" }: StatsCardProps) => {
  const styles = toneStyles[tone];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm ${styles.surface} ${styles.ring}`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${styles.accent}`} />
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
        {icon && (
          <div className={`flex h-9 w-9 items-center justify-center rounded-full ${styles.icon}`}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-6 flex items-end justify-between">
        <div className="text-[2rem] font-bold leading-none text-slate-900">{value}</div>
        <div
          className={`text-sm font-semibold ${
            trend === "up" ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {change}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
