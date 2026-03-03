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

  next()
})

export default router
