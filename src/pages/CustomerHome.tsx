import {
  ArrowRight,
  ClipboardList,
  FilePlus2,
  GraduationCap,
  LifeBuoy,
  ScanSearch,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

interface Service {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
  cta: string;
}

const services: Service[] = [
  {
    to: "/file-case",
    icon: FilePlus2,
    title: "File a Case",
    description:
      "Been targeted by a scam, phishing, or other cyber incident? File a case and a council member will reach out.",
    cta: "Start a case",
  },
  {
    to: "/request-audit",
    icon: ScanSearch,
    title: "Request a Cyber Audit",
    description:
      "Get your devices, accounts, or home network reviewed for vulnerabilities by a TECH-NEST volunteer.",
    cta: "Request an audit",
  },
  {
    to: "/avail-training",
    icon: GraduationCap,
    title: "Available Training",
    description:
      "Browse upcoming workshops on phishing, passwords, AI safety, and more — and reserve a seat.",
    cta: "Browse trainings",
  },
  {
    to: "/community-support",
    icon: LifeBuoy,
    title: "Community Support",
    description:
      "Need ongoing help recovering from an incident or setting up safer accounts? Connect with a councillor.",
    cta: "Get support",
  },
  {
    to: "/my-requests",
    icon: ClipboardList,
    title: "My Requests",
    description:
      "See the status of the cases, audits, and support requests you have submitted.",
    cta: "View my requests",
  },
];

function CustomerHome() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary">
          Welcome to TECH-NEST Care
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          How can your community council help you today?
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {services.map(({ to, icon: Icon, title, description, cta }) => (
          <Link
            key={to}
            to={to}
            className="group flex flex-col rounded-xl bg-tertiary p-6 shadow-sm ring-1 ring-gray-100 transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/40"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
              <Icon className="h-6 w-6 text-secondary" strokeWidth={2.25} />
            </div>
            <h2 className="mt-4 text-lg font-bold text-secondary">{title}</h2>
            <p className="mt-2 flex-1 text-sm text-gray-600">{description}</p>
            <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary">
              {cta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default CustomerHome;
