/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly WEB_BACKEND_HOST: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
