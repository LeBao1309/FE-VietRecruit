import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router'
import App from '@/App.vue'
import '@/assets/index.css'
import { useAuthStore } from '@/stores/authStore'
import { authService } from '@/services/authService'
import { getRefreshToken } from '@/services/http'

const app = createApp(App)

app.use(createPinia())

const authStore = useAuthStore()
authStore.hydrate()
if (authStore.isAuthenticated) {
  authStore.fetchProfile()
}

if (authStore.isAuthenticated) {
  // Refresh token on every app load so roles in JWT always reflect current backend state
  const refreshToken = getRefreshToken()
  if (refreshToken) {
    authService.refresh({ refreshToken }).then((result) => {
      if (result.data) {
        // authService.refresh() already called setTokens() internally
        // re-hydrate to extract updated roles from the new JWT
        authStore.hydrate()
      }
    })
  }
  authStore.fetchProfile()
}

app.use(router)

app.mount('#app')
