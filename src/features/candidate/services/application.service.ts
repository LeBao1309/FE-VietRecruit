import { apiClient } from '@/core/api/axios.instance'
import type { 
  ApplicationCreateRequest, 
  ApplicationSummaryResponse,
  ApplicationResponse,
  ApplicationStatusHistoryResponse,
  InterviewResponse,
  OfferResponse
} from '../types/application.schema'

export const applicationService = {
  apply: async (data: ApplicationCreateRequest): Promise<void> => {
    await apiClient.post('/vietrecruit/applications', data)
  },

  listMyApplications: async (params: any): Promise<{ content: ApplicationSummaryResponse[], totalElements: number, totalPages: number }> => {
    const response = await apiClient.get('/vietrecruit/applications/mine', { params })
    const payload = response.data.data || response.data
    return {
      content: payload.content || payload.data || [],
      totalElements: payload.totalElements || 0,
      totalPages: payload.totalPages || 0
    }
  },

  getApplication: async (id: string): Promise<ApplicationResponse> => {
    const response = await apiClient.get(`/vietrecruit/applications/${id}`)
    return response.data.data
  },

  getStatusHistory: async (id: string): Promise<ApplicationStatusHistoryResponse[]> => {
    const response = await apiClient.get(`/vietrecruit/applications/${id}/status-history`)
    return response.data.data || []
  },

  listInterviews: async (id: string): Promise<InterviewResponse[]> => {
    const response = await apiClient.get(`/vietrecruit/applications/${id}/interviews`)
    return response.data.data || []
  },

  listOffers: async (id: string): Promise<OfferResponse[]> => {
    const response = await apiClient.get(`/vietrecruit/applications/${id}/offers`)
    return response.data.data || []
  },

  respondToOffer: async (offerId: string, action: 'ACCEPT' | 'DECLINE'): Promise<void> => {
    await apiClient.put(`/vietrecruit/offers/${offerId}/respond`, { action })
  }
}
