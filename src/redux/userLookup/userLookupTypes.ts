// User lookup types - matching backend SLTUser entity
export interface LookupUser {
  id: string;
  azureId: string;
  serviceNum: string;
  display_name: string;
  email: string;
  role: 'user' | 'admin' | 'technician' | 'teamLeader' | 'superAdmin';
  createdAt?: string;
  updatedAt?: string;
}

export interface UserLookupState {
  loading: boolean;
  user: LookupUser | null;
  error: string | null;
}
