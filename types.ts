// FIX: Removed self-import of JobType and LocationType which was causing declaration conflicts.
export enum JobType {
  FullTime = 'Full-Time',
  PartTime = 'Part-Time',
  Contract = 'Contract',
  Internship = 'Internship',
}

export enum LocationType {
  Onsite = 'On-site',
  Remote = 'Remote',
  Hybrid = 'Hybrid',
}

export interface Job {
  id: string;
  companyId: string;
  title: string;
  description: string;
  location: string;
  experienceLevel: string;
  salaryMin: number;
  salaryMax: number;
  jobType: JobType;
  locationType: LocationType;
  applicants: string[]; // array of seeker ids
  shortlisted: string[];
  rejected: string[];
}

export interface Review {
    id: string;
    authorId: string;
    reviewerName: string;
    rating: number; // 1-5
    comment: string;
    date: string;
}

export interface Company {
  id: string; // Corresponds to Firebase Auth UID
  name: string;
  email: string;
  password?: string;
  logo: string;
  description: string;
  website: string;
  contactInfo: string;
  officeAddress: string;
  reviews: Review[];
  jobs: string[]; // array of job ids
}

export interface JobAlertsPreferences {
  keywords: string[];
  jobTypes: JobType[];
  locationTypes: LocationType[];
  minSalary: number;
}

export interface JobSeeker {
  id: string; // Corresponds to Firebase Auth UID
  name: string;
  email: string;
  password?: string;
  phone: string;
  photoUrl: string;
  skills: string[];
  resumeUrl: string; // url to pdf
  expectedSalary: number;
  appliedJobs: string[]; // array of job ids
  jobAlertsEnabled: boolean;
  jobAlertsPreferences: JobAlertsPreferences;
}

export interface Admin {
  id: string; // Corresponds to Firebase Auth UID
  email: string;
  password?: string;
}

export type ReactionType = 'like' | 'love' | 'dislike';

export interface Reaction {
  userId: string;
  type: ReactionType;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoUrl: string;
  content: string;
  timestamp: string;
}

export interface BlogPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: 'seeker' | 'company' | 'admin';
  authorPhotoUrl: string;
  content: string;
  timestamp: string;
  reactions: Reaction[];
  comments: Comment[];
}