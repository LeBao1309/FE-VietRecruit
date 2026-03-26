// src/core/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '@/core/router/routes'
import { useAuthStore, resolvePostLoginRoute } from '@/core/stores/auth.store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to, _from) => {
  const auth = useAuthStore()

  // (1) Guest-only: logged-in users go to their workspace
  if (to.meta.guestOnly && auth.isAuthenticated && auth.user) {
    return resolvePostLoginRoute(auth.user)
  }

  // (2) Protected: unauthenticated users go to login
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  // (3) COMPANY_ADMIN without company association cannot skip onboarding
  if (
    to.meta.requiresAuth &&
    to.path !== '/onboarding/employer' &&
    auth.user?.roles?.includes('COMPANY_ADMIN') &&
    !auth.user?.companyId
  ) {
    return { path: '/onboarding/employer' }
  }

  // (4) Role mismatch: silently redirect to correct workspace
  const routeRoles = to.meta.allowedRoles as string[] | undefined
  const userRole = auth.user?.roles?.[0]
  if (routeRoles && userRole && !routeRoles.includes(userRole)) {
    return resolvePostLoginRoute(auth.user)
  }

  return true
})

export default router
