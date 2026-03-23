import { apiClient } from '@/core/api/axios.instance'
import type { AdminCompany, AdminUser, GlobalTransaction } from '../types/admin.dto'

export const adminService = {
  getCompanies: async (): Promise<AdminCompany[]> => {
    const { data } = await apiClient.get('/vietrecruit/v1/admin/companies')
    return data.content ?? data
  },
  
  getUsers: async (): Promise<AdminUser[]> => {
    const { data } = await apiClient.get('/vietrecruit/v1/admin/users')
    return data.content ?? data
  },
  
  toggleUserBan: async (userId: string, isBanned: boolean): Promise<AdminUser> => {
    const { data } = await apiClient.patch(`/vietrecruit/v1/admin/users/${userId}/ban`, { isBanned })
    return data
  },
  
  getTransactions: async (): Promise<GlobalTransaction[]> => {
    const { data } = await apiClient.get('/vietrecruit/v1/admin/transactions')
    return data.content ?? data
  }
}
