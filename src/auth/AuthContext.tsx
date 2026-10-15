import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "../lib/api";
import { supabase } from "../lib/supabase";

export type Role = "admin" | "customer";

interface Me {
  id: string;
  email: string;
  role: Role;
  fullName: string | null;
}

interface AuthState {
  role: Role | null;
  user: Me | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  // Resolves true when Supabase requires email confirmation before sign-in.
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async (session: Session | null) => {
      let me: Me | null = null;
      if (session) {
        me = await api<Me>("/me", { token: session.access_token }).catch(
          () => null,
        );
      }
      if (active) {
        setUser(me);
        setLoading(false);
      }
    };

    // Fires INITIAL_SESSION on subscribe, so no separate getSession() call is needed.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      void load(session);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    setUser(await api<Me>("/me", { token: data.session.access_token }));
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    if (!data.session) return true;
    setUser(await api<Me>("/me", { token: data.session.access_token }));
    return false;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthCtx.Provider
      value={{ role: user?.role ?? null, user, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
