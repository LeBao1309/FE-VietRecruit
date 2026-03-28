<script setup lang="ts">
import { useUiStore } from '@/stores/uiStore'

const ui = useUiStore()
</script>

<template>
  <Teleport to="body">
    <div class="toast-container" v-if="ui.toasts.length > 0">
      <div
        v-for="toast in ui.toasts"
        :key="toast.id"
        :class="['toast', `toast-${toast.type}`]"
        role="alert"
      >
        <div class="toast-content">
          <p class="toast-title">{{ toast.title }}</p>
          <p v-if="toast.message" class="toast-message">{{ toast.message }}</p>
        </div>
        <button
          class="toast-close"
          @click="ui.removeToast(toast.id)"
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.toast-message {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.toast-close {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-disabled);
  font-size: var(--font-size-xs);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.toast-close:hover {
  color: var(--color-text-primary);
  background-color: var(--color-bg-page);
}
</style>
