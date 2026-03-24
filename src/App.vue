<script setup lang="ts">
import AppToast from '@/components/common/AppToast.vue'
import GlobalErrorBoundary from '@/components/common/GlobalErrorBoundary.vue'
</script>

<template>
  <GlobalErrorBoundary>
    <router-view />
  </GlobalErrorBoundary>
  <AppToast />
</template>
