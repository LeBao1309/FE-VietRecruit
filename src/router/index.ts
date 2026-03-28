import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
  type NavigationGuardNext,
  type RouteLocationNormalized,
} from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import type { RoleCode } from '@/types/enums'

// ── Route Metadata ───────────────────────────────────────────────────
declare module 'vue-router' {
  interface RouteMeta {
    /** Route requires authentication */
    requiresAuth?: boolean
    /** Route is only accessible when NOT authenticated */
    guestOnly?: boolean
    /** Allowed roles (empty = any authenticated user) */
    roles?: RoleCode[]
    /** Page title for document.title */
    title?: string
  }
}

// ── Route Definitions ────────────────────────────────────────────────
const routes: RouteRecordRaw[] = [
  // ── Public ──
  {
    path: '/',
    name: 'Landing',
    component: () => import('@/views/LandingPage.vue'),
    meta: { title: 'VietRecruit — Modern ATS' },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginPage.vue'),
    meta: { guestOnly: true, title: 'Login' },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/RegisterPage.vue'),
    meta: { guestOnly: true, title: 'Register' },
  },
  {
    path: '/verify-otp',
    name: 'VerifyOtp',
    component: () => import('@/views/auth/VerifyOtpPage.vue'),
    meta: { guestOnly: true, title: 'Verify Email' },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/auth/ForgotPasswordPage.vue'),
    meta: { guestOnly: true, title: 'Forgot Password' },
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/views/auth/ResetPasswordPage.vue'),
    meta: { guestOnly: true, title: 'Reset Password' },
  },
  {
    path: '/register/invite',
    name: 'InviteRegister',
    component: () => import('@/views/auth/InviteRegisterPage.vue'),
    meta: { guestOnly: true, title: 'Accept Invitation' },
  },
  {
    path: '/oauth2/callback',
    name: 'OAuth2Callback',
    component: () => import('@/views/auth/OAuth2CallbackPage.vue'),
    meta: { title: 'Signing in…' },
  },

  // ── Candidate ──
  {
    path: '/candidate',
    component: () => import('@/layouts/CandidateLayout.vue'),
    meta: { requiresAuth: true, roles: ['CANDIDATE'] },
    children: [
      {
        path: '',
        redirect: '/candidate/dashboard',
      },
      {
        path: 'dashboard',
        name: 'CandidateDashboard',
        component: () => import('@/views/candidate/DashboardPage.vue'),
        meta: { title: 'Dashboard' },
      },
      {
        path: 'profile',
        name: 'CandidateProfile',
        component: () => import('@/views/shared/ProfilePage.vue'),
        meta: { title: 'My Profile' },
      },
      {
        path: 'settings',
        name: 'CandidateSettings',
        component: () => import('@/views/shared/SettingsPage.vue'),
        meta: { title: 'Settings' },
      },
    ],
  },

  // ── Employer ──
  {
    path: '/employer',
    component: () => import('@/layouts/EmployerLayout.vue'),
    meta: { requiresAuth: true, roles: ['COMPANY_ADMIN', 'HR', 'INTERVIEWER'] },
    children: [
      {
        path: '',
        redirect: '/employer/dashboard',
      },
      {
        path: 'dashboard',
        name: 'EmployerDashboard',
        component: () => import('@/views/employer/DashboardPage.vue'),
        meta: { title: 'Dashboard' },
      },
      {
        path: 'profile',
        name: 'EmployerProfile',
        component: () => import('@/views/shared/ProfilePage.vue'),
        meta: { title: 'My Profile' },
      },
      {
        path: 'settings',
        name: 'EmployerSettings',
        component: () => import('@/views/shared/SettingsPage.vue'),
        meta: { title: 'Settings' },
      },
    ],
  },

  // ── Admin ──
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, roles: ['SYSTEM_ADMIN'] },
    children: [
      {
        path: '',
        redirect: '/admin/users',
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/UsersPage.vue'),
        meta: { title: 'User Management' },
      },
    ],
  },

  // ── Catch-all ──
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundPage.vue'),
    meta: { title: 'Page Not Found' },
  },
]

// ── Router Instance ──────────────────────────────────────────────────
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// ── Navigation Guards ────────────────────────────────────────────────
router.beforeEach(
  (
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ) => {
    const auth = useAuthStore()

    // Set page title
    const title = to.meta.title
    document.title = title ? `${title} | VietRecruit` : 'VietRecruit'

    // Guest-only routes (login, register) — redirect if already authed
    if (to.meta.guestOnly && auth.isAuthenticated) {
      // Redirect to role-appropriate dashboard
      if (auth.isCandidate) return next('/candidate/dashboard')
      if (auth.isEmployer) return next('/employer/dashboard')
      if (auth.isSystemAdmin) return next('/admin/users')
      return next('/')
    }

    // Protected routes
    if (to.meta.requiresAuth && !auth.isAuthenticated) {
      return next({ name: 'Login', query: { redirect: to.fullPath } })
    }

    // Role-based access
    const requiredRoles = to.meta.roles
    if (requiredRoles && requiredRoles.length > 0 && auth.isAuthenticated) {
      const hasAccess = auth.hasAnyRole(...requiredRoles)
      if (!hasAccess) {
        // Redirect to their own dashboard instead of showing 403
        if (auth.isCandidate) return next('/candidate/dashboard')
        if (auth.isEmployer) return next('/employer/dashboard')
        if (auth.isSystemAdmin) return next('/admin/users')
        return next('/')
      }
    }

    next()
  },
)

export default router
