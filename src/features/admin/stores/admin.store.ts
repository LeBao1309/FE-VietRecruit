import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminMockService } from '../services/admin-mock.service'
import type { AdminCompany, AdminUser, GlobalTransaction } from '../types/admin.dto'

export const useAdminStore = defineStore('admin', () => {
  const companies = ref<AdminCompany[]>([])
  const users = ref<AdminUser[]>([])
  const transactions = ref<GlobalTransaction[]>([])
  
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchCompanies = async () => {
    isLoading.value = true
    error.value = null
    try {
      companies.value = await adminMockService.getCompanies()
    } catch (err: any) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const fetchUsers = async () => {
    isLoading.value = true
    error.value = null
    try {
      users.value = await adminMockService.getUsers()
    } catch (err: any) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const toggleUserBan = async (userId: string, isBanned: boolean) => {
    isLoading.value = true
    error.value = null
    try {
      const updatedUser = await adminMockService.toggleUserBan(userId, isBanned)
      const index = users.value.findIndex(u => u.id === userId)
      if (index !== -1) {
        users.value[index] = updatedUser
      }
    } catch (err: any) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  const fetchTransactions = async () => {
    isLoading.value = true
    error.value = null
    try {
      transactions.value = await adminMockService.getTransactions()
    } catch (err: any) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  return {
    companies,
    users,
    transactions,
    isLoading,
    error,
    fetchCompanies,
    fetchUsers,
    toggleUserBan,
    fetchTransactions
  }
})
