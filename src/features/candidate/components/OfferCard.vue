<script setup lang="ts">
import { useToast } from 'vue-toastification';
const toast = useToast();
import { ref } from 'vue'
import type { OfferResponse } from '../types/application.schema'
import { applicationService } from '../services/application.service'

const props = defineProps<{ offer: OfferResponse }>()
const emit = defineEmits<{ (e: 'updated'): void }>()
const isResponding = ref(false)

const formatCurrency = (value?: number | null, currency?: string | null) => {
  if (value == null) return 'Thỏa thuận'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currency || 'VND' }).format(value)
}

const formatDate = (dateString?: string | null) => {
  if (!dateString) return 'Chưa xác định'
  return new Date(dateString).toLocaleDateString('vi-VN')
}

const statusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'SENT': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'ACCEPTED': return 'bg-green-100 text-green-800 border-green-200'
    case 'DECLINED': return 'bg-red-100 text-red-800 border-red-200'
    case 'EXPIRED': return 'bg-gray-100 text-gray-800 border-gray-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const respond = async (action: 'ACCEPT' | 'DECLINE') => {
  if (!confirm(`Bạn có chắc chắn muốn ${action === 'ACCEPT' ? 'CHẤP NHẬN' : 'TỪ CHỐI'} thư mời nhận việc này?`)) return
  
  isResponding.value = true
  try {
    await applicationService.respondToOffer(props.offer.id, action)
    toast.success(`Đã ${action === 'ACCEPT' ? 'chấp nhận' : 'từ chối'} offer.`)
    emit('updated')
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Thao tác thất bại.')
  } finally {
    isResponding.value = false
  }
}
</script>

<template>
  <div :class="['border rounded-xl p-6 shadow-sm transition', offer.status === 'SENT' ? 'border-indigo-300 bg-indigo-50/30' : 'border-gray-200 bg-white']">
    <div class="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 border-b pb-4">
      <div>
        <h3 class="font-bold text-xl text-gray-900 flex items-center gap-2">
          <svg class="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
          Thư mời nhận việc (Offer)
        </h3>
        <p class="text-sm text-gray-500 mt-1">Gửi ngày {{ formatDate(offer.createdAt) }}</p>
      </div>
      <span :class="['px-3 py-1 rounded-full text-sm font-semibold border', statusColor(offer.status)]">
        {{ offer.status }}
      </span>
    </div>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
      <div class="space-y-1">
        <p class="text-sm text-gray-500">Mức lương cơ bản</p>
        <p class="font-semibold text-lg text-emerald-600">{{ formatCurrency(offer.baseSalary, offer.currency) }}</p>
      </div>
      <div class="space-y-1">
        <p class="text-sm text-gray-500">Ngày bắt đầu làm việc dự kiến</p>
        <p class="font-medium text-gray-900">{{ formatDate(offer.startDate) }}</p>
      </div>
      
      <div class="sm:col-span-2 space-y-1" v-if="offer.note">
        <p class="text-sm text-gray-500">Ghi chú</p>
        <p class="text-sm text-gray-700 bg-white p-3 rounded border border-gray-100 italic">{{ offer.note }}</p>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-100">
      <a v-if="offer.offerLetterUrl" :href="offer.offerLetterUrl" target="_blank" class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-lg">
        <svg class="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        Tải file Offer (.PDF)
      </a>
      <span v-else class="text-sm text-gray-400 italic">Không có thư mời đính kèm</span>

      <div v-if="offer.status === 'SENT'" class="flex gap-3 w-full sm:w-auto">
        <button @click="respond('DECLINE')" :disabled="isResponding" class="flex-1 sm:flex-none px-6 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 focus:outline-none transition font-medium disabled:opacity-50">
          Từ chối Offer
        </button>
        <button @click="respond('ACCEPT')" :disabled="isResponding" class="flex-1 sm:flex-none px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none shadow-sm transition font-medium disabled:opacity-50">
          Chấp nhận nhận việc
        </button>
      </div>
      <div v-if="offer.status === 'EXPIRED'" class="text-gray-500 text-sm font-medium flex items-center">
        <svg class="w-4 h-4 mr-1 pb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        Offer này đã hết hạn.
      </div>
    </div>
  </div>
</template>
