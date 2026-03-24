<script setup lang="ts">
// src/features/job/components/AiJdGeneratorPanel.vue
// Slide-in or inline panel for AI-generated JD content.

import { Loader2, Sparkles, Check, RotateCcw, X } from 'lucide-vue-next'

const props = defineProps<{
  isGenerating: boolean
  generatedContent: string | null
  error: string | null
}>()

const emit = defineEmits<{
  accept: []
  retry: []
  dismiss: []
}>()
</script>

<template>
  <div class="mt-4 border-2 border-[#009898]/20 bg-[#009898]/5 rounded-xl overflow-hidden transition-all animate-in fade-in slide-in-from-top-4 duration-300">
    <div class="px-4 py-3 bg-[#009898]/10 border-b border-[#009898]/20 flex items-center justify-between">
      <div class="flex items-center gap-2 text-[#009898]">
        <Sparkles class="w-5 h-5" />
        <span class="font-bold text-sm uppercase tracking-wider">AI JD Generator</span>
      </div>
      <button @click="emit('dismiss')" class="text-gray-400 hover:text-gray-600 transition-colors">
        <X class="w-5 h-5" />
      </button>
    </div>

    <div class="p-6">
      <!-- Loading State -->
      <div v-if="isGenerating" class="flex flex-col items-center justify-center py-12 text-center">
        <Loader2 class="w-10 h-10 text-[#009898] animate-spin mb-4" />
        <p class="text-gray-600 font-medium italic">Gemini đang soạn thảo mô tả công việc hoàn hảo cho bạn...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-8">
        <p class="text-red-500 font-medium mb-4">{{ error }}</p>
        <button 
          @click="emit('retry')"
          class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
        >
          <RotateCcw class="w-4 h-4" />
          Thử lại
        </button>
      </div>

      <!-- Result State -->
      <div v-else-if="generatedContent" class="space-y-6">
        <div class="prose prose-sm max-w-none prose-slate bg-white p-6 rounded-lg border border-gray-100 shadow-inner max-h-[400px] overflow-y-auto whitespace-pre-wrap text-gray-700 leading-relaxed">
          {{ generatedContent }}
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <button 
            @click="emit('retry')"
            class="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-[#009898] hover:bg-[#009898]/5 rounded-lg transition-colors font-medium"
          >
            <RotateCcw class="w-4 h-4" />
            Tạo bản khác
          </button>
          <button 
            @click="emit('accept')"
            class="inline-flex items-center gap-2 px-6 py-2 bg-[#009898] text-white rounded-lg hover:bg-[#007a7a] transition-all shadow-md hover:shadow-lg font-bold"
          >
            <Check class="w-4 h-4" />
            Sử dụng nội dung này
          </button>
        </div>
      </div>

      <!-- Empty/Initial State (shouldn't really happen if panel is open) -->
      <div v-else class="text-center py-12 text-gray-400">
        Chưa có nội dung được tạo.
      </div>
    </div>
  </div>
</template>
