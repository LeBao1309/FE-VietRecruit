// src/core/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '@/core/router/routes'
import { tokenService } from '@/core/api/token.service'
import { useAuthStore, resolvePostLoginRoute } from '@/core/stores/auth.store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore()

  // (1) Guest-only: logged-in users go to their workspace
  if (to.meta.guestOnly && auth.isAuthenticated && auth.user) {
    return next(resolvePostLoginRoute(auth.user))
  }

  // (2) Protected: unauthenticated users go to login
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }

  // (3) COMPANY_ADMIN without company profile cannot skip onboarding
  if (
    to.meta.requiresAuth &&
    to.path !== '/onboarding/employer' &&
    auth.user?.roles?.includes('COMPANY_ADMIN') &&
    !auth.user?.companyProfileComplete
  ) {
    return next({ path: '/onboarding/employer' })
  }

  // (4) Role mismatch: silently redirect to correct workspace
  const routeRoles = to.meta.allowedRoles as string[] | undefined
  const userRole = auth.user?.roles?.[0]
  if (routeRoles && userRole && !routeRoles.includes(userRole)) {
    return next(resolvePostLoginRoute(auth.user))
  }

  // Specific permission strings required — user must have ALL of them
  const routePermissions = to.meta.permissions as string[] | undefined
  if (routePermissions && auth.isAuthenticated) {
    const token = tokenService.getAccessToken()
    if (token) {
      try {
        const payloadStr = token.split('.')[1]
        if (!payloadStr) {
          return next(resolvePostLoginRoute(auth.user))
        }
        const payload = JSON.parse(atob(payloadStr))
        const permissions: string[] = payload.permissions || []
        const hasPermission = routePermissions.every((p) => permissions.includes(p))
        if (!hasPermission) {
          return next(resolvePostLoginRoute(auth.user))
        }
      } catch {
        return next(resolvePostLoginRoute(auth.user))
      }
    }
  }

  next()
})

export default router
