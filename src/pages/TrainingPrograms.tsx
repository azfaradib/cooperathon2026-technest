import { CalendarDays, Check, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import PageHeader from "../components/PageHeader";
import { api } from "../lib/api";
import { formatDateTime } from "../lib/format";
import type { TrainingCategory, TrainingProgram } from "../types";

const filters: ("All" | TrainingCategory)[] = [
  "All",
  "Phishing",
  "Passwords",
  "AI Safety",
  "Social Engineering",
  "General",
];

const categoryBadge: Record<TrainingCategory, string> = {
  Phishing: "bg-primary/20 text-secondary",
  Passwords: "bg-primary/30 text-secondary",
  "AI Safety": "bg-primary/15 text-secondary",
  "Social Engineering": "bg-primary/25 text-secondary",
  General: "bg-primary/10 text-secondary",
};

interface ScheduleModalProps {
  program: TrainingProgram;
  onClose: () => void;
  onSaved: (updated: TrainingProgram) => void;
}

function ScheduleModal({ program, onClose, onSaved }: ScheduleModalProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [seats, setSeats] = useState(String(program.capacity));
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const inputClass =
    "w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const updated = await api<TrainingProgram>(`/training/${program.id}`, {
        method: "PATCH",
        body: {
          nextSession: new Date(`${date}T${time}`).toISOString(),
          capacity: Number(seats),
        },
      });
      onSaved(updated);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not schedule session");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        {done ? (
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200">
              <Check className="h-7 w-7 text-emerald-600" />
            </div>
            <div>
              <div className="text-base font-semibold text-secondary">
                Session Scheduled
              </div>
              <div className="mt-1 text-sm text-gray-500">
                <span className="font-medium text-secondary">
                  {program.title}
                </span>{" "}
                has been added to the calendar for{" "}
                <span className="font-medium text-secondary">
                  {new Date(`${date}T${time}`).toLocaleString("en-CA", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
                .
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 rounded-lg bg-btn px-6 py-2 text-sm font-semibold text-white hover:bg-btn-hover"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <div className="text-base font-semibold text-secondary">
                  Schedule Session
                </div>
                <div className="mt-0.5 text-xs text-gray-500">
                  {program.title}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Start Time
                </label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Seat Capacity
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={200}
                  value={seats}
                  onChange={(e) => setSeats(e.target.value)}
                  className={inputClass}
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-btn py-2 text-sm font-semibold text-white hover:bg-btn-hover"
                >
                  Confirm
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function TrainingPrograms() {
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [scheduling, setScheduling] = useState<TrainingProgram | null>(null);

  useEffect(() => {
    api<TrainingProgram[]>("/training")
      .then(setPrograms)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const visible = programs.filter(
    (p) => filter === "All" || p.category === filter,
  );

  return (
    <div>
      <PageHeader
        title="Training Programs"
        subtitle="Schedule, browse, and manage cyber-awareness workshops for your community."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              filter === f
                ? "bg-btn text-tertiary"
                : "border border-gray-200 bg-tertiary text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {error && <p className="text-sm text-red-600">{error}</p>}
        {loading && <p className="text-sm text-gray-500">Loading…</p>}
        {visible.map((p) => {
          const pct = Math.round((p.enrolled / p.capacity) * 100);
          const barShade =
            pct >= 75 ? "bg-primary" : pct >= 40 ? "bg-primary/60" : "bg-primary/30";
          return (
            <div
              key={p.id}
              className="flex flex-col overflow-hidden rounded-xl bg-white ring-1 ring-gray-100 shadow-sm"
            >
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold leading-snug text-secondary">
                    {p.title}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${categoryBadge[p.category]}`}
                  >
                    {p.category}
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-gray-500">
                  {p.description}
                </p>

                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                  {formatDateTime(p.nextSession)}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span>Enrollment</span>
                    <span className="font-medium text-gray-600">
                      {p.enrolled} / {p.capacity}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full ${barShade}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 px-5 py-3">
                <button
                  type="button"
                  onClick={() => setScheduling(p)}
                  className="w-full rounded-lg bg-btn py-2 text-xs font-semibold text-white transition-colors hover:bg-btn-hover"
                >
                  Schedule Session
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {scheduling && (
        <ScheduleModal
          program={scheduling}
          onClose={() => setScheduling(null)}
          onSaved={(updated) =>
            setPrograms((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
          }
        />
      )}
    </div>
  );
}

export default TrainingPrograms;
