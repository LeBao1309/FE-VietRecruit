<script setup lang="ts">
import {
  Bot,
  LayoutDashboard,
  BarChart3,
  Megaphone,
  CalendarCheck,
  ShieldCheck,
} from "lucide-vue-next";
import type { Component } from "vue";

interface Feature {
  id: string;
  icon: Component;
  title: string;
  description: string;
  colSpan: string;
  rowSpan?: string;
  visual: "kanban" | "analytics" | "multipost" | "default";
}

const features: Feature[] = [
  {
    id: "ai-screening",
    icon: Bot,
    title: "AI Sàng lọc CV",
    description:
      "Tự động chấm điểm và xếp hạng ứng viên theo JD với độ chính xác 94%",
    colSpan: "md:col-span-2",
    visual: "kanban",
  },
  {
    id: "pipeline",
    icon: LayoutDashboard,
    title: "Pipeline Kanban",
    description:
      "Kéo thả ứng viên qua từng giai đoạn tuyển dụng trực quan, theo thời gian thực",
    colSpan: "md:col-span-1",
    visual: "default",
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Báo cáo thời gian thực",
    description:
      "Dashboard analytics với 20+ metrics tuyển dụng quan trọng, xuất báo cáo PDF",
    colSpan: "md:col-span-1",
    visual: "analytics",
  },
  {
    id: "multipost",
    icon: Megaphone,
    title: "Đăng tin đa kênh",
    description:
      "Tự động đăng lên LinkedIn, VietnamWorks, TopCV chỉ 1 click, theo dõi hiệu quả từng kênh",
    colSpan: "md:col-span-2",
    visual: "multipost",
  },
  {
    id: "scheduling",
    icon: CalendarCheck,
    title: "Lên lịch phỏng vấn",
    description:
      "Tích hợp Google Calendar & Zoom, tự động gửi link cho ứng viên và nhà tuyển dụng",
    colSpan: "md:col-span-1",
    visual: "default",
  },
  {
    id: "security",
    icon: ShieldCheck,
    title: "Bảo mật doanh nghiệp",
    description:
      "SSO, RBAC, audit logs đầy đủ — đạt chuẩn ISO 27001 và GDPR compliant",
    colSpan: "md:col-span-1",
    visual: "default",
  },
];
</script>

<template>
  <section id="features" class="relative py-24 px-6 bg-surface-soft">
    <div class="max-w-7xl mx-auto">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <span class="section-badge mb-4"> Tính năng cốt lõi </span>
        <h2
          class="font-display text-4xl md:text-5xl text-text-primary mb-4 leading-tight font-bold"
        >
          Mọi thứ đội ngũ HR cần<br />
          <span class="text-brand italic">trong một nền tảng</span>
        </h2>
        <p
          class="text-text-secondary text-base max-w-xl mx-auto leading-relaxed"
        >
          Từ đăng tin tuyển dụng đến offer letter — VietRecruit xử lý toàn bộ
          pipeline tuyển dụng của bạn.
        </p>
      </div>

      <!-- Bento Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          v-for="feature in features"
          :key="feature.id"
          class="card group cursor-default"
          :class="
            feature.colSpan === 'md:col-span-2'
              ? 'md:col-span-2'
              : 'md:col-span-1'
          "
        >
          <!-- Icon -->
          <div
            class="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center mb-4 group-hover:bg-brand group-hover:text-white transition-all duration-300"
          >
            <component
              :is="feature.icon"
              class="w-5 h-5 text-brand group-hover:text-white"
            />
          </div>

          <!-- Text -->
          <h3 class="font-semibold text-text-primary mb-2">
            {{ feature.title }}
          </h3>
          <p class="text-sm text-text-secondary leading-relaxed">
            {{ feature.description }}
          </p>

          <!-- Large card only: mock UI screenshot -->
          <div
            v-if="feature.colSpan === 'md:col-span-2'"
            class="mt-6 rounded-xl bg-surface-muted border border-border h-32 flex items-center justify-center overflow-hidden"
          >
            <span class="text-xs text-text-muted font-mono"
              >[ Feature Preview ]</span
            >
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
