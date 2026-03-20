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
  // Subscription & Payment
  {
    path: '/subscriptions/current',
    name: 'SubscriptionDashboard',
    component: () => import('@/features/subscription/pages/SubscriptionDashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/payment/status',
    name: 'PaymentStatus',
    component: () => import('@/features/payment/pages/PaymentStatusPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/offers',
    name: 'OfferDashboard',
    component: () => import('@/features/offer/views/OfferDashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/offers/create',
    name: 'OfferCreate',
    component: () => import('@/features/offer/views/OfferCreateView.vue'),
    meta: { requiresAuth: true },
  },
  // ── Candidate Portal ───────────────────────────────────────
  {
    path: '/candidate/profile',
    name: 'CandidateProfile',
    component: () => import('@/features/candidate/views/CandidateProfilePage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/jobs',
    name: 'JobBoard',
    component: () => import('@/features/candidate/views/JobBoardPage.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/jobs/:id',
    name: 'JobDetail',
    component: () => import('@/features/candidate/views/JobDetailPage.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/applications/mine',
    name: 'MyApplications',
    component: () => import('@/features/candidate/views/MyApplicationsPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/applications/:id',
    name: 'ApplicationDetail',
    component: () => import('@/features/candidate/views/ApplicationDetailPage.vue'),
    meta: { requiresAuth: true },
  },
  // ── Admin routes ───────────────────────────────────────────
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/features/admin/components/AdminLayout.vue'),
    meta: { requiresAuth: true, roles: ['SYSTEM_ADMIN', 'CUSTOMER_SERVICE'] },
    children: [
      {
        path: '',
        redirect: '/admin/companies',
      },
      {
        path: 'companies',
        name: 'AdminCompanies',
        component: () => import('@/features/admin/views/AdminCompanyListPage.vue'),
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/features/admin/views/AdminUserListPage.vue'),
      },
      {
        path: 'transactions',
        name: 'AdminTransactions',
        component: () => import('@/features/admin/views/AdminTransactionHistoryPage.vue'),
        meta: { permissions: ['TRANSACTION:VIEW_ALL'] },
      },
    ],
  },
  // ── Fallback ───────────────────────────────────────────────
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]
