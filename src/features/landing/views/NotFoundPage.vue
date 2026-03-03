<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <div
    class="min-h-screen bg-surface flex flex-col items-center justify-center px-6 text-center"
  >
    <div class="relative">
      <!-- Glow -->
      <div
        class="absolute inset-0 pointer-events-none"
        style="
          background: radial-gradient(
            ellipse 60% 60% at 50% 50%,
            rgba(0, 140, 140, 0.12) 0%,
            transparent 70%
          );
        "
        aria-hidden="true"
      />

      <!-- 404 Number -->
      <p
        class="font-mono text-8xl md:text-[160px] font-bold text-brand/20 leading-none select-none"
        aria-hidden="true"
      >
        404
      </p>
    </div>

    <div class="relative z-10 -mt-6 md:-mt-12">
      <h1 class="font-display text-3xl md:text-5xl text-white mb-4">
        Trang không tồn tại
      </h1>
      <p class="text-[#6B7280] text-base mb-8 max-w-sm mx-auto">
        Trang bạn đang tìm không tồn tại hoặc đã bị xóa.
      </p>
      <RouterLink
        to="/"
        class="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 hover:shadow-brand-glow"
      >
        Về trang chủ
      </RouterLink>
    </div>
  </div>
</template>
