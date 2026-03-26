<script setup lang="ts">
import { getErrorMessage } from '@/core/utils/error'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/core/constants/route-names'
import { applicationService } from '../services/application.service'
import ApplicationStatusBadge from '../components/ApplicationStatusBadge.vue'
import StatusTimeline from '../components/StatusTimeline.vue'
import InterviewCard from '../components/InterviewCard.vue'
import OfferCard from '../components/OfferCard.vue'
import CandidateNavbar from '../components/CandidateNavbar.vue'
import type { ApplicationResponse, ApplicationStatusHistoryResponse, InterviewResponse, OfferResponse } from '../types/application.schema'

const route = useRoute()
const router = useRouter()
const id = route.params.id as string

function goBack() {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push({ name: ROUTE_NAMES.MY_APPLICATIONS })
  }
}

const application = ref<ApplicationResponse | null>(null)
const history = ref<ApplicationStatusHistoryResponse[]>([])
const interviews = ref<InterviewResponse[]>([])
const offers = ref<OfferResponse[]>([])

const isLoading = ref(true)
const error = ref<string | null>(null)

const loadData = async () => {
  try {
    const [appRes, histRes, intRes, offRes] = await Promise.all([
      applicationService.getApplication(id),
      applicationService.getStatusHistory(id),
      applicationService.listInterviews(id),
      applicationService.listOffers(id)
    ])
    application.value = appRes
    history.value = histRes
    interviews.value = intRes
    offers.value = offRes
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => loadData())
</script>

<template>
  <div class="min-h-screen bg-surface-soft">
    <CandidateNavbar />
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button @click="goBack()" class="mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition">
        <svg class="mr-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Trở về danh sách
      </button>

      <div v-if="isLoading" class="animate-pulse space-y-6">
        <div class="h-32 bg-gray-200 rounded-xl w-full"></div>
        <div class="h-64 bg-gray-200 rounded-xl w-full"></div>
      </div>

      <div v-else-if="error" class="bg-red-50 text-red-600 rounded-lg p-6 font-medium border border-red-200 flex items-center gap-3">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        {{ error }}
      </div>

      <div v-else-if="application" class="space-y-6">
        <!-- Header -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 mb-1 tracking-tight">{{ application.jobTitle }}</h1>
            <p class="text-sm text-gray-500 font-medium flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Nộp ngày {{ new Date(application.createdAt).toLocaleDateString('vi-VN') }}
            </p>
          </div>
          <div>
            <ApplicationStatusBadge :status="application.status" class="px-5 py-2 text-sm shadow-sm" />
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div class="lg:col-span-2 space-y-8">
            
            <!-- Offers Section -->
            <div v-if="offers.length > 0" class="space-y-4">
              <h2 class="text-xl font-bold text-gray-900 border-b pb-2">Chi tiết Offer</h2>
              <OfferCard 
                v-for="offer in offers" 
                :key="offer.id" 
                :offer="offer" 
                @updated="loadData"
              />
            </div>

            <!-- Interviews Section -->
            <div v-if="interviews.length > 0" class="space-y-4">
              <h2 class="text-xl font-bold text-gray-900 border-b pb-2">Lịch Phỏng Vấn</h2>
              <div class="grid grid-cols-1 gap-4">
                <InterviewCard v-for="interview in interviews" :key="interview.id" :interview="interview" />
              </div>
            </div>

            <!-- Application Info -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-6 border-b pb-3">Hồ sơ lúc ứng tuyển</h2>
              <dl class="space-y-6 text-sm text-gray-600">
                <div>
                  <dt class="font-bold text-gray-900 mb-2">Thư giới thiệu (Cover Letter)</dt>
                  <dd class="bg-indigo-50/50 p-5 rounded-lg border border-indigo-100 text-gray-700 leading-relaxed whitespace-pre-wrap">{{ application.coverLetter || 'Không đính kèm thư giới thiệu.' }}</dd>
                </div>
                <div>
                  <dt class="font-bold text-gray-900 mb-2">Tệp CV Đính kèm</dt>
                  <dd>
                    <a v-if="application.appliedCvUrl" :href="application.appliedCvUrl" target="_blank" class="inline-flex items-center px-5 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-indigo-700 bg-white hover:bg-indigo-50 transition border-indigo-200">
                      <svg class="-ml-1 mr-2 h-5 w-5 text-indigo-500 border-indigo-100 rounded" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      Xem CV đã sử dụng lúc ứng tuyển
                    </a>
                    <span v-else class="text-gray-400 italic">Không có CV.</span>
                  </dd>
                </div>
              </dl>
            </div>
            
          </div>

          <!-- Timeline Sidebar -->
          <div class="lg:col-span-1 border border-gray-100 bg-white rounded-xl shadow-sm p-6 sticky top-6">
            <h3 class="font-bold text-gray-900 mb-6 border-b pb-3 flex items-center gap-2">
              <svg class="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Lịch sử quá trình
            </h3>
            <StatusTimeline :history="history" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
