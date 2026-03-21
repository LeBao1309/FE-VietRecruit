<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useRouter } from "vue-router";

import AuthLayout from "@/features/auth/components/AuthLayout.vue";
import { useAuth } from "@/features/auth/composables/useAuth";
import { VerifyOtpRequestSchema } from "@/features/auth/types/auth.dto";

const auth = useAuth();
const router = useRouter();

// ── Redirect if no pending email ──
onMounted(() => {
  if (!auth.pendingVerificationEmail.value) {
    router.push({ name: 'Register' });
  }
});

const pendingEmail = computed(() => auth.pendingVerificationEmail.value ?? "");

// ── OTP input state ──
const otpInputs = ref<string[]>(Array(8).fill(""));
const otpRefs = ref<HTMLInputElement[]>([]);
const code = computed(() => otpInputs.value.join(""));

// ── Validation ──
const codeError = ref<string | null>(null);
const submitted = ref(false);

function validate(): boolean {
  const result = VerifyOtpRequestSchema.safeParse({
    email: pendingEmail.value,
    code: code.value,
  });

  if (!result.success) {
    const codeIssue = result.error.issues.find((i) => i.path[0] === "code");
    codeError.value = codeIssue?.message ?? "Mã xác thực không hợp lệ";
    return false;
  }

  codeError.value = null;
  return true;
}

// ── OTP input handlers ──
function onOtpInput(index: number, event: Event): void {
  const target = event.target as HTMLInputElement;
  const value = target.value;

  // Only allow digits
  if (value && !/^\d$/.test(value)) {
    otpInputs.value[index] = "";
    return;
  }

  otpInputs.value[index] = value;

  // Auto-advance to next input
  if (value && index < 7) {
    nextTick(() => {
      otpRefs.value[index + 1]?.focus();
    });
  }

  // Clear error on input change
  if (auth.hasError.value) auth.clearError();
  if (codeError.value) codeError.value = null;
}

function onOtpKeydown(index: number, event: KeyboardEvent): void {
  // Auto-backspace to previous input
  if (event.key === "Backspace" && !otpInputs.value[index] && index > 0) {
    nextTick(() => {
      otpRefs.value[index - 1]?.focus();
    });
  }
}

function onOtpPaste(event: ClipboardEvent): void {
  event.preventDefault();
  const pastedData = event.clipboardData?.getData("text") ?? "";
  const digits = pastedData.replace(/\D/g, "").slice(0, 8);

  for (let i = 0; i < 8; i++) {
    otpInputs.value[i] = digits[i] ?? "";
  }

  // Focus the next empty input or last input
  const nextEmpty = otpInputs.value.findIndex((v) => !v);
  const focusIdx = nextEmpty === -1 ? 7 : nextEmpty;
  nextTick(() => {
    otpRefs.value[focusIdx]?.focus();
  });
}

// ── Submit ──
async function handleSubmit(): Promise<void> {
  submitted.value = true;
  if (!validate()) return;
  await auth.verifyOtp({ email: pendingEmail.value, code: code.value });
}

// ── Resend OTP with countdown ──
const resendCooldown = ref(0);
let resendTimer: ReturnType<typeof setInterval> | null = null;

function startCooldown(): void {
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

    <!-- Right panel form -->
    <h2 class="font-display text-2xl font-bold text-text-primary mb-1">
      Nhập mã xác thực
    </h2>
    <p class="text-text-secondary text-sm mb-2">Mã xác thực đã được gửi đến</p>
    <p class="text-brand font-semibold text-sm mb-8">
      {{ pendingEmail }}
    </p>

    <!-- API error alert -->
    <div
      v-if="auth.error.value"
      role="alert"
      class="mb-6 p-3 rounded-lg bg-danger/10 text-danger text-sm"
    >
      {{ auth.error.value }}
    </div>

    <form novalidate @submit.prevent="handleSubmit">
      <!-- 8-digit OTP input boxes -->
      <div class="flex gap-2 mb-2 justify-center">
        <input
          v-for="(_, index) in 8"
          :key="index"
          :ref="
            (el) => {
              if (el) otpRefs[index] = el as HTMLInputElement;
            }
          "
          type="text"
          inputmode="numeric"
          maxlength="1"
          :value="otpInputs[index]"
          class="w-10 h-12 text-center text-lg font-semibold text-text-primary border rounded-lg transition-all duration-200 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          :class="[
            submitted && codeError
              ? 'border-danger'
              : 'border-border hover:border-border-strong',
          ]"
          @input="onOtpInput(index, $event)"
          @keydown="onOtpKeydown(index, $event)"
          @paste="onOtpPaste"
        />
      </div>
      <p
        v-if="submitted && codeError"
        class="text-danger text-xs mt-1.5 text-center mb-4"
      >
        {{ codeError }}
      </p>

      <!-- Submit -->
      <button
        id="verify-otp-submit"
        type="submit"
        class="btn-primary w-full px-4 py-3 text-base mt-4"
        :disabled="auth.isLoading.value"
      >
        <span>{{ auth.isLoading.value ? 'Đang xử lý...' : 'Xác nhận' }}</span>
      </button>
    </form>

    <!-- Resend section -->
    <div class="text-center mt-6">
      <p class="text-text-secondary text-sm">
        Không nhận được mã?
        <button
          v-if="resendCooldown <= 0"
          type="button"
          class="text-brand hover:text-brand-dark font-semibold transition-colors ml-1"
          :disabled="auth.isLoading.value"
          @click="handleResend"
        >
          Gửi lại
        </button>
        <span v-else class="text-text-muted ml-1">
          Gửi lại sau {{ resendCooldown }}s
        </span>
      </p>
    </div>
  </AuthLayout>
</template>
