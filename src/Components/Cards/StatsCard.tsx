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
  { icon: string; accent: string; glow: string }
> = {
  blue: {
    icon: "text-blue-700 bg-blue-100/90 dark:text-blue-300 dark:bg-blue-500/20",
    accent: "bg-blue-500",
    glow: "from-blue-500/20",
  },
  violet: {
    icon: "text-violet-700 bg-violet-100/90 dark:text-violet-300 dark:bg-violet-500/20",
    accent: "bg-violet-500",
    glow: "from-violet-500/20",
  },
  indigo: {
    icon: "text-indigo-700 bg-indigo-100/90 dark:text-indigo-300 dark:bg-indigo-500/20",
    accent: "bg-indigo-500",
    glow: "from-indigo-500/20",
  },
  sky: {
    icon: "text-sky-700 bg-sky-100/90 dark:text-sky-300 dark:bg-sky-500/20",
    accent: "bg-sky-500",
    glow: "from-sky-500/20",
  },
};

const StatsCard = ({ title, value, change, trend = "up", icon, tone = "blue" }: StatsCardProps) => {
  const styles = toneStyles[tone];

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-900"
    >
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {title}
        </div>
        {icon && (
          <div className={`flex h-9 w-9 items-center justify-center rounded-full ${styles.icon}`}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-6 flex items-end justify-between">
        <div className="text-[2rem] font-bold leading-none text-slate-900 dark:text-slate-100">
          {value}
        </div>
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
