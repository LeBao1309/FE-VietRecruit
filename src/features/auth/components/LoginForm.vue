<template>
  <div class="login-form w-full">
    <!-- Success Banners -->
    <div
      v-if="successBanner"
      class="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-1"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      <span v-if="successBanner === 'registered'">Đăng ký thành công! Vui lòng kiểm tra email để xác thực.</span>
      <span v-else-if="successBanner === 'verified'">Xác thực email thành công! Bạn có thể đăng nhập ngay.</span>
      <span v-else-if="successBanner === 'invited'">Xác nhận lời mời thành công! Chào mừng bạn gia nhập đội ngũ.</span>
      <span v-else-if="successBanner === 'reset'">Đặt lại mật khẩu thành công!</span>
    </div>

    <!-- Error Alert -->
    <div
      v-if="error"
      class="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-1"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      {{ error }}
    </div>

    <div class="mb-8 text-center md:text-left">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Chào mừng trở lại!</h1>
      <p class="text-gray-500 font-medium">Vui lòng đăng nhập để quản lý công việc của bạn.</p>
    </div>

    <form class="space-y-5" @submit.prevent="handleSubmit">
      <!-- Email Field -->
      <div>
        <label for="email" class="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Địa chỉ Email</label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </div>
          <input
            id="email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            placeholder="you@company.com"
            class="block w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#009898] focus:ring-4 focus:ring-[#009898]/10 transition-all duration-200"
            required
          />
        </div>
      </div>

      <!-- Password Field -->
      <div>
        <div class="flex items-center justify-between mb-1.5 ml-1">
          <label for="password" class="block text-sm font-bold text-gray-700">Mật khẩu</label>
          <button
            type="button"
            class="text-xs font-bold text-[#009898] hover:text-[#007a7a] transition-colors"
            @click="$emit('navigateForgot')"
          >
            Quên mật khẩu?
          </button>
        </div>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
            </svg>
          </div>
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            placeholder="••••••••"
            class="block w-full pl-11 pr-12 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#009898] focus:ring-4 focus:ring-[#009898]/10 transition-all duration-200"
            required
          />
          <button
            type="button"
            class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            @click="showPassword = !showPassword"
          >
            <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fill-rule="evenodd" d="M.458 10C1.274 5.943 5.065 3 10 3s8.726 2.943 9.542 7c-.816 4.057-4.477 7-9.542 7S1.274 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="w-full h-12 bg-[#009898] hover:bg-[#007a7a] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-[#009898]/20 flex items-center justify-center gap-2"
        :disabled="isLoading"
      >
        <svg v-if="isLoading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{{ isLoading ? 'Đang xử lý...' : 'Đăng nhập' }}</span>
      </button>
    </form>

    <div class="mt-8">
      <SocialLoginButtons :is-loading="isLoading" @login="(p) => $emit('socialLogin', p)" />
    </div>

    <div class="mt-10 pt-6 border-t border-gray-100 text-center">
      <p class="text-gray-500 text-sm font-medium">
        Bạn mới sử dụng VietRecruit?
        <button
          type="button"
          class="text-[#009898] hover:text-[#007a7a] font-bold transition-colors ml-1"
          @click="$emit('navigateRegister')"
        >
          Tham gia ngay
        </button>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import SocialLoginButtons from './SocialLoginButtons.vue';

defineProps<{
  isLoading: boolean;
  error: string | null;
  successBanner: 'registered' | 'verified' | 'invited' | 'reset' | null;
}>();

const emit = defineEmits<{
  (e: 'submit', payload: { email: string; password: string }): void;
  (e: 'navigateForgot'): void;
  (e: 'navigateRegister'): void;
  (e: 'socialLogin', provider: 'google' | 'github'): void;
}>();

const form = reactive({
  email: '',
  password: '',
});

const showPassword = ref(false);

function handleSubmit() {
  emit('submit', { ...form });
}
</script>
