import { useState } from "react";
import { api } from "../lib/api";
import type { IncidentReport, IncidentStatus } from "../types";
import AttachmentGallery from "./AttachmentGallery";
import Modal from "./Modal";

const statuses: IncidentStatus[] = ["New", "In Progress", "Resolved"];

const statusBadge: Record<IncidentStatus, string> = {
  New: "bg-orange-100 text-orange-700",
  "In Progress": "bg-primary/15 text-secondary",
  Resolved: "bg-emerald-100 text-emerald-700",
};

const label = "mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500";

interface Props {
  incident: IncidentReport;
  members: string[];
  onClose: () => void;
  onUpdated: (updated: IncidentReport) => void;
}

function IncidentDetailModal({ incident, members, onClose, onUpdated }: Props) {
  const [error, setError] = useState("");

  const save = async (body: { status?: IncidentStatus; assignedTo?: string }) => {
    setError("");
    try {
      onUpdated(
        await api<IncidentReport>(`/incidents/${incident.id}`, {
          method: "PATCH",
          body,
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save changes");
    }
  };

  // Assigning a new case means someone is now working on it.
  const assign = (assignedTo: string) =>
    save({
      assignedTo,
      ...(assignedTo && incident.status === "New" && { status: "In Progress" as const }),
    });

  const options =
    incident.assignedTo && !members.includes(incident.assignedTo)
      ? [incident.assignedTo, ...members]
      : members;

  return (
    <Modal
      title={`${incident.resident} — ${incident.issueType}`}
      subtitle={`Reported ${incident.date}`}
      onClose={onClose}
    >
      <div className="space-y-5">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className={label}>Urgency</dt>
            <dd className="text-secondary">{incident.urgency ?? "—"}</dd>
          </div>
          <div>
            <dt className={label}>Email</dt>
            <dd className="break-all text-secondary">{incident.email ?? "—"}</dd>
          </div>
          <div>
            <dt className={label}>Phone</dt>
            <dd className="text-secondary">{incident.phone ?? "—"}</dd>
          </div>
        </dl>

        <div>
          <div className={label}>What happened</div>
          <p className="whitespace-pre-wrap text-sm text-gray-700">{incident.description}</p>
        </div>

        <div>
          <div className={label}>Status</div>
          <div className="flex gap-2">
            {statuses.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => s !== incident.status && save({ status: s })}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  incident.status === s ? statusBadge[s] : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className={label}>Assigned to</div>
          <select
            value={incident.assignedTo ?? ""}
            onChange={(e) => assign(e.target.value)}
            className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Unassigned</option>
            {options.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className={label}>Attachments</div>
          {incident.attachmentCount ? (
            <AttachmentGallery incidentId={incident.id} />
          ) : (
            <p className="text-sm text-gray-500">No files attached.</p>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </Modal>
  );
}

export default IncidentDetailModal;
