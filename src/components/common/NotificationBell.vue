<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notificationStore'

const router = useRouter()
const notificationStore = useNotificationStore()

const dropdownOpen = ref(false)
const bellRef = ref<HTMLElement | null>(null)

onMounted(() => {
  notificationStore.fetchUnreadCount()
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})

function handleOutsideClick(e: MouseEvent) {
  if (bellRef.value && !bellRef.value.contains(e.target as Node)) {
    dropdownOpen.value = false
  }
}

async function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
  if (dropdownOpen.value && notificationStore.notifications.length === 0) {
    await notificationStore.fetchNotifications(0, 10)
  }
}

function viewAll() {
  dropdownOpen.value = false
  router.push('/notifications')
}
</script>

<template>
  <div ref="bellRef" class="relative">
    <button
      @click="toggleDropdown"
      class="relative flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition-colors"
      aria-label="Thông báo"
    >
      <!-- Bell icon -->
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
      <!-- Unread badge -->
      <span
        v-if="notificationStore.unreadCount > 0"
        class="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold leading-none"
      >
        {{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}
      </span>
    </button>

    <!-- Dropdown -->
    <div
      v-if="dropdownOpen"
      class="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200/60 z-50 overflow-hidden"
    >
      <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <span class="text-sm font-semibold text-slate-800">Thông Báo</span>
        <button
          v-if="notificationStore.unreadCount > 0"
          @click="notificationStore.markAllAsRead()"
          class="text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors"
        >
          Đánh dấu tất cả đã đọc
        </button>
      </div>

      <div v-if="notificationStore.loading" class="flex justify-center py-6">
        <div class="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>

      <div v-else-if="notificationStore.notifications.length === 0" class="py-8 text-center">
        <svg class="w-10 h-10 mx-auto text-slate-300 mb-2" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        <p class="text-sm text-slate-400">Không có thông báo mới</p>
      </div>

      <ul v-else class="max-h-72 overflow-y-auto divide-y divide-slate-100">
        <li
          v-for="n in notificationStore.notifications"
          :key="n.id"
          @click="notificationStore.markAsRead(n.id)"
          :class="['px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors', !n.isRead ? 'bg-teal-50/50' : '']"
        >
          <p class="text-sm font-medium text-slate-800 leading-snug">{{ n.title }}</p>
          <p class="text-xs text-slate-500 mt-0.5 line-clamp-2">{{ n.message }}</p>
          <p class="text-[10px] text-slate-400 mt-1">{{ n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : '—' }}</p>
        </li>
      </ul>

      <div class="border-t border-slate-100 px-4 py-2.5">
        <button
          @click="viewAll"
          class="text-xs text-teal-600 hover:text-teal-700 font-medium w-full text-center transition-colors"
        >
          Xem tất cả thông báo →
        </button>
      </div>
    </div>
  </div>
</template>
