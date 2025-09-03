/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Web Search API Keys
  readonly VITE_SERPER_API_KEY?: string
  readonly VITE_SERPAPI_KEY?: string
  readonly VITE_BING_SEARCH_API_KEY?: string
  readonly VITE_BRAVE_SEARCH_API_KEY?: string
  readonly VITE_GOOGLE_SEARCH_API_KEY?: string
  readonly VITE_GOOGLE_SEARCH_ENGINE_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface ImportMetaEnv {
  readonly VITE_DJANGO_API_BASE?: string
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
