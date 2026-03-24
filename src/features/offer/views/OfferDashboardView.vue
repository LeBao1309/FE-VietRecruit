<!-- src/features/offer/views/OfferDashboardView.vue -->
<!-- Page listing applications and their corresponding offers. Pure UI. -->
<script setup lang="ts">
import { 
  ChevronDown, ChevronRight, FileText, 
  Send, CheckCircle, XCircle, Clock, AlertCircle, Plus 
} from 'lucide-vue-next'

interface Offer {
  id: string
  baseSalary: number
  currency: string
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'
  createdAt: string
  startDate: string
}

const props = defineProps<{
  applications: Array<{ id: string; candidateName: string; jobTitle: string; status: string; createdAt: string }>
  offersMap: Record<string, Offer[]>
  expandedAppId: string | null
  isLoading: boolean
  error: string | null
}>()

const emit = defineEmits<{
  (e: 'viewOffers', applicationId: string): void
  (e: 'draftOffer', applicationId: string): void
  (e: 'sendOffer', offerId: string): void
  (e: 'respondOffer', offerId: string, status: 'ACCEPTED' | 'DECLINED'): void
}>()

const statusConfig = {
  DRAFT: { label: 'Bản nháp', class: 'bg-gray-50 text-gray-700 border-gray-200' },
  SENT: { label: 'Đã gửi', class: 'bg-blue-50 text-blue-700 border-blue-200' },
  ACCEPTED: { label: 'Chấp nhận', class: 'bg-green-50 text-green-700 border-green-200' },
  DECLINED: { label: 'Từ chối', class: 'bg-red-50 text-red-700 border-red-200' },
  EXPIRED: { label: 'Hết hạn', class: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
}

function formatCurrency(val: number, curr: string) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: curr }).format(val)
}
</script>

<template>
  <div class="p-8 max-w-7xl mx-auto space-y-8">
    <!-- Header -->
    <header>
      <h1 class="text-3xl font-black text-text-primary uppercase tracking-tight">Quản lý Offer</h1>
      <p class="text-sm text-text-muted mt-1 font-medium">Gửi và theo dõi các đề nghị làm việc cho ứng viên tiềm năng.</p>
    </header>

    <!-- Error State -->
    <div v-if="error" class="p-6 bg-red-50 border border-red-200 rounded-3xl flex items-center gap-4 text-red-700">
      <AlertCircle class="w-6 h-6" />
      <p class="font-bold uppercase text-xs tracking-tight">{{ error }}</p>
    </div>

    <!-- Main Table Card -->
    <div class="bg-white border border-border rounded-3xl shadow-sm overflow-hidden">
      <div v-if="isLoading" class="p-12 space-y-6">
        <div v-for="n in 5" :key="n" class="h-16 bg-surface-soft animate-pulse rounded-2xl"></div>
      </div>

      <div v-else-if="applications.length === 0" class="p-24 text-center space-y-4">
        <div class="w-20 h-20 bg-surface-soft rounded-full flex items-center justify-center mx-auto text-text-muted/30">
          <FileText class="w-10 h-10" />
        </div>
        <h3 class="text-xl font-black text-text-primary uppercase tracking-tight">Chưa có ứng viên nào ở bước Offer</h3>
        <p class="text-sm text-text-muted font-medium">Chuyển trạng thái ứng viên sang "OFFER" trong Pipeline để tạo đề nghị.</p>
      </div>

      <table v-else class="w-full text-left border-collapse">
        <thead class="bg-surface-soft/50 border-b border-border">
          <tr>
            <th class="p-6 text-[10px] font-black text-text-muted uppercase tracking-widest">Ứng viên / Vị trí</th>
            <th class="p-6 text-[10px] font-black text-text-muted uppercase tracking-widest text-center">Trạng thái hiện tại</th>
            <th class="p-6 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="app in applications" :key="app.id">
            <!-- Application Row -->
            <tr 
              class="group hover:bg-surface-soft/30 transition-colors border-b border-border last:border-0 cursor-pointer"
              @click="emit('viewOffers', app.id)"
            >
              <td class="p-6">
                <div class="flex items-center gap-4">
                  <div 
                    class="w-10 h-10 rounded-xl bg-brand/5 flex items-center justify-center text-brand transition-transform group-hover:scale-110"
                    :class="{ 'rotate-90': expandedAppId === app.id }"
                  >
                    <ChevronRight class="w-5 h-5 transition-transform" :class="{ 'rotate-90': expandedAppId === app.id }" />
                  </div>
                  <div>
                    <p class="text-sm font-black text-text-primary uppercase tracking-tight">{{ app.candidateName }}</p>
                    <p class="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">{{ app.jobTitle }}</p>
                  </div>
                </div>
              </td>
              <td class="p-6 text-center">
                <span class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black uppercase tracking-wider">
                  {{ app.status }}
                </span>
              </td>
              <td class="p-6 text-right">
                <button 
                  @click.stop="emit('draftOffer', app.id)"
                  class="px-4 py-2 bg-brand text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-brand-sm hover:bg-brand-dark transition-all flex items-center gap-2 ml-auto"
                >
                  <Plus class="w-3.5 h-3.5" /> Tạo Offer
                </button>
              </td>
            </tr>

            <!-- Expanded Offers List -->
            <tr v-if="expandedAppId === app.id">
              <td colspan="3" class="p-0 bg-surface-soft/20 border-b border-border">
                <div class="p-6 pl-20 space-y-4">
                  <div v-if="!offersMap[app.id] || offersMap[app.id].length === 0" class="text-center py-8 border-2 border-dashed border-border rounded-2xl">
                    <p class="text-xs text-text-muted font-bold uppercase tracking-widest">Chưa có bản nháp offer nào cho ứng viên này.</p>
                  </div>
                  <div 
                    v-for="offer in offersMap[app.id]" 
                    :key="offer.id"
                    class="bg-white border border-border rounded-2xl p-5 flex items-center justify-between shadow-sm"
                  >
                    <div class="flex items-center gap-6">
                      <div :class="['p-3 rounded-xl border', statusConfig[offer.status].class]">
                        <FileText class="w-5 h-5" />
                      </div>
                      <div class="space-y-1">
                        <div class="flex items-center gap-3">
                          <p class="text-sm font-black text-text-primary">{{ formatCurrency(offer.baseSalary, offer.currency) }}</p>
                          <span :class="['px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-widest', statusConfig[offer.status].class]">
                            {{ statusConfig[offer.status].label }}
                          </span>
                        </div>
                        <p class="text-[10px] text-text-muted font-bold uppercase tracking-widest flex items-center gap-2">
                          <Clock class="w-3 h-3" /> Ngày tạo: {{ new Date(offer.createdAt).toLocaleDateString('vi-VN') }} 
                          &bull; Ngày bắt đầu: {{ new Date(offer.startDate).toLocaleDateString('vi-VN') }}
                        </p>
                      </div>
                    </div>

                    <div class="flex items-center gap-2">
                      <button 
                        v-if="offer.status === 'DRAFT'"
                        @click="emit('sendOffer', offer.id)"
                        class="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors"
                        title="Gửi cho ứng viên"
                      >
                        <Send class="w-4 h-4" />
                      </button>
                      <button 
                        v-if="offer.status === 'SENT'"
                        @click="emit('respondOffer', offer.id, 'ACCEPTED')"
                        class="p-2.5 rounded-xl bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 transition-colors"
                        title="Đánh dấu Chấp nhận"
                      >
                        <CheckCircle class="w-4 h-4" />
                      </button>
                      <button 
                        v-if="offer.status === 'SENT'"
                        @click="emit('respondOffer', offer.id, 'DECLINED')"
                        class="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
                        title="Đánh dấu Từ chối"
                      >
                        <XCircle class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
