<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { tokenService } from '@/core/api/token.service'
import { authService } from '@/features/auth/services/auth.service'

const router = useRouter()

onMounted(async () => {
  // If there is no stored token, nothing to restore
  if (!tokenService.hasSession()) return

  // If access token is still valid, rehydration already happened via tokenService.getUser()
  if (tokenService.isAccessTokenValid()) return

  // Access token expired — attempt silent refresh
  const refreshToken = tokenService.getRefreshToken()
  if (!refreshToken) {
    tokenService.clearAll()
    await router.push({ name: 'Login' })
    return
  }

  try {
    const refreshed = await authService.refreshToken(refreshToken)
    tokenService.setTokens(refreshed.accessToken, refreshed.refreshToken, refreshed.expiresIn)
    // User stays on current page — guard handles access
  } catch {
    // Refresh failed (expired / revoked) → force re-login
    tokenService.clearAll()
    await router.push({ name: 'Login' })
  }
})
</script>

<template>
  <main class="min-h-screen bg-surface text-white">
    <RouterView />
  </main>
</template>