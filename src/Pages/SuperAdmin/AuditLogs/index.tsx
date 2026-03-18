import { useEffect, useState } from "react";
import { getJson } from "@/lib/api";
import { isSessionActive } from "@/lib/auth";

type AuditLogEntry = {
  id: string;
  action: string;
  entity: string;
  createdAt: string;
  staff?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  };
};

type Severity = "Low" | "Medium" | "High";

const severityClassMap: Record<Severity, string> = {
  High: "bg-rose-50 text-rose-600",
  Medium: "bg-amber-50 text-amber-600",
  Low: "bg-slate-100 text-slate-600",
};

const severityByAction = (action: string): Severity => {
  const normalized = action.toUpperCase();
  if (["DELETE", "STATUS_CHANGE", "EXPORT"].includes(normalized)) return "High";
  if (["UPDATE", "CREATE"].includes(normalized)) return "Medium";
  return "Low";
};

const formatRelativeTime = (value: string) => {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return "just now";
  const diff = Date.now() - timestamp;
  if (diff < 60_000) return "just now";
  const minutes = Math.round(diff / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
};

const getActorName = (entry: AuditLogEntry) => {
  const { staff } = entry;
  if (!staff) return "System";
  const name = [staff.firstName, staff.lastName].filter(Boolean).join(" ");
  if (name) return name;
  return staff.email ?? "System";
};

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const authenticated = isSessionActive();

  useEffect(() => {
    if (!authenticated) {
      setLoading(false);
      return;
    }
    let mounted = true;
    setLoading(true);

    getJson<{ data: AuditLogEntry[] }>("/audit-logs?page=1&limit=6")
      .then((response) => {
        if (!mounted) return;
        setLogs(response.data ?? []);
        setError("");
      })
      .catch((err) => {
        if (!mounted) return;
        const message = err instanceof Error ? err.message : "Unable to fetch audit logs.";
        setError(message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [authenticated]);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Audit Logs & Activity Tracking
        </div>
        <div className="mt-1 text-2xl font-semibold text-slate-900">Compliance logs</div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">Recent activity</div>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          {!authenticated ? (
            <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
              Log in to view the audit trail.
            </div>
          ) : loading ? (
            <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
              Loading audit logs...
            </div>
          ) : logs.length ? (
            logs.map((log) => {
              const severity = severityByAction(log.action);
              return (
                <div key={log.id} className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-slate-900">{log.action}</div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        severityClassMap[severity]
                      }`}
                    >
                      {severity}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {getActorName(log)} · {formatRelativeTime(log.createdAt)}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
              {error || "No activity has been recorded yet."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
