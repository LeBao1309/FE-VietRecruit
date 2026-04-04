<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { candidateService } from '@/services/candidateService'
import type { JobRecommendationResponse } from '@/types/job'

const router = useRouter()

// ── State ──
const loading = ref(true)
const recommendations = ref<JobRecommendationResponse[]>([])

// ── Load ──
async function loadRecommendations(): Promise<void> {
 loading.value = true
 try {
 const result = await candidateService.getRecommendations(20)
 if (result.data) {
 recommendations.value = result.data
 }
 } finally {
 loading.value = false
 }
}

function goToJob(jobId: string): void {
 router.push(`/jobs/${jobId}`)
}

function scoreColor(score: number): string {
 if (score >= 80) return 'text-emerald-500'
 if (score >= 60) return 'text-teal-500'
 if (score >= 40) return 'text-amber-500'
 return 'text-slate-500'
}

function scoreStroke(score: number): string {
 if (score >= 80) return 'stroke-emerald-500'
 if (score >= 60) return 'stroke-teal-500'
 if (score >= 40) return 'stroke-amber-500'
 return 'stroke-slate-400'
}

onMounted(loadRecommendations)
</script>

<template>
 <div class="max-w-4xl mx-auto px-6 py-10">
 <div class="mb-8">
 <h1 class="text-3xl font-extrabold text-slate-900 mb-2">Việc Làm Đề Xuất</h1>
 <p class="text-sm font-medium text-slate-500">Các việc làm được AI đề xuất dựa trên hồ sơ, năng lực và nguyện vọng của bạn.</p>
 </div>

 <!-- Loading -->
 <div v-if="loading" class="space-y-4">
 <div v-for="i in 5" :key="i" class="premium-card p-6 animate-pulse">
 <div class="flex items-center gap-6">
 <div class="w-16 h-16 bg-slate-200 rounded-full shrink-0" />
 <div class="flex-1 space-y-3">
 <div class="h-4 bg-slate-200 rounded w-48" />
 <div class="h-3 bg-slate-200 rounded w-32" />
 </div>
 <div class="h-8 w-24 bg-slate-200 rounded shrink-0" />
 </div>
 </div>
 </div>

 <!-- Empty state -->
 <div v-else-if="recommendations.length === 0" class="premium-card p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
 <span class="text-5xl mb-4 opacity-50">🤖</span>
 <p class="text-lg font-bold text-slate-900 mb-2">Chưa có đề xuất nào</p>
 <p class="text-sm font-medium text-slate-500 mb-6 max-w-md mx-auto">Hoàn thiện hồ sơ và tải lên CV để nhận các đề xuất việc làm từ AI.</p>
 <router-link to="/candidate/candidate-profile" class="btn-primary py-2.5 px-6">
 Hoàn Thiện Hồ Sơ Của Bạn
 </router-link>
 </div>

 <!-- Results -->
 <div v-else class="space-y-4">
 <div
 v-for="rec in recommendations"
 :key="rec.jobId"
 @click="goToJob(rec.jobId)"
 class="premium-card p-6 flex flex-col sm:flex-row sm:items-center sm:gap-6 hover:shadow-lg hover:-translate-y-0.5 hover:border-teal-500/30 :border-teal-500/30 transition-all duration-300 cursor-pointer group"
 >
 <!-- Match score -->
 <div class="relative w-16 h-16 shrink-0 mb-4 sm:mb-0 drop-shadow-sm">
 <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90">
 <circle cx="18" cy="18" r="15.5" fill="none" class="stroke-slate-200 " stroke-width="3" />
 <circle
 cx="18" cy="18" r="15.5" fill="none" stroke-width="3" stroke-linecap="round"
 :class="scoreStroke(rec.matchScore)"
 :stroke-dasharray="`${(rec.matchScore / 100) * 97.4} 97.4`"
 class="transition-all duration-1000 ease-out"
 />
 </svg>
 <span class="absolute inset-0 flex items-center justify-center text-sm font-black" :class="scoreColor(rec.matchScore)">
 {{ rec.matchScore }}%
 </span>
 </div>

 <!-- Job info -->
 <div class="flex-1 min-w-0 mb-4 sm:mb-0">
 <h3 class="text-lg font-bold text-slate-900 group-hover:text-teal-600 :text-teal-400 transition-colors mb-1 truncate">
 {{ rec.title }}
 </h3>
 <p class="text-sm font-medium text-slate-500 mb-2">
 <span class="text-slate-700 ">{{ rec.companyName }}</span>
 <span v-if="rec.location" class="mx-1.5 opacity-50">•</span>
 <span v-if="rec.location">{{ rec.location }}</span>
 </p>
 <div class="bg-slate-50 p-3 rounded-lg border border-slate-100 ">
 <p class="text-xs font-medium text-slate-600 line-clamp-2 leading-relaxed">
 <span class="font-bold text-slate-700 mr-1">Lý do phù hợp:</span>{{ rec.matchReason }}
 </p>
 </div>
 </div>

 <!-- CTA -->
 <div class="shrink-0 flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
 <span class="sm:hidden text-xs font-bold text-teal-600">Xem Việc Làm</span>
 <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-teal-50 :bg-teal-900/30 group-hover:text-teal-600 :text-teal-400 transition-colors">
 <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
 </svg>
 </div>
 </div>
 </div>

 <!-- Footer note -->
 <p class="text-xs font-medium text-slate-400 text-center mt-8">
 Đề xuất được AI tạo tự động dựa vào hồ sơ và CV của bạn. Hãy cập nhật hồ sơ để có kết quả tốt hơn.
 </p>
 </div>
 </div>
</template>
