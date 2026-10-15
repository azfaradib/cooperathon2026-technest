import { ShieldCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { api } from "../lib/api";

const inputClass =
  "w-full rounded-md border border-gray-300 bg-tertiary px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40";

function Login() {
  const { role, loading, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    api<{ needsSetup: boolean }>("/setup/status")
      .then((s) => setNeedsSetup(s.needsSetup))
      .catch(() => {});
  }, []);

  if (!loading && role) {
    return <Navigate to={role === "admin" ? "/" : "/customer"} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else if (await signUp(email, password, fullName)) {
        setNotice("Check your email to confirm your account, then sign in.");
        setMode("signin");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
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
          <p className="mt-1 text-sm text-tertiary/70">
            Community Cyber Support —{" "}
            {mode === "signin" ? "Sign In" : "Create Account"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl bg-tertiary p-6 shadow-lg ring-1 ring-white/10"
        >
          {mode === "signup" && (
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              className={inputClass}
            />
          )}
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className={inputClass}
          />
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={inputClass}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}
          {notice && <p className="text-sm text-emerald-700">{notice}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-btn px-4 py-2.5 text-sm font-semibold text-tertiary transition-colors hover:bg-btn-hover disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign In" : "Sign Up"}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError("");
            }}
            className="w-full text-center text-xs text-gray-500 hover:text-secondary"
          >
            {mode === "signin"
              ? "New resident? Create an account"
              : "Already have an account? Sign in"}
          </button>
        </form>

        {needsSetup && (
          <p className="mt-4 text-center text-xs text-tertiary/70">
            No admin exists yet.{" "}
            <Link to="/setup" className="font-semibold text-primary underline">
              Run first-time setup
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;
