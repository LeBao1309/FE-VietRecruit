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
  <div v-if="hasError" class="min-h-screen flex items-center justify-center bg-bg-page p-6">
    <div class="max-w-md w-full bg-surface border border-border rounded-lg shadow-sm p-8 text-center">
      <div class="w-16 h-16 bg-error-bg rounded-full flex items-center justify-center text-error text-2xl mx-auto mb-4">
        !
      </div>
      <h1 class="text-xl font-bold text-text-primary mb-2">Something went wrong</h1>
      <p class="text-sm text-text-secondary mb-6">
        An unexpected error occurred. Please try reloading the page.
      </p>
      
      <!-- Optional: Display error details in development mode -->
      <div v-if="errorMessage" class="mb-6 text-xs text-left text-error bg-error-bg p-3 rounded overflow-auto max-h-32">
        {{ errorMessage }}
      </div>
      
      <button 
        @click="reloadPage" 
        class="w-full px-4 py-2 font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition focus-visible:ring-2 focus:outline-none"
      >
        Reload Page
      </button>
    </div>
  </div>
  
  <slot v-else></slot>
</template>
