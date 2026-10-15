import { Bell, CircleUserRound, Megaphone, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { api } from "../lib/api";
import { timeAgo } from "../lib/format";
import { usePolling } from "../lib/usePolling";
import type { AppNotification, CouncilSettings } from "../types";

function Header() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [councilName, setCouncilName] = useState("");

  usePolling(() => {
    api<AppNotification[]>("/notifications").then(setNotifications).catch(() => {});
  });

  // Refetch on navigation so the council name stays current.
  useEffect(() => {
    api<CouncilSettings>("/settings")
      .then((s) => setCouncilName(s.name))
      .catch(() => {});
  }, [pathname]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleLogOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <header className="bg-secondary text-tertiary">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/40">
            <ShieldCheck className="h-6 w-6 text-primary" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <div className="text-xl font-bold tracking-wide">
              TECH-NEST <span className="italic font-semibold text-primary">Care</span>
            </div>
            <div className="text-xs text-tertiary/70">Community Cyber Support</div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-sm font-medium text-tertiary/90">
            Welcome, {councilName}
          </div>

          <div ref={notifRef} className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen((v) => !v)}
              className="relative rounded-full p-2 hover:bg-white/10"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                  {notifications.length}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-xl bg-white shadow-xl ring-1 ring-gray-200 z-50">
                <div className="border-b border-gray-100 px-4 py-3">
                  <div className="text-sm font-semibold text-secondary">Notifications</div>
                </div>
                <ul className="max-h-96 divide-y divide-gray-100 overflow-y-auto py-1">
                  {notifications.length === 0 && (
                    <li className="px-4 py-3 text-sm text-gray-500">
                      Nothing new.
                    </li>
                  )}
                  {notifications.map((n) => (
                    <li key={n.id}>
                      <Link
                        to={n.to}
                        onClick={() => setNotifOpen(false)}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Megaphone className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-secondary leading-snug">{n.title}</div>
                          <div className="mt-1 text-xs text-gray-400">{timeAgo(n.createdAt)}</div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/30 bg-white/5"
            aria-label="Account"
          >
            <CircleUserRound className="h-7 w-7 text-tertiary/90" strokeWidth={1.75} />
          </div>

          <button
            type="button"
            onClick={handleLogOut}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-secondary hover:bg-primary-hover"
          >
            Log Out
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
