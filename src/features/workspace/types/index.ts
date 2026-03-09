export type UserRole = 'SYSTEM_ADMIN' | 'COMPANY_ADMIN' | 'HR' | 'INTERVIEWER' | 'CANDIDATE';
export type JobStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';
export type ApplicationStatus = 'NEW' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED';
export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELED';
export type ScorecardResult = 'PASS' | 'FAIL' | 'CONSIDERING';
export type OfferStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'DECLINED';

export interface Company {
  id: string;
  name: string;
  domain?: string | null;
  website?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface User {
  id: string;
  company_id?: string | null;
  email: string;
  password_hash: string;
  full_name: string;
  phone?: string | null;
  avatar_url?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  portfolio_url?: string | null;
  location?: string | null;
  dob?: string | null;
  gender?: string | null;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface Department {
  id: string;
  company_id: string;
  name: string;
  description?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface Location {
  id: string;
  company_id: string;
  name: string;
  address?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  company_id: string;
  name: string;
  created_by?: string | null;
  updated_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Job {
  id: string;
  company_id: string;
  department_id?: string | null;
  location_id?: string | null;
  category_id?: string | null;
  title: string;
  description: string;
  requirements?: string | null;
  min_salary?: number | null;
  max_salary?: number | null;
  currency?: string;
  is_negotiable?: boolean;
  status: JobStatus;
  deadline?: string | null;
  public_link?: string | null;
  embedding?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface Candidate {
  id: string;
  user_id: string;
  headline?: string | null;
  summary?: string | null;
  default_cv_url?: string | null;
  cv_embedding?: string | null;
  parsed_cv_text?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  applied_cv_url: string;
  cover_letter?: string | null;
  status: ApplicationStatus;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface ApplicationStatusHistory {
  id: string;
  application_id: string;
  old_status?: ApplicationStatus | null;
  new_status: ApplicationStatus;
  notes?: string | null;
  changed_by?: string | null;
  changed_at?: string;
}

export interface Interview {
  id: string;
  application_id: string;
  title: string;
  scheduled_at: string;
  duration_minutes?: number;
  location_or_link?: string | null;
  interview_type?: string | null;
  status: InterviewStatus;
  created_by?: string | null;
  updated_by?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface InterviewInterviewer {
  interview_id: string;
  user_id: string;
}

export interface Scorecard {
  id: string;
  interview_id: string;
  interviewer_id: string;
  skill_score?: number | null;
  attitude_score?: number | null;
  english_score?: number | null;
  average_score?: number | null;
  comments?: string | null;
  result: ScorecardResult;
  created_by?: string | null;
  updated_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Offer {
  id: string;
  application_id: string;
  offer_letter_url?: string | null;
  base_salary: number;
  currency?: string;
  start_date?: string | null;
  note?: string | null;
  status: OfferStatus;
  created_by?: string | null;
  updated_by?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// UI specific combined interfaces for ease of mock UI rendering
// These represent API queries that return joined relational data
export interface ApplicationWithDetails extends Application {
  candidate: Candidate & {
    user: User;
  };
  job: Job & {
    department?: Department;
  };
  scorecards?: Scorecard[];
  interviews?: Interview[];
}

export interface JobWithDetails extends Job {
  department?: Department;
  location?: Location;
  applicationCount?: number; // Generated count mock field
}

export interface InterviewWithDetails extends Interview {
  application: ApplicationWithDetails;
  interviewers: User[];
}
