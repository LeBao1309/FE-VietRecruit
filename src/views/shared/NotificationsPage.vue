<script setup lang="ts">
import { onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notificationStore'
import BaseEmptyState from '@/components/common/BaseEmptyState.vue'
import BaseSkeleton from '@/components/common/BaseSkeleton.vue'

const notificationStore = useNotificationStore()

onMounted(() => {
  notificationStore.fetchNotifications(0, 20)
})
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-slate-900">Thông Báo</h1>
      <button
        v-if="notificationStore.unreadCount > 0"
        @click="notificationStore.markAllAsRead()"
        class="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
      >
        Đánh dấu tất cả đã đọc
      </button>
    </div>

    <!-- Loading skeleton -->
    <div v-if="notificationStore.loading && notificationStore.notifications.length === 0" class="space-y-3">
      <BaseSkeleton v-for="i in 5" :key="i" class="h-20 rounded-xl" />
    </div>

    <!-- Empty state -->
    <BaseEmptyState
      v-else-if="notificationStore.notifications.length === 0"
      title="Không có thông báo"
      description="Bạn chưa có thông báo nào. Hệ thống sẽ gửi thông báo khi có cập nhật về đơn ứng tuyển hoặc lịch phỏng vấn."
      icon="🔔"
    />

    <!-- Notification list -->
    <ul v-else class="space-y-2">
      <li
        v-for="n in notificationStore.notifications"
        :key="n.id"
        :class="[
          'flex items-start gap-3 p-4 rounded-xl border transition-colors cursor-pointer',
          n.isRead
            ? 'bg-white border-slate-200/60 hover:bg-slate-50'
            : 'bg-teal-50/60 border-teal-200/60 hover:bg-teal-50'
        ]"
        @click="notificationStore.markAsRead(n.id)"
      >
        <!-- Unread dot -->
        <div class="mt-1 shrink-0">
          <span
            v-if="!n.isRead"
            class="block w-2 h-2 rounded-full bg-teal-500"
          />
          <span v-else class="block w-2 h-2 rounded-full bg-slate-200" />
        </div>

        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-slate-800 leading-snug">{{ n.title }}</p>
          <p class="text-sm text-slate-600 mt-0.5 leading-relaxed">{{ n.message }}</p>
          <p class="text-xs text-slate-400 mt-1.5">
            {{ new Date(n.createdAt).toLocaleString('vi-VN') }}
          </p>
        </div>
      </li>
    </ul>

    <!-- Load more -->
    <div v-if="notificationStore.hasMore" class="mt-6 flex justify-center">
      <button
        @click="notificationStore.loadMore()"
        :disabled="notificationStore.loading"
        class="px-5 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
      >
        <span v-if="notificationStore.loading">Đang tải...</span>
        <span v-else>Tải thêm</span>
      </button>
    </div>
  </div>
</template>
