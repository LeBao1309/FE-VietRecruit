<script setup lang="ts">
import { ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { Eye, EyeOff, Loader2 } from "lucide-vue-next";
import AuthLayout from "@/features/auth/components/AuthLayout.vue";
import { useAuth } from "@/features/auth/composables/useAuth";
import { LoginRequestSchema } from "@/features/auth/types/auth.dto";

const auth = useAuth();

// ── Form state ──
const email = ref("");
const password = ref("");
const showPassword = ref(false);

// ── Validation ──
const fieldErrors = ref<{ email?: string; password?: string }>({});
const submitted = ref(false);

function validate(): boolean {
  const result = LoginRequestSchema.safeParse({
    email: email.value,
    password: password.value,
  });

  if (!result.success) {
    const errs: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = String(issue.path[0]);
      if (!errs[key]) errs[key] = issue.message;
    }
    fieldErrors.value = errs;
    return false;
  }

  fieldErrors.value = {};
  return true;
}

async function handleSubmit(): Promise<void> {
  submitted.value = true;
  if (!validate()) return;
  await auth.login({ email: email.value, password: password.value });
}

// Clear API error on any input change
watch([email, password], () => {
  if (auth.hasError.value) auth.clearError();
});

// ── Left panel content ──
const valueProps = [
  "Sàng lọc CV tự động bằng AI với độ chính xác 94%",
  "Pipeline Kanban trực quan, sync thời gian thực",
  "Tích hợp 10+ job boards và calendar",
];
</script>

<template>
  <AuthLayout>
    <!-- Left panel brand content -->
    <template #brand-content>
      <h2 class="font-display text-4xl font-bold text-white leading-tight mb-6">
        Chào mừng trở lại<br />với VietRecruit ATS
      </h2>
      <ul class="space-y-3 mb-12">
        <li
          v-for="vp in valueProps"
          :key="vp"
          class="flex items-center gap-3 text-white/80 text-sm"
        >
          <span
            class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-xs"
            >✓</span
          >
          {{ vp }}
        </li>
      </ul>
    </template>

    <!-- Right panel form -->
    <h2 class="font-display text-2xl font-bold text-text-primary mb-1">
      Đăng nhập
    </h2>
    <p class="text-text-secondary text-sm mb-8">
      Tiếp tục với tài khoản VietRecruit của bạn
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
          for="login-email"
          class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
        >
          Email
        </label>
        <input
          id="login-email"
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

      <!-- Password -->
      <div>
        <div class="flex items-center justify-between mb-1.5">
          <label
            for="login-password"
            class="block text-xs font-semibold text-text-secondary uppercase tracking-wider"
          >
            Mật khẩu
          </label>
          <RouterLink
            to="/auth/forgot-password"
            class="text-xs text-brand hover:text-brand-dark transition-colors"
          >
            Quên mật khẩu?
          </RouterLink>
        </div>
        <div class="relative">
          <input
            id="login-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            placeholder="••••••••"
            class="input pr-11"
            :class="{ '!border-danger': submitted && fieldErrors.password }"
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
          v-if="submitted && fieldErrors.password"
          class="text-danger text-xs mt-1.5"
        >
          {{ fieldErrors.password }}
        </p>
      </div>

      <!-- Submit -->
      <button
        id="login-submit"
        type="submit"
        class="btn-primary w-full py-3 text-base mt-2"
        :disabled="auth.isLoading.value"
      >
        <Loader2
          v-if="auth.isLoading.value"
          :size="18"
          class="animate-spin"
          aria-hidden="true"
        />
        <span v-else>Đăng nhập</span>
      </button>
    </form>

    <!-- Register link -->
    <p class="text-center text-sm text-text-secondary mt-8">
      Chưa có tài khoản?
      <RouterLink
        to="/auth/register"
        class="text-brand hover:text-brand-dark transition-colors font-semibold"
      >
        Dùng thử miễn phí →
      </RouterLink>
    </p>
  </AuthLayout>
</template>
