// TODO: BE notification module currently sends async email via Kafka only.
// No in-app notification REST endpoints exist yet.
// This service is a stub — wire up real endpoints when BE exposes them.
// Expected endpoints when ready:
//   GET  /notifications?page=&size=     → PageResponse<NotificationResponse>
//   PUT  /notifications/:id/read        → void
//   PUT  /notifications/read-all        → void
//   GET  /notifications/unread-count    → number

import type { PageResponse } from '@/types/common'

export interface NotificationResponse {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  metadata: Record<string, string> | null
}

export const notificationService = {
  /** GET /notifications — paginated list (stub) */
  async getNotifications(
    _page = 0,
    _size = 20,
  ): Promise<PageResponse<NotificationResponse>> {
    // TODO: replace with real API call when BE endpoint is ready
    return {
      content: [],
      page: 0,
      size: _size,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
      empty: true,
    }
  },

  /** PUT /notifications/:id/read (stub) */
  async markAsRead(_id: string): Promise<void> {
    // TODO: implement when BE endpoint is ready
  },

  /** PUT /notifications/read-all (stub) */
  async markAllAsRead(): Promise<void> {
    // TODO: implement when BE endpoint is ready
  },

  /** GET /notifications/unread-count (stub) */
  async getUnreadCount(): Promise<number> {
    // TODO: implement when BE endpoint is ready
    return 0
  },
}
