<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

interface Metric {
  id: string;
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
  sublabel: string;
}

const metrics: Metric[] = [
  {
    id: "companies",
    value: 500,
    suffix: "+",
    label: "Doanh nghiệp",
    sublabel: "tin dùng",
  },
  {
    id: "accuracy",
    value: 94,
    suffix: "%",
    label: "Độ chính xác AI",
    sublabel: "sàng lọc",
  },
  {
    id: "speed",
    value: 3,
    suffix: "x",
    label: "Nhanh hơn",
    sublabel: "tuyển dụng",
  },
  {
    id: "timetohire",
    value: 30,
    prefix: "<",
    suffix: " ngày",
    label: "Time-to-hire",
    sublabel: "trung bình",
  },
];

const displayValues = ref<number[]>(metrics.map(() => 0));
const sectionRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;
let hasAnimated = false;

function animateCounter(
  index: number,
  target: number,
  duration: number = 2000,
): void {
  const start = performance.now();
  const startValue = 0;

  function update(now: number): void {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    displayValues.value[index] = Math.round(
      startValue + (target - startValue) * eased,
    );

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

function startAnimation(): void {
  if (hasAnimated) return;
  hasAnimated = true;
  metrics.forEach((m, i) => {
    setTimeout(() => {
      animateCounter(i, m.value, 2000);
    }, i * 100);
  });
}

onMounted(() => {
  if (!window.IntersectionObserver) {
    // Fallback: show full values immediately
    metrics.forEach((m, i) => {
      displayValues.value[i] = m.value;
    });
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        startAnimation();
      }
    },
    { threshold: 0.3 },
  );

  if (sectionRef.value) {
    observer.observe(sectionRef.value);
  }
});

onUnmounted(() => {
  observer?.disconnect();
});
</script>

<template>
  <section
    ref="sectionRef"
    class="py-20 bg-brand relative overflow-hidden"
    aria-label="Metrics"
  >
    <!-- Subtle texture overlay -->
    <div
      class="absolute inset-0 opacity-10 pointer-events-none"
      style="
        background-image: radial-gradient(
          circle,
          rgba(255, 255, 255, 0.3) 1px,
          transparent 1px
        );
        background-size: 20px 20px;
      "
    />

    <div
      class="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10"
    >
      <div
        v-for="(metric, i) in metrics"
        :key="metric.label"
        class="relative z-10"
      >
        <!-- Number -->
        <div class="font-mono text-4xl font-bold text-white mb-1 tabular-nums">
          {{ metric.prefix || "" }}{{ displayValues[i]
          }}{{ metric.suffix || "" }}
        </div>
        <!-- Label -->
        <div class="text-sm text-white/70 font-medium">{{ metric.label }}</div>
        <!-- Sub-label -->
        <div class="text-xs text-white/50 mt-0.5">{{ metric.sublabel }}</div>
      </div>
    </div>
  </section>
</template>
