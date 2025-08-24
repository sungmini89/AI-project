/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_MODE?: string
  readonly VITE_SPOONACULAR_API_KEY?: string
  readonly VITE_EDAMAM_APP_ID?: string
  readonly VITE_EDAMAM_APP_KEY?: string
  readonly VITE_EDAMAM_API_KEY?: string
  readonly VITE_OFFLINE_MODE?: string
  readonly VITE_MOCK_MODE?: string
  readonly VITE_API_TIMEOUT?: string
  readonly VITE_CACHE_DURATION?: string
  readonly VITE_DEBUG_MODE?: string
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_LOG_LEVEL?: string
  readonly VITE_AI_SERVICE_MODE?: string
  readonly VITE_CUSTOM_AI_API_KEY?: string
  readonly VITE_CUSTOM_AI_BASE_URL?: string
  readonly VITE_APP_TITLE?: string
  readonly VITE_APP_DESCRIPTION?: string
  readonly VITE_DEFAULT_LANGUAGE?: string
  readonly VITE_ENABLE_ANALYTICS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}