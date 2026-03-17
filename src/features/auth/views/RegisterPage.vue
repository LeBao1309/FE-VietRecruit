<script setup lang="ts">
import { ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { Eye, EyeOff, Loader2 } from "lucide-vue-next";
import AuthLayout from "@/features/auth/components/AuthLayout.vue";
import { useAuth } from "@/features/auth/composables/useAuth";
import { RegisterRequestSchema } from "@/features/auth/types/auth.dto";

const auth = useAuth();

// ── Form state ──
const fullName = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const phone = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const agreeToTerms = ref(false);

// ── Validation ──
type FieldName =
  | "fullName"
  | "email"
  | "password"
  | "confirmPassword"
  | "phone";
const fieldErrors = ref<Partial<Record<FieldName, string>>>({});
const submitted = ref(false);
const termsError = ref<string | null>(null);

function validate(): boolean {
  const result = RegisterRequestSchema.safeParse({
    fullName: fullName.value,
    email: email.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
    phone: phone.value || undefined,
  });

  const errs: Partial<Record<FieldName, string>> = {};
  if (!result.success) {
    for (const issue of result.error.issues) {
      const key = String(issue.path[0]) as FieldName;
      if (!errs[key]) errs[key] = issue.message;
    }
  }
  fieldErrors.value = errs;

  // Terms validation (UI-only)
  if (!agreeToTerms.value) {
    termsError.value = "Bạn phải đồng ý với điều khoản sử dụng";
  } else {
    termsError.value = null;
  }

  return result.success && agreeToTerms.value;
}

async function handleSubmit(): Promise<void> {
  submitted.value = true;
  if (!validate()) return;

  await auth.register({
    fullName: fullName.value,
    email: email.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
    phone: phone.value || undefined,
  });
}

// Clear API error on any input change
watch([fullName, email, password, confirmPassword, phone], () => {
  if (auth.hasError.value) auth.clearError();
});

// ── Left panel content ──
const valueProps = [
  "Nhập dữ liệu từ Excel / ATS cũ miễn phí",
  "Onboarding 1-on-1 với Customer Success",
  "14 ngày dùng thử toàn tính năng Growth",
];
</script>

<template>
  <AuthLayout>
    <!-- Left panel brand content -->
    <template #brand-content>
      <h2 class="font-display text-4xl font-bold text-white leading-tight mb-6">
        Xây dựng đội ngũ<br />xuất sắc cùng AI.
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
      Tạo tài khoản
    </h2>
    <p class="text-text-secondary text-sm mb-8">
      Dùng thử miễn phí 14 ngày — không cần thẻ tín dụng
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
      <!-- Full Name -->
      <div>
        <label
          for="register-fullname"
          class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
        >
          Họ và tên
        </label>
        <input
          id="register-fullname"
          v-model="fullName"
          type="text"
          autocomplete="name"
          placeholder="Nguyễn Văn A"
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

      <!-- Email -->
      <div>
        <label
          for="register-email"
          class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
        >
          Email
        </label>
        <input
          id="register-email"
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
        <label
          for="register-password"
          class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
        >
          Mật khẩu
        </label>
        <div class="relative">
          <input
            id="register-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Tối thiểu 8 ký tự"
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

      <!-- Confirm Password -->
      <div>
        <label
          for="register-confirm-password"
          class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
        >
          Xác nhận mật khẩu
        </label>
        <div class="relative">
          <input
            id="register-confirm-password"
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Nhập lại mật khẩu"
            class="input pr-11"
            :class="{
              '!border-danger': submitted && fieldErrors.confirmPassword,
            }"
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors p-1"
            @click="showConfirmPassword = !showConfirmPassword"
            :aria-label="showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
          >
            <EyeOff v-if="showConfirmPassword" :size="16" aria-hidden="true" />
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

      <!-- Phone (optional) -->
      <div>
        <label
          for="register-phone"
          class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
        >
          Số điện thoại
          <span class="normal-case tracking-normal font-normal text-text-muted"
            >(Tùy chọn)</span
          >
        </label>
        <input
          id="register-phone"
          v-model="phone"
          type="tel"
          autocomplete="tel"
          placeholder="0912 345 678"
          class="input"
          :class="{ '!border-danger': submitted && fieldErrors.phone }"
        />
        <p
          v-if="submitted && fieldErrors.phone"
          class="text-danger text-xs mt-1.5"
        >
          {{ fieldErrors.phone }}
        </p>
      </div>

      <!-- Terms checkbox -->
      <div>
        <label class="flex items-start gap-3 cursor-pointer group mt-2">
          <div class="relative flex-shrink-0 mt-0.5">
            <input
              id="register-terms"
              v-model="agreeToTerms"
              type="checkbox"
              class="sr-only"
            />
            <div
              :class="[
                'w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center',
                agreeToTerms
                  ? 'bg-brand border-brand'
                  : 'bg-white border-border group-hover:border-brand',
              ]"
            >
              <svg
                v-if="agreeToTerms"
                width="10"
                height="8"
                viewBox="0 0 10 8"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M1 4l3 3 5-6"
                  stroke="white"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>
          <span class="text-xs text-text-secondary leading-relaxed">
            Tôi đồng ý với
            <a
              href="#"
              class="text-brand hover:text-brand-dark font-semibold transition-colors"
              >Điều khoản</a
            >
            và
            <a
              href="#"
              class="text-brand hover:text-brand-dark font-semibold transition-colors"
              >Chính sách bảo mật</a
            >
          </span>
        </label>
        <p v-if="submitted && termsError" class="text-danger text-xs mt-1.5">
          {{ termsError }}
        </p>
      </div>

      <!-- Submit -->
      <button
        id="register-submit"
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
        <span v-else>Tạo tài khoản</span>
      </button>
    </form>

    <!-- Login link -->
    <p class="text-center text-sm text-text-secondary mt-8">
      Đã có tài khoản?
      <RouterLink
        to="/auth/login"
        class="text-brand hover:text-brand-dark transition-colors font-semibold"
      >
        Đăng nhập →
      </RouterLink>
    </p>
  </AuthLayout>
</template>
