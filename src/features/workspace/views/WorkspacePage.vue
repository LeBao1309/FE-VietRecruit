<script setup lang="ts">
import { useAuthStore } from "@/core/stores/auth.store";

const authStore = useAuthStore();
</script>

<template>
  <div
    class="min-h-screen bg-surface flex flex-col items-center justify-center px-6 text-center"
  >
    <div
      class="absolute inset-0 pointer-events-none"
      style="
        background: radial-gradient(
          ellipse 60% 50% at 50% 30%,
          rgba(0, 140, 140, 0.08) 0%,
          transparent 70%
        );
      "
      aria-hidden="true"
    />

    <div class="relative z-10 max-w-md">
      <div class="flex items-center justify-center gap-2.5 mb-8">
        <img
          src="@/assets/img/vietrecruit-icon.svg"
          alt="VietRecruit"
          class="h-8"
        />
        <span class="font-semibold text-text-primary">VietRecruit</span>
      </div>

      <h1 class="font-display text-3xl text-text-primary mb-2">
        Workspace đang được xây dựng
      </h1>
      <p class="text-text-secondary text-sm mb-8">
        Dashboard đang trong quá trình phát triển. Cảm ơn bạn đã đăng ký!
      </p>
      <button
        type="button"
        class="btn-primary px-6 py-3"
        @click="authStore.logout()"
      >
        Đăng xuất
      </button>
    </div>
  </div>
</template>
