<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import NavBar from "@/features/landing/components/NavBar.vue";
import HeroSection from "@/features/landing/components/HeroSection.vue";

// Lazy-load below-fold sections for performance
const LogoMarquee = defineAsyncComponent(
  () => import("@/features/landing/components/LogoMarquee.vue"),
);
const FeaturesGrid = defineAsyncComponent(
  () => import("@/features/landing/components/FeaturesGrid.vue"),
);
const MetricsSection = defineAsyncComponent(
  () => import("@/features/landing/components/MetricsSection.vue"),
);
const TestimonialsSection = defineAsyncComponent(
  () => import("@/features/landing/components/TestimonialsSection.vue"),
);
const PricingSection = defineAsyncComponent(
  () => import("@/features/landing/components/PricingSection.vue"),
);
const FaqSection = defineAsyncComponent(
  () => import("@/features/landing/components/FaqSection.vue"),
);
const CtaSection = defineAsyncComponent(
  () => import("@/features/landing/components/CtaSection.vue"),
);
const FooterSection = defineAsyncComponent(
  () => import("@/features/landing/components/FooterSection.vue"),
);
</script>

<template>
  <div class="min-h-screen bg-surface overflow-x-hidden">
    <!-- Eager-load navbar (critical) -->
    <NavBar />

    <!-- Hero: above-fold, eager -->
    <HeroSection />

    <!-- Below-fold: lazy loaded via Suspense -->
    <Suspense>
      <LogoMarquee />
      <template #fallback>
        <div class="h-32 bg-surface" />
      </template>
    </Suspense>

    <Suspense>
      <FeaturesGrid />
      <template #fallback>
        <div class="h-96 bg-surface" />
      </template>
    </Suspense>

    <Suspense>
      <MetricsSection />
      <template #fallback>
        <div class="h-40 bg-panel" />
      </template>
    </Suspense>

    <Suspense>
      <TestimonialsSection />
      <template #fallback>
        <div class="h-80 bg-surface" />
      </template>
    </Suspense>

    <Suspense>
      <PricingSection />
      <template #fallback>
        <div class="h-96 bg-surface" />
      </template>
    </Suspense>

    <Suspense>
      <FaqSection />
      <template #fallback>
        <div class="h-80 bg-surface" />
      </template>
    </Suspense>

    <Suspense>
      <CtaSection />
      <template #fallback>
        <div class="h-64 bg-surface" />
      </template>
    </Suspense>

    <Suspense>
      <FooterSection />
      <template #fallback>
        <div class="h-40 bg-panel" />
      </template>
    </Suspense>
  </div>
</template>
