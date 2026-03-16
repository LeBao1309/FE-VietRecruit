<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { Eye, EyeOff, Loader2, CheckCircle, ArrowLeft } from "lucide-vue-next";
import AuthLayout from "@/features/auth/components/AuthLayout.vue";
import { useAuth } from "@/features/auth/composables/useAuth";
import { ResetPasswordRequestSchema } from "@/features/auth/types/auth.dto";

const auth = useAuth();
const route = useRoute();

// ── Extract token + email from URL query ──
const email = ref("");
const token = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const showConfirm = ref(false);
const resetSuccess = ref(false);

// Pre-fill from URL: /auth/reset-password?email=...&token=...
onMounted(() => {
  email.value = (route.query.email as string) ?? "";
  token.value = (route.query.token as string) ?? "";
});

// ── Validation ──
const fieldErrors = ref<Record<string, string>>({});
const submitted = ref(false);

function validate(): boolean {
  fieldErrors.value = {};

  // Confirm password (UI-only)
  if (newPassword.value !== confirmPassword.value) {
    fieldErrors.value.confirmPassword = "Mật khẩu xác nhận không khớp";
    return false;
  }

  const result = ResetPasswordRequestSchema.safeParse({
    email: email.value,
    token: token.value,
    newPassword: newPassword.value,
  });

  if (!result.success) {
    for (const issue of result.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors.value[key]) fieldErrors.value[key] = issue.message;
    }
    return false;
  }

  return true;
}

async function handleSubmit(): Promise<void> {
  submitted.value = true;
  if (!validate()) return;

  const success = await auth.resetPassword({
    email: email.value,
    token: token.value,
    newPassword: newPassword.value,
  });

  if (success) {
    resetSuccess.value = true;
  }
}

// Clear API error on input
watch([newPassword, confirmPassword], () => {
  if (auth.hasError.value) auth.clearError();
});
</script>

<template>
  <AuthLayout>
    <!-- Left panel brand content -->
    <template #brand-content>
      <h2 class="font-display text-4xl font-bold text-white leading-tight mb-6">
        Đặt lại mật khẩu<br />của bạn
      </h2>
      <p class="text-white/80 text-sm leading-relaxed">
        Tạo mật khẩu mới an toàn để bảo vệ tài khoản. Mật khẩu phải có ít nhất
        8 ký tự.
      </p>
    </template>

    <!-- State A: Form -->
    <template v-if="!resetSuccess">
      <h2 class="font-display text-2xl font-bold text-text-primary mb-1">
        Tạo mật khẩu mới
      </h2>
      <p class="text-text-secondary text-sm mb-8">
        Nhập mật khẩu mới cho tài khoản của bạn
      </p>

      <!-- API error alert -->
      <div
        v-if="auth.error.value"
        role="alert"
        class="mb-6 p-3 rounded-lg bg-danger/10 text-danger text-sm"
      >
        {{ auth.error.value }}
      </div>

      <!-- Token missing warning -->
      <div
        v-if="!token"
        role="alert"
        class="mb-6 p-3 rounded-lg bg-warning/10 text-warning-dark text-sm"
      >
        Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng
        <RouterLink
          to="/auth/forgot-password"
          class="text-brand font-semibold hover:underline"
        >
          yêu cầu liên kết mới
        </RouterLink>.
      </div>

      <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
        <!-- Email (read-only if pre-filled) -->
        <div>
          <label
            for="reset-email"
            class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
          >
            Email
          </label>
          <input
            id="reset-email"
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="you@company.com"
            class="input"
            :class="{ '!border-danger': submitted && fieldErrors.email }"
            :readonly="!!route.query.email"
          />
          <p
            v-if="submitted && fieldErrors.email"
            class="text-danger text-xs mt-1.5"
          >
            {{ fieldErrors.email }}
          </p>
        </div>

        <!-- New Password -->
        <div>
          <label
            for="reset-new-password"
            class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
          >
            Mật khẩu mới
          </label>
          <div class="relative">
            <input
              id="reset-new-password"
              v-model="newPassword"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="Ít nhất 8 ký tự"
              maxlength="72"
              class="input pr-11"
              :class="{ '!border-danger': submitted && fieldErrors.newPassword }"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors p-1"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
            >
              <EyeOff v-if="showPassword" :size="16" aria-hidden="true" />
              <Eye v-else :size="16" aria-hidden="true" />
            </button>
          </div>
          <p
            v-if="submitted && fieldErrors.newPassword"
            class="text-danger text-xs mt-1.5"
          >
            {{ fieldErrors.newPassword }}
          </p>
        </div>

        <!-- Confirm Password -->
        <div>
          <label
            for="reset-confirm-password"
            class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
          >
            Xác nhận mật khẩu
          </label>
          <div class="relative">
            <input
              id="reset-confirm-password"
              v-model="confirmPassword"
              :type="showConfirm ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="Nhập lại mật khẩu mới"
              maxlength="72"
              class="input pr-11"
              :class="{ '!border-danger': submitted && fieldErrors.confirmPassword }"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors p-1"
              @click="showConfirm = !showConfirm"
              :aria-label="showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
            >
              <EyeOff v-if="showConfirm" :size="16" aria-hidden="true" />
              <Eye v-else :size="16" aria-hidden="true" />
            </button>
          </div>
          <p
            v-if="submitted && fieldErrors.confirmPassword"
            class="text-danger text-xs mt-1.5"
          >
            {{ fieldErrors.confirmPassword }}
          </p>
        </div>

        <!-- Submit -->
        <button
          id="reset-password-submit"
          type="submit"
          class="btn-primary w-full py-3 text-base mt-2"
          :disabled="auth.isLoading.value || !token"
        >
          <Loader2
            v-if="auth.isLoading.value"
            :size="18"
            class="animate-spin"
            aria-hidden="true"
          />
          <span v-else>Đặt lại mật khẩu</span>
        </button>
      </form>

      <!-- Back link -->
      <div class="mt-8 text-center">
        <RouterLink
          to="/auth/login"
          class="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-brand transition-colors"
        >
          <ArrowLeft :size="14" aria-hidden="true" />
          Quay lại đăng nhập
        </RouterLink>
      </div>
    </template>

    <!-- State B: Success -->
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
          Đặt lại mật khẩu thành công
        </h2>
        <p class="text-text-secondary text-sm mb-8">
          Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập với mật khẩu mới.
        </p>

        <RouterLink
          to="/auth/login"
          class="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm"
        >
          Đăng nhập ngay
        </RouterLink>
      </div>
    </template>
  </AuthLayout>
</template>
