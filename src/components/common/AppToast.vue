<script setup lang="ts">
import { useUiStore } from '@/stores/uiStore'

const ui = useUiStore()
</script>

<template>
  <Teleport to="body">
    <div v-if="ui.toasts.length > 0" class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <div
        v-for="toast in ui.toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-md shadow-lg bg-surface border border-border min-w-[320px] max-w-[440px] animate-toast-in"
        :class="{
          'border-l-[3px] border-l-success': toast.type === 'success',
          'border-l-[3px] border-l-error': toast.type === 'error',
          'border-l-[3px] border-l-warning': toast.type === 'warning',
          'border-l-[3px] border-l-info': toast.type === 'info',
        }"
        role="alert"
      >
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-900">{{ toast.title }}</p>
          <p v-if="toast.message" class="text-sm text-gray-500 mt-0.5">{{ toast.message }}</p>
        </div>
        <button
          class="shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 text-xs rounded hover:text-gray-900 hover:bg-gray-100 transition"
          @click="ui.removeToast(toast.id)"
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      </div>
    </div>
  </Teleport>
</template>
