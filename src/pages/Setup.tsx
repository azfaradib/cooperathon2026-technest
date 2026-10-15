import { ShieldCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { api } from "../lib/api";

const inputClass =
  "w-full rounded-md border border-gray-300 bg-tertiary px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40";

function Setup() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [available, setAvailable] = useState<boolean | null>(null);
  const [setupToken, setSetupToken] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<{ needsSetup: boolean }>("/setup/status")
      .then((s) => setAvailable(s.needsSetup))
      .catch(() => setAvailable(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api("/setup", {
        method: "POST",
        body: { setupToken, fullName, email, password },
      });
      await signIn(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Setup failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-secondary via-secondary to-slate-800 px-4 py-12">
      <div className="mx-auto max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/40">
            <ShieldCheck className="h-8 w-8 text-primary" strokeWidth={2.25} />
          </div>
          <h1 className="text-3xl font-bold text-tertiary">
            TECH-NEST <span className="italic text-primary">Care</span>
          </h1>
          <p className="mt-1 text-sm text-tertiary/70">First-time admin setup</p>
        </div>

        {available === null ? (
          <p className="text-center text-sm text-tertiary/70">Loading…</p>
        ) : !available ? (
          <div className="rounded-xl bg-tertiary p-6 text-center text-sm text-gray-600 shadow-lg">
            Setup is not available. An admin already exists.{" "}
            <Link to="/login" className="font-semibold text-secondary underline">
              Go to sign in
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-xl bg-tertiary p-6 shadow-lg ring-1 ring-white/10"
          >
            <input
              required
              type="password"
              value={setupToken}
              onChange={(e) => setSetupToken(e.target.value)}
              placeholder="Setup token"
              className={inputClass}
            />
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              className={inputClass}
            />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin email"
              className={inputClass}
            />
            <input
              required
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (8+ characters)"
              className={inputClass}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-btn px-4 py-2.5 text-sm font-semibold text-tertiary hover:bg-btn-hover disabled:opacity-60"
            >
              {busy ? "Please wait…" : "Create admin account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Setup;
