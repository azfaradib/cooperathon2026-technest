import { Check, Clock, UserCircle2, X } from "lucide-react";
import { useState } from "react";
import Select from "../components/Select";
import Button from "../components/Button";
import Card from "../components/Card";
import PageHeader from "../components/PageHeader";
import { api } from "../lib/api";
import { timeAgo } from "../lib/format";
import { usePolling } from "../lib/usePolling";
import type { CasePriority, SupportCase } from "../types";

const priorityBadge: Record<CasePriority, string> = {
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-primary/15 text-secondary",
  Low: "bg-emerald-100 text-emerald-700",
};

const statusOptions = ["New", "In Progress", "Resolved"] as const;
type CaseStatus = (typeof statusOptions)[number];

const statusBadge: Record<CaseStatus, string> = {
  New: "bg-orange-100 text-orange-700",
  "In Progress": "bg-primary/15 text-secondary",
  Resolved: "bg-emerald-100 text-emerald-700",
};

// ── Open Case Modal ──────────────────────────────────────────────────────────

function OpenCaseModal({
  c,
  onClose,
  onSaved,
}: {
  c: SupportCase;
  onClose: () => void;
  onSaved: (updated: SupportCase) => void;
}) {
  const [status, setStatus] = useState<CaseStatus>(c.status);
  const [notes, setNotes] = useState(c.notes);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    try {
      const updated = await api<SupportCase>(`/support-cases/${c.id}`, {
        method: "PATCH",
        body: { status, notes },
      });
      onSaved(updated);
      setSaved(true);
      setTimeout(onClose, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save case");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        {saved ? (
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200">
              <Check className="h-7 w-7 text-emerald-600" />
            </div>
            <div className="text-base font-semibold text-secondary">Case Updated</div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-base font-semibold text-secondary">{c.resident}</div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityBadge[c.priority]}`}>
                    {c.priority}
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-gray-500">{c.issueType}</div>
              </div>
              <button type="button" onClick={onClose} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1.5">
                  <UserCircle2 className="h-4 w-4" /> {c.assignedTo ?? "Unassigned"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> Updated {timeAgo(c.updatedAt)}
                </span>
              </div>

              <div>
                <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Request</div>
                <p className="text-sm text-gray-600">{c.description}</p>
                <p className="mt-1 text-xs text-gray-400">Contact: {c.contact}</p>
              </div>

              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Status</div>
                <div className="flex gap-2">
                  {statusOptions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                        status === s ? statusBadge[s] : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Case Notes</div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="button" onClick={handleSave} className="flex-1 rounded-lg bg-btn py-2 text-sm font-semibold text-white hover:bg-btn-hover">
                  Save & Close
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Reassign Modal ───────────────────────────────────────────────────────────

function ReassignModal({
  c,
  members,
  onClose,
  onConfirm,
}: {
  c: SupportCase;
  members: string[];
  onClose: () => void;
  onConfirm: (newAssignee: string) => void;
}) {
  const [selected, setSelected] = useState(c.assignedTo ?? "");
  const [reason, setReason] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <div className="text-base font-semibold text-secondary">Reassign Case</div>
            <div className="mt-0.5 text-xs text-gray-500">{c.resident} — {c.issueType}</div>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Currently Assigned</div>
            <div className="text-sm font-medium text-secondary">{c.assignedTo ?? "Unassigned"}</div>
          </div>

          <div>
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Assign To</div>
            <Select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              searchable
            >
              {members.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </Select>
          </div>

          <div>
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Reason{" "}
              <span className="normal-case font-normal text-gray-400">(optional)</span>
            </div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="e.g. Capacity issue, better expertise match…"
              className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="button"
              disabled={!selected || selected === c.assignedTo}
              onClick={() => { onConfirm(selected); onClose(); }}
              className="flex-1 rounded-lg bg-btn py-2 text-sm font-semibold text-white hover:bg-btn-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              Confirm Reassignment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

function CommunitySupport() {
  const [cases, setCases] = useState<SupportCase[]>([]);
  const [members, setMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openCase, setOpenCase] = useState<SupportCase | null>(null);
  const [reassignCase, setReassignCase] = useState<SupportCase | null>(null);

  usePolling(() => {
    Promise.all([
      api<SupportCase[]>("/support-cases"),
      api<string[]>("/support-cases/assignees"),
    ])
      .then(([list, names]) => {
        setCases(list);
        setMembers(names);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  });

  const replaceCase = (updated: SupportCase) =>
    setCases((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));

  const reassign = async (c: SupportCase, assignedTo: string) => {
    setError("");
    try {
      replaceCase(
        await api<SupportCase>(`/support-cases/${c.id}`, {
          method: "PATCH",
          body: { assignedTo },
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reassign case");
    }
  };

  return (
    <div>
      <PageHeader
        title="Community Support"
        subtitle="Active resident support cases assigned to council members."
      />

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-gray-500">Loading…</p>}
      {!loading && cases.length === 0 && (
        <p className="text-sm text-gray-500">No support cases yet.</p>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {cases.map((c) => {
          return (
            <Card key={c.id}>
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-secondary">{c.resident}</h3>
                    <p className="text-sm text-gray-600">{c.issueType}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityBadge[c.priority]}`}>
                    {c.priority}
                  </span>
                </div>
                <div className="flex flex-col gap-1 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-2">
                    <UserCircle2 className="h-4 w-4" />
                    Assigned: {c.assignedTo ?? "Unassigned"}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Updated {timeAgo(c.updatedAt)}
                  </span>
                  <span className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadge[c.status]}`}>
                    {c.status}
                  </span>
                </div>
                <div className="mt-1 flex gap-2">
                  <Button size="sm" onClick={() => setOpenCase(c)}>
                    Open Case
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setReassignCase(c)}>
                    {c.assignedTo ? "Reassign" : "Assign"}                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {openCase && (
        <OpenCaseModal
          c={openCase}
          onClose={() => setOpenCase(null)}
          onSaved={replaceCase}
        />
      )}

      {reassignCase && (
        <ReassignModal
          c={reassignCase}
          members={members}
          onClose={() => setReassignCase(null)}
          onConfirm={(newAssignee) => reassign(reassignCase, newAssignee)}
        />
      )}
    </div>
  );
}

export default CommunitySupport;
