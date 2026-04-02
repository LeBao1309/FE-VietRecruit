<!-- src/features/interview/components/AiInterviewQuestionsPanel.vue -->
<!-- Panel displaying AI-generated interview questions. Pure UI. -->
<script setup lang="ts">
import { computed } from 'vue'
import { Sparkles, Copy, X, RefreshCw, ChevronRight } from 'lucide-vue-next'

interface Question {
 category: string
 question: string
 difficulty: 'EASY' | 'MEDIUM' | 'HARD'
}

const props = defineProps<{
 questions: Question[] | null
 isGenerating?: boolean
 error?: string | null
}>()

const emit = defineEmits<{
 (e: 'retry'): void
 (e: 'dismiss'): void
 (e: 'copyAll'): void
}>()

const groupedQuestions = computed(() => {
 if (!props.questions) return {}
 return props.questions.reduce((acc, q) => {
 if (!acc[q.category]) acc[q.category] = []
 acc[q.category].push(q)
 return acc
 }, {} as Record<string, Question[]>)
})

const difficultyConfig = {
 EASY: 'bg-green-50 text-green-700 border-green-200',
 MEDIUM: 'bg-yellow-50 text-yellow-700 border-yellow-200',
 HARD: 'bg-red-50 text-red-700 border-red-200'
}
</script>

<template>
 <div class="bg-white border border-border rounded-3xl shadow-xl overflow-hidden flex flex-col">
 <!-- Header -->
 <header class="p-6 border-b border-border bg-brand/5 flex items-center justify-between">
 <div class="flex items-center gap-3">
 <div class="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand">
 <Sparkles class="w-5 h-5" />
 </div>
 <div>
 <h3 class="text-sm font-black text-brand uppercase tracking-tighter">Gợi ý Câu hỏi Phỏng vấn AI</h3>
 <p class="text-[10px] text-brand/60 font-bold uppercase tracking-widest">Dựa trên mô tả công việc và hồ sơ</p>
 </div>
 </div>
 <div class="flex items-center gap-2">
 <button 
 @click="emit('copyAll')"
 class="p-2 rounded-lg hover:bg-brand/10 text-brand transition-colors"
 title="Sao chép tất cả"
 >
 <Copy class="w-4 h-4" />
 </button>
 <button 
 @click="emit('dismiss')"
 class="p-2 rounded-lg hover:bg-surface-soft text-text-muted transition-colors"
 >
 <X class="w-4 h-4" />
 </button>
 </div>
 </header>

 <!-- Body -->
 <div class="p-6 overflow-y-auto max-h-[500px] space-y-8">
 <div v-if="isGenerating" class="flex flex-col items-center justify-center py-12 space-y-4">
 <div class="w-12 h-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin"></div>
 <p class="text-xs font-bold text-text-muted uppercase tracking-widest animate-pulse">Đang phân tích và tạo câu hỏi...</p>
 </div>

 <div v-else-if="error" class="p-6 text-center space-y-4">
 <p class="text-sm text-red-600 font-bold uppercase tracking-tight">{{ error }}</p>
 <button 
 @click="emit('retry')"
 class="px-6 py-2 bg-brand text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 mx-auto"
 >
 <RefreshCw class="w-4 h-4" /> Thử lại
 </button>
 </div>

 <div v-else-if="questions && questions.length > 0" class="space-y-8">
 <div v-for="(qs, category) in groupedQuestions" :key="category" class="space-y-4">
 <h4 class="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
 <ChevronRight class="w-3 h-3 text-brand" /> {{ category }}
 </h4>
 <div class="space-y-3">
 <div 
 v-for="(q, idx) in qs" 
 :key="idx"
 class="p-4 bg-surface-soft rounded-2xl border border-border/50 group hover:border-brand/30 transition-all"
 >
 <div class="flex items-start justify-between gap-4">
 <p class="text-sm text-text-primary font-bold leading-relaxed">
 {{ q.question }}
 </p>
 <span 
 :class="['px-2 py-0.5 rounded-full text-[9px] font-black border uppercase shrink-0', difficultyConfig[q.difficulty]]"
 >
 {{ q.difficulty }}
 </span>
 </div>
 </div>
 </div>
 </div>
 </div>

 <div v-else class="text-center py-12">
 <p class="text-xs text-text-muted italic">Nhấn vào "Gợi ý câu hỏi AI" để bắt đầu.</p>
 </div>
 </div>

 <!-- Footer -->
 <footer class="p-4 border-t border-border bg-surface-soft/30 text-center">
 <p class="text-[9px] text-text-muted font-bold uppercase tracking-widest">
 Lưu ý: Câu hỏi do AI tạo ra chỉ mang tính chất tham khảo.
 </p>
 </footer>
 </div>
</template>
