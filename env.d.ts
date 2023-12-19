declare namespace NodeJS {
  interface ProcessEnv {
    readonly APP_URL?: string;
    readonly NEXT_PUBLIC_API_URL?: string;
    readonly CORS_EDGE_CONFIG?: string;
    readonly POLKACHU_USER?: string;
    readonly POLKACHU_PASSWORD?: string;
  }
}
