/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DJANGO_API_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
