// incidentTypes.ts
export interface Incident {
  incident_number: string;
  informant: string;
  location: string;
  handler: string;
  update_by: string;
  category: string;
  update_on: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  description?: string;
  notify_informant?: boolean;
  urgent_notification_to: string;
  Attachment?: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum IncidentStatus {
  OPEN = "Open",
  IN_PROGRESS = "In Progress",
  HOLD = "Hold",
  CLOSED = "Closed",
}

export enum IncidentPriority {
  MEDIUM = "Medium",
  HIGH = "High",
  CRITICAL = "Critical",
}

export interface Category {
  id: string;
  name: string;
}

export interface IncidentState {
  incidents: Incident[];
  assignedToMe: Incident[];
  assignedByMe: Incident[];
  teamIncidents: Incident[];
  currentIncident: Incident | null;
  categories: Category[]; // Add this line
  loading: boolean;
  error: string | null;
}
