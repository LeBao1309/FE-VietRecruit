<script setup lang="ts"></script>

<template>
  <!-- Option A: Full brand teal background -->
  <section class="py-24 bg-brand relative overflow-hidden">
    <div
      class="absolute inset-0 opacity-10 pointer-events-none"
      style="
        background-image: radial-gradient(
          circle,
          rgba(255, 255, 255, 0.4) 1px,
          transparent 1px
        );
        background-size: 24px 24px;
      "
    />
    <div class="relative z-10 max-w-3xl mx-auto px-6 text-center">
      <h2 class="font-display text-4xl font-bold text-white mb-4">
        Sẵn sàng tuyển dụng thông minh hơn?
      </h2>
      <p class="text-white/70 text-lg mb-8">
        Dùng thử miễn phí 14 ngày. Không cần thẻ tín dụng.
      </p>
      <div class="flex items-center justify-center gap-4 flex-wrap">
        <a
          href="/auth/register"
          class="bg-white text-brand font-semibold px-8 py-4 rounded-xl text-base hover:bg-brand-light transition-all hover:shadow-lg"
        >
          Bắt đầu miễn phí ngay →
        </a>
        <a
          href="#demo"
          class="border border-white/40 text-white font-semibold px-8 py-4 rounded-xl text-base hover:bg-white/10 transition-all"
        >
          Đặt lịch demo
        </a>
      </div>
      <p class="text-white/50 text-sm mt-6">
        ⭐ 4.9/5 từ 200+ reviews · Setup trong 5 phút · Cancel anytime
      </p>
    </div>
  </section>
</template>
