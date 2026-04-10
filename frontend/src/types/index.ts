
export type UserRole = 'CITIZEN' | 'DEPARTMENT_ADMIN' | 'STAFF' | 'SUPER_ADMIN';

export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'SUBMITTED';

export type IssueCategory = string; 

export interface User {
  name: string;
  id: string;
  fullname: string; 
  email: string;
  role: UserRole;
  departmentId?: string; 
  department?: {
    id: string;
    name: string;
  } | any; 
  departmentAdmin?: {
    departmentId: string;
    department?: {
      id: string;
      name: string;
    };
  };
  staff?: {
    departmentId: string;
    department?: {
      id: string;
      name: string;
    };
  };
  points?: number;
  avatar?: string;
}

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
  // Staff nesting for frontend display
  staff?: {
    user: {
      fullname: string;
    }
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
  activeTasks: number; // Legacy support for UI
}

// ✅ Dynamic Label Helper
// Kyunki categories ab dynamic hain, hum ise string keys par map karenge
export const CATEGORY_LABELS: Record<string, string> = {
  water: 'Water Supply',
  electricity: 'Electricity',
  roads: 'Roads & Potholes',
  sanitation: 'Sanitation',
  streetlights: 'Street Lights',
  drainage: 'Drainage',
};

// ✅ Backend Status Labels (Sync with Database Enum)
export const STATUS_LABELS: Record<IssueStatus, string> = {
  SUBMITTED: 'Submitted',
  OPEN: 'Pending',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
};