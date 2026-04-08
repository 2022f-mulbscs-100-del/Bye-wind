import { useEffect, useState } from "react";
import {
  FiArrowUpRight,
  FiClock,
  FiExternalLink,
  FiFileText,
  FiPlus,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import StatsCard from "../../../Components/Cards/StatsCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getJson } from "@/lib/api";
import { useBranchContext } from "@/context/BranchContext";
import { getStoredRestaurantId } from "@/lib/auth";

const trafficData = [
  { month: "Jan", value: 40 },
  { month: "Feb", value: 28 },
  { month: "Mar", value: 52 },
  { month: "Apr", value: 41 },
  { month: "May", value: 62 },
  { month: "Jun", value: 48 },
  { month: "Jul", value: 71 },
];

const reservationsTable = [
  {
    name: "Maya Carter",
    time: "Today, 7:30 PM",
    party: 4,
    status: "Confirmed",
  },
  {
    name: "Liam Nguyen",
    time: "Today, 8:15 PM",
    party: 2,
    status: "Pending",
  },
  {
    name: "Ava Diaz",
    time: "Tomorrow, 6:00 PM",
    party: 6,
    status: "Confirmed",
  },
  {
    name: "Noah Patel",
    time: "Tomorrow, 8:45 PM",
    party: 3,
    status: "Seated",
  },
];

const quickLinks = [
  { label: "Add Reservation", icon: FiPlus },
  { label: "Create Event", icon: FiFileText },
  { label: "View Calendar", icon: FiClock },
  { label: "Open Reports", icon: FiExternalLink },
];

type DashboardStats = {
  staffCount: number;
  menuCount: number;
  reservationCount: number;
  totalCapacity: number;
};

const Dashboard = () => {
  const { selectedBranchId } = useBranchContext();
  const restaurantId = getStoredRestaurantId();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const query = selectedBranchId 
          ? `?branchId=${selectedBranchId}` 
          : `?restaurantId=${restaurantId}`;
        const res = await getJson<DashboardStats>(`/stats/dashboard${query}`);
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedBranchId, restaurantId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Overview
          </div>
          <div className="text-2xl font-semibold text-slate-900">Dashboard</div>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm"
        >
          Today
          <FiArrowUpRight className="text-slate-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Reservations"
          value={loading ? "..." : stats?.reservationCount?.toString() || "0"}
          change="Today"
          trend="up"
          tone="blue"
          icon={<FiClock />}
        />
        <StatsCard
          title="Staff Members"
          value={loading ? "..." : stats?.staffCount?.toString() || "0"}
          change="Active"
          trend="up"
          tone="violet"
          icon={<FiUsers />}
        />
        <StatsCard
          title="Menu Items"
          value={loading ? "..." : stats?.menuCount?.toString() || "0"}
          change="Total items"
          trend="up"
          tone="sky"
          icon={<FiFileText />}
        />
        <StatsCard
          title="Seating Capacity"
          value={loading ? "..." : stats?.totalCapacity?.toString() || "0"}
          change="Total seats"
          trend="up"
          tone="indigo"
          icon={<FiTrendingUp />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <Card className="border-slate-100">
          <CardHeader>
            <CardTitle>Marketing Insights</CardTitle>
            <CardDescription>Audience growth and engagement</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData} margin={{ left: -10, right: 10 }}>
                <defs>
                  <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${v}k`} />
                <Tooltip
                  cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: "#e2e8f0",
                    background: "#ffffff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTraffic)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-slate-100">
            <CardHeader>
              <CardTitle>Revenue</CardTitle>
              <CardDescription>Today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-slate-900">$24,580</div>
              <div className="mt-1 text-xs text-emerald-600">+8.3% from yesterday</div>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>Online Orders</span>
                <span className="text-slate-700">$12,430</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>In-store</span>
                <span className="text-slate-700">$12,150</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100">
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
              <CardDescription>Shortcuts for daily actions</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.label}
                    type="button"
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
                  >
                    <Icon className="text-slate-400" />
                    {link.label}
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-slate-100">
        <CardHeader>
          <CardTitle>Reservations</CardTitle>
          <CardDescription>Upcoming guests and seating status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr>
                  <th className="pb-3 font-medium">Guest</th>
                  <th className="pb-3 font-medium">Time</th>
                  <th className="pb-3 font-medium">Party</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                {reservationsTable.map((row) => (
                  <tr key={row.name} className="border-t border-slate-100">
                    <td className="py-3 font-medium text-slate-900">{row.name}</td>
                    <td className="py-3">{row.time}</td>
                    <td className="py-3">{row.party}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          row.status === "Confirmed"
                            ? "bg-emerald-50 text-emerald-600"
                            : row.status === "Pending"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
