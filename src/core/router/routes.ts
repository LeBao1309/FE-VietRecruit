// src/core/router/routes.ts
import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  // ── Public routes ──────────────────────────────────────────
  {
    path: '/',
    name: 'Landing',
    component: () => import('@/features/landing/views/LandingPage.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/features/auth/views/LoginPage.vue'),
    meta: { requiresAuth: false, guestOnly: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/features/auth/views/RegisterPage.vue'),
    meta: { requiresAuth: false, guestOnly: true },
  },
  {
    path: '/auth/verify-otp',
    name: 'VerifyOtp',
    component: () => import('@/features/auth/views/VerifyOtpPage.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/auth/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/features/auth/views/ForgotPasswordPage.vue'),
    meta: { requiresAuth: false, guestOnly: true },
  },
  // ── Protected routes ───────────────────────────────────────
  {
    path: '/workspace',
    name: 'Workspace',
    component: () => import('@/features/workspace/views/WorkspacePage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/workspace/pipeline',
    name: 'Pipeline',
    component: () => import('@/features/workspace/views/PipelinePage.vue'),
    meta: { requiresAuth: true },
  },
  // ── Fallback ───────────────────────────────────────────────
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]
