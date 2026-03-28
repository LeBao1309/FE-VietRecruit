<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
</script>

<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <router-link to="/employer/dashboard" class="sidebar-logo">VietRecruit</router-link>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/employer/dashboard" class="sidebar-link">Dashboard</router-link>
      </nav>
      <div class="sidebar-footer">
        <span class="sidebar-user text-sm">{{ auth.user?.fullName ?? 'Employer' }}</span>
      </div>
    </aside>
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 240px;
  background-color: var(--color-bg-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  padding: var(--space-4) var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.sidebar-logo {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.sidebar-nav {
  flex: 1;
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.sidebar-link {
  display: block;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.sidebar-link:hover,
.sidebar-link.router-link-active {
  background-color: var(--color-primary-bg);
  color: var(--color-primary);
}

.sidebar-footer {
  padding: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.sidebar-user {
  color: var(--color-text-secondary);
}

.app-main {
  flex: 1;
  overflow-y: auto;
}
</style>
