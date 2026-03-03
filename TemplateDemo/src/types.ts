export type Role = 'candidate' | 'recruiter';

export type JobType = 'Full-time' | 'Part-time' | 'Remote' | 'Contract' | 'Hybrid' | 'On-site';

export type ApplicationStatus = 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Rejected' | 'Withdrawn';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  salaryMin: number;
  salaryMax: number;
  description: string;
  skills: string[];
  department: string;
  postedDays: number;
  isActive: boolean;
}

export interface TimelineEntry {
  status: string;
  date: string;
  message?: string;
}

export interface Application {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  candidateAvatar: string;
  candidateExperience: number;
  candidateSkills: string[];
  jobId: string;
  jobTitle: string;
  company: string;
  status: ApplicationStatus;
  score: number;
  appliedDate: string;
  lastUpdate: string;
  interviewDate?: string;
  interviewTime?: string;
  interviewDuration?: string;
  interviewFormat?: string;
  meetingLink?: string;
  candidateNote?: string;
  rejectionReason?: string;
  privateNotes?: string;
  timeline: TimelineEntry[];
  scoreUpdated?: boolean;
  isGuest?: boolean;
  isBlacklisted?: boolean;
}

export interface WorkExperience {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  major: string;
  year: string;
}

export interface Profile {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  location: string;
  summary: string;
  skills: string[];
  experiences: WorkExperience[];
  education: Education[];
  completionPercent: number;
}

export interface AppNotification {
  id: string;
  recipientRole: Role;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: string;
  metadata?: {
    jobTitle?: string;
    candidateName?: string;
    interviewDate?: string;
    meetingLink?: string;
  };
}

export interface Settings {
  emailNotifications: boolean;
  inAppNotifications: boolean;
  companyName?: string;
  privacyMode?: boolean;
}

export interface InterviewData {
  date: string;
  time: string;
  duration: string;
  format: string;
  meetingLink?: string;
  noteForCandidate?: string;
}

export interface CompanyInfo {
  name: string;
  website: string;
  logoUrl: string;
  about: string;
}

export interface Scorecard {
  appId: string;
  rating: number;
  pros: string;
  cons: string;
  recommendation: 'Strongly Hire' | 'Hire' | 'No Hire';
  createdAt: string;
  recruiterName: string;
}

export interface ActivityComment {
  id: string;
  appId: string;
  type: 'system' | 'comment';
  message: string;
  author?: string;
  timestamp: string;
}
