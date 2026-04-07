import { defineStore } from 'pinia'
import { ref } from 'vue'
import { notificationService, type NotificationResponse } from '@/services/notificationService'
import type { PageResponse } from '@/types/common'

export const useNotificationStore = defineStore('notification', () => {
  // ── State ──────────────────────────────────────────────────────────
  const notifications = ref<NotificationResponse[]>([])
  const unreadCount = ref(0)
  const loading = ref(false)
  const hasMore = ref(false)
  const currentPage = ref(0)

  // ── Actions ────────────────────────────────────────────────────────
  async function fetchNotifications(page = 0, size = 20): Promise<void> {
    loading.value = true
    try {
      const result: PageResponse<NotificationResponse> =
        await notificationService.getNotifications(page, size)
      if (page === 0) {
        notifications.value = result.content
      } else {
        notifications.value = [...notifications.value, ...result.content]
      }
      currentPage.value = page
      hasMore.value = !result.last
    } finally {
      loading.value = false
    }
  }

  async function fetchUnreadCount(): Promise<void> {
    unreadCount.value = await notificationService.getUnreadCount()
  }

  async function markAsRead(id: string): Promise<void> {
    await notificationService.markAsRead(id)
    const n = notifications.value.find((n) => n.id === id)
    if (n) {
      n.isRead = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  async function markAllAsRead(): Promise<void> {
    await notificationService.markAllAsRead()
    notifications.value.forEach((n) => (n.isRead = true))
    unreadCount.value = 0
  }

  async function loadMore(): Promise<void> {
    if (!hasMore.value || loading.value) return
    await fetchNotifications(currentPage.value + 1)
  }

  return {
    notifications,
    unreadCount,
    loading,
    hasMore,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    loadMore,
  }
})
