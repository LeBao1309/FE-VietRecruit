import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router'
import App from '@/App.vue'
import '@/assets/index.css'
import { useAuthStore } from '@/stores/authStore'

const app = createApp(App)

app.use(createPinia())

const authStore = useAuthStore()
authStore.hydrate()

app.use(router)

app.mount('#app')
