import {
  AlertTriangle,
  BookOpen,
  GraduationCap,
  Home,
  ScanSearch,
  Settings as SettingsIcon,
  Users,
  type LucideIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/training", label: "Training Programs", icon: GraduationCap },
  { to: "/incidents", label: "Incident Reports", icon: AlertTriangle },
  { to: "/audits", label: "Audit Requests", icon: ScanSearch },
  { to: "/support", label: "Community Support", icon: Users },
  { to: "/resources", label: "Resources", icon: BookOpen },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

function Sidebar() {
  return (
    <aside className="flex w-64 flex-col border-r border-gray-200 bg-tertiary py-6">
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-secondary border-l-4 border-primary pl-3"
                      : "text-gray-700 hover:bg-gray-50",
                  ].join(" ")
                }
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
