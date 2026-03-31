<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()

const navItems = [
  { to: '/admin/users', label: 'Users', icon: '👥' },
  { to: '/admin/transactions', label: 'Transactions', icon: '💳' },
]
</script>

<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="sidebar-brand">
        <router-link to="/admin/users" class="brand-link">
          <span class="brand-icon">⚙</span>
          <span class="brand-text">VietRecruit Admin</span>
        </router-link>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          active-class="nav-link-active"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          {{ item.label }}
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar-small">
            {{ auth.user?.fullName?.charAt(0)?.toUpperCase() ?? 'A' }}
          </div>
          <div class="user-meta">
            <span class="user-name-text">{{ auth.user?.fullName ?? 'Admin' }}</span>
            <span class="user-role-text">System Admin</span>
          </div>
        </div>
        <button @click="auth.logout()" class="logout-btn" title="Log out">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </aside>

    <main class="admin-main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

/* ═══ Sidebar ═══ */
.admin-sidebar {
  width: 240px;
  background: #0f172a;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-brand {
  padding: 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #fff;
}

.brand-icon {
  font-size: 1.25rem;
}

.brand-text {
  font-size: 0.9375rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

/* ═══ Nav ═══ */
.sidebar-nav {
  flex: 1;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #94a3b8;
  text-decoration: none;
  transition: all 0.15s;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #e2e8f0;
}

.nav-link-active {
  background: rgba(0, 140, 140, 0.15) !important;
  color: #5eead4 !important;
  font-weight: 600;
}

.nav-icon { font-size: 1rem; }

/* ═══ Footer ═══ */
.sidebar-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar-small {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 140, 140, 0.3);
  color: #5eead4;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  font-weight: 700;
  flex-shrink: 0;
}

.user-meta {
  display: flex;
  flex-direction: column;
}

.user-name-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: #e2e8f0;
  line-height: 1.2;
}

.user-role-text {
  font-size: 0.625rem;
  color: #64748b;
}

.logout-btn {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.15s;
  display: flex;
  align-items: center;
}

.logout-btn:hover {
  color: #f87171;
  background: rgba(248, 113, 113, 0.1);
}

/* ═══ Main ═══ */
.admin-main {
  flex: 1;
  overflow-y: auto;
  background: #f8fafc;
}
</style>
