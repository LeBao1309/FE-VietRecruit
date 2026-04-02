<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const hasError = ref(false)
const errorMessage = ref('')

onErrorCaptured((err: unknown, _instance, info) => {
 console.error('[GlobalErrorBoundary] Caught error:', err, 'Info:', info)
 hasError.value = true
 
 if (err instanceof Error) {
 errorMessage.value = err.message
 } else {
 errorMessage.value = String(err)
 }
 
 // Return false to prevent error from propagating further
 return false
})

function reloadPage() {
 window.location.reload()
}
</script>

<template>
 <div v-if="hasError" class="min-h-screen flex items-center justify-center bg-slate-50 p-6">
 <div class="max-w-md w-full premium-card p-8 text-center relative overflow-hidden">
 <!-- Decorative background accent -->
 <div class="absolute -top-12 -right-12 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none"></div>

 <div class="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 text-3xl font-bold mx-auto mb-5 rotate-3 shadow-sm">
 !
 </div>
 <h1 class="text-xl font-extrabold text-slate-900 mb-2">Something went wrong</h1>
 <p class="text-sm font-medium text-slate-500 mb-6">
 An unexpected error occurred. Please try reloading the page.
 </p>
 
 <!-- Optional: Display error details in development mode -->
 <div v-if="errorMessage" class="mb-6 text-xs text-left text-rose-600 bg-rose-50 p-4 rounded-xl overflow-auto max-h-32 border border-rose-100 ">
 {{ errorMessage }}
 </div>
 
 <button 
 @click="reloadPage" 
 class="w-full btn-primary"
 >
 Reload Page
 </button>
 </div>
 </div>
 
 <slot v-else></slot>
</template>
