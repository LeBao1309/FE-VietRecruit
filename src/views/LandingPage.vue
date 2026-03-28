<script setup lang="ts">
</script>

<template>
  <div class="landing-page">
    <header class="landing-header">
      <div class="landing-header-inner">
        <div class="landing-logo">VietRecruit</div>
        <nav class="landing-nav">
          <router-link to="/login" class="btn btn-ghost">Login</router-link>
          <router-link to="/register" class="btn btn-primary">Get Started</router-link>
        </nav>
      </div>
    </header>

    <main class="landing-hero">
      <h1 class="landing-hero-title">Modern Applicant Tracking System</h1>
      <p class="landing-hero-subtitle">
        Streamline your hiring process with AI-powered screening, interview
        management, and offer workflows — all in one platform.
      </p>
      <div class="landing-hero-actions">
        <router-link to="/register" class="btn btn-primary btn-lg">
          Start Free Trial
        </router-link>
        <router-link to="/jobs" class="btn btn-secondary btn-lg">
          Browse Jobs
        </router-link>
      </div>
    </main>
  </div>
</template>

<style scoped>
.landing-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.landing-header {
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-surface);
}

.landing-header-inner {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.landing-logo {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.landing-nav {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.landing-hero {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-16) var(--space-6);
  max-width: 720px;
  margin: 0 auto;
}

.landing-hero-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
  margin-bottom: var(--space-4);
}

.landing-hero-subtitle {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--space-8);
}

.landing-hero-actions {
  display: flex;
  gap: var(--space-4);
}
</style>
