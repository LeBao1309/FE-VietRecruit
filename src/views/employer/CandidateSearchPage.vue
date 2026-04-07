<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { candidateService } from '@/services/candidateService'
import type { CandidateSearchResponse } from '@/types/candidate'
import type { SearchPageResponse } from '@/types/common'
import BaseSkeleton from '@/components/common/BaseSkeleton.vue'
import BaseEmptyState from '@/components/common/BaseEmptyState.vue'
import { useUiStore } from '@/stores/uiStore'

const router = useRouter()
const ui = useUiStore()

// ── State ──
const loading = ref(false)
const results = ref<CandidateSearchResponse[]>([])
const totalElements = ref(0)
const totalPages = ref(0)
const currentPage = ref(0)
const pageSize = 12

// ── Filters ──
const query = ref('')
const skillInput = ref('')
const skills = ref<string[]>([])
const workType = ref('')
const educationLevel = ref('')
const experienceMin = ref<number | null>(null)
const isOpenToWork = ref(false)

const workTypeOptions = [
  { label: 'Tất Cả', value: '' },
  { label: 'Toàn Thời Gian', value: 'FULL_TIME' },
  { label: 'Bán Thời Gian', value: 'PART_TIME' },
  { label: 'Từ Xa', value: 'REMOTE' },
  { label: 'Kết Hợp', value: 'HYBRID' },
  { label: 'Hợp Đồng', value: 'CONTRACT' },
]

const educationOptions = [
  { label: 'Tất Cả', value: '' },
  { label: 'Dưới Đại Học', value: 'BELOW_BACHELOR' },
  { label: 'Đại Học', value: 'BACHELOR' },
  { label: 'Thạc Sĩ', value: 'MASTER' },
  { label: 'Tiến Sĩ', value: 'PHD' },
]

// ── Search ──
async function search(page = 0): Promise<void> {
  loading.value = true
  try {
    const result = await candidateService.searchCandidates({
      q: query.value || undefined,
      skills: skills.value.length > 0 ? skills.value : undefined,
      workType: workType.value || undefined,
      educationLevel: educationLevel.value || undefined,
      experienceMin: experienceMin.value ?? undefined,
      isOpenToWork: isOpenToWork.value || undefined,
      page,
      size: pageSize,
    })
    if (result.error) {
      ui.toastError('Tìm kiếm thất bại', result.error.message)
      return
    }
    const data = result.data as SearchPageResponse<CandidateSearchResponse>
    results.value = data.content
    totalElements.value = data.totalElements
    totalPages.value = data.totalPages
    currentPage.value = data.page
  } finally {
    loading.value = false
  }
}

function addSkill(): void {
  const s = skillInput.value.trim()
  if (s && !skills.value.includes(s)) {
    skills.value.push(s)
  }
  skillInput.value = ''
}

function removeSkill(skill: string): void {
  skills.value = skills.value.filter((s) => s !== skill)
}

function onSkillKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addSkill()
  }
}

function resetFilters(): void {
  query.value = ''
  skills.value = []
  workType.value = ''
  educationLevel.value = ''
  experienceMin.value = null
  isOpenToWork.value = false
  currentPage.value = 0
  search(0)
}

// ── Pagination ──
const canGoPrev = computed(() => currentPage.value > 0)
const canGoNext = computed(() => currentPage.value < totalPages.value - 1)

function prevPage(): void {
  if (canGoPrev.value) search(currentPage.value - 1)
}
function nextPage(): void {
  if (canGoNext.value) search(currentPage.value + 1)
}

// ── Navigation ──
function viewCandidate(id: string): void {
  router.push(`/employer/candidates/${id}`)
}

// ── Helpers ──
function formatExperience(years: number | null): string {
  if (years === null) return '—'
  if (years === 0) return 'Mới ra trường'
  return `${years} năm`
}

function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return '—'
  const fmt = (n: number) => n.toLocaleString('vi-VN')
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `Từ ${fmt(min)}`
  if (max) return `Đến ${fmt(max)}`
  return '—'
}

// Reload when key filters change
watch([workType, educationLevel, isOpenToWork], () => {
  currentPage.value = 0
  search(0)
})

onMounted(() => search(0))
</script>

<template>
  <div class="max-w-6xl mx-auto px-6 pb-8 md:px-8">

    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-xl font-bold text-slate-900">Tìm Kiếm Ứng Viên</h1>
      <p class="text-sm text-slate-500 mt-1">Tìm kiếm và xem hồ sơ ứng viên phù hợp.</p>
    </div>

    <!-- Search + Filters -->
    <div class="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-5 mb-6">
      <!-- Keyword search -->
      <div class="flex gap-3 mb-4">
        <input
          v-model="query"
          type="text"
          placeholder="Tìm theo kỹ năng, vị trí, từ khóa..."
          class="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
          @keydown.enter="search(0)"
        />
        <button
          @click="search(0)"
          class="px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors outline-none focus:ring-2 focus:ring-teal-500/50"
        >
          Tìm Kiếm
        </button>
        <button
          @click="resetFilters"
          class="px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
        >
          Đặt Lại
        </button>
      </div>

      <!-- Filter row -->
      <div class="flex flex-wrap gap-3">
        <!-- Work type -->
        <div class="relative">
          <select
            v-model="workType"
            class="appearance-none pl-3 pr-8 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all shadow-sm"
          >
            <option v-for="opt in workTypeOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <svg class="absolute right-2.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <!-- Education -->
        <div class="relative">
          <select
            v-model="educationLevel"
            class="appearance-none pl-3 pr-8 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all shadow-sm"
          >
            <option v-for="opt in educationOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <svg class="absolute right-2.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <!-- Min experience -->
        <input
          v-model.number="experienceMin"
          type="number"
          min="0"
          max="30"
          placeholder="Kinh nghiệm tối thiểu (năm)"
          class="w-52 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
          @change="search(0)"
        />

        <!-- Open to work -->
        <label class="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
          <input
            v-model="isOpenToWork"
            type="checkbox"
            class="w-4 h-4 accent-teal-600 rounded"
          />
          Đang tìm việc
        </label>
      </div>

      <!-- Skills tags input -->
      <div class="mt-3">
        <div class="flex flex-wrap gap-2 mb-2">
          <span
            v-for="skill in skills"
            :key="skill"
            class="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full border border-teal-200"
          >
            {{ skill }}
            <button @click="removeSkill(skill)" class="hover:text-teal-900 leading-none">&times;</button>
          </span>
        </div>
        <input
          v-model="skillInput"
          type="text"
          placeholder="Thêm kỹ năng (Enter hoặc dấu phẩy để thêm)..."
          class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
          @keydown="onSkillKeydown"
        />
      </div>
    </div>

    <!-- Result count -->
    <p v-if="!loading" class="text-sm text-slate-500 mb-4">
      Tìm thấy <span class="font-semibold text-slate-700">{{ totalElements }}</span> ứng viên
    </p>

    <!-- Loading skeleton -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <BaseSkeleton v-for="i in 9" :key="i" class="h-48 rounded-xl" />
    </div>

    <!-- Empty state -->
    <BaseEmptyState
      v-else-if="results.length === 0"
      title="Không tìm thấy ứng viên"
      description="Thử thay đổi từ khóa hoặc bộ lọc để tìm kiếm ứng viên phù hợp hơn."
      icon="🔍"
    />

    <!-- Candidate cards -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="candidate in results"
        :key="candidate.id"
        @click="viewCandidate(candidate.id)"
        class="bg-white border border-slate-200/60 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer p-5 flex flex-col gap-3"
      >
        <!-- Headline -->
        <div>
          <p class="text-sm font-semibold text-slate-900 leading-snug">
            {{ candidate.desiredPosition ?? 'Chưa cập nhật vị trí' }}
          </p>
          <p v-if="candidate.desiredPositionLevel" class="text-xs text-slate-500 mt-0.5">
            {{ candidate.desiredPositionLevel }}
          </p>
        </div>

        <!-- Open to work badge -->
        <div v-if="candidate.isOpenToWork" class="flex items-center gap-1">
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-600 border border-green-200">
            Đang tìm việc
          </span>
        </div>

        <!-- Stats -->
        <div class="text-xs text-slate-500 space-y-1">
          <div class="flex items-center justify-between">
            <span>Kinh nghiệm</span>
            <span class="font-medium text-slate-700">{{ formatExperience(candidate.yearsOfExperience) }}</span>
          </div>
          <div v-if="candidate.educationLevel" class="flex items-center justify-between">
            <span>Học vấn</span>
            <span class="font-medium text-slate-700">{{ candidate.educationLevel }}</span>
          </div>
          <div v-if="candidate.workType" class="flex items-center justify-between">
            <span>Loại công việc</span>
            <span class="font-medium text-slate-700">{{ candidate.workType }}</span>
          </div>
          <div v-if="candidate.desiredSalaryMin || candidate.desiredSalaryMax" class="flex items-center justify-between">
            <span>Lương mong muốn</span>
            <span class="font-medium text-slate-700 text-right">
              {{ formatSalary(candidate.desiredSalaryMin, candidate.desiredSalaryMax) }}
            </span>
          </div>
        </div>

        <!-- Skills -->
        <div v-if="candidate.skills && candidate.skills.length > 0" class="flex flex-wrap gap-1.5">
          <span
            v-for="skill in candidate.skills.slice(0, 4)"
            :key="skill"
            class="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-medium rounded-full"
          >
            {{ skill }}
          </span>
          <span
            v-if="candidate.skills.length > 4"
            class="px-2 py-0.5 bg-slate-100 text-slate-400 text-[11px] rounded-full"
          >
            +{{ candidate.skills.length - 4 }}
          </span>
        </div>

        <!-- View button -->
        <div class="mt-auto pt-2 border-t border-slate-100">
          <span class="text-xs font-semibold text-teal-600 hover:text-teal-700">
            Xem hồ sơ →
          </span>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between mt-6 text-sm font-medium text-slate-500">
      <span>Trang {{ currentPage + 1 }} / {{ totalPages }}</span>
      <div class="flex items-center gap-2">
        <button
          @click="prevPage"
          :disabled="!canGoPrev"
          class="px-3 py-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ‹ Trước
        </button>
        <button
          @click="nextPage"
          :disabled="!canGoNext"
          class="px-3 py-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Sau ›
        </button>
      </div>
    </div>
  </div>
</template>
