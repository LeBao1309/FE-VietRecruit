<script setup lang="ts">
import { onMounted } from "vue";
import { useWorkspaceStore } from "../../../stores/useWorkspaceStore";
import { storeToRefs } from "pinia";
import JobPostingRow from "../components/JobPostingRow.vue";
import InterviewSlot from "../components/InterviewSlot.vue";
import StageProgressBar from "../components/StageProgressBar.vue";
import PipelineSidebar from "../components/PipelineSidebar.vue";
import PipelineTopBar from "../components/PipelineTopBar.vue";
import {
  Building2,
  UsersRound,
  CalendarDays,
  Plus,
  BellRing,
  CircleCheckBig,
} from "lucide-vue-next";

const workspaceStore = useWorkspaceStore();
const {
  applications,
  recentJobs,
  todayInterviews,
  activeJobs,
  upcomingInterviews,
  isLoading,
} = storeToRefs(workspaceStore);

const showAlert = (msg: string) => window.alert(msg);

onMounted(() => {
  workspaceStore.fetchWorkspaceData();
});
</script>

<template>
  <div
    class="h-screen w-full flex flex-col bg-surface overflow-hidden text-text-primary font-sans"
  >
    <PipelineTopBar />

    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar -->
      <PipelineSidebar />

      <!-- Main Dashboard Content -->
      <main
        class="flex-1 overflow-y-auto p-6 lg:p-8 bg-surface-soft scrollbar-hide"
      >
        <!-- Breadcrumb & Header -->
        <div
          class="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-border"
        >
          <div>
            <nav class="flex text-sm text-text-muted mb-2 font-medium">
              <span class="hover:text-brand cursor-pointer">VietRecruit</span>
              <span class="mx-2">/</span>
              <span class="text-text-primary">Workspace Dashboard</span>
            </nav>
            <h1 class="text-3xl font-display font-bold text-text-primary">
              Xin chào đội ngũ Tuyển dụng 👋
            </h1>
          </div>
          <div class="mt-4 md:mt-0 flex gap-3">
            <button
              @click.prevent="
                showAlert('Tính năng [Lịch phỏng vấn] đang được phát triển!')
              "
              class="px-4 py-2 border border-border text-text-primary bg-white rounded-lg hover:bg-surface-muted transition-colors text-sm font-semibold flex items-center gap-2 shadow-xs"
            >
              <CalendarDays class="w-4 h-4" />
              Lịch phỏng vấn
            </button>
            <button
              @click.prevent="
                showAlert('Tính năng [Tạo Job mới] đang được phát triển!')
              "
              class="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors shadow-brand-sm text-sm font-semibold flex items-center gap-2"
            >
              <Plus class="w-4 h-4" />
              Tạo Job mới
            </button>
          </div>
        </div>

        <!-- Banner -->
        <div
          class="mb-8 p-4 bg-brand-light border border-brand/20 rounded-xl flex items-start gap-4 shadow-xs relative overflow-hidden group"
        >
          <div
            class="absolute inset-0 bg-gradient-to-r from-brand/5 to-transparent pointer-events-none"
          ></div>
          <div
            class="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0 text-brand mt-0.5"
          >
            <BellRing class="w-5 h-5 fill-brand/20" />
          </div>
          <div class="flex-1 z-10">
            <h3 class="font-bold text-brand-dark text-sm">
              Cập nhật hệ thống AI (v2.1)
            </h3>
            <p class="text-sm text-brand-darker mt-1 font-medium opacity-90">
              Tính năng phân tích CV bằng AI đã được cải thiện. Bạn có thể xem
              kết quả chi tiết hơn trong Hồ sơ ứng viên bắt đầu từ hôm nay.
            </p>
          </div>
          <button
            @click.prevent="
              showAlert('Tính năng [Ẩn thông báo] đang được phát triển!')
            "
            class="text-brand hover:text-brand-dark transition-colors z-10 p-1 bg-white/50 rounded-lg hover:bg-white/80"
          >
            <span class="text-xs font-bold px-2">Ẩn</span>
          </button>
        </div>

        <div
          v-if="isLoading"
          class="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-pulse"
        >
          <div class="xl:col-span-2 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                class="h-28 bg-white border border-border rounded-xl shadow-xs"
              ></div>
              <div
                class="h-28 bg-white border border-border rounded-xl shadow-xs"
              ></div>
              <div
                class="h-28 bg-white border border-border rounded-xl shadow-xs"
              ></div>
            </div>
            <div
              class="h-44 bg-white border border-border rounded-xl shadow-xs mt-6"
            ></div>
            <div class="space-y-3">
              <div class="h-6 w-48 bg-gray-200 rounded"></div>
              <div
                class="h-20 bg-white border border-border rounded-xl shadow-xs"
              ></div>
              <div
                class="h-20 bg-white border border-border rounded-xl shadow-xs"
              ></div>
            </div>
          </div>
          <div class="space-y-6">
            <div
              class="h-[280px] bg-white border border-border rounded-xl shadow-xs"
            ></div>
            <div
              class="h-44 bg-surface-soft border border-border rounded-xl shadow-xs"
            ></div>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <!-- Left Column (Jobs & Funnel) -->
          <div class="xl:col-span-2 space-y-6">
            <!-- Stats -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                class="p-5 bg-white border border-border rounded-xl shadow-xs transition-transform hover:-translate-y-1 hover:shadow-hover"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <p class="text-sm font-medium text-text-muted mb-1">
                      Jobs Đang mở
                    </p>
                    <h4
                      class="text-2xl font-bold tracking-tight text-text-primary"
                    >
                      {{ recentJobs.length }}
                    </h4>
                  </div>
                  <div class="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Building2 class="w-5 h-5" />
                  </div>
                </div>
              </div>
              <div
                class="p-5 bg-white border border-border rounded-xl shadow-xs transition-transform hover:-translate-y-1 hover:shadow-hover"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <p class="text-sm font-medium text-text-muted mb-1">
                      Ứng viên hôm nay
                    </p>
                    <h4
                      class="text-2xl font-bold tracking-tight text-text-primary"
                    >
                      {{ applications.length }}
                    </h4>
                  </div>
                  <div class="p-2 bg-brand-light text-brand-dark rounded-lg">
                    <UsersRound class="w-5 h-5" />
                  </div>
                </div>
              </div>
              <div
                class="p-5 bg-white border border-border rounded-xl shadow-xs transition-transform hover:-translate-y-1 hover:shadow-hover"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <p class="text-sm font-medium text-text-muted mb-1">
                      Phỏng vấn sắp tới
                    </p>
                    <h4
                      class="text-2xl font-bold tracking-tight text-text-primary"
                    >
                      {{ todayInterviews.length }}
                    </h4>
                  </div>
                  <div class="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <CalendarDays class="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Pipeline Funnel -->
            <div
              class="p-6 bg-white border border-border rounded-xl flex flex-col gap-4 shadow-xs"
            >
              <div
                class="flex justify-between items-center bg-surface-soft p-2 rounded-lg -mx-2 -mt-2 mb-2"
              >
                <h3
                  class="text-base font-bold text-text-primary flex items-center gap-2 pl-2"
                >
                  Tỉ lệ chuyển đổi
                </h3>
                <button
                  @click.prevent="
                    showAlert(
                      'Tính năng [Xem báo cáo chi tiết] đang được phát triển!',
                    )
                  "
                  class="text-xs text-brand hover:underline font-semibold pr-2"
                >
                  Xem báo cáo
                </button>
              </div>
              <StageProgressBar />
            </div>

            <!-- Active Jobs -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-bold text-text-primary">
                  Tin tuyển dụng nổi bật
                </h3>
                <button
                  @click.prevent="$router.push('/workspace/pipeline')"
                  class="text-sm text-brand font-semibold hover:underline"
                >
                  Xem tất cả
                </button>
              </div>
              <div class="flex flex-col gap-3">
                <JobPostingRow
                  v-for="job in activeJobs"
                  :key="job.id"
                  :job="job"
                />
                <div
                  v-if="activeJobs.length === 0"
                  class="p-6 border-2 border-dashed border-border rounded-xl text-center text-text-muted text-sm"
                >
                  Chưa có job nào
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column (Interviews & Tasks) -->
          <div class="space-y-6">
            <!-- Upcoming Interviews -->
            <div class="p-5 bg-white border border-border rounded-xl shadow-xs">
              <h3
                class="text-base font-bold text-text-primary mb-4 flex items-center gap-2"
              >
                <div class="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
                Phỏng vấn sắp tới
              </h3>
              <div class="flex flex-col gap-3">
                <InterviewSlot
                  v-for="interview in upcomingInterviews"
                  :key="interview.id"
                  :interview="interview"
                />
                <div
                  v-if="upcomingInterviews.length === 0"
                  class="text-center py-4 text-sm text-text-muted"
                >
                  Không có phỏng vấn nào sắp tới
                </div>
              </div>
              <div class="mt-4 pt-4 border-t border-border text-center">
                <button
                  @click.prevent="
                    showAlert(
                      'Tính năng [Lịch phỏng vấn đầy đủ] đang được phát triển!',
                    )
                  "
                  class="text-sm text-brand hover:text-brand-dark font-medium transition-colors"
                >
                  Tới Lịch Phỏng Vấn (2+)
                </button>
              </div>
            </div>

            <!-- Focus / To-Dos -->
            <div
              class="p-5 bg-surface-soft border border-border rounded-xl relative overflow-hidden group"
            >
              <div
                class="absolute -right-6 -top-6 w-24 h-24 bg-brand-light rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"
              ></div>
              <h3
                class="text-base font-bold text-text-primary mb-4 flex items-center gap-2 relative z-10"
              >
                <div class="w-1.5 h-4 bg-brand rounded-full"></div>
                Công việc cần xử lý
              </h3>
              <ul class="space-y-3 relative z-10">
                <li
                  class="flex items-start gap-3 p-3 bg-white rounded-lg border border-border-subtle hover:border-brand-muted transition-colors cursor-pointer group/item"
                >
                  <div
                    class="mt-0.5 text-neutral-300 group-hover/item:text-brand transition-colors"
                  >
                    <CircleCheckBig class="w-5 h-5" />
                  </div>
                  <div>
                    <p
                      class="text-sm font-semibold text-text-primary group-hover/item:text-brand transition-colors"
                    >
                      Duyệt 4 CV UI/UX Designer mới
                    </p>
                    <p class="text-xs text-text-muted mt-0.5">
                      Cần xử lý trước 17:00 hôm nay
                    </p>
                  </div>
                  <span
                    class="ml-auto w-2 h-2 rounded-full bg-danger shrink-0 mt-2"
                  ></span>
                </li>
                <li
                  class="flex items-start gap-3 p-3 bg-white rounded-lg border border-border-subtle hover:border-brand-muted transition-colors cursor-pointer group/item"
                >
                  <div
                    class="mt-0.5 text-neutral-300 group-hover/item:text-brand transition-colors"
                  >
                    <CircleCheckBig class="w-5 h-5" />
                  </div>
                  <div>
                    <p
                      class="text-sm font-semibold text-text-primary group-hover/item:text-brand transition-colors"
                    >
                      Viết Scorecard Phỏng vấn Lê Hùng
                    </p>
                    <p class="text-xs text-text-muted mt-0.5">
                      Phỏng vấn kết thúc lúc 11:30
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <!-- Team Presence (Mock) -->
            <div class="p-4 bg-white border border-border rounded-xl">
              <h3
                class="text-xs font-bold text-text-muted tracking-wider uppercase mb-3"
              >
                Thành viên Đang Online
              </h3>
              <div class="flex -space-x-1 overflow-hidden">
                <img
                  class="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                  src="https://ui-avatars.com/api/?name=A&background=random"
                  alt=""
                />
                <img
                  class="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                  src="https://ui-avatars.com/api/?name=B&background=random"
                  alt=""
                />
                <img
                  class="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                  src="https://ui-avatars.com/api/?name=C&background=random"
                  alt=""
                />
                <div
                  class="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-surface-muted flex items-center justify-center text-xs font-bold text-text-secondary"
                >
                  +2
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
