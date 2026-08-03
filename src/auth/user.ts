export type UserRole = 'participant' | 'scout';

export type RecruitmentStatus =
  | 'Recruited'
  | 'Trial Invited'
  | 'Shortlisted'
  | 'Under Review'
  | 'Rejected'
  | 'Pending';

export interface AthleteProfile {
  athleteId?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  height?: number; // in cm
  weight?: number; // in kg
  bmi?: number;
  sport?: string;
  position?: string;
  experienceLevel?: string;
  dominantHand?: 'Right' | 'Left' | 'Ambidextrous';
  dominantLeg?: 'Right' | 'Left' | 'Both';
  school?: string;
  college?: string;
  academy?: string;
  district?: string;
  state?: string;
  country?: string;
  scoutScore?: number;
  strengthScore?: number;
  enduranceScore?: number;
  speedScore?: number;
  agilityScore?: number;
  balanceScore?: number;
  flexibilityScore?: number;
  reactionTime?: number; // in seconds
  jumpHeight?: number; // in cm
  sprintTime?: number; // in seconds
  formAccuracy?: number; // in %
  consistencyScore?: number; // in %
  recruitmentStatus?: RecruitmentStatus;
  recruitDate?: string | null;
  recruitedBy?: string | null;
  contactDetails?: string;
}

export interface OnFormUser extends AthleteProfile {
  email: string;
  name: string;
  role: UserRole;
  password: string;
  createdAt: string;
}

export interface PublicUser extends AthleteProfile {
  email: string;
  name: string;
  role: UserRole;
}

export function toPublicUser(u: OnFormUser): PublicUser {
  const { password, ...publicUser } = u;
  return publicUser;
}

