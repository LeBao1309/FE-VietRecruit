export const STORAGE_KEYS = {
  ACCESS_TOKEN:   'access_token',
  REFRESH_TOKEN:  'refresh_token',
  EXPIRES_IN:     'token_expires_in',
  USER:           'auth_user',
  REDIRECT_PATH:  'redirect_after_login',
  LOCALE:         'app_locale',
  THEME:          'app_theme',
} as const

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS]
