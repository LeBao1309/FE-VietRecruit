import { ref, watch, onMounted } from 'vue'

type Theme = 'light' | 'dark' | 'system'

export function useTheme() {
  const theme = ref<Theme>('system')
  const isDark = ref(false)

  function applyTheme(currentTheme: Theme) {
    let resolvedDark = false
    if (currentTheme === 'system') {
      resolvedDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    } else {
      resolvedDark = currentTheme === 'dark'
    }

    isDark.value = resolvedDark
    
    if (resolvedDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    localStorage.setItem('vietrecruit_theme', currentTheme)
  }

  function toggleTheme() {
    if (theme.value === 'light') {
      theme.value = 'dark'
    } else if (theme.value === 'dark') {
      theme.value = 'system'
    } else {
      theme.value = 'light'
    }
  }

  watch(theme, (newTheme) => {
    applyTheme(newTheme)
  })

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (_e) => {
    if (theme.value === 'system') {
      applyTheme('system')
    }
  })

  onMounted(() => {
    const savedTheme = localStorage.getItem('vietrecruit_theme') as Theme | null
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      theme.value = savedTheme
    } else {
      applyTheme('system')
    }
  })

  return {
    theme,
    isDark,
    toggleTheme,
    setTheme: (newTheme: Theme) => { theme.value = newTheme }
  }
}
