// src/core/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '@/core/router/routes'
import { tokenService } from '@/core/api/token.service'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to, _from) => {
  const hasSession = tokenService.hasSession()

  // Protected route → redirect to login
  if (to.meta.requiresAuth && !hasSession) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  // Guest-only route (login/register) → redirect to workspace if already logged in
  if (to.meta.guestOnly && hasSession) {
    return { name: 'Workspace' }
  }

  // RBAC checks
  // TEMPORARILY DISABLED FOR DEVELOPMENT - ALL USERS CAN ACCESS ALL ROUTES
  // TODO: Re-enable role checks before production deployment
  /*
  if (to.meta.requiresAuth && hasSession) {
    const token = tokenService.getAccessToken()
    // Old: let currentRole = ''
    let permissions: string[] = []

    if (token) {
      try {
        const payloadStr = token.split('.')[1]
        if (payloadStr) {
          const payload = JSON.parse(atob(payloadStr))
          // Backend JWT uses "roles" (array), not "role" (string)
          // Old: currentRole = payload.role || ''
          const userRoles: string[] = payload.roles || (payload.role ? [payload.role] : [])
          permissions = payload.permissions || []

          // Check Role — user must have at least one of the required roles
          if (to.meta.roles && Array.isArray(to.meta.roles)) {
            const hasRole = to.meta.roles.some((r) => userRoles.includes(r))
            if (!hasRole) {
              return { name: 'Workspace' }
            }
          }

          // Check Permissions
          if (to.meta.permissions && Array.isArray(to.meta.permissions)) {
            const hasPermission = to.meta.permissions.every(p => permissions.includes(p))
            if (!hasPermission) {
              return { name: 'Workspace' }
            }
          }
        }
      } catch {
        // Ignored, defaults apply
      }
    }
  }
  */

  // Explicit return true = allow navigation (Vue Router 4 style)
  return true
})

export default router
