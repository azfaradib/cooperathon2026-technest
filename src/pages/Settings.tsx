import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Button from "../components/Button";
import Card from "../components/Card";
import PageHeader from "../components/PageHeader";
import { api } from "../lib/api";
import type { AdminUser, CouncilSettings } from "../types";

function Toggle({
  label,
  description,
  on,
  onChange,
}: {
  label: string;
  description: string;
  on: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <div className="text-sm font-medium text-secondary">{label}</div>
        <div className="text-xs text-gray-500">{description}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!on)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
          on ? "bg-btn" : "bg-gray-300"
        }`}
        aria-pressed={on}
      >
        <span
          className={`absolute top-1/2 left-0.5 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            on ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<CouncilSettings | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminNotice, setAdminNotice] = useState("");

  useEffect(() => {
    api<AdminUser[]>("/admins")
      .then(setAdmins)
      .catch((err: Error) => setAdminError(err.message));
  }, []);

  const handleAddAdmin = async (e: FormEvent) => {
    e.preventDefault();
    setAdminError("");
    setAdminNotice("");
    try {
      await api("/admins", {
        method: "POST",
        body: { fullName: adminName, email: adminEmail, password: adminPassword },
      });
      setAdmins(await api<AdminUser[]>("/admins"));
      setAdminNotice(`${adminEmail} is now an admin.`);
      setAdminName("");
      setAdminEmail("");
      setAdminPassword("");
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : "Could not add admin");
    }
  };

  const handleRemoveAdmin = async (id: string) => {
    setAdminError("");
    setAdminNotice("");
    try {
      await api(`/admins/${id}`, { method: "DELETE" });
      setAdmins((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : "Could not remove admin");
    }
  };

  useEffect(() => {
    api<CouncilSettings>("/settings")
      .then(setSettings)
      .catch((err: Error) => setError(err.message));
  }, []);

  const update = <K extends keyof CouncilSettings>(
    key: K,
    value: CouncilSettings[K],
  ) => {
    setSaved(false);
    setSettings((s) => (s ? { ...s, [key]: value } : s));
  };

  const handleSave = async () => {
    if (!settings) return;
    setError("");
    try {
      setSettings(
        await api<CouncilSettings>("/settings", { method: "PUT", body: settings }),
      );
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save settings");
    }
  };

  const handleLogOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Manage your council profile, notifications, and account."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Council Profile">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Council Name
              </label>
              <input
                value={settings?.name ?? ""}
                onChange={(e) => update("name", e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Region
              </label>
              <input
                value={settings?.region ?? ""}
                onChange={(e) => update("region", e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Contact Email
              </label>
              <input
                type="email"
                value={settings?.contactEmail ?? ""}
                onChange={(e) => update("contactEmail", e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {saved && <p className="text-sm text-emerald-700">Settings saved.</p>}
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </Card>

        <Card title="Notification Preferences">
          <div className="divide-y divide-gray-100">
            <Toggle
              label="New incident reports"
              description="Email me when a resident files a new report."
              on={settings?.notifyIncidents ?? false}
              onChange={(v) => update("notifyIncidents", v)}
            />
            <Toggle
              label="Training reminders"
              description="Notify me 24h before a scheduled session."
              on={settings?.notifyTraining ?? false}
              onChange={(v) => update("notifyTraining", v)}
            />
            <Toggle
              label="Weekly digest"
              description="Send a summary of community activity each Monday."
              on={settings?.weeklyDigest ?? false}
              onChange={(v) => update("weeklyDigest", v)}
            />
            <Toggle
              label="TECH-NEST product updates"
              description="Occasional emails about new features and resources."
              on={settings?.productUpdates ?? false}
              onChange={(v) => update("productUpdates", v)}
            />
          </div>
        </Card>

        <Card title="Council Members (Admins)" className="lg:col-span-2">
          <ul className="divide-y divide-gray-100">
            {admins.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-secondary">
                    {a.fullName ?? "(no name)"}
                    {a.id === user?.id && (
                      <span className="ml-2 text-xs font-normal text-gray-400">you</span>
                    )}
                  </div>
                  <div className="truncate text-xs text-gray-500">{a.email}</div>
                </div>
                {a.id !== user?.id && (
                  <Button size="sm" variant="ghost" onClick={() => handleRemoveAdmin(a.id)}>
                    Remove admin
                  </Button>
                )}
              </li>
            ))}
          </ul>

          <form
            onSubmit={handleAddAdmin}
            className="mt-4 grid grid-cols-1 gap-3 border-t border-gray-100 pt-4 md:grid-cols-4"
          >
            <input
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              placeholder="Full name"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <input
              required
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="Email"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Password (new accounts)"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <Button type="submit">Add admin</Button>
            <p className="text-xs text-gray-500 md:col-span-4">
              If the email already has an account, it is promoted to admin and the
              password is ignored.
            </p>
            {adminError && <p className="text-sm text-red-600 md:col-span-4">{adminError}</p>}
            {adminNotice && <p className="text-sm text-emerald-700 md:col-span-4">{adminNotice}</p>}
          </form>
        </Card>

        <Card title="Account" className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-secondary">
                Signed in as
              </div>
              <div className="text-xs text-gray-600">{user?.email}</div>
            </div>
            <Button variant="secondary" onClick={handleLogOut}>
              Log Out
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Settings;
