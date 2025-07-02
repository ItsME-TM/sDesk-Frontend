// technicianTypes.js
export interface Technician {
  id: number;
  user: any; // SLTUser, can be typed more strictly if needed
  serviceNum: string;
  name: string;
  team: string;
  cat1: string;
  cat2: string;
  cat3: string;
  cat4: string;
  rr: number;
  active: boolean;
  tier: number;
  level: string;
  teamLevel: string;
  designation: string;
  email: string;
  contactNumber: string;
  teamLeader?: boolean;
  assignAfterSignOff?: boolean;
  permanentMember?: boolean;
  subrootUser?: boolean;
}
