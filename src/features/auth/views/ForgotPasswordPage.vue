<script setup lang="ts">
import { ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { Loader2, CheckCircle, ArrowLeft } from "lucide-vue-next";
import AuthLayout from "@/features/auth/components/AuthLayout.vue";
import { useAuth } from "@/features/auth/composables/useAuth";
import { ForgotPasswordRequestSchema } from "@/features/auth/types/auth.dto";

const auth = useAuth();

// ── Form state ──
const email = ref("");
const emailSent = ref(false);
const sentEmail = ref("");

// ── Validation ──
const fieldErrors = ref<{ email?: string }>({});
const submitted = ref(false);

function validate(): boolean {
  const result = ForgotPasswordRequestSchema.safeParse({ email: email.value });

  if (!result.success) {
    const emailIssue = result.error.issues.find((i) => i.path[0] === "email");
    fieldErrors.value = { email: emailIssue?.message };
    return false;
  }

  fieldErrors.value = {};
  return true;
}

async function handleSubmit(): Promise<void> {
  submitted.value = true;
  if (!validate()) return;

  const success = await auth.forgotPassword({ email: email.value });
  if (success) {
    sentEmail.value = email.value;
    emailSent.value = true;
    startCooldown();
  }
}

// ── Resend cooldown ──
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
  const success = await auth.forgotPassword({ email: sentEmail.value });
  if (success) startCooldown();
}

// Clear API error on input change
watch(email, () => {
  if (auth.hasError.value) auth.clearError();
});
</script>

<template>
  <AuthLayout>
    <!-- Left panel brand content -->
    <template #brand-content>
      <h2 class="font-display text-4xl font-bold text-white leading-tight mb-6">
        Đặt lại mật khẩu<br />dễ dàng
      </h2>
      <p class="text-white/80 text-sm leading-relaxed">
        Nhập email đã đăng ký và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu cho
        bạn.
      </p>
    </template>

    <!-- Right panel — State A: Form -->
    <template v-if="!emailSent">
      <h2 class="font-display text-2xl font-bold text-text-primary mb-1">
        Quên mật khẩu?
      </h2>
      <p class="text-text-secondary text-sm mb-8">
        Nhập email để nhận hướng dẫn đặt lại mật khẩu
      </p>

      <!-- API error alert -->
      <div
        v-if="auth.error.value"
        role="alert"
        class="mb-6 p-3 rounded-lg bg-danger/10 text-danger text-sm"
      >
        {{ auth.error.value }}
      </div>

      <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
        <!-- Email -->
        <div>
          <label
            for="forgot-email"
            class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
          >
            Email
          </label>
          <input
            id="forgot-email"
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="you@company.com"
            class="input"
            :class="{ '!border-danger': submitted && fieldErrors.email }"
          />
          <p
            v-if="submitted && fieldErrors.email"
            class="text-danger text-xs mt-1.5"
          >
            {{ fieldErrors.email }}
          </p>
        </div>

        <!-- Submit -->
        <button
          id="forgot-password-submit"
          type="submit"
          class="btn-primary w-full py-3 text-base"
          :disabled="auth.isLoading.value"
        >
          <Loader2
            v-if="auth.isLoading.value"
            :size="18"
            class="animate-spin"
            aria-hidden="true"
          />
          <span v-else>Gửi hướng dẫn đặt lại mật khẩu</span>
        </button>
      </form>

      <!-- Back to login -->
      <div class="mt-8 text-center">
        <RouterLink
          to="/login"
          class="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-brand transition-colors"
        >
          <ArrowLeft :size="14" aria-hidden="true" />
          Quay lại đăng nhập
        </RouterLink>
      </div>
    </template>

    <!-- Right panel — State B: Success -->
    <template v-else>
      <div class="text-center">
        <div class="flex justify-center mb-6">
          <div
            class="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center"
          >
            <CheckCircle :size="32" class="text-brand" />
          </div>
        </div>

        <h2 class="font-display text-2xl font-bold text-text-primary mb-2">
          Kiểm tra email của bạn
        </h2>
        <p class="text-text-secondary text-sm mb-2">
          Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến
        </p>
        <p class="text-brand font-semibold text-sm mb-6">
          {{ sentEmail }}
        </p>

        <p class="text-text-muted text-xs mb-4">
          Không nhận được email? Kiểm tra thư mục spam hoặc
          <button
            v-if="resendCooldown <= 0"
            type="button"
            class="text-brand hover:text-brand-dark font-semibold transition-colors"
            :disabled="auth.isLoading.value"
            @click="handleResend"
          >
            Gửi lại
          </button>
          <span v-else class="text-text-muted">
            gửi lại sau {{ resendCooldown }}s
          </span>
        </p>

        <RouterLink
          to="/login"
          class="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-brand transition-colors mt-4"
        >
          <ArrowLeft :size="14" aria-hidden="true" />
          Quay lại đăng nhập
        </RouterLink>
      </div>
    </template>
  </AuthLayout>
</template>
