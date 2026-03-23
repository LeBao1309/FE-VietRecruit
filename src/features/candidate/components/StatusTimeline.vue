<script setup lang="ts">
import type { ApplicationStatusHistoryResponse } from '../types/application.schema'
import { getStageConfig } from '@/core/constants/pipeline-stages'
import type { ApplicationStatus } from '@/core/constants/enums'

defineProps<{ history: ApplicationStatusHistoryResponse[] }>()

const formatStatus = (s: string) => {
  return getStageConfig(s as ApplicationStatus).label;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}
</script>

<template>
  <div class="flow-root">
    <ul role="list" class="-mb-8">
      <li v-for="(item, itemIdx) in history" :key="item.id">
        <div class="relative pb-8">
          <span v-if="itemIdx !== history.length - 1" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
          <div class="relative flex space-x-3">
            <div>
              <span class="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center ring-8 ring-white shadow-sm">
                <svg class="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </span>
            </div>
            <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
              <div>
                <p class="text-sm text-gray-500">
                  <span class="font-medium text-gray-900">{{ formatStatus(item.newStatus) }}</span>
                  <span v-if="item.changedByName" class="ml-1 text-xs">cập nhật bởi {{ item.changedByName }}</span>
                </p>
                <p v-if="item.notes" class="mt-2 text-sm text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100 shadow-sm">{{ item.notes }}</p>
              </div>
              <div class="text-right text-xs whitespace-nowrap text-gray-500 font-medium">
                <time :datetime="item.changedAt">{{ formatDate(item.changedAt) }}</time>
              </div>
            </div>
          </div>
        </div>
      </li>
    </ul>
    
    <div v-if="!history || history.length === 0" class="text-sm text-gray-500 py-4 bg-gray-50 text-center rounded">
      Chưa có lịch sử trạng thái.
    </div>
  </div>
</template>
