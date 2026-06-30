// frontend/src/services/review.service.ts
import api from './api.js';
import { 
  IReviewRequest, 
  CreateReviewRequestDTO, 
  UpdateReviewStatusDTO,
  ReviewListResponse,
  ReviewStatsResponse
} from '../types/review.js';

class ReviewService {
  private baseUrl = '/review';

  async createReviewRequest(data: CreateReviewRequestDTO): Promise<IReviewRequest> {
    const response = await api.post<IReviewRequest>(`${this.baseUrl}`, data);
    return response.data;
  }

  async getReviewRequests(
    page: number = 1,
    limit: number = 20,
    status?: 'pending' | 'approved' | 'rejected'
  ): Promise<ReviewListResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) {
      params.append('status', status);
    }
    const response = await api.get<ReviewListResponse>(`${this.baseUrl}?${params.toString()}`);
    return response.data;
  }

  async getReviewRequestsByUser(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ReviewListResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    const response = await api.get<ReviewListResponse>(`${this.baseUrl}/user/${userId}?${params.toString()}`);
    return response.data;
  }

  async getReviewById(reviewId: string): Promise<IReviewRequest> {
    const response = await api.get<IReviewRequest>(`${this.baseUrl}/${reviewId}`);
    return response.data;
  }

  async updateReviewStatus(data: UpdateReviewStatusDTO): Promise<IReviewRequest> {
    const response = await api.patch<IReviewRequest>(
      `${this.baseUrl}/${data.reviewId}/status`,
      { status: data.status }
    );
    return response.data;
  }

  async deleteReviewRequest(reviewId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${reviewId}`);
  }

  async addAttachments(reviewId: string, attachments: any[]): Promise<IReviewRequest> {
    const response = await api.post<IReviewRequest>(
      `${this.baseUrl}/${reviewId}/attachments`,
      { attachments }
    );
    return response.data;
  }

  async getReviewStats(): Promise<ReviewStatsResponse> {
    const response = await api.get<ReviewStatsResponse>(`${this.baseUrl}/stats`);
    return response.data;
  }
}

export const reviewService = new ReviewService();