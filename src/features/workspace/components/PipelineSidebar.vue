<script setup lang="ts">
import { LayoutDashboard, Users, BarChart3, Settings } from "lucide-vue-next";
import { useToast } from "vue-toastification";

const toast = useToast();
const showAlert = (msg: string) => toast.info(msg);

const navItems = [
  {
    id: "dashboard",
    label: "Tổng quan",
    icon: LayoutDashboard,
    to: "/workspace",
  },
  {
    id: "pipeline",
    label: "Kênh tuyển dụng",
    icon: Users,
    to: "/workspace/pipeline",
  },
  { id: "analytics", label: "Phân tích", icon: BarChart3, to: "" },
  {
    id: "settings",
    label: "Cài đặt công việc",
    icon: Settings,
    to: "",
  },
];

const stats = [
  { label: "Đã nộp", count: 12, percent: 100, color: "#008C8C" },
  { label: "Sàng lọc", count: 4, percent: 33, color: "#008C8C" },
  { label: "Phỏng vấn", count: 2, percent: 17, color: "#008C8C" },
  { label: "Đề nghị", count: 1, percent: 8, color: "#008C8C" },
  { label: "Đã tuyển", count: 1, percent: 8, color: "#059669" },
];
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
            (item.to === '/workspace' ? isExactActive : isActive)
              ? 'text-[#008C8C] font-medium bg-[#008C8C]/5'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
          ]"
        >
          <div
            v-if="item.to === '/workspace' ? isExactActive : isActive"
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
      </div>

      <div class="mt-6 pt-4 border-t border-gray-200 border-dashed">
        <p class="text-xs text-gray-500">
          <strong class="text-gray-900 font-medium">8.3%</strong> tỷ lệ chuyển
          đổi
        </p>
      </div>
    </div>
  </div>
</template>
