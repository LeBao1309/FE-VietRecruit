<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'DECLINED' | string;
}>();

const badgeStyle = computed(() => {
  switch (props.status) {
    case 'DRAFT': return 'bg-slate-100 text-slate-600 border-slate-200';
    case 'SENT': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'ACCEPTED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'DECLINED': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-slate-100 text-slate-600 border-slate-200';
  }
});
</script>

<template>
  <span 
    class="px-2.5 py-1 text-xs font-bold rounded-full capitalize border tracking-wide whitespace-nowrap"
    :class="badgeStyle"
  >
    {{ status.toLowerCase() }}
  </span>
</template>
