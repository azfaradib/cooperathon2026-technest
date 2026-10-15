import {
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
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
  Phishing: "bg-orange-100 text-orange-700",
  Passwords: "bg-primary/15 text-secondary",
  "AI Safety": "bg-purple-100 text-purple-700",
  "Social Engineering": "bg-emerald-100 text-emerald-700",
  General: "bg-gray-100 text-gray-700",
};

function AvailTraining() {
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");

  useEffect(() => {
    api<TrainingProgram[]>("/training")
      .then(setPrograms)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const visible = programs.filter(
    (p) => filter === "All" || p.category === filter,
  );

  const toggleRegister = async (p: TrainingProgram) => {
    setError("");
    try {
      const updated = await api<TrainingProgram>(`/training/${p.id}/register`, {
        method: p.registered ? "DELETE" : "POST",
      });
      setPrograms((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update registration");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
          <GraduationCap
            className="h-5 w-5 text-secondary"
            strokeWidth={2.25}
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-secondary">
            Available Training
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Reserve a spot in upcoming workshops. Sessions are free and run by
            community councillors.
          </p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              filter === f
                ? "bg-btn text-tertiary"
                : "bg-tertiary text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-gray-500">Loading…</p>}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {visible.map((p) => {
          const isRegistered = p.registered;
          const full = p.enrolled >= p.capacity;
          return (
            <div
              key={p.id}
              className="flex flex-col rounded-xl bg-tertiary p-5 shadow-sm ring-1 ring-gray-100"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-base font-semibold text-secondary">
                  {p.title}
                </h3>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${categoryBadge[p.category]}`}
                >
                  {p.category}
                </span>
              </div>
              <p className="mt-2 flex-1 text-sm text-gray-600">
                {p.description}
              </p>
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  {formatDateTime(p.nextSession)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {p.enrolled}/{p.capacity}
                </span>
              </div>

              <div className="mt-4">
                {isRegistered ? (
                  <button
                    type="button"
                    onClick={() => toggleRegister(p)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Registered — Click to cancel
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleRegister(p)}
                    disabled={full}
                    className="w-full rounded-md bg-btn px-4 py-2 text-sm font-semibold text-tertiary hover:bg-btn-hover disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {full ? "Session Full" : "Register"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AvailTraining;
