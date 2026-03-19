import { apiClient } from '@/core/api/axios.instance'
import type { CandidateProfileResponse, CandidateUpdateRequest, CvUploadResponse } from '../types/candidate.schema'

export const candidateService = {
  getProfile: async (): Promise<CandidateProfileResponse> => {
    const response = await apiClient.get('/vietrecruit/candidates/me')
    return response.data.data
  },

  updateProfile: async (data: CandidateUpdateRequest): Promise<CandidateProfileResponse> => {
    const response = await apiClient.put('/vietrecruit/candidates/me', data)
    return response.data.data
  },

  uploadCv: async (file: File): Promise<CvUploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post('/vietrecruit/candidates/me/cv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data.data
  },

  deleteCv: async (): Promise<void> => {
    await apiClient.delete('/vietrecruit/candidates/me/cv')
  }
}
