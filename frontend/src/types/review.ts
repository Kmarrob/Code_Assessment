// frontend/src/types/review.ts

export interface IAttachment {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt?: Date;
}

export interface IReviewRequest {
  _id: string;
  companyId: string;
  responseId: string;
  userId: string;
  repId: string;
  controlId: string;
  justification: string;
  attachments: IAttachment[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  // Populados pelo backend
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  rep?: {
    _id: string;
    name: string;
    email: string;
  };
  control?: {
    _id: string;
    name: string;
    id: string;
  };
  response?: {
    _id: string;
    maturityLevel: number;
    scenario: string;
    observations: string;
  };
}

export interface CreateReviewRequestDTO {
  responseId: string;
  userId: string;
  controlId: string;
  justification: string;
  attachments?: IAttachment[];
  companyId?: string;
}

export interface UpdateReviewStatusDTO {
  reviewId: string;
  status: 'approved' | 'rejected';
  companyId?: string;
}

export interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface ReviewListResponse {
  success: boolean;
  data: IReviewRequest[];
  pagination: {
    page: number;
    total: number;
    totalPages: number;
    limit: number;
  };
}

export interface ReviewStatsResponse {
  success: boolean;
  data: ReviewStats;
}