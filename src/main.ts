// src/main.ts — IMPORT ORDER IS MANDATORY
// Font imports MUST come first — before Vue, router, and stores.
// This ensures the font is registered in the CSSOM before any component renders.
import '@fontsource/be-vietnam-pro/400.css' // Regular — body text
import '@fontsource/be-vietnam-pro/500.css' // Medium — labels, buttons
import '@fontsource/be-vietnam-pro/600.css' // SemiBold — subheadings
import '@fontsource/be-vietnam-pro/700.css' // Bold — headings
import '@fontsource/be-vietnam-pro/800.css' // ExtraBold — hero display

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/core/router/index'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import App from './App.vue'
import './assets/css/main.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(Toast, {
  position: 'bottom-right',
  timeout: 3000,
  closeOnClick: true,
  pauseOnHover: true,
})
app.mount('#app')