import { Paperclip, Plus } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import IncidentDetailModal from "../components/IncidentDetailModal";
import PageHeader from "../components/PageHeader";
import Select from "../components/Select";
import { api } from "../lib/api";
import { usePolling } from "../lib/usePolling";
import type { AdminUser, IncidentReport, IncidentStatus } from "../types";

const statuses: IncidentStatus[] = ["New", "In Progress", "Resolved"];

const statusBadge: Record<IncidentStatus, string> = {
  New: "bg-orange-100 text-orange-700",
  "In Progress": "bg-primary/15 text-secondary",
  Resolved: "bg-emerald-100 text-emerald-700",
};

function IncidentReports() {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [resident, setResident] = useState("");
  const [issueType, setIssueType] = useState("Identity Theft");
  const [description, setDescription] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [members, setMembers] = useState<string[]>([]);

  const selected = incidents.find((i) => i.id === selectedId) ?? null;
  const replaceIncident = (updated: IncidentReport) =>
    setIncidents((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));

  useEffect(() => {
    api<AdminUser[]>("/admins")
      .then((list) => setMembers(list.map((a) => a.fullName ?? a.email)))
      .catch(() => {});
  }, []);

  usePolling(() => {
    api<IncidentReport[]>("/incidents")
      .then(setIncidents)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const created = await api<IncidentReport>("/incidents", {
        method: "POST",
        body: { resident, issueType, description },
      });
      setIncidents((prev) => [created, ...prev]);
      setResident("");
      setDescription("");
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save report");
    }
  };

  const handleStatusChange = async (id: string, status: IncidentStatus) => {
    setError("");
    try {
      const updated = await api<IncidentReport>(`/incidents/${id}`, {
        method: "PATCH",
        body: { status },
      });
      replaceIncident(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update status");
    }
  };

  return (
    <div>
      <PageHeader
        title="Incident Reports"
        subtitle="Track and triage cyber incidents reported by community residents."
        action={
          <Button onClick={() => setShowForm((s) => !s)}>
            <Plus className="h-4 w-4" />
            {showForm ? "Close Form" : "New Report"}
          </Button>
        }
      />

      {showForm && (
        <div className="mb-6">
          <Card title="New Incident Report">
            <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-sm font-medium text-secondary">
                  Resident's Name
                </label>
                <input
                  required
                  value={resident}
                  onChange={(e) => setResident(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-secondary">
                  Issue Type
                </label>
                <Select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                >
                  <option>Identity Theft</option>
                  <option>Phishing Email</option>
                  <option>Phone Scam</option>
                  <option>Account Takeover</option>
                  <option>Malware</option>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-secondary">
                  Description
                </label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" variant="secondary">
                  Submit Report
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <Card>
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : incidents.length === 0 ? (
          <p className="text-sm text-gray-500">No incident reports yet.</p>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr className="border-b border-gray-200">
                <th className="pb-3">Resident</th>
                <th className="pb-3">Issue Type</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Assigned</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Description</th>
                <th className="pb-3">Files</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {incidents.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className="cursor-pointer text-secondary hover:bg-gray-50"
                >
                  <td className="py-3 font-medium">{r.resident}</td>
                  <td className="py-3">{r.issueType}</td>
                  <td className="py-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={r.status}
                      onChange={(e) =>
                        handleStatusChange(r.id, e.target.value as IncidentStatus)
                      }
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusBadge[r.status]}`}
                    >
                      {statuses.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 text-gray-600">
                    {r.assignedTo ?? <span className="text-gray-400">Unassigned</span>}
                  </td>
                  <td className="py-3 text-gray-600">{r.date}</td>
                  <td className="max-w-md py-3 text-gray-600">
                    <span className="line-clamp-2">{r.description}</span>
                  </td>
                  <td className="py-3">
                    {r.attachmentCount ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-secondary">
                        <Paperclip className="h-3.5 w-3.5" />
                        {r.attachmentCount}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </Card>

      {selected && (
        <IncidentDetailModal
          incident={selected}
          members={members}
          onClose={() => setSelectedId(null)}
          onUpdated={replaceIncident}
        />
      )}
    </div>
  );
}

export default IncidentReports;
