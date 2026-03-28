<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  /** Current image URL */
  modelValue: string | null
  /** 'avatar' (circle) or 'banner' (rectangle) */
  variant?: 'avatar' | 'banner'
  /** Accept type */
  accept?: string
  /** Size limit in MB */
  maxSizeMb?: number
  /** Loading state */
  loading?: boolean
  /** Placeholder text */
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'upload', file: File): void
  (e: 'delete'): void
}>()

const variant = props.variant ?? 'avatar'
const accept = props.accept ?? 'image/jpeg,image/png,image/webp'
const maxSizeMb = props.maxSizeMb ?? 5

const isDragging = ref(false)
const error = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

function triggerInput(): void {
  fileInput.value?.click()
}

function validateFile(file: File): boolean {
  error.value = ''
  const allowedTypes = accept.split(',').map((t) => t.trim())
  if (!allowedTypes.includes(file.type)) {
    error.value = `Only ${allowedTypes.map((t) => t.split('/')[1]).join(', ')} files allowed.`
    return false
  }
  if (file.size > maxSizeMb * 1024 * 1024) {
    error.value = `File size must be under ${maxSizeMb}MB.`
    return false
  }
  return true
}

function handleFileChange(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file && validateFile(file)) {
    emit('upload', file)
  }
  input.value = ''
}

function handleDrop(event: DragEvent): void {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file && validateFile(file)) {
    emit('upload', file)
  }
}

function handleDragOver(event: DragEvent): void {
  event.preventDefault()
  isDragging.value = true
}

function handleDragLeave(): void {
  isDragging.value = false
}

function handleDelete(): void {
  emit('delete')
}
</script>

<template>
  <div class="space-y-2">
    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      class="hidden"
      @change="handleFileChange"
    />

    <!-- Avatar variant -->
    <div v-if="variant === 'avatar'" class="flex items-center gap-4">
      <div
        class="relative w-20 h-20 rounded-full overflow-hidden border-2 cursor-pointer transition shrink-0"
        :class="isDragging ? 'border-primary bg-primary-bg' : 'border-border bg-gray-100'"
        @click="triggerInput"
        @drop.prevent="handleDrop"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
      >
        <img
          v-if="modelValue"
          :src="modelValue"
          alt="Avatar"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
          👤
        </div>
        <div
          v-if="loading"
          class="absolute inset-0 bg-black/30 flex items-center justify-center"
        >
          <span class="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      </div>
      <div class="flex flex-col gap-1.5">
        <button
          @click="triggerInput"
          :disabled="loading"
          class="px-3 py-1.5 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary-bg transition disabled:opacity-50"
        >
          {{ modelValue ? 'Change' : 'Upload' }}
        </button>
        <button
          v-if="modelValue"
          @click="handleDelete"
          :disabled="loading"
          class="px-3 py-1.5 text-sm font-medium text-error border border-error/30 rounded-md hover:bg-error-bg transition disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    </div>

    <!-- Banner variant -->
    <div
      v-else
      class="relative w-full h-36 rounded-lg overflow-hidden border-2 border-dashed cursor-pointer transition"
      :class="isDragging ? 'border-primary bg-primary-bg' : 'border-border bg-gray-50'"
      @click="triggerInput"
      @drop.prevent="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
    >
      <img
        v-if="modelValue"
        :src="modelValue"
        alt="Banner"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex flex-col items-center justify-center gap-1">
        <span class="text-gray-400 text-xl">📸</span>
        <span class="text-sm text-gray-400">{{ placeholder ?? 'Drop image or click to upload' }}</span>
        <span class="text-xs text-gray-300">Max {{ maxSizeMb }}MB</span>
      </div>
      <div
        v-if="loading"
        class="absolute inset-0 bg-black/30 flex items-center justify-center"
      >
        <span class="inline-block w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
      <!-- Delete overlay for banner -->
      <button
        v-if="modelValue && !loading"
        @click.stop="handleDelete"
        class="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center text-xs transition"
        title="Remove banner"
      >
        ✕
      </button>
    </div>

    <p v-if="error" class="text-xs text-error">{{ error }}</p>
  </div>
</template>
