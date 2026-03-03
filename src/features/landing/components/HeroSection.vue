<script setup lang="ts">
import { defineAsyncComponent } from "vue";

const HeroVisual3D = defineAsyncComponent(
  () => import("@/features/landing/components/HeroVisual3D.vue"),
);
</script>

<template>
  <section
    class="relative min-h-screen flex items-center overflow-hidden bg-surface-soft pt-16"
  >
    <!-- Subtle background geometry: light teal gradient in top-right -->
    <div
      class="absolute inset-0 pointer-events-none"
      style="
        background:
          radial-gradient(
            ellipse 60% 50% at 80% 20%,
            rgba(0, 152, 152, 0.07) 0%,
            transparent 70%
          ),
          radial-gradient(
            ellipse 40% 40% at 20% 80%,
            rgba(0, 152, 152, 0.04) 0%,
            transparent 60%
          );
      "
    />

    <!-- Subtle dot grid overlay -->
    <div
      class="absolute inset-0 pointer-events-none opacity-[0.025]"
      style="
        background-image: radial-gradient(circle, #009898 1px, transparent 1px);
        background-size: 28px 28px;
      "
    />

    <div class="relative z-10 max-w-7xl mx-auto px-6 w-full py-20 lg:py-32">
      <div class="grid lg:grid-cols-[3fr_2fr] gap-12 lg:gap-16 items-center">
        <!-- Left Column: Copy -->
        <div class="space-y-8">
          <!-- Announcement badge -->
          <div
            class="section-badge w-fit animate-fade-up"
            style="animation-delay: 0ms"
          >
            🎉 VietRecruit 2.0 — AI Screening đã ra mắt →
          </div>

          <!-- H1 -->
          <h1
            class="font-display text-5xl lg:text-7xl font-bold text-text-primary leading-[1.1] tracking-tight animate-fade-up"
            style="animation-delay: 100ms"
          >
            Tuyển dụng
            <span class="text-brand italic">thông minh hơn.</span>
            <br />Nhanh hơn. Với AI.
          </h1>

          <!-- Sub-headline -->
          <p
            class="text-lg text-text-secondary leading-relaxed max-w-lg animate-fade-up font-sans"
            style="animation-delay: 200ms"
          >
            Nền tảng ATS toàn diện giúp đội ngũ HR Việt Nam tự động hóa quy
            trình tuyển dụng, sàng lọc ứng viên bằng AI và đưa ra quyết định dựa
            trên dữ liệu.
          </p>

          <!-- CTA row -->
          <div
            class="flex items-center gap-4 flex-wrap animate-fade-up"
            style="animation-delay: 300ms"
          >
            <a href="/register" class="btn-primary px-7 py-3.5 text-base">
              Bắt đầu miễn phí — 14 ngày
            </a>
            <button
              class="inline-flex items-center gap-2.5 bg-white text-text-primary border border-border hover:border-brand/50 text-base font-medium px-5 py-3 rounded-lg transition-all duration-200 hover:bg-surface-muted"
              type="button"
            >
              <span
                class="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-primary/70"
              >
                <svg
                  width="10"
                  height="12"
                  viewBox="0 0 10 12"
                  fill="currentColor"
                >
                  <path d="M0 0l10 6-10 6V0z" />
                </svg>
              </span>
              Xem demo
            </button>
          </div>

          <!-- Social proof -->
          <div
            class="flex items-center gap-3 animate-fade-up pt-4"
            style="animation-delay: 400ms"
          >
            <!-- Stacked avatars -->
            <div class="flex -space-x-2">
              <div
                v-for="i in 4"
                :key="i"
                class="w-8 h-8 rounded-full border-2 border-surface"
                :style="`background: linear-gradient(135deg, #009898 ${i * 15}%, #005F5F)`"
              />
            </div>
            <div class="flex items-center gap-2">
              <div class="flex gap-0.5">
                <span v-for="s in 5" :key="s" class="text-amber-400 text-xs"
                  >★</span
                >
              </div>
              <span class="text-sm text-text-secondary">
                Được tin dùng bởi
                <strong class="text-text-primary font-semibold">500+</strong>
                doanh nghiệp VN
              </span>
            </div>
          </div>
        </div>

        <!-- Right Column: 3D Visual -->
        <div
          class="relative hidden lg:block animate-fade-up z-0 opacity-90 h-[520px]"
        >
          <Suspense>
            <HeroVisual3D />
          </Suspense>
        </div>
      </div>
    </div>
  </section>
</template>
