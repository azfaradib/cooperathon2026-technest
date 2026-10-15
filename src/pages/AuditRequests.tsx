import { useEffect, useState } from "react";
import Card from "../components/Card";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import { api } from "../lib/api";
import { usePolling } from "../lib/usePolling";
import type { AdminUser, AuditRequest, AuditStatus } from "../types";

const statuses: AuditStatus[] = ["New", "In Progress", "Completed"];

const statusBadge: Record<AuditStatus, string> = {
  New: "bg-orange-100 text-orange-700",
  "In Progress": "bg-primary/15 text-secondary",
  Completed: "bg-emerald-100 text-emerald-700",
};

function AuditRequests() {
  const [audits, setAudits] = useState<AuditRequest[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = audits.find((a) => a.id === selectedId) ?? null;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [members, setMembers] = useState<string[]>([]);

  useEffect(() => {
    api<AdminUser[]>("/admins")
      .then((list) => setMembers(list.map((a) => a.fullName ?? a.email)))
      .catch(() => {});
  }, []);

  usePolling(() => {
    api<AuditRequest[]>("/audit-requests")
      .then(setAudits)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  });

  const save = async (
    id: string,
    body: { status?: AuditStatus; assignedTo?: string },
  ) => {
    setError("");
    try {
      const updated = await api<AuditRequest>(`/audit-requests/${id}`, {
        method: "PATCH",
        body,
      });
      setAudits((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save changes");
    }
  };

  const handleStatusChange = (id: string, status: AuditStatus) => save(id, { status });

  // Assigning a new request means someone is now working on it.
  const assign = (a: AuditRequest, assignedTo: string) =>
    save(a.id, {
      assignedTo,
      ...(assignedTo && a.status === "New" && { status: "In Progress" as const }),
    });

  return (
    <div>
      <PageHeader
        title="Audit Requests"
        subtitle="Cyber audits requested by residents."
      />

      <Card>
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : audits.length === 0 ? (
          <p className="text-sm text-gray-500">No audit requests yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr className="border-b border-gray-200">
                  <th className="pb-3">Resident</th>
                  <th className="pb-3">Audit</th>
                  <th className="pb-3">Devices</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Assigned</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {audits.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => setSelectedId(a.id)}
                    className="cursor-pointer align-top text-secondary hover:bg-gray-50"
                  >
                    <td className="py-3">
                      <div className="font-medium">{a.name}</div>
                      <div className="text-xs text-gray-500">{a.email}</div>
                    </td>
                    <td className="py-3">
                      <div>{a.target}</div>
                      {a.context && (
                        <div className="max-w-xs text-xs text-gray-500">
                          {a.context}
                        </div>
                      )}
                    </td>
                    <td className="py-3">{a.deviceCount}</td>
                    <td className="py-3">
                      <div>{a.contactMethod}</div>
                      {a.preferredTime && (
                        <div className="text-xs text-gray-500">
                          {a.preferredTime}
                        </div>
                      )}
                    </td>
                    <td className="py-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={a.status}
                        onChange={(e) =>
                          handleStatusChange(a.id, e.target.value as AuditStatus)
                        }
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusBadge[a.status]}`}
                      >
                        {statuses.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 text-gray-600">
                      {a.assignedTo ?? <span className="text-gray-400">Unassigned</span>}
                    </td>
                    <td className="py-3 text-gray-600">{a.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selected && (
        <Modal
          title={`${selected.name} — ${selected.target}`}
          subtitle={`Requested ${selected.date}`}
          onClose={() => setSelectedId(null)}
        >
          <div className="space-y-5">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <Detail label="Email" value={selected.email} />
              <Detail label="Devices / accounts" value={String(selected.deviceCount)} />
              <Detail label="Preferred contact" value={selected.contactMethod} />
              <Detail label="Preferred time" value={selected.preferredTime ?? "—"} />
            </dl>
            <div>
              <div className={labelClass}>Notes from the resident</div>
              <p className="whitespace-pre-wrap text-sm text-gray-700">
                {selected.context ?? "—"}
              </p>
            </div>
            <div>
              <div className={labelClass}>Status</div>
              <div className="flex gap-2">
                {statuses.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => s !== selected.status && handleStatusChange(selected.id, s)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                      selected.status === s ? statusBadge[s] : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className={labelClass}>Assigned to</div>
              <select
                value={selected.assignedTo ?? ""}
                onChange={(e) => assign(selected, e.target.value)}
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Unassigned</option>
                {(selected.assignedTo && !members.includes(selected.assignedTo)
                  ? [selected.assignedTo, ...members]
                  : members
                ).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </Modal>
      )}
    </div>
  );
}

const labelClass = "mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500";

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className={labelClass}>{label}</dt>
      <dd className="break-all text-secondary">{value}</dd>
    </div>
  );
}

export default AuditRequests;
