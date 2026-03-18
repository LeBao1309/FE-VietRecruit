// src/features/offer/services/application.service.ts
import { apiClient } from '@/core/api/axios.instance';
import type { PageResponseApplicationSummary } from '../types/application.schema';

export const applicationService = {
  /**
   * Fetches applications with optional filtering.
   * Based on api.json endpoints.
   */
  async getApplications(params?: { status?: string; page?: number; size?: number }): Promise<PageResponseApplicationSummary> {
    const { data } = await apiClient.get('/vietrecruit/applications', { params });
    // Assuming backend wraps response in an ApiResponse object: { success, code, message, data }
    return data.data; 
  }
};
