export type TrainingCategory =
  | "Phishing"
  | "Passwords"
  | "AI Safety"
  | "Social Engineering"
  | "General";

export interface TrainingProgram {
  id: string;
  title: string;
  category: TrainingCategory;
  nextSession: string | null;
  capacity: number;
  enrolled: number;
  registered: boolean;
  description: string;
}

export type IncidentStatus = "New" | "In Progress" | "Resolved";

export interface IncidentReport {
  id: string;
  resident: string;
  issueType: string;
  status: IncidentStatus;
  date: string;
  description: string;
  email?: string | null;
  phone?: string | null;
  urgency?: CasePriority;
  assignedTo?: string | null;
  attachmentCount?: number;
}

export interface Attachment {
  id: string;
  fileName: string;
  contentType: string;
  size: number;
  url: string;
}

export type CasePriority = "Low" | "Medium" | "High";

export interface SupportCase {
  id: string;
  resident: string;
  contact: string;
  issueType: string;
  priority: CasePriority;
  status: IncidentStatus;
  assignedTo: string | null;
  description: string;
  notes: string;
  updatedAt: string;
}

export type AuditStatus = "New" | "In Progress" | "Completed";

export interface AuditRequest {
  id: string;
  name: string;
  email: string;
  target: string;
  deviceCount: number;
  contactMethod: "Email" | "Phone" | "In Person";
  preferredTime: string | null;
  context: string | null;
  status: AuditStatus;
  assignedTo: string | null;
  date: string;
}

export type ResourceCategory = "Guide" | "Tip" | "Download";

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  content: string[];
  readTime?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  to: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  fullName: string | null;
  email: string;
}

export interface CouncilSettings {
  name: string;
  region: string;
  contactEmail: string;
  notifyIncidents: boolean;
  notifyTraining: boolean;
  weeklyDigest: boolean;
  productUpdates: boolean;
}

export interface Update {
  id: string;
  title: string;
  type: "alert" | "webinar" | "tip";
}
