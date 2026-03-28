<script setup lang="ts">
</script>

<template>
  <div class="auth-layout">
    <div class="auth-layout-header">
      <router-link to="/" class="auth-logo">VietRecruit</router-link>
    </div>
    <main class="auth-layout-main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--color-bg-page);
}

.auth-layout-header {
  padding: var(--space-6);
}

.auth-logo {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.auth-layout-main {
  width: 100%;
  max-width: 440px;
  padding: 0 var(--space-4);
}
</style>
