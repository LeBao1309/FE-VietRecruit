<script setup lang="ts">
// Tech logos from assets — using the ones already available
const logos = [
  {
    name: "PostgreSQL",
    src: new URL("@/assets/img/postgresql.svg", import.meta.url).href,
  },
  {
    name: "Redis",
    src: new URL("@/assets/img/redis.svg", import.meta.url).href,
  },
  {
    name: "Kafka",
    src: new URL("@/assets/img/kafka.svg", import.meta.url).href,
  },
  {
    name: "Docker",
    src: new URL("@/assets/img/docker.svg", import.meta.url).href,
  },
  {
    name: "Elasticsearch",
    src: new URL("@/assets/img/elastic.svg", import.meta.url).href,
  },
  {
    name: "Grafana",
    src: new URL("@/assets/img/grafana.svg", import.meta.url).href,
  },
  {
    name: "Jenkins",
    src: new URL("@/assets/img/jenkins.svg", import.meta.url).href,
  },
  {
    name: "Spring",
    src: new URL("@/assets/img/springio.svg", import.meta.url).href,
  },
  {
    name: "Prometheus",
    src: new URL("@/assets/img/prometheus.svg", import.meta.url).href,
  },
  {
    name: "Qdrant",
    src: new URL("@/assets/img/qdrant.svg", import.meta.url).href,
  },
];

// Duplicate for seamless infinite loop
const row1 = [...logos, ...logos];
const row2 = [...logos].reverse().concat([...logos].reverse());
</script>

<template>
  <section class="py-16 relative overflow-hidden" aria-label="Technology stack">
    <!-- Section Label -->
    <p
      class="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6B7280] mb-10"
    >
      Được xây dựng trên nền tảng công nghệ hàng đầu
    </p>

    <!-- Marquee container -->
    <div class="space-y-5">
      <!-- Row 1: left → right -->
      <div
        class="relative overflow-hidden"
        style="
          mask-image: linear-gradient(
            to right,
            transparent,
            black 10%,
            black 90%,
            transparent
          );
          -webkit-mask-image: linear-gradient(
            to right,
            transparent,
            black 10%,
            black 90%,
            transparent
          );
        "
      >
        <div
          class="flex gap-8 items-center w-max"
          style="animation: marquee 30s linear infinite"
        >
          <div
            v-for="(logo, i) in row1"
            :key="`row1-${logo.name}-${i}`"
            class="flex items-center justify-center w-24 h-12 flex-shrink-0"
          >
            <img
              :src="logo.src"
              :alt="logo.name"
              loading="lazy"
              class="max-h-8 max-w-[80px] w-auto object-contain grayscale opacity-40 hover:grayscale-0 hover:opacity-80 transition-all duration-300"
            />
          </div>
        </div>
      </div>

      <!-- Row 2: right → left -->
      <div
        class="relative overflow-hidden"
        style="
          mask-image: linear-gradient(
            to right,
            transparent,
            black 10%,
            black 90%,
            transparent
          );
          -webkit-mask-image: linear-gradient(
            to right,
            transparent,
            black 10%,
            black 90%,
            transparent
          );
        "
      >
        <div
          class="flex gap-8 items-center w-max"
          style="animation: marquee-reverse 30s linear infinite"
        >
          <div
            v-for="(logo, i) in row2"
            :key="`row2-${logo.name}-${i}`"
            class="flex items-center justify-center w-24 h-12 flex-shrink-0"
          >
            <img
              :src="logo.src"
              :alt="logo.name"
              loading="lazy"
              class="max-h-8 max-w-[80px] w-auto object-contain grayscale opacity-40 hover:grayscale-0 hover:opacity-80 transition-all duration-300"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
