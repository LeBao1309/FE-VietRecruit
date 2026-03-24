<template>
  <div class="min-h-screen flex font-sans">
    <!-- Left brand panel — hidden on mobile -->
    <div
      class="hidden md:flex md:w-1/2 lg:w-3/5 bg-[#009898] relative overflow-hidden flex-col justify-between p-12"
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
        <div class="flex items-center gap-3 mb-16">
          <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <div class="w-6 h-6 bg-[#009898] rounded-md rotate-45 flex items-center justify-center">
              <div class="w-3 h-3 bg-white rounded-full -rotate-45"></div>
            </div>
          </div>
          <span class="text-white font-bold text-2xl tracking-tight">VietRecruit</span>
        </div>

        <!-- Slot for per-page headline and value props -->
        <slot name="brand-content" />
      </div>

      <!-- Testimonial / Branding Footer -->
      <div class="relative z-10 bg-white/10 rounded-2xl p-6 border border-white/20 backdrop-blur-sm">
        <p class="text-white/90 text-sm leading-relaxed italic mb-4">
          "VietRecruit helps us reduce CV screening time by 70%, allowing our team to focus on what matters: the people."
        </p>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold">
            TL
          </div>
          <div>
            <div class="text-white text-sm font-semibold">Nguyễn Thị Lan</div>
            <div class="text-white/60 text-xs uppercase tracking-wider">HR Director, Techcombank</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right form panel -->
    <div class="flex-1 flex items-center justify-center bg-gray-50 p-6 md:p-12 lg:p-16">
      <div class="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
        <!-- Mobile logo -->
        <div class="flex md:hidden items-center gap-2 mb-8 justify-center">
          <div class="w-8 h-8 bg-[#009898] rounded-lg flex items-center justify-center">
            <div class="w-4 h-4 bg-white rounded-sm rotate-45 flex items-center justify-center">
              <div class="w-2 h-2 bg-[#009898] rounded-full -rotate-45"></div>
            </div>
          </div>
          <span class="font-bold text-gray-900 text-xl tracking-tight">VietRecruit</span>
        </div>

        <!-- Per-page form content -->
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No props, no emits as per spec.
</script>
