<script setup lang="ts">
</script>

<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <h1 class="not-found-code">404</h1>
      <h2 class="not-found-title">Page Not Found</h2>
      <p class="not-found-description">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <router-link to="/" class="btn btn-primary">Go Home</router-link>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.not-found-content {
  text-align: center;
}

.not-found-code {
  font-size: 72px;
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  line-height: 1;
  margin-bottom: var(--space-2);
}

.not-found-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-3);
}

.not-found-description {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-6);
}
</style>
