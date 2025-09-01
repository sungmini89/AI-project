/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_MODE: string
  readonly VITE_COLORMIND_API_URL: string
  readonly VITE_THECOLORAPI_URL: string
  readonly VITE_ENABLE_PWA: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}