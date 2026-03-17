<script setup lang="ts">
import { ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { CheckCircle } from "lucide-vue-next";
import AuthLayout from "@/features/auth/components/AuthLayout.vue";
import { useAuth } from "@/features/auth/composables/useAuth";
import { ChangePasswordRequestSchema } from "@/features/auth/types/auth.dto";

const auth = useAuth();

// ── Form state ──
const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const showCurrent = ref(false);
const showNew = ref(false);
const showConfirm = ref(false);
const changeSuccess = ref(false);

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

  // Same password check
  if (currentPassword.value === newPassword.value) {
    fieldErrors.value.newPassword =
      "Mật khẩu mới phải khác mật khẩu hiện tại";
    return false;
  }

  const result = ChangePasswordRequestSchema.safeParse({
    currentPassword: currentPassword.value,
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

  const success = await auth.changePassword({
    currentPassword: currentPassword.value,
    newPassword: newPassword.value,
  });

  if (success) {
    changeSuccess.value = true;
  }
}

// Clear API error on input
watch([currentPassword, newPassword, confirmPassword], () => {
  if (auth.hasError.value) auth.clearError();
});
</script>

<template>
  <AuthLayout>
    <!-- Left panel brand content -->
    <template #brand-content>
      <h2 class="font-display text-4xl font-bold text-white leading-tight mb-6">
        Bảo mật tài khoản<br />của bạn
      </h2>
      <p class="text-white/80 text-sm leading-relaxed">
        Thay đổi mật khẩu định kỳ giúp bảo vệ tài khoản khỏi truy cập trái
        phép. Mật khẩu mới phải có ít nhất 8 ký tự.
      </p>
    </template>

    <!-- State A: Form -->
    <template v-if="!changeSuccess">
      <h2 class="font-display text-2xl font-bold text-text-primary mb-1">
        Đổi mật khẩu
      </h2>
      <p class="text-text-secondary text-sm mb-8">
        Nhập mật khẩu hiện tại và mật khẩu mới
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
        <!-- Current Password -->
        <div>
          <label
            for="change-current-password"
            class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
          >
            Mật khẩu hiện tại
          </label>
          <div class="relative">
            <input
              id="change-current-password"
              v-model="currentPassword"
              :type="showCurrent ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="••••••••"
              maxlength="72"
              class="input pr-11"
              :class="{ '!border-danger': submitted && fieldErrors.currentPassword }"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors px-2 py-1 bg-white"
              @click="showCurrent = !showCurrent"
            >
              {{ showCurrent ? 'Ẩn' : 'Hiện' }}
            </button>
          </div>
          <p
            v-if="submitted && fieldErrors.currentPassword"
            class="text-danger text-xs mt-1.5"
          >
            {{ fieldErrors.currentPassword }}
          </p>
        </div>

        <!-- New Password -->
        <div>
          <label
            for="change-new-password"
            class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
          >
            Mật khẩu mới
          </label>
          <div class="relative">
            <input
              id="change-new-password"
              v-model="newPassword"
              :type="showNew ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="Ít nhất 8 ký tự"
              maxlength="72"
              class="input pr-11"
              :class="{ '!border-danger': submitted && fieldErrors.newPassword }"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors px-2 py-1 bg-white"
              @click="showNew = !showNew"
            >
              {{ showNew ? 'Ẩn' : 'Hiện' }}
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
            for="change-confirm-password"
            class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
          >
            Xác nhận mật khẩu mới
          </label>
          <div class="relative">
            <input
              id="change-confirm-password"
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
              class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors px-2 py-1 bg-white"
              @click="showConfirm = !showConfirm"
            >
              {{ showConfirm ? 'Ẩn' : 'Hiện' }}
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
          id="change-password-submit"
          type="submit"
          class="btn-primary w-full px-4 py-3 text-base mt-2"
          :disabled="auth.isLoading.value"
        >
          <span>{{ auth.isLoading.value ? 'Đang xử lý...' : 'Đổi mật khẩu' }}</span>
        </button>
      </form>

      <!-- Back link -->
      <div class="mt-8 text-center">
        <RouterLink
          to="/workspace"
          class="inline-flex text-sm text-text-secondary hover:text-brand transition-colors"
        >
          Quay lại trang quản lý
        </RouterLink>
      </div>
    </template>

    <!-- State B: Success — user is logged out at this point -->
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
          Đổi mật khẩu thành công
        </h2>
        <p class="text-text-secondary text-sm mb-8">
          Tất cả phiên đăng nhập đã bị thu hồi. Vui lòng đăng nhập lại với mật
          khẩu mới.
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
