<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRoute, RouterLink } from "vue-router";

import AuthLayout from "@/features/auth/components/AuthLayout.vue";
import { useAuth } from "@/features/auth/composables/useAuth";
import { RegisterByInviteRequestSchema } from "@/features/auth/types/auth.dto";

const auth = useAuth();
const route = useRoute();

// ── Extract token from URL query ──
const token = ref("");
const fullName = ref("");
const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const showConfirm = ref(false);

// Pre-fill token from URL: /auth/register/invite?token=...
onMounted(() => {
  token.value = (route.query.token as string) ?? "";
});

// ── Validation ──
type FieldName = "token" | "fullName" | "password" | "confirmPassword";
const fieldErrors = ref<Partial<Record<FieldName, string>>>({});
const submitted = ref(false);

function validate(): boolean {
  const result = RegisterByInviteRequestSchema.safeParse({
    token: token.value,
    fullName: fullName.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
  });

  const errs: Partial<Record<FieldName, string>> = {};
  if (!result.success) {
    for (const issue of result.error.issues) {
      const key = String(issue.path[0]) as FieldName;
      if (!errs[key]) errs[key] = issue.message;
    }
  }
  fieldErrors.value = errs;
  return result.success;
}

async function handleSubmit(): Promise<void> {
  submitted.value = true;
  if (!validate()) return;

  await auth.registerByInvite({
    token: token.value,
    fullName: fullName.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
  });
}

// Clear API error on input change
watch([fullName, password, confirmPassword], () => {
  if (auth.hasError.value) auth.clearError();
});
</script>

<template>
  <AuthLayout>
    <!-- Left panel brand content -->
    <template #brand-content>
      <h2 class="font-display text-4xl font-bold text-white leading-tight mb-6">
        Tham gia đội ngũ<br />tuyển dụng
      </h2>
      <p class="text-white/80 text-sm leading-relaxed">
        Bạn đã được mời tham gia workspace của công ty. Hoàn tất đăng ký để bắt
        đầu sử dụng VietRecruit.
      </p>
    </template>

    <!-- Right panel form -->
    <h2 class="font-display text-2xl font-bold text-text-primary mb-1">
      Đăng ký theo lời mời
    </h2>
    <p class="text-text-secondary text-sm mb-8">
      Hoàn tất thông tin để kích hoạt tài khoản
    </p>

    <!-- Token missing warning -->
    <div
      v-if="!token"
      role="alert"
      class="mb-6 p-3 rounded-lg bg-warning/10 text-warning-dark text-sm"
    >
      Liên kết mời không hợp lệ hoặc đã hết hạn. Vui lòng liên hệ quản trị
      viên công ty để nhận lại lời mời.
    </div>

    <!-- API error alert -->
    <div
      v-if="auth.error.value"
      role="alert"
      class="mb-6 p-3 rounded-lg bg-danger/10 text-danger text-sm"
    >
      {{ auth.error.value }}
    </div>

    <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
      <!-- Full Name -->
      <div>
        <label
          for="invite-fullname"
          class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
        >
          Họ và tên
        </label>
        <input
          id="invite-fullname"
          v-model="fullName"
          type="text"
          autocomplete="name"
          placeholder="Nguyễn Văn A"
          maxlength="255"
          class="input"
          :class="{ '!border-danger': submitted && fieldErrors.fullName }"
        />
        <p
          v-if="submitted && fieldErrors.fullName"
          class="text-danger text-xs mt-1.5"
        >
          {{ fieldErrors.fullName }}
        </p>
      </div>

      <!-- Password -->
      <div>
        <label
          for="invite-password"
          class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
        >
          Mật khẩu
        </label>
        <div class="relative">
          <input
            id="invite-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Tối thiểu 8 ký tự"
            maxlength="72"
            class="input pr-11"
            :class="{ '!border-danger': submitted && fieldErrors.password }"
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors px-2 py-1 bg-white"
            @click="showPassword = !showPassword"
          >
            {{ showPassword ? 'Ẩn' : 'Hiện' }}
          </button>
        </div>
        <p
          v-if="submitted && fieldErrors.password"
          class="text-danger text-xs mt-1.5"
        >
          {{ fieldErrors.password }}
        </p>
      </div>

      <!-- Confirm Password -->
      <div>
        <label
          for="invite-confirm-password"
          class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
        >
          Xác nhận mật khẩu
        </label>
        <div class="relative">
          <input
            id="invite-confirm-password"
            v-model="confirmPassword"
            :type="showConfirm ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Nhập lại mật khẩu"
            maxlength="72"
            class="input pr-11"
            :class="{
              '!border-danger': submitted && fieldErrors.confirmPassword,
            }"
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
        id="invite-register-submit"
        type="submit"
        class="btn-primary w-full px-4 py-3 text-base mt-2"
        :disabled="auth.isLoading.value || !token"
      >
        <span>{{ auth.isLoading.value ? 'Đang xử lý...' : 'Hoàn tất đăng ký' }}</span>
      </button>
    </form>

    <!-- Back to login -->
    <div class="mt-8 text-center">
      <RouterLink
        to="/auth/login"
        class="inline-flex text-sm text-text-secondary hover:text-brand transition-colors"
      >
        Quay lại đăng nhập
      </RouterLink>
    </div>
  </AuthLayout>
</template>
