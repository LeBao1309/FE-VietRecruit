// Auto-generated from router/index.ts — DO NOT edit manually
// Every route name used anywhere in src/ must be listed here

export const ROUTE_NAMES = {
  // Auth
  LOGIN:              'Login',
  REGISTER:           'Register',
  INVITE_REGISTER:    'InviteRegister',
  VERIFY_OTP:         'VerifyOtp',
  FORGOT_PASSWORD:    'ForgotPassword',
  RESET_PASSWORD:     'ResetPassword',
  CHANGE_PASSWORD:    'ChangePassword',

  // Workspace (Employer)
  WORKSPACE:          'Workspace',
  JOB_LIST:           'JobList',
  JOB_CREATE:         'JobCreate',
  JOB_EDIT:           'JobEdit',
  PIPELINE:           'Pipeline',
  INTERVIEW_LIST:     'InterviewList',
  INTERVIEWER_DASHBOARD: 'InterviewerDashboard',
  SCORECARD_DASHBOARD: 'ScorecardDashboard',
  OFFER_DASHBOARD:    'OfferDashboard',
  OFFER_CREATE:       'OfferCreate',
  COMPANY_SETTINGS:   'CompanySettings',
  SUBSCRIPTION_DASHBOARD: 'SubscriptionDashboard',
  PAYMENT_STATUS:     'PaymentStatus',

  // Onboarding
  EMPLOYER_ONBOARDING: 'EmployerOnboarding',
  CANDIDATE_ONBOARDING: 'CandidateOnboarding',

  // Candidate
  CANDIDATE_PROFILE:  'CandidateProfile',
  JOB_BOARD:          'JobBoard',
  JOB_DETAIL:         'JobDetail',
  MY_APPLICATIONS:    'MyApplications',
  APPLICATION_DETAIL: 'ApplicationDetail',

  // Admin
  ADMIN_LAYOUT:       'AdminLayout',
  ADMIN_DASHBOARD:    'AdminDashboard',
  ADMIN_COMPANIES:    'AdminCompanies',
  ADMIN_USERS:        'AdminUsers',
  ADMIN_TRANSACTIONS: 'AdminTransactions',

  // Shared
  LANDING:            'Landing',
  NOT_FOUND:          '404',
} as const

export type RouteName = typeof ROUTE_NAMES[keyof typeof ROUTE_NAMES]
