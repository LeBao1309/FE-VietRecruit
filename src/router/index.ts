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

  // ── Public Job Board ──
  {
    path: '/jobs',
    name: 'JobBoard',
    component: () => import('@/views/public/JobBoardPage.vue'),
    meta: { title: 'Browse Jobs' },
  },
  {
    path: '/jobs/:id',
    name: 'PublicJobDetail',
    component: () => import('@/views/public/PublicJobDetailPage.vue'),
    meta: { title: 'Job Details' },
  },

  // ── Company Directory (public) ──
  {
    path: '/companies',
    name: 'CompanyList',
    component: () => import('@/views/public/CompanyListPage.vue'),
    meta: { title: 'Explore Companies' },
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
        path: 'candidate-profile',
        name: 'CandidateProfileEdit',
        component: () => import('@/views/candidate/CandidateProfilePage.vue'),
        meta: { title: 'Candidate Profile' },
      },
      {
        path: 'cv',
        name: 'CvManagement',
        component: () => import('@/views/candidate/CvManagementPage.vue'),
        meta: { title: 'CV Management' },
      },
      {
        path: 'recommendations',
        name: 'JobRecommendations',
        component: () => import('@/views/candidate/JobRecommendationsPage.vue'),
        meta: { title: 'Job Recommendations' },
      },
      {
        path: 'salary-benchmark',
        name: 'CandidateSalaryBenchmark',
        component: () => import('@/views/candidate/SalaryBenchmarkPage.vue'),
        meta: { title: 'Salary Benchmark' },
      },
      {
        path: 'applications',
        name: 'CandidateApplications',
        component: () => import('@/views/candidate/MyApplicationsPage.vue'),
        meta: { title: 'My Applications' },
      },
      {
        path: 'applications/:id',
        name: 'CandidateApplicationDetail',
        component: () => import('@/views/candidate/ApplicationDetailPage.vue'),
        meta: { title: 'Application Details' },
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
        path: 'company-setup',
        name: 'CompanySetup',
        component: () => import('@/views/employer/CompanySetupPage.vue'),
        meta: { title: 'Company Setup' },
      },
      {
        path: 'organization',
        name: 'Organization',
        component: () => import('@/views/employer/OrganizationPage.vue'),
        meta: { title: 'Organization' },
      },
      {
        path: 'team',
        name: 'Team',
        component: () => import('@/views/employer/TeamPage.vue'),
        meta: { title: 'Team' },
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
      {
        path: 'pricing',
        name: 'EmployerPricing',
        component: () => import('@/views/employer/PricingPage.vue'),
        meta: { title: 'Plans & Pricing', roles: ['COMPANY_ADMIN'] },
      },
      {
        path: 'payment-status',
        name: 'PaymentStatus',
        component: () => import('@/views/employer/PaymentStatusPage.vue'),
        meta: { title: 'Payment Status', roles: ['COMPANY_ADMIN'] },
      },
      {
        path: 'subscription',
        name: 'EmployerSubscription',
        component: () => import('@/views/employer/SubscriptionPage.vue'),
        meta: { title: 'Subscription', roles: ['COMPANY_ADMIN'] },
      },
      {
        path: 'billing',
        name: 'EmployerBilling',
        component: () => import('@/views/employer/BillingPage.vue'),
        meta: { title: 'Billing History', roles: ['COMPANY_ADMIN'] },
      },
      // ── Interviewer Portal ──
      {
        path: 'my-interviews',
        name: 'InterviewerDashboard',
        component: () => import('@/views/employer/InterviewerDashboardPage.vue'),
        meta: { title: 'My Interviews', roles: ['INTERVIEWER'] },
      },
      // ── Job Management ──
      {
        path: 'jobs',
        name: 'EmployerJobs',
        component: () => import('@/views/employer/JobListPage.vue'),
        meta: { title: 'Jobs', roles: ['COMPANY_ADMIN', 'HR'] },
      },
      {
        path: 'jobs/new',
        name: 'EmployerJobCreate',
        component: () => import('@/views/employer/JobFormPage.vue'),
        meta: { title: 'Create Job', roles: ['COMPANY_ADMIN', 'HR'] },
      },
      {
        path: 'jobs/:id/edit',
        name: 'EmployerJobEdit',
        component: () => import('@/views/employer/JobFormPage.vue'),
        meta: { title: 'Edit Job', roles: ['COMPANY_ADMIN', 'HR'] },
      },
      {
        path: 'jobs/:id',
        name: 'EmployerJobDetail',
        component: () => import('@/views/employer/JobDetailPage.vue'),
        meta: { title: 'Job Details', roles: ['COMPANY_ADMIN', 'HR'] },
      },
      // ── Candidate Search ──
      {
        path: 'candidates',
        name: 'EmployerCandidateSearch',
        component: () => import('@/views/employer/CandidateSearchPage.vue'),
        meta: { title: 'Search Candidates', roles: ['COMPANY_ADMIN', 'HR'] },
      },
      {
        path: 'candidates/:id',
        name: 'EmployerCandidateDetail',
        component: () => import('@/views/employer/CandidateDetailPage.vue'),
        meta: { title: 'Candidate Profile', roles: ['COMPANY_ADMIN', 'HR'] },
      },
      // ── Application Pipeline ──
      {
        path: 'jobs/:id/applications',
        name: 'EmployerApplicationPipeline',
        component: () => import('@/views/employer/ApplicationPipelinePage.vue'),
        meta: { title: 'Application Pipeline', roles: ['COMPANY_ADMIN', 'HR'] },
      },
      {
        path: 'jobs/:jobId/applications/:id',
        name: 'EmployerApplicationDetail',
        component: () => import('@/views/employer/ApplicationDetailPage.vue'),
        meta: { title: 'Application Details', roles: ['COMPANY_ADMIN', 'HR'] },
      },
      {
        path: 'applications/:id',
        name: 'EmployerApplicationDetailFlat',
        component: () => import('@/views/employer/ApplicationDetailPage.vue'),
        meta: { title: 'Application Details', roles: ['COMPANY_ADMIN', 'HR'] },
      },
      // ── Interviews ──
      {
        path: 'applications/:id/interviews',
        name: 'EmployerInterviewList',
        component: () => import('@/views/employer/InterviewListPage.vue'),
        meta: { title: 'Interviews', roles: ['COMPANY_ADMIN', 'HR'] },
      },
      {
        path: 'interviews/:id',
        name: 'EmployerInterviewDetail',
        component: () => import('@/views/employer/InterviewDetailPage.vue'),
        meta: { title: 'Interview Details', roles: ['COMPANY_ADMIN', 'HR', 'INTERVIEWER'] },
      },
      // ── Scorecards ──
      {
        path: 'interviews/:id/scorecard',
        name: 'EmployerScorecardForm',
        component: () => import('@/views/employer/ScorecardFormPage.vue'),
        meta: { title: 'Submit Scorecard', roles: ['COMPANY_ADMIN', 'HR', 'INTERVIEWER'] },
      },
      {
        path: 'interviews/:id/scorecards',
        name: 'EmployerScorecardSummary',
        component: () => import('@/views/employer/ScorecardSummaryPage.vue'),
        meta: { title: 'Scorecard Summary', roles: ['COMPANY_ADMIN', 'HR', 'INTERVIEWER'] },
      },
      // ── Offers ──
      {
        path: 'offers/:id',
        name: 'EmployerOfferDetail',
        component: () => import('@/views/employer/OfferDetailPage.vue'),
        meta: { title: 'Offer Management', roles: ['COMPANY_ADMIN', 'HR'] },
      },
    ],
  },

  // ── Admin ──
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, roles: ['SYSTEM_ADMIN', 'CUSTOMER_SERVICE'] },
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
      {
        path: 'transactions',
        name: 'AdminTransactions',
        component: () => import('@/views/admin/TransactionsPage.vue'),
        meta: { title: 'Transaction History' },
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
      if (auth.isSystemAdmin || auth.isCustomerService) return next('/admin/users')
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
        if (auth.isSystemAdmin || auth.isCustomerService) return next('/admin/users')
        return next('/')
      }
    }

    next()
  },
)

export default router
