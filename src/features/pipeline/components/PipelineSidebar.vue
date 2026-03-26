<!-- src/features/pipeline/components/PipelineSidebar.vue -->
<!-- Sidebar for navigation and stats in the Pipeline view. Pure UI. -->
<script setup lang="ts">
import { 
  BarChart2, Layout, Settings, Users, 
  ChevronRight, TrendingUp 
} from 'lucide-vue-next'

interface Stat {
  status: string
  label: string
  count: number
  color: string
}

const props = defineProps<{
  stats: Stat[]
  conversionRate: number
  isLoading?: boolean
  activeRoute: string
}>()

const emit = defineEmits<{
  (e: 'navigate', route: string): void
}>()

const navItems = [
  { id: 'overview', label: 'Tổng quan', icon: Layout },
  { id: 'pipeline', label: 'Kênh tuyển dụng', icon: TrendingUp },
  { id: 'candidates', label: 'Ứng viên', icon: Users },
  { id: 'analytics', label: 'Phân tích', icon: BarChart2 },
  { id: 'settings', label: 'Cài đặt', icon: Settings },
]

const totalCandidates = (stats: Stat[]) => stats.reduce((acc, curr) => acc + curr.count, 0)
</script>

<template>
  <aside class="w-64 bg-white border-r border-border h-full flex flex-col shrink-0">
    <div class="p-6">
      <h3 class="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">Điều hướng</h3>
      <nav class="space-y-1">
        <button
          v-for="item in navItems"
          :key="item.id"
          class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group"
          :class="[
            activeRoute === item.id 
              ? 'bg-brand text-white shadow-brand-sm font-bold' 
              : 'hover:bg-surface-soft text-text-muted'
          ]"
          @click="emit('navigate', item.id)"
        >
          <div class="flex items-center gap-3">
            <component :is="item.icon" class="w-4 h-4" />
            <span class="text-xs uppercase tracking-wide">{{ item.label }}</span>
          </div>
          <ChevronRight 
            v-if="activeRoute !== item.id"
            class="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" 
          />
        </button>
      </nav>
    </div>

    <div class="mt-auto border-t border-border p-6 bg-surface-soft/30">
      <h3 class="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-6">Thống kê Kênh</h3>
      
      <div v-if="isLoading" class="space-y-6 animate-pulse">
        <div v-for="n in 3" :key="n" class="space-y-2">
          <div class="h-2 w-1/2 bg-gray-100 rounded"></div>
          <div class="h-2 w-full bg-gray-100 rounded"></div>
        </div>
      </div>

      <div v-else class="space-y-6">
        <!-- Stats Progress Bars -->
        <div class="space-y-4">
          <div v-for="stat in stats" :key="stat.status" class="space-y-1.5">
            <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide">
              <span class="text-text-muted">{{ stat.label }}</span>
              <span class="text-text-primary">{{ stat.count }}</span>
            </div>
            <div class="h-1.5 w-full bg-white border border-border rounded-full overflow-hidden">
              <div 
                class="h-full rounded-full transition-all duration-500"
                :style="{ 
                  width: `${(stat.count / Math.max(totalCandidates(stats), 1)) * 100}%`,
                  backgroundColor: stat.color 
                }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Conversion Rate Card -->
        <div class="p-4 bg-brand/5 border border-brand/10 rounded-xl relative overflow-hidden group">
          <div class="absolute -right-2 -bottom-2 opacity-5 text-brand transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
            <TrendingUp class="w-16 h-16" />
          </div>
          <p class="text-[10px] font-black text-brand uppercase tracking-widest mb-1">Tỷ lệ chuyển đổi</p>
          <div class="flex items-end gap-1">
            <span class="text-2xl font-black text-brand font-display">{{ conversionRate }}%</span>
            <span class="text-[10px] text-brand/60 font-bold mb-1.5">+2.4% vs last mo.</span>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
