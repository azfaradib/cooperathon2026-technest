import { CheckCircle2, ScanSearch } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import Select from "../components/Select";
import { api } from "../lib/api";
import type { AuditRequest } from "../types";

const auditTargets = [
  "Home Network (Wi-Fi, router)",
  "Personal Devices (phone, laptop)",
  "Online Accounts (email, social)",
  "Small Business Setup",
  "Other",
];

const contactMethods = ["Email", "Phone", "In Person"] as const;

function RequestAudit() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [target, setTarget] = useState(auditTargets[0]);
  const [deviceCount, setDeviceCount] = useState("1");
  const [contactMethod, setContactMethod] =
    useState<(typeof contactMethods)[number]>("Email");
  const [preferredTime, setPreferredTime] = useState("");
  const [context, setContext] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const created = await api<AuditRequest>("/audit-requests", {
        method: "POST",
        body: {
          name,
          email,
          target,
          deviceCount,
          contactMethod,
          preferredTime,
          context,
        },
      });
      setReferenceId(`TNC-A-${created.id.slice(0, 8).toUpperCase()}`);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send request");
    } finally {
      setBusy(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-xl bg-tertiary p-10 text-center shadow-sm ring-1 ring-gray-100">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200">
          <CheckCircle2
            className="h-8 w-8 text-emerald-600"
            strokeWidth={2.25}
          />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-secondary">
          Audit request received
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          A TECH-NEST volunteer will reach you via {contactMethod.toLowerCase()}{" "}
          to schedule your {target.toLowerCase()} audit.
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Reference ID:{" "}
          <span className="font-mono font-semibold text-secondary">
            {referenceId}
          </span>
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
          <ScanSearch className="h-5 w-5 text-secondary" strokeWidth={2.25} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-secondary">
            Request a Cyber Audit
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            A volunteer will review your setup and walk you through what to
            change, harden, or remove.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl bg-tertiary p-6 shadow-sm ring-1 ring-gray-100"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Full Name" required>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className={inputClass}
            />
          </Field>
          <Field label="Email" required>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              className={inputClass}
            />
          </Field>
          <Field label="What to audit" required>
            <Select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            >
              {auditTargets.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Field label="Roughly how many devices / accounts?">
            <input
              type="number"
              min={1}
              value={deviceCount}
              onChange={(e) => setDeviceCount(e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Preferred contact method" required>
            <div className="flex gap-2">
              {contactMethods.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setContactMethod(m)}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    contactMethod === m
                      ? "border-btn bg-btn text-tertiary"
                      : "border-gray-200 bg-tertiary text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Preferred time slot">
            <input
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              placeholder="e.g. weekday evenings, Sat morning"
              className={inputClass}
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Anything we should know in advance?">
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={4}
                placeholder="Concerns, recent incidents, devices that are acting up — anything that helps us prepare."
                className={inputClass}
              />
            </Field>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-5">
          <p className="text-xs text-gray-500">
            Audits are free and provided by TECH-NEST volunteers.
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-btn px-6 py-2.5 text-sm font-semibold text-tertiary hover:bg-btn-hover disabled:opacity-60"
          >
            {busy ? "Sending…" : "Request Audit"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-gray-300 bg-tertiary px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40";

interface FieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
}

function Field({ label, required, children }: FieldProps) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
        {required && <span className="ml-0.5 text-orange-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export default RequestAudit;
