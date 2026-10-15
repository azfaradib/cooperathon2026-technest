import { CheckCircle2, LifeBuoy } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import Select from "../components/Select";
import { api } from "../lib/api";
import type { SupportCase } from "../types";

const supportTypes = [
  "Account recovery help",
  "Help recovering from a scam",
  "Setting up safer devices",
  "Ongoing one-on-one mentorship",
  "Help for a family member",
  "Other",
];

const urgencyLevels = ["Low", "Medium", "High"] as const;

function CommunitySupportRequest() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [supportType, setSupportType] = useState(supportTypes[0]);
  const [urgency, setUrgency] = useState<(typeof urgencyLevels)[number]>("Medium");
  const [description, setDescription] = useState("");
  const [followUp, setFollowUp] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const created = await api<SupportCase>("/support-cases", {
        method: "POST",
        body: {
          resident: name,
          contact,
          issueType: supportType,
          priority: urgency,
          description,
          followUp,
        },
      });
      setReferenceId(`TNC-S-${created.id.slice(0, 8).toUpperCase()}`);
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
          Support request received
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          A councillor will reach out at <strong>{contact}</strong> to help with
          “{supportType.toLowerCase()}”.
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
          <LifeBuoy className="h-5 w-5 text-secondary" strokeWidth={2.25} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-secondary">
            Community Support
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Need ongoing help? A councillor will partner with you for as long as
            you need.
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
          <Field label="Email or Phone" required>
            <input
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="jane@example.com or (514) 555-0100"
              className={inputClass}
            />
          </Field>
          <Field label="Type of support" required>
            <Select
              value={supportType}
              onChange={(e) => setSupportType(e.target.value)}
            >
              {supportTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </Field>

          <Field label="Urgency" required>
            <div className="flex gap-2">
              {urgencyLevels.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setUrgency(level)}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    urgency === level
                      ? "border-btn bg-btn text-tertiary"
                      : "border-gray-200 bg-tertiary text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </Field>

          <div className="md:col-span-2">
            <Field label="Tell us more" required>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="What kind of help are you looking for, and what have you tried so far?"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="md:col-span-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-md border border-gray-200 p-3 hover:bg-gray-50">
              <input
                type="checkbox"
                checked={followUp}
                onChange={(e) => setFollowUp(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary"
              />
              <span className="text-sm text-secondary">
                I'm okay with the councillor following up periodically to check
                in.
              </span>
            </label>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-5">
          <p className="text-xs text-gray-500">
            All requests are confidential within TECH-NEST Care.
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-btn px-6 py-2.5 text-sm font-semibold text-tertiary hover:bg-btn-hover disabled:opacity-60"
          >
            {busy ? "Sending…" : "Send Request"}
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

export default CommunitySupportRequest;
