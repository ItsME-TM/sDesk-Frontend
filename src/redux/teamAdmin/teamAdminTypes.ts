// teamAdminTypes.ts
export interface TeamAdmin {
  id: string;
  serviceNumber: string;
  userName: string;
  contactNumber: string;
  designation: string;
  email: string;
  cat1?: string;
  cat2?: string;
  cat3?: string;
  cat4?: string;
  active: boolean;
  assignAfterSignOff: boolean;
  teamId: string;
  teamName: string;
  assignedAt: string;
  createdAt?: string;
  updatedAt?: string;
}
