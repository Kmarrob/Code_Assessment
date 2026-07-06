// frontend/src/types/report.ts

export interface TeamMember {
  name: string;
  role: string;
  email: string;
}

export interface Report {
  _id: string;
  companyId: string;
  projectNumber?: string;
  scope?: string;
  assessmentStartDate?: Date | string;
  assessmentEndDate?: Date | string;
  clientTeam: TeamMember[];
  consultantTeam: TeamMember[];
  status: 'draft' | 'in_review' | 'finalized' | 'archived';
  generatedBy?: string;
  generatedAt?: Date | string;
  updatedBy?: string;
  updatedAt?: Date | string;
  changeHistory?: Array<{
    changedBy: string;
    changes: string;
    changedAt: Date | string;
  }>;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ReportStats {
  totalUsers: number;
  totalResponses: number;
  totalControls: number;
  completionRate: number;
}

export interface ReportDashboardData {
  report: Report;
  stats: ReportStats;
}

export interface ReportListResponse {
  reports: Report[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateReportData {
  projectNumber?: string;
  scope?: string;
  status?: 'draft' | 'in_review' | 'finalized' | 'archived';
}