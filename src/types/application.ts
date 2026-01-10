export type ApplicationStatus = 
  | 'wishlist'
  | 'applied'
  | 'screening'
  | 'interview1'
  | 'interview2'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export type EmploymentType = 
  | 'full-time'
  | 'part-time'
  | 'contract'
  | 'remote'
  | 'hybrid';

export type Platform = 
  | 'linkedin'
  | 'email'
  | 'website'
  | 'referral'
  | 'recruiter'
  | 'indeed'
  | 'glassdoor'
  | 'other';

export interface JobApplication {
  id: string;
  jobTitle: string;
  company: string;
  platform: Platform;
  location: string;
  employmentType: EmploymentType;
  dateApplied: string;
  jobUrl?: string;
  status: ApplicationStatus;
  lastContactDate?: string;
  followUpDueDate?: string;
  nextAction?: string;
  contactName?: string;
  contactEmail?: string;
  contactLinkedIn?: string;
  notes?: string;
  salaryRange?: string;
  keyRequirements?: string;
  createdAt: string;
  updatedAt: string;
}

export const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string }> = {
  wishlist: { label: 'Wishlist', color: 'status-wishlist' },
  applied: { label: 'Applied', color: 'status-applied' },
  screening: { label: 'HR Screening', color: 'status-screening' },
  interview1: { label: 'Interview 1', color: 'status-interview1' },
  interview2: { label: 'Final Interview', color: 'status-interview2' },
  offer: { label: 'Offer', color: 'status-offer' },
  rejected: { label: 'Rejected', color: 'status-rejected' },
  withdrawn: { label: 'Withdrawn', color: 'status-withdrawn' },
};

export const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'email', label: 'Email' },
  { value: 'website', label: 'Company Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'recruiter', label: 'Recruiter' },
  { value: 'indeed', label: 'Indeed' },
  { value: 'glassdoor', label: 'Glassdoor' },
  { value: 'other', label: 'Other' },
];

export const EMPLOYMENT_TYPE_OPTIONS: { value: EmploymentType; label: string }[] = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
];
