<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
</script>

<template>
  <div class="app-layout">
    <aside class="sidebar sidebar-admin">
      <div class="sidebar-header">
        <router-link to="/admin/users" class="sidebar-logo">VietRecruit Admin</router-link>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/admin/users" class="sidebar-link">Users</router-link>
      </nav>
      <div class="sidebar-footer">
        <span class="sidebar-user text-sm">{{ auth.user?.fullName ?? 'Admin' }}</span>
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

.sidebar-admin {
  background-color: #1a1a2e;
}

.sidebar-admin .sidebar-logo {
  color: #e0f4f4;
}

.sidebar-admin .sidebar-link {
  color: #adb5bd;
}

.sidebar-admin .sidebar-link:hover,
.sidebar-admin .sidebar-link.router-link-active {
  background-color: rgba(0, 140, 140, 0.15);
  color: #e0f4f4;
}

.sidebar-admin .sidebar-footer {
  border-top-color: rgba(255, 255, 255, 0.1);
}

.sidebar-admin .sidebar-user {
  color: #adb5bd;
}

.sidebar-header {
  padding: var(--space-4);
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
