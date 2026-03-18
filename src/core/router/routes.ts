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
    path: '/auth/login',
    name: 'Login',
    component: () => import('@/features/auth/views/LoginPage.vue'),
    meta: { requiresAuth: false, guestOnly: true },
  },
  {
    path: '/auth/register',
    name: 'Register',
    component: () => import('@/features/auth/views/RegisterPage.vue'),
    meta: { requiresAuth: false, guestOnly: true },
  },
  {
    path: '/auth/register/invite',
    name: 'InviteRegister',
    component: () => import('@/features/auth/views/InviteRegisterPage.vue'),
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
  {
    path: '/auth/reset-password',
    name: 'ResetPassword',
    component: () => import('@/features/auth/views/ResetPasswordPage.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/auth/change-password',
    name: 'ChangePassword',
    component: () => import('@/features/auth/views/ChangePasswordPage.vue'),
    meta: { requiresAuth: true },
  },
  // ── Protected routes ───────────────────────────────────────
  // Onboarding
  {
    path: '/onboarding/employer',
    name: 'EmployerOnboarding',
    component: () => import('@/features/onboarding/views/EmployerOnboardingPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/onboarding/candidate',
    name: 'CandidateOnboarding',
    component: () => import('@/features/onboarding/views/CandidateOnboardingPage.vue'),
    meta: { requiresAuth: true },
  },
  // Company Settings
  {
    path: '/company/settings',
    name: 'CompanySettings',
    component: () => import('@/features/company/views/CompanySettingsPage.vue'),
    meta: { requiresAuth: true },
  },
  // Workspace
  {
    path: '/workspace',
    name: 'Workspace',
    component: () => import('@/features/workspace/views/WorkspacePage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/workspace/applications',
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
