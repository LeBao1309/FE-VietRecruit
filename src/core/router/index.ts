// src/core/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '@/core/router/routes'
import { tokenService } from '@/core/api/token.service'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to, _from, next) => {
  const hasSession = tokenService.hasSession()

  // Protected route → redirect to login
  if (to.meta.requiresAuth && !hasSession) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }

  // Guest-only route (login/register) → redirect to workspace if already logged in
  if (to.meta.guestOnly && hasSession) {
    return next({ name: 'Workspace' })
  }

  // RBAC checks
  if (to.meta.requiresAuth && hasSession) {
    const token = tokenService.getAccessToken()
    let currentRole = ''
    let permissions: string[] = []
    
    if (token) {
      try {
        const payloadStr = token.split('.')[1]
        if (payloadStr) {
          const payload = JSON.parse(atob(payloadStr))
          currentRole = payload.role || ''
          permissions = payload.permissions || []
        }
      } catch (e) {
        // Ignored, defaults apply
      }
    }

    // Check Role
    if (to.meta.roles && Array.isArray(to.meta.roles)) {
      if (!to.meta.roles.includes(currentRole)) {
        return next({ name: 'Workspace' }) // Redirect unauthorized to home
      }
    }

    // Check Permissions
    if (to.meta.permissions && Array.isArray(to.meta.permissions)) {
      const hasPermission = to.meta.permissions.every(p => permissions.includes(p))
      if (!hasPermission) {
        return next({ name: 'Workspace' }) // Missing specific explicit capability
      }
    }
  }

  next()
})

export default router
