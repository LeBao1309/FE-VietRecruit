<script setup lang="ts">
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'

const auth = useAuthStore()
const ui = useUiStore()

// ── Change Password ──
const pwForm = ref({
 currentPassword: '',
 newPassword: '',
 confirmPassword: '',
})
const pwLoading = ref(false)
const showCurrentPw = ref(false)
const showNewPw = ref(false)
const pwErrors = ref<Record<string, string>>({})

const passwordRules = computed(() => {
 const pw = pwForm.value.newPassword
 return {
 length: pw.length >= 8,
 upper: /[A-Z]/.test(pw),
 lower: /[a-z]/.test(pw),
 digit: /\d/.test(pw),
 special: /[!@#$%^&*(),.?":{}|<>]/.test(pw),
 }
})

const passwordStrength = computed(() => {
 const rules = passwordRules.value
 const passed = [rules.length, rules.upper, rules.lower, rules.digit, rules.special].filter(Boolean).length
 if (passed <= 2) return { label: 'Yếu', color: 'bg-rose-500', width: 'w-1/5' }
 if (passed <= 3) return { label: 'Trung Bình', color: 'bg-amber-500', width: 'w-2/5' }
 if (passed <= 4) return { label: 'Khá', color: 'bg-blue-500', width: 'w-3/5' }
 return { label: 'Mạnh', color: 'bg-emerald-500', width: 'w-full' }
})

function validatePw(): boolean {
 pwErrors.value = {}
 if (!pwForm.value.currentPassword) pwErrors.value.currentPassword = 'Vui lòng nhập mật khẩu hiện tại.'
 if (!pwForm.value.newPassword) {
 pwErrors.value.newPassword = 'Vui lòng nhập mật khẩu mới.'
 } else {
 const rules = passwordRules.value
 if (!rules.length || !rules.upper || !rules.lower || !rules.digit || !rules.special) {
 pwErrors.value.newPassword = 'Mật khẩu chưa đáp ứng đủ yêu cầu.'
 }
 }
 if (pwForm.value.newPassword !== pwForm.value.confirmPassword) {
 pwErrors.value.confirmPassword = 'Mật khẩu xác nhận không khớp.'
 }
 return Object.keys(pwErrors.value).length === 0
}

async function handleChangePassword(): Promise<void> {
 if (!validatePw()) return
 pwLoading.value = true
 try {
 const result = await authService.changePassword({
 currentPassword: pwForm.value.currentPassword,
 newPassword: pwForm.value.newPassword,
 })
 if (result.error) {
 ui.toastError('Đổi mật khẩu thất bại', result.error.message)
 return
 }
 ui.toastSuccess('Đổi mật khẩu thành công', 'Tất cả phiên đăng nhập khác đã bị huỷ. Vui lòng đăng nhập lại.')
 pwForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
 await auth.logout()
 } finally {
 pwLoading.value = false
 }
}
</script>

<template>
 <div class="max-w-3xl mx-auto px-6 py-10">
 <div class="mb-8">
 <h1 class="text-2xl font-extrabold text-slate-900">Cài Đặt</h1>
 <p class="text-sm font-medium text-slate-500 mt-1">Quản lý bảo mật tài khoản của bạn</p>
 </div>

 <!-- Account info -->
 <div class="premium-card overflow-hidden mb-8">
 <div class="p-6 border-b border-slate-200">
 <h2 class="text-lg font-bold text-slate-900">Tài Khoản</h2>
 </div>
 <div class="p-6 space-y-4">
 <div class="flex items-center justify-between">
 <span class="text-sm font-bold text-slate-500">Email</span>
 <span class="text-sm font-bold text-slate-900">{{ auth.user?.email ?? '—' }}</span>
 </div>
 <div class="flex items-center justify-between">
 <span class="text-sm font-bold text-slate-500">Vai trò</span>
 <div class="flex gap-1.5">
 <span
 v-for="role in auth.roles"
 :key="role"
 class="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-md bg-teal-50 text-teal-700 border border-teal-100"
 >
 {{ role }}
 </span>
 </div>
 </div>
 </div>
 </div>

 <!-- Change Password -->
 <div class="premium-card overflow-hidden">
 <div class="p-6 border-b border-slate-200">
 <h2 class="text-lg font-bold text-slate-900">Đổi Mật Khẩu</h2>
 <p class="text-xs font-medium text-slate-400 mt-1">Tất cả phiên đăng nhập sẽ bị huỷ sau khi đổi mật khẩu.</p>
 </div>
 <form @submit.prevent="handleChangePassword" class="p-6 space-y-6">
 <!-- Current password -->
 <div>
 <label for="set-current-pw" class="block text-sm font-bold text-slate-700 mb-1.5">Mật khẩu hiện tại</label>
 <div class="relative">
 <input
 id="set-current-pw"
 v-model="pwForm.currentPassword"
 :type="showCurrentPw ? 'text' : 'password'"
 autocomplete="current-password"
 placeholder="••••••••"
 class="w-full px-4 py-3 pr-16 text-sm border rounded-xl outline-none transition-all duration-300 bg-slate-50"
 :class="pwErrors.currentPassword ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white'"
 />
 <button
 type="button"
 @click="showCurrentPw = !showCurrentPw"
 class="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-slate-400 hover:text-slate-600 transition-colors bg-white/50 rounded-md text-xs font-bold"
 >
 {{ showCurrentPw ? 'Ẩn' : 'Hiện' }}
 </button>
 </div>
 <p v-if="pwErrors.currentPassword" class="text-xs font-bold text-rose-500 mt-1.5">{{ pwErrors.currentPassword }}</p>
 </div>

 <!-- New password -->
 <div>
 <label for="set-new-pw" class="block text-sm font-bold text-slate-700 mb-1.5">Mật khẩu mới</label>
 <div class="relative">
 <input
 id="set-new-pw"
 v-model="pwForm.newPassword"
 :type="showNewPw ? 'text' : 'password'"
 autocomplete="new-password"
 placeholder="••••••••"
 class="w-full px-4 py-3 pr-16 text-sm border rounded-xl outline-none transition-all duration-300 bg-slate-50"
 :class="pwErrors.newPassword ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white'"
 />
 <button
 type="button"
 @click="showNewPw = !showNewPw"
 class="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-slate-400 hover:text-slate-600 transition-colors bg-white/50 rounded-md text-xs font-bold"
 >
 {{ showNewPw ? 'Ẩn' : 'Hiện' }}
 </button>
 </div>
 <p v-if="pwErrors.newPassword" class="text-xs font-bold text-rose-500 mt-1.5">{{ pwErrors.newPassword }}</p>

 <!-- Password strength -->
 <div v-if="pwForm.newPassword.length > 0" class="mt-3">
 <div class="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
 <div :class="[passwordStrength.color, passwordStrength.width]" class="h-full rounded-full transition-all duration-500" />
 </div>
 <div class="flex items-center justify-between mt-1.5">
 <span class="text-xs font-bold text-slate-500">{{ passwordStrength.label }}</span>
 </div>
 <ul class="mt-2 space-y-1">
 <li v-for="(passed, rule) in passwordRules" :key="rule"
 class="text-xs font-medium flex items-center gap-2"
 :class="passed ? 'text-emerald-500' : 'text-slate-400'">
 <span class="font-bold flex-shrink-0">{{ passed ? '✓' : '○' }}</span>
 <span>
 {{ rule === 'length' ? 'Ít nhất 8 ký tự' :
 rule === 'upper' ? 'Có chữ hoa' :
 rule === 'lower' ? 'Có chữ thường' :
 rule === 'digit' ? 'Có chữ số' :
 'Có ký tự đặc biệt' }}
 </span>
 </li>
 </ul>
 </div>
 </div>

 <!-- Confirm password -->
 <div>
 <label for="set-confirm-pw" class="block text-sm font-bold text-slate-700 mb-1.5">Xác nhận mật khẩu mới</label>
 <input
 id="set-confirm-pw"
 v-model="pwForm.confirmPassword"
 type="password"
 autocomplete="new-password"
 placeholder="••••••••"
 class="w-full px-4 py-3 text-sm border rounded-xl outline-none transition-all duration-300 bg-slate-50"
 :class="pwErrors.confirmPassword ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white'"
 />
 <p v-if="pwErrors.confirmPassword" class="text-xs font-bold text-rose-500 mt-1.5">{{ pwErrors.confirmPassword }}</p>
 </div>

 <div class="flex justify-end pt-4 border-t border-slate-200">
 <button
 type="submit"
 :disabled="pwLoading"
 class="btn-primary py-2.5 px-6 flex items-center gap-2"
 >
 <span v-if="pwLoading" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 {{ pwLoading ? 'Đang đổi…' : 'Đổi mật khẩu' }}
 </button>
 </div>
 </form>
 </div>
 </div>
</template>
