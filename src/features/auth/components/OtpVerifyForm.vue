<template>
  <div class="otp-verify-form">
    <!-- API error alert -->
    <div
      v-if="error"
      role="alert"
      class="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-1"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      {{ error }}
    </div>

    <form novalidate @submit.prevent="handleSubmit">
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Xác thực tài khoản</h2>
        <p class="text-gray-500 text-sm">
          Chúng tôi đã gửi mã OTP gồm 8 chữ số đến email
          <span class="font-semibold text-gray-900">{{ email }}</span>
        </p>
      </div>

      <!-- 8-digit OTP input boxes -->
      <div class="flex gap-1 md:gap-2 mb-6 justify-center">
        <input
          v-for="(_, index) in 8"
          :key="index"
          :ref="(el) => { if (el) otpRefs[index] = el as HTMLInputElement; }"
          type="text"
          inputmode="numeric"
          maxlength="1"
          :value="otpInputs[index]"
          class="w-7 h-10 md:w-10 md:h-12 text-center text-lg md:text-xl font-bold text-gray-900 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:border-[#009898] focus:ring-4 focus:ring-[#009898]/10"
          :class="[
            error ? 'border-red-200 bg-red-50/30' : 'border-gray-200 bg-white hover:border-gray-300',
          ]"
          @input="onOtpInput(index, $event)"
          @keydown="onOtpKeydown(index, $event)"
          @paste="onOtpPaste"
        />
      </div>

      <!-- Submit -->
      <button
        type="submit"
        class="w-full h-12 bg-[#009898] hover:bg-[#007a7a] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-[#009898]/20 flex items-center justify-center gap-2"
        :disabled="isLoading || !isComplete"
      >
        <svg v-if="isLoading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{{ isLoading ? 'Đang xử lý...' : 'Xác nhận' }}</span>
      </button>
    </form>

    <!-- Resend section -->
    <div class="text-center mt-8 pt-6 border-t border-gray-100">
      <p class="text-gray-500 text-sm">
        Không nhận được mã?
        <button
          v-if="resendCooldown <= 0"
          type="button"
          class="text-[#009898] hover:text-[#007a7a] font-bold transition-colors ml-1"
          :disabled="isLoading"
          @click="$emit('resend')"
        >
          Gửi lại mã
        </button>
        <span v-else class="text-gray-400 font-medium ml-1">
          Gửi lại sau <span class="text-gray-900">{{ resendCooldown }} giây</span>
        </span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue";

const props = defineProps<{
  email: string;
  isLoading: boolean;
  error: string | null;
  resendCooldown: number;
}>();

const emit = defineEmits<{
  (e: "submit", code: string): void;
  (e: "resend"): void;
}>();

const otpInputs = ref<string[]>(Array(8).fill(""));
const otpRefs = ref<HTMLInputElement[]>([]);

const isComplete = computed(() => otpInputs.value.every(v => v.length === 1));

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

function handleSubmit(): void {
  if (isComplete.value) {
    emit("submit", otpInputs.value.join(""));
  }
}
</script>
