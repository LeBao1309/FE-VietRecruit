<script setup lang="ts">
import { ref, watch, onUnmounted } from "vue";
import { RouterLink, useRouter } from "vue-router";

import AuthLayout from "@/features/auth/components/AuthLayout.vue";
import OtpVerifyForm from "@/features/auth/components/OtpVerifyForm.vue";
import { useAuth } from "@/features/auth/composables/useAuth";
import { RegisterRequestSchema } from "@/features/auth/types/auth.dto";
import type { AccountType } from "@/features/auth/types/auth.dto";

const auth = useAuth();
const router = useRouter();

// Step control
const step = ref<'select' | 'form' | 'otp'>('select');

// ── Form state ──
const fullName = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const phone = ref("");
const accountType = ref<AccountType>("CANDIDATE");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const agreeToTerms = ref(false);

// ── Validation ──
type FieldName =
  | "fullName"
  | "email"
  | "password"
  | "confirmPassword"
  | "phone"
  | "accountType";
const fieldErrors = ref<Partial<Record<FieldName, string>>>({});
const submitted = ref(false);
const termsError = ref<string | null>(null);

function selectType(type: AccountType) {
  accountType.value = type;
  step.value = 'form';
}

function goBack() {
  if (step.value === 'form') {
    step.value = 'select';
    auth.clearError();
  } else if (step.value === 'otp') {
    step.value = 'form';
  }
}

function validate(): boolean {
  const result = RegisterRequestSchema.safeParse({
    fullName: fullName.value,
    email: email.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
    phone: phone.value || undefined,
    accountType: accountType.value,
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

async function handleRegister(): Promise<void> {
  submitted.value = true;
  if (!validate()) return;

  const success = await auth.register({
    fullName: fullName.value,
    email: email.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
    phone: phone.value || undefined,
    accountType: accountType.value, // Account type is set from Step 1
  });

  if (success) {
    step.value = 'otp';
    startCooldown();
  }
}

// ── OTP handlers ──
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

async function handleOtpSubmit(code: string) {
  await auth.verifyOtp({ email: email.value, code });
}

async function handleOtpResend() {
  const success = await auth.resendOtp(email.value);
  if (success) startCooldown();
}

onUnmounted(() => {
  if (resendTimer) clearInterval(resendTimer);
});

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

    <!-- ══════════════════════════════════════════════════ -->
    <!-- STEP 1 — Account type selector                    -->
    <!-- ══════════════════════════════════════════════════ -->
    <div v-if="step === 'select'">
      <h2 class="font-display text-2xl font-bold text-text-primary mb-1">
        Bạn là ai?
      </h2>
      <p class="text-text-secondary text-sm mb-8">
        Chọn loại tài khoản phù hợp với bạn
      </p>

      <div class="space-y-4">
        <!-- CANDIDATE card -->
        <button
          class="w-full text-left p-4 border border-border rounded-xl hover:border-brand hover:shadow-sm transition-all bg-white group flex items-start gap-4"
          @click="selectType('CANDIDATE')"
          aria-label="Đăng ký tài khoản ứng viên"
        >
          <div class="w-12 h-12 rounded-lg bg-brand/5 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform flex-shrink-0">
            🧑💼
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-text-primary mb-1 group-hover:text-brand transition-colors">Ứng viên</h3>
            <p class="text-sm text-text-secondary">Tìm kiếm việc làm phù hợp với kỹ năng và kinh nghiệm của bạn</p>
          </div>
        </button>

        <!-- EMPLOYER card -->
        <button
          class="w-full text-left p-4 border border-border rounded-xl hover:border-brand hover:shadow-sm transition-all bg-white group flex items-start gap-4"
          @click="selectType('EMPLOYER')"
          aria-label="Đăng ký tài khoản nhà tuyển dụng"
        >
          <div class="w-12 h-12 rounded-lg bg-brand/5 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform flex-shrink-0">
            🏢
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-text-primary mb-1 group-hover:text-brand transition-colors">Nhà tuyển dụng</h3>
            <p class="text-sm text-text-secondary">Đăng tin tuyển dụng và quản lý ứng viên cho công ty của bạn</p>
          </div>
        </button>
      </div>

      <!-- Login link -->
      <p class="text-center text-sm text-text-secondary mt-8 space-x-1">
        <span>Đã có tài khoản?</span>
        <RouterLink
          to="/auth/login"
          class="text-brand hover:text-brand-dark transition-colors font-semibold"
        >
          Đăng nhập →
        </RouterLink>
      </p>
    </div>

    <!-- ══════════════════════════════════════════════════ -->
    <!-- STEP 2 — Registration form                        -->
    <!-- ══════════════════════════════════════════════════ -->
    <div v-else-if="step === 'form'">
      <div class="flex items-center mb-6">
        <button class="mr-4 p-2 -ml-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-full transition-colors flex items-center justify-center" @click="goBack" aria-label="Quay lại">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div>
          <h2 class="font-display text-2xl font-bold text-text-primary flex items-center gap-3">
            Tạo tài khoản
            <span :class="['text-xs px-2.5 py-1 rounded-full font-medium tracking-wide flex items-center gap-1.5', accountType === 'EMPLOYER' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-brand/10 text-brand border border-brand/20']">
              {{ accountType === 'EMPLOYER' ? '🏢 Nhà tuyển dụng' : '🧑💼 Ứng viên' }}
            </span>
          </h2>
        </div>
      </div>
      
      <p class="text-text-secondary text-sm mb-6">
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

      <form class="space-y-4" novalidate @submit.prevent="handleRegister">
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
            maxlength="255"
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
              maxlength="72"
              class="input pr-11"
              :class="{
                '!border-danger': submitted && fieldErrors.confirmPassword,
              }"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors px-2 py-1 bg-white"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              {{ showConfirmPassword ? 'Ẩn' : 'Hiện' }}
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
            maxlength="50"
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
          class="btn-primary w-full px-4 py-3 text-base mt-2"
          :disabled="auth.isLoading.value"
        >
          <span>{{ auth.isLoading.value ? 'Đang xử lý...' : 'Đăng ký' }}</span>
        </button>
      </form>

      <!-- Login link -->
      <p class="text-center text-sm text-text-secondary mt-8 space-x-1">
        <span>Đã có tài khoản?</span>
        <RouterLink
          to="/auth/login"
          class="text-brand hover:text-brand-dark transition-colors font-semibold"
        >
          Đăng nhập →
        </RouterLink>
      </p>
    </div>

    <!-- ══════════════════════════════════════════════════ -->
    <!-- STEP 3 — OTP verification                         -->
    <!-- ══════════════════════════════════════════════════ -->
    <div v-else-if="step === 'otp'">
      <div class="flex items-center mb-6">
        <button class="mr-4 p-2 -ml-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-full transition-colors flex items-center justify-center" @click="goBack" aria-label="Quay lại">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h2 class="font-display text-2xl font-bold text-text-primary">Xác thực email</h2>
      </div>
      
      <p class="text-text-secondary text-sm mb-6">
        Chúng tôi đã gửi mã OTP đến <strong>{{ email }}</strong>
      </p>

      <OtpVerifyForm
        :email="email"
        :is-loading="auth.isLoading.value"
        :error="auth.error.value"
        :resend-cooldown="resendCooldown"
        @submit="handleOtpSubmit"
        @resend="handleOtpResend"
      />
    </div>
  </AuthLayout>
</template>
