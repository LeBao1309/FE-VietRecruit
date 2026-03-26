<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter, RouterLink } from "vue-router";

import AuthLayout from "@/features/auth/components/AuthLayout.vue";
import OtpVerifyForm from "@/features/auth/components/OtpVerifyForm.vue";
import { useAuth } from "@/features/auth/composables/useAuth";

const auth = useAuth();
const router = useRouter();

// ── Redirect if no pending email ──
onMounted(() => {
  if (!auth.pendingVerificationEmail.value) {
    router.push({ name: 'Register' });
  } else {
    startCooldown();
  }
});

const pendingEmail = computed(() => auth.pendingVerificationEmail.value ?? "");

// ── Submit ──
async function handleSubmit(code: string): Promise<void> {
  await auth.verifyOtp({ email: pendingEmail.value, code });
}

// ── Resend OTP with countdown ──
const resendCooldown = ref(0);
let resendTimer: ReturnType<typeof setInterval> | null = null;

function startCooldown(): void {
  if (resendTimer) clearInterval(resendTimer);
  resendCooldown.value = 60;
  resendTimer = setInterval(() => {
    resendCooldown.value--;
    if (resendCooldown.value <= 0) {
      if (resendTimer) clearInterval(resendTimer);
      resendTimer = null;
    }
  }, 1000);
}

async function handleResend(): Promise<void> {
  const success = await auth.resendOtp(pendingEmail.value);
  if (success) startCooldown();
}

onUnmounted(() => {
  if (resendTimer) clearInterval(resendTimer);
});
</script>

<template>
  <AuthLayout>
    <!-- Left panel brand content -->
    <template #brand-content>
      <h2 class="font-display text-4xl font-bold text-white leading-tight mb-6">
        Xác thực tài khoản<br />của bạn
      </h2>
      <p class="text-white/80 text-sm leading-relaxed">
        Chúng tôi đã gửi mã xác thực 8 chữ số đến email của bạn. Vui lòng kiểm
        tra hộp thư đến và nhập mã bên dưới.
      </p>
    </template>

    <OtpVerifyForm
      :email="pendingEmail"
      :is-loading="auth.isLoading.value"
      :error="auth.error.value"
      :resend-cooldown="resendCooldown"
      @submit="handleSubmit"
      @resend="handleResend"
    />

    <!-- Home button -->
    <div class="mt-8 text-center">
      <RouterLink
        to="/"
        class="inline-flex text-sm text-text-secondary hover:text-brand transition-colors font-medium"
      >
        Quay lại trang chủ
      </RouterLink>
    </div>
  </AuthLayout>
</template>
