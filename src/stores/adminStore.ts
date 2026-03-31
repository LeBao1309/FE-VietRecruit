import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AdminUserResponse, UserRequest } from '@/types/user'
import type { PageResponse } from '@/types/common'
import type { TransactionHistoryResponse } from '@/types/subscription'
import { adminUserService } from '@/services/adminUserService'
import { adminPaymentService } from '@/services/adminPaymentService'
import { useUiStore } from './uiStore'

export const useAdminStore = defineStore('admin', () => {
  // ── State ──
  const users = ref<PageResponse<AdminUserResponse> | null>(null)
  const selectedUser = ref<AdminUserResponse | null>(null)
  const transactions = ref<PageResponse<TransactionHistoryResponse> | null>(null)
  const loading = ref(false)
  const userLoading = ref(false)
  const transactionLoading = ref(false)

  // ── Getters ──
  const userList = computed(() => users.value?.content ?? [])
  const transactionList = computed(() => transactions.value?.content ?? [])
  const hasUsers = computed(() => !users.value?.empty)
  const hasTransactions = computed(() => !transactions.value?.empty)

  // ── User Actions ──
  async function fetchUsers(page = 0, size = 20): Promise<void> {
    loading.value = true
    try {
      const result = await adminUserService.listUsers({ page, size, sort: 'createdAt,desc' })
      if (result.data) {
        users.value = result.data
      } else {
        useUiStore().toastError('Failed to load users', result.error?.message ?? '')
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchUser(id: string): Promise<AdminUserResponse | null> {
    userLoading.value = true
    try {
      const result = await adminUserService.getUser(id)
      if (result.data) {
        selectedUser.value = result.data
        return result.data
      } else {
        useUiStore().toastError('Failed to load user', result.error?.message ?? '')
        return null
      }
    } finally {
      userLoading.value = false
    }
  }

  async function createUser(body: UserRequest): Promise<boolean> {
    const ui = useUiStore()
    userLoading.value = true
    try {
      const result = await adminUserService.createUser(body)
      if (result.data) {
        ui.toastSuccess('User created', `${result.data.fullName} has been created.`)
        return true
      } else {
        ui.toastError('Failed to create user', result.error?.message ?? '')
        return false
      }
    } finally {
      userLoading.value = false
    }
  }

  async function updateUser(id: string, body: UserRequest): Promise<boolean> {
    const ui = useUiStore()
    userLoading.value = true
    try {
      const result = await adminUserService.updateUser(id, body)
      if (result.data) {
        selectedUser.value = result.data
        ui.toastSuccess('User updated', `${result.data.fullName} has been updated.`)
        return true
      } else {
        ui.toastError('Failed to update user', result.error?.message ?? '')
        return false
      }
    } finally {
      userLoading.value = false
    }
  }

  async function deleteUser(id: string): Promise<boolean> {
    const ui = useUiStore()
    userLoading.value = true
    try {
      const result = await adminUserService.deleteUser(id)
      if (!result.error) {
        ui.toastSuccess('User deleted', 'The user has been removed.')
        return true
      } else {
        ui.toastError('Failed to delete user', result.error.message)
        return false
      }
    } finally {
      userLoading.value = false
    }
  }

  // ── Transaction Actions ──
  async function fetchTransactions(
    page = 0,
    size = 20,
    companyId?: string,
  ): Promise<void> {
    transactionLoading.value = true
    try {
      const result = await adminPaymentService.getTransactions({
        page,
        size,
        sort: 'createdAt,desc',
        companyId,
      })
      if (result.data) {
        transactions.value = result.data
      } else {
        useUiStore().toastError('Failed to load transactions', result.error?.message ?? '')
      }
    } finally {
      transactionLoading.value = false
    }
  }

  return {
    // state
    users,
    selectedUser,
    transactions,
    loading,
    userLoading,
    transactionLoading,
    // getters
    userList,
    transactionList,
    hasUsers,
    hasTransactions,
    // actions
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
    fetchTransactions,
  }
})
