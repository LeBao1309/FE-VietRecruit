import { apiClient } from '@/core/api/axios.instance'
import type { UserProfileResponse, UserUpdateRequest } from '../types/candidate.schema'

export const userService = {
  getUserProfile: async (): Promise<UserProfileResponse> => {
    const response = await apiClient.get('/vietrecruit/users/me')
    return response.data.data
  },

  updateUserProfile: async (data: UserUpdateRequest): Promise<UserProfileResponse> => {
    const response = await apiClient.put('/vietrecruit/users/me', data)
    return response.data.data
  },

  uploadAvatar: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post('/vietrecruit/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return { url: response.data.data.avatarUrl }
  },

  setAvatarUrl: async (url: string): Promise<void> => {
    await apiClient.put('/vietrecruit/users/me/avatar/url', { url })
  },

  deleteAvatar: async (): Promise<void> => {
    await apiClient.delete('/vietrecruit/users/me/avatar')
  },

  uploadBanner: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post('/vietrecruit/users/me/banner', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return { url: response.data.data.bannerUrl }
  },

  setBannerUrl: async (url: string): Promise<void> => {
    await apiClient.put('/vietrecruit/users/me/banner/url', { url })
  },

  deleteBanner: async (): Promise<void> => {
    await apiClient.delete('/vietrecruit/users/me/banner')
  }
}
