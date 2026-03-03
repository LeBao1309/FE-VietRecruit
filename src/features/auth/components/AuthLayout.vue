<template>
  <div class="min-h-screen flex">
    <!-- Left brand panel — hidden on mobile -->
    <div
      class="hidden lg:flex lg:w-3/5 bg-brand relative overflow-hidden flex-col justify-between p-12"
    >
      <!-- Background dot texture -->
      <div
        class="absolute inset-0 opacity-[0.08]"
        style="
          background-image: radial-gradient(circle, white 1px, transparent 1px);
          background-size: 20px 20px;
        "
      />

      <div class="relative z-10">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-3 mb-16">
          <img
            src="@/assets/img/vietrecruit-icon.svg"
            alt="VietRecruit"
            class="h-8 brightness-0 invert"
          />
          <span class="text-white font-semibold text-lg">VietRecruit</span>
        </RouterLink>

        <!-- Slot for per-page headline and value props -->
        <slot name="brand-content" />
      </div>

      <!-- Testimonial -->
      <div class="relative z-10 bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
        <p class="text-white/90 text-sm italic mb-3">
          "VietRecruit giúp chúng tôi giảm 70% thời gian sàng lọc CV."
        </p>
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-white/20" />
          <div>
            <div class="text-white text-xs font-semibold">Nguyễn Thị Lan</div>
            <div class="text-white/60 text-xs">HR Director, Techcombank</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right form panel -->
    <div class="flex-1 flex items-center justify-center bg-white p-8 lg:p-16">
      <div class="w-full max-w-sm">
        <!-- Mobile logo -->
        <RouterLink to="/" class="flex lg:hidden items-center gap-2 mb-8">
          <img
            src="@/assets/img/vietrecruit-icon.svg"
            alt="VietRecruit"
            class="h-6"
          />
          <span class="font-semibold text-text-primary">VietRecruit</span>
        </RouterLink>

        <!-- Per-page form content -->
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>
