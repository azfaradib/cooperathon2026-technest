import { CheckCircle2, FilePlus2, Paperclip, X } from "lucide-react";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Select from "../components/Select";
import FileThumb from "../components/FileThumb";
import { api } from "../lib/api";
import type { IncidentReport } from "../types";

const issueTypes = [
  "Identity Theft",
  "Phishing Email",
  "Phone Scam",
  "Account Takeover",
  "Malware",
  "Online Harassment",
  "Other",
];

const urgencyLevels = ["Low", "Medium", "High"] as const;

const MAX_FILES = 5;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

function FileCase() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [issueType, setIssueType] = useState(issueTypes[0]);
  const [urgency, setUrgency] = useState<(typeof urgencyLevels)[number]>("Medium");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [uploadWarning, setUploadWarning] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const created = await api<IncidentReport>("/incidents", {
        method: "POST",
        body: {
          resident: fullName,
          email,
          phone,
          issueType,
          urgency,
          description,
        },
      });
      setReferenceId(`TNC-${created.id.slice(0, 8).toUpperCase()}`);

      // The case already exists at this point, so an upload failure is only a warning.
      if (attachments.length > 0) {
        const form = new FormData();
        attachments.forEach((f) => form.append("files", f));
        try {
          await api(`/incidents/${created.id}/attachments`, {
            method: "POST",
            body: form,
          });
        } catch (err) {
          setUploadWarning(
            `Your case was filed, but the attachments could not be uploaded: ${
              err instanceof Error ? err.message : "unknown error"
            }. Please tell the council member who contacts you.`,
          );
        }
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit case");
    } finally {
      setBusy(false);
    }
  };

  const handleFileAnother = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setIssueType(issueTypes[0]);
    setUrgency("Medium");
    setDescription("");
    setAttachments([]);
    setUploadWarning("");
    setSubmitted(false);
  };

  const handleFilesPicked = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const picked = Array.from(e.target.files);
    e.target.value = "";

    if (picked.some((f) => f.size > MAX_FILE_BYTES)) {
      setError("Each file must be 5 MB or smaller.");
      return;
    }
    if (attachments.length + picked.length > MAX_FILES) {
      setError(`You can attach at most ${MAX_FILES} files.`);
      return;
    }
    setError("");
    setAttachments((prev) => [...prev, ...picked]);
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
          Case filed successfully
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Thank you, {fullName || "resident"}. Your community council has been
          notified and will reach out within 24 hours.
        </p>
        {uploadWarning && (
          <p className="mt-2 text-sm text-orange-600">{uploadWarning}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Reference ID:{" "}
          <span className="font-mono font-semibold text-secondary">
            {referenceId}
          </span>
        </p>
        <button
          type="button"
          onClick={handleFileAnother}
          className="mt-6 rounded-md bg-btn px-5 py-2.5 text-sm font-semibold text-tertiary hover:bg-btn-hover"
        >
          File another case
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
          <FilePlus2 className="h-5 w-5 text-secondary" strokeWidth={2.25} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-secondary">File a New Case</h1>
          <p className="mt-1 text-sm text-gray-600">
            Tell us what happened. A council member will review your case and
            contact you with next steps.
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
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
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
          <Field label="Phone (optional)">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(514) 555-0100"
              className={inputClass}
            />
          </Field>
          <Field label="Issue Type" required>
            <Select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
            >
              {issueTypes.map((t) => (
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
            <Field label="What happened?" required>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Describe the incident, when it happened, and any details you remember."
                className={inputClass}
              />
            </Field>
          </div>

          <div className="md:col-span-2">
            <Field label="Attachments (optional)">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".png,.jpg,.jpeg,.webp,.gif,.pdf,.txt,.eml"
                onChange={handleFilesPicked}
                className="hidden"
                aria-label="Add attachments"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-secondary hover:bg-gray-50"
              >
                <Paperclip className="h-4 w-4" />
                Add screenshots, emails, or other files
              </button>
              <p className="mt-1.5 text-xs text-gray-500">
                Anything that helps us understand what happened. Up to 5
                files, 5 MB each (images, PDF, text, or .eml).
              </p>

              {attachments.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {attachments.map((file, idx) => (
                    <li
                      key={`${file.name}-${idx}`}
                      className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <FileThumb file={file} />
                        <span className="truncate font-medium text-secondary">
                          {file.name}
                        </span>
                        <span className="shrink-0 text-xs text-gray-500">
                          {formatSize(file.size)}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="ml-3 rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-secondary"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Field>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-5">
          <p className="text-xs text-gray-500">
            Your information stays with your community council and TECH-NEST
            Care staff.
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-btn px-6 py-2.5 text-sm font-semibold text-tertiary hover:bg-btn-hover disabled:opacity-60"
          >
            {busy ? "Submitting…" : "Submit Case"}
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
  children: React.ReactNode;
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

export default FileCase;
