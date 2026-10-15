import { Check, Copy, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import Modal from "./Modal";

interface Contact {
  name: string;
  region: string;
  email: string;
}

function ContactModal({ onClose }: { onClose: () => void }) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api<Contact>("/contact")
      .then(setContact)
      .catch((err: Error) => setError(err.message));
  }, []);

  const copy = async () => {
    if (!contact) return;
    await navigator.clipboard.writeText(contact.email);
    setCopied(true);
  };

  return (
    <Modal title="Contact TECH-NEST" subtitle="We're here to help." onClose={onClose}>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!contact && !error && <p className="text-sm text-gray-500">Loading…</p>}
      {contact && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Questions about a case, an audit, or a training session? Email{" "}
            <span className="font-medium text-secondary">{contact.name}</span>
            {contact.region && ` (${contact.region})`} and we'll get back to you.
          </p>
          <div className="rounded-md bg-gray-50 px-4 py-3 text-sm font-medium text-secondary ring-1 ring-gray-100">
            {contact.email}
          </div>
          <div className="flex gap-3">
            <a
              href={`mailto:${contact.email}?subject=${encodeURIComponent("TECH-NEST Care inquiry")}`}
              className="inline-flex items-center gap-2 rounded-md bg-btn px-4 py-2 text-sm font-semibold text-tertiary hover:bg-btn-hover"
            >
              <Mail className="h-4 w-4" /> Send an email
            </a>
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy address"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default ContactModal;
