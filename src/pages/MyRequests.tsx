import { ClipboardList } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { timeAgo } from "../lib/format";
import type { AuditRequest, IncidentReport, SupportCase } from "../types";

interface Row {
  id: string;
  title: string;
  status: string;
  when: string;
}

const statusBadge: Record<string, string> = {
  New: "bg-orange-100 text-orange-700",
  "In Progress": "bg-primary/15 text-secondary",
  Resolved: "bg-emerald-100 text-emerald-700",
  Completed: "bg-emerald-100 text-emerald-700",
};

function Section({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <section className="rounded-xl bg-tertiary p-5 shadow-sm ring-1 ring-gray-100">
      <h2 className="text-sm font-semibold text-secondary">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-gray-500">Nothing submitted yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-gray-100">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-secondary">{r.title}</div>
                <div className="text-xs text-gray-400">
                  <span className="font-mono">{r.id.slice(0, 8).toUpperCase()}</span> · {r.when}
                </div>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusBadge[r.status]}`}>
                {r.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function MyRequests() {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [cases, setCases] = useState<SupportCase[]>([]);
  const [audits, setAudits] = useState<AuditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api<IncidentReport[]>("/incidents/mine"),
      api<SupportCase[]>("/support-cases/mine"),
      api<AuditRequest[]>("/audit-requests/mine"),
    ])
      .then(([i, c, a]) => {
        setIncidents(i);
        setCases(c);
        setAudits(a);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
          <ClipboardList className="h-5 w-5 text-secondary" strokeWidth={2.25} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-secondary">My Requests</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track the status of everything you have submitted.
          </p>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <div className="space-y-5">
          <Section
            title="Cases"
            rows={incidents.map((i) => ({
              id: i.id,
              title: i.issueType,
              status: i.status,
              when: i.date,
            }))}
          />
          <Section
            title="Support requests"
            rows={cases.map((c) => ({
              id: c.id,
              title: c.issueType,
              status: c.status,
              when: timeAgo(c.updatedAt),
            }))}
          />
          <Section
            title="Audit requests"
            rows={audits.map((a) => ({
              id: a.id,
              title: a.target,
              status: a.status,
              when: a.date,
            }))}
          />
        </div>
      )}
    </div>
  );
}

export default MyRequests;
