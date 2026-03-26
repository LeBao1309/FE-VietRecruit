<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMyApplicationsStore } from '../stores/my-applications.store'
import { applicationService } from '../services/application.service'
import ApplicationStatusBadge from '../components/ApplicationStatusBadge.vue'
import CandidateNavbar from '../components/CandidateNavbar.vue'

const store = useMyApplicationsStore()
const router = useRouter()

const fetchApps = async () => {
  store.isLoading = true
  store.error = null
  try {
    const res = await applicationService.listMyApplications({ page: store.page, size: store.size })
    store.applications = res.content
    store.totalElements = res.totalElements
    store.totalPages = res.totalPages
  } catch {
    store.error = 'Khong the tai danh sach ung tuyen.'
  } finally {
    store.isLoading = false
  }
}

onMounted(() => fetchApps())

const goToDetail = (id: string) => {
  router.push({ name: 'ApplicationDetail', params: { id } })
}

const changePage = (p: number) => {
  if (p >= 0 && p < store.totalPages) {
    store.page = p
    fetchApps()
  }
}
</script>

<template>
  <div class="min-h-screen bg-surface-soft">
    <CandidateNavbar />

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-text-primary">Viec lam da ung tuyen</h1>
          <p class="mt-1.5 text-sm text-text-secondary">Quan ly va theo doi trang thai cac don ung tuyen cua ban.</p>
        </div>
        <div class="mt-4 sm:mt-0">
          <button
            @click="router.push({ name: 'JobBoard' })"
            class="btn-primary"
          >
            Tim viec moi
          </button>
        </div>
      </div>

      <!-- Error -->
      <div v-if="store.error" class="bg-danger-light text-danger-dark rounded-xl p-4 font-medium mb-6 border border-danger/20">
        {{ store.error }}
      </div>

      <div class="bg-panel rounded-2xl border border-border overflow-hidden">
        <!-- Loading -->
        <div v-if="store.isLoading" class="p-6 space-y-6">
          <div v-for="i in 3" :key="i" class="animate-pulse flex items-center justify-between">
            <div class="flex-1 space-y-3 py-1">
              <div class="h-5 bg-surface-muted rounded w-1/2"></div>
              <div class="h-4 bg-surface-muted rounded w-1/4"></div>
            </div>
            <div class="h-6 bg-surface-muted rounded-full w-24"></div>
          </div>
        </div>

        <!-- Empty -->
        <div v-else-if="store.applications.length === 0" class="p-16 text-center flex flex-col items-center">
          <div class="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p class="text-lg font-semibold text-text-primary">Chua co don ung tuyen nao.</p>
          <p class="mt-1 text-sm text-text-muted">Kham pha cac viec lam phu hop va nop don ngay!</p>
        </div>

        <!-- List -->
        <ul v-else role="list" class="divide-y divide-border-subtle">
          <li v-for="app in store.applications" :key="app.id">
            <div
              @click="goToDetail(app.id)"
              class="px-6 py-5 hover:bg-surface-soft cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div class="flex-1 min-w-0 pr-4">
                <h3 class="text-base font-semibold text-text-primary group-hover:text-brand transition-colors truncate mb-1">
                  {{ app.jobTitle }}
                </h3>
                <div class="flex flex-wrap items-center text-sm text-text-muted gap-x-4 gap-y-2">
                  <span class="flex items-center gap-1.5">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span class="font-medium text-text-secondary">{{ app.candidateName }}</span>
                  </span>
                  <span class="flex items-center gap-1.5">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Ngay nop: {{ new Date(app.createdAt).toLocaleDateString('vi-VN') }}
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <ApplicationStatusBadge :status="app.status" />
                <svg class="h-5 w-5 text-text-disabled group-hover:text-brand transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </li>
        </ul>

        <!-- Pagination -->
        <div v-if="store.totalPages > 1" class="px-6 py-4 bg-surface-soft border-t border-border-subtle flex items-center justify-between">
          <span class="text-sm text-text-secondary">
            Trang <span class="font-semibold text-text-primary">{{ store.page + 1 }}</span> / {{ store.totalPages }}
          </span>
          <div class="flex gap-2">
            <button
              @click="changePage(store.page - 1)"
              :disabled="store.page === 0"
              class="btn-secondary text-xs px-3 py-1.5 disabled:opacity-50"
            >
              Trang truoc
            </button>
            <button
              @click="changePage(store.page + 1)"
              :disabled="store.page >= store.totalPages - 1"
              class="btn-secondary text-xs px-3 py-1.5 disabled:opacity-50"
            >
              Trang sau
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
