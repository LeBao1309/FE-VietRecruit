<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const isScrolled = ref(false);
const navLinks = [
  { label: "Tính năng", href: "#features" },
  { label: "Bảng giá", href: "#pricing" },
  { label: "Blog", href: "/blog" },
];

function handleScroll() {
  isScrolled.value = window.scrollY > 20;
}
onMounted(() =>
  window.addEventListener("scroll", handleScroll, { passive: true }),
);
onUnmounted(() => window.removeEventListener("scroll", handleScroll));
</script>

<template>
  <nav
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="
      isScrolled
        ? 'bg-white/90 backdrop-blur-xl border-b border-border shadow-sm'
        : 'bg-transparent'
    "
  >
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <!-- Logo -->
      <a href="/" class="flex items-center gap-2.5 group">
        <img
          src="@/assets/img/vietrecruit-icon.svg"
          alt="VietRecruit"
          class="h-7 w-auto"
        />
        <span
          class="font-semibold text-text-primary text-[15px] tracking-tight"
        >
          VietRecruit
        </span>
      </a>

      <!-- Nav Links -->
      <div class="hidden md:flex items-center gap-1">
        <a
          v-for="link in navLinks"
          :key="link.label"
          :href="link.href"
          class="px-4 py-2 rounded-lg text-sm text-text-secondary font-medium transition-all duration-150 hover:text-text-primary hover:bg-surface-muted"
        >
          {{ link.label }}
        </a>
      </div>

      <!-- CTA Row -->
      <div class="flex items-center gap-3">
        <a href="/login" class="btn-ghost text-sm">Đăng nhập</a>
        <a href="/register" class="btn-primary text-sm">
          Dùng thử miễn phí →
        </a>
      </div>
    </div>
  </nav>
</template>
