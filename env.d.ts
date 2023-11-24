declare namespace NodeJS {
  interface ProcessEnv {
    readonly APP_URL?: string;
    readonly NEXT_PUBLIC_API_URL?: string;
    readonly POLKACHU_USER?: string;
    readonly POLKACHU_PASSWORD?: string;
  }
}
