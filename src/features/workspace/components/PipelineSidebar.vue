<script setup lang="ts">
import { computed } from 'vue';
import { LayoutDashboard, Users, BarChart3, Settings } from "lucide-vue-next";
import { useToast } from "vue-toastification";
import { ROUTE_NAMES } from "@/core/constants/route-names";
import { usePipelineStore } from '@/features/pipeline/stores/usePipelineStore';
import { PIPELINE_STAGE_CONFIG } from '@/core/constants/pipeline-stages';

const toast = useToast();
const showAlert = (msg: string) => toast.info(msg);

const navItems = [
  {
    id: "dashboard",
    label: "Tổng quan",
    icon: LayoutDashboard,
    to: { name: ROUTE_NAMES.WORKSPACE },
    isDashboard: true,
  },
  {
    id: "pipeline",
    label: "Kênh tuyển dụng",
    icon: Users,
    to: { name: ROUTE_NAMES.PIPELINE },
    isDashboard: false,
  },
  { id: "analytics", label: "Phân tích", icon: BarChart3, to: "", isDashboard: false },
  {
    id: "settings",
    label: "Cài đặt công việc",
    icon: Settings,
    to: "",
    isDashboard: false,
  },
];

const pipelineStore = usePipelineStore()

const stats = computed(() => {
  const byStatus = pipelineStore.applicationsByStatus
  const total = pipelineStore.totalApplications || 1

  return PIPELINE_STAGE_CONFIG.map((stage) => ({
    label:   stage.label,
    color:   stage.color,
    count:   byStatus[stage.status as keyof typeof byStatus]?.length ?? 0,
    percent: Math.round(((byStatus[stage.status as keyof typeof byStatus]?.length ?? 0) / total) * 100),
  }))
})

const conversionRate = computed(() => pipelineStore.conversionRate)
</script>

<template>
  <div
    class="w-[240px] flex-shrink-0 bg-[#F8FAFA] border-r border-gray-200 flex flex-col h-full z-10"
  >
    <!-- Nav -->
    <nav class="py-4 flex flex-col gap-1">
      <RouterLink
        v-for="item in navItems"
        :key="item.id"
        :to="item.to || '#'"
        custom
        v-slot="{ isActive, isExactActive, href, navigate }"
      >
        <a
          :href="item.to ? href : '#'"
          @click="
            (e) => {
              if (!item.to) {
                e.preventDefault();
                showAlert(
                  `Tính năng [${item.label}] đang được phát triển trong bản cập nhật tới!`,
                );
              } else {
                navigate(e);
              }
            }
          "
          :class="[
            'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors relative',
            (item.isDashboard ? isExactActive : isActive)
              ? 'text-[#008C8C] font-medium bg-[#008C8C]/5'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
          ]"
        >
          <div
            v-if="item.isDashboard ? isExactActive : isActive"
            class="absolute left-0 top-0 bottom-0 w-0.5 bg-[#008C8C]"
          ></div>
          <component :is="item.icon" class="w-4 h-4" />
          {{ item.label }}
        </a>
      </RouterLink>
    </nav>

    <div class="px-6 py-2">
      <div class="h-px bg-gray-200 w-full"></div>
    </div>

    <!-- Stats -->
    <div class="px-4 py-4">
      <h3
        class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4"
      >
        Tổng quan
      </h3>

      <div class="space-y-4">
        <template v-if="pipelineStore.isLoading">
          <div v-for="_ in 5" :key="_" class="space-y-1.5">
            <div class="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div class="h-1.5 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </template>
        
        <template v-else>
          <div v-for="stat in stats" :key="stat.label" class="space-y-1.5">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-700">{{ stat.label }}</span>
              <span class="text-gray-900 font-medium">{{ stat.count }}</span>
            </div>
            <div class="flex items-center gap-3">
              <div
                class="h-1.5 rounded-full bg-gray-200 bg-opacity-70 flex-1 overflow-hidden"
              >
                <div
                  class="h-full rounded-full transition-all duration-1000 ease-out"
                  :style="{
                    width: `${stat.percent}%`,
                    backgroundColor: stat.color,
                  }"
                ></div>
              </div>
              <span class="text-[10px] text-gray-500 w-7 text-right"
                >{{ stat.percent }}%</span
              >
            </div>
          </div>
        </template>

        <template v-if="!pipelineStore.isLoading && pipelineStore.totalApplications === 0">
          <p class="text-xs text-gray-400 text-center py-2">Chưa có ứng viên nào</p>
        </template>
      </div>

      <div class="mt-6 pt-4 border-t border-gray-200 border-dashed">
        <p class="text-xs text-gray-500">
          <strong class="text-gray-900 font-medium">{{ conversionRate }}%</strong> tỷ lệ chuyển
          đổi
        </p>
      </div>
    </div>
  </div>
</template>
