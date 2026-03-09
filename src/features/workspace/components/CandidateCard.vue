<script setup lang="ts">
import { computed } from "vue";
import { Mail, Calendar, Star, X } from "lucide-vue-next";
import AiScoreBadge from "./AiScoreBadge.vue";
import type { ApplicationWithDetails } from "../types";

const props = defineProps<{
  candidate: ApplicationWithDetails;
  selected: boolean;
}>();

const avatar = computed(() => props.candidate.candidate?.user?.avatar_url);
const name = computed(
  () => props.candidate.candidate?.user?.full_name || "Unknown",
);
const role = computed(
  () => props.candidate.candidate?.headline || props.candidate.job?.title,
);

const daysAgo = computed(() => {
  if (!props.candidate.created_at) return 0;
  const diffTime = Math.abs(
    new Date().getTime() - new Date(props.candidate.created_at).getTime(),
  );
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

const aiScore = computed(() => {
  if (props.candidate.scorecards && props.candidate.scorecards.length > 0) {
    const score = props.candidate.scorecards[0]?.average_score;
    return score ? Math.round(score) : 0;
  }
  return 0;
});
</script>

<template>
  <div
    data-testid="candidate-card"
    :class="[
      'bg-white rounded-xl border p-4 mb-2 cursor-pointer transition-all duration-150 relative group',
      selected
        ? 'border-[#008C8C] ring-2 ring-[#008C8C]/10 shadow-sm'
        : 'border-gray-200 hover:border-[#008C8C]/30 hover:shadow-md',
    ]"
  >
    <div class="flex items-start gap-3">
      <!-- Avatar -->
      <div v-if="avatar" class="w-8 h-8 rounded-full overflow-hidden shrink-0">
        <img :src="avatar" class="w-full h-full object-cover" />
      </div>
      <div
        v-else
        class="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shrink-0"
      >
        <span class="text-xs font-medium text-gray-600">{{
          name.charAt(0)
        }}</span>
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <h4 class="font-semibold text-gray-900 truncate">
          {{ name }}
        </h4>
        <p class="text-sm text-gray-500 truncate mt-0.5">
          {{ role }}
        </p>

        <div class="flex items-center justify-between mt-3">
          <div class="flex items-center gap-2">
            <!-- Source & Time -->
            <span class="text-xs text-gray-500 flex items-center gap-1">
              <span
                class="w-4 h-4 rounded bg-gray-100 flex items-center justify-center font-bold text-[10px] text-gray-500"
              >
                in
              </span>
              {{ daysAgo }} ngày trước
            </span>
          </div>
        </div>

        <div class="flex items-center justify-between mt-2">
          <AiScoreBadge :score="aiScore" />
          <button
            class="text-xs text-gray-500 hover:text-[#008C8C] flex items-center gap-1 transition-colors"
          >
            <Star class="w-3.5 h-3.5" /> Shortlist
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Action Bar -->
    <div
      class="absolute bottom-0 left-0 right-0 h-9 bg-white border-t border-gray-100 rounded-b-xl flex items-center opacity-0 group-hover:opacity-100 transition-opacity overflow-hidden z-20 shadow-sm"
    >
      <button
        class="flex-1 flex items-center justify-center text-gray-500 hover:text-[#008C8C] hover:bg-[#008C8C]/10 transition-colors h-full text-xs gap-1"
        @click.stop
      >
        <Mail class="w-3.5 h-3.5" />
      </button>
      <button
        class="flex-1 flex items-center justify-center text-gray-500 hover:text-[#008C8C] hover:bg-[#008C8C]/10 transition-colors h-full text-xs gap-1 border-l border-gray-100"
        @click.stop
      >
        <Calendar class="w-3.5 h-3.5" />
      </button>
      <button
        class="flex-1 flex items-center justify-center text-gray-500 hover:text-[#008C8C] hover:bg-[#008C8C]/10 transition-colors h-full text-xs gap-1 border-l border-gray-100"
        @click.stop
      >
        <Star class="w-3.5 h-3.5" />
      </button>
      <button
        class="flex-1 flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors h-full text-xs gap-1 border-l border-gray-100"
        @click.stop
      >
        <X class="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
</template>
