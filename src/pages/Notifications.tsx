import { Megaphone } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { api } from "../lib/api";
import { timeAgo } from "../lib/format";
import { usePolling } from "../lib/usePolling";
import type { AppNotification } from "../types";

function Notifications() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  usePolling(() => {
    api<AppNotification[]>("/notifications")
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  });

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="New requests waiting for the council."
      />

      <div className="max-w-2xl space-y-3">
        {loading && <p className="text-sm text-gray-500">Loading…</p>}
        {!loading && items.length === 0 && (
          <p className="text-sm text-gray-500">Nothing new.</p>
        )}
        {items.map((n) => (
          <Link
            key={n.id}
            to={n.to}
            className="flex items-start gap-4 rounded-xl bg-white p-4 ring-1 ring-gray-100 shadow-sm hover:ring-primary/40"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Megaphone className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-secondary">{n.title}</div>
              <div className="mt-0.5 text-xs text-gray-400">{timeAgo(n.createdAt)}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Notifications;
