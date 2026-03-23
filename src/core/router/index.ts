// src/core/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '@/core/router/routes'
import { tokenService } from '@/core/api/token.service'
import { resolvePostLoginRoute } from '@/core/stores/auth.store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to, _from) => {
  const hasSession = tokenService.hasSession()

  // ── 1. Guest-only pages — redirect logged-in users to their workspace ──
  if (to.meta.guestOnly && hasSession) {
    const user = tokenService.getUser()
    return resolvePostLoginRoute(user)
  }

  // ── 2. Protected pages — redirect guests to login ──
  if (to.meta.requiresAuth && !hasSession) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  // ── 3. RBAC via JWT (for protected pages) ──
  if (to.meta.requiresAuth && hasSession) {
    const token = tokenService.getAccessToken()

    if (token) {
      try {
        const payloadStr = token.split('.')[1]
        if (payloadStr) {
          const payload = JSON.parse(atob(payloadStr))
          // Backend JWT uses "roles" (array) OR "role" (string)
          const userRoles: string[] = payload.roles || (payload.role ? [payload.role] : [])
          const permissions: string[] = payload.permissions || []

          // Role check — user must have at least one of the required roles
          if (to.meta.roles && Array.isArray(to.meta.roles)) {
            const hasRole = to.meta.roles.some((r) => userRoles.includes(r))
            if (!hasRole) {
              // Redirect to correct workspace, not always employer
              const user = tokenService.getUser()
              return resolvePostLoginRoute(user)
            }
          }

          // accountType check — e.g. candidate-only routes
          if (to.meta.accountType && Array.isArray(to.meta.accountType)) {
            const user = tokenService.getUser()
            const type = user?.accountType ?? payload.accountType
            if (!to.meta.accountType.includes(type)) {
              return resolvePostLoginRoute(user)
            }
          }

          // Permissions check
          if (to.meta.permissions && Array.isArray(to.meta.permissions)) {
            const hasPermission = to.meta.permissions.every((p) => permissions.includes(p))
            if (!hasPermission) {
              const user = tokenService.getUser()
              return resolvePostLoginRoute(user)
            }
          }
        }
      } catch {
        // Ignored, defaults apply
      }
    }
  }

  return true
})

export default router
