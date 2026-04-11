/** Matches backend Prisma `Role` + optional `ADMIN` used in route guards. */
export type UserRole = 'CITIZEN' | 'RECYCLING_PARTNER' | 'WASTE_STAFF' | 'ADMIN';

export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'SUBMITTED';

export type IssueCategory = string;

export interface User {
  id: string;
  fullname: string;
  email: string;
  role: UserRole;
  points?: number;
  phoneNumber?: string;
  createdAt?: string;
  avatar?: string;
  /** Legacy civic demo (department admin pages) */
  departmentId?: string;
  department?: { id: string; name: string };
  departmentAdmin?: { departmentId: string; department?: { id: string; name: string } };
  staff?: { departmentId: string; department?: { id: string; name: string } };
}

/** Legacy civic-issue type (superadmin / department demo pages). */
export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  beforePhoto?: string;
  afterPhoto?: string;
  reportedBy: string;
  reportedAt: Date;
  assignedTo?: string;
  staff?: {
    user: {
      fullname: string;
    };
  };
  resolvedAt?: Date;
  upvotes: number;
  upvotedBy: string[];
}

export interface StaffMember {
  name: string;
  id: string;
  userId: string;
  departmentId: string;
  user: {
    fullname: string;
    email: string;
    phoneNumber?: string;
  };
  _count?: {
    tasks: number;
  };
  activeTasks: number;
}

export const CATEGORY_LABELS: Record<string, string> = {
  water: 'Water Supply',
  electricity: 'Electricity',
  roads: 'Roads & Potholes',
  sanitation: 'Sanitation',
  streetlights: 'Street Lights',
  drainage: 'Drainage',
};

export const STATUS_LABELS: Record<IssueStatus, string> = {
  SUBMITTED: 'Submitted',
  OPEN: 'Pending',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
};
