declare namespace NodeJS {
  interface ProcessEnv {
    readonly APP_URL?: string;
    readonly NEXT_PUBLIC_API_URL?: string;

    readonly POLKACHU_USER?: string;
    readonly POLKACHU_PASSWORD?: string;

    readonly NEXT_PUBLIC_EDGE_CONFIG?: string;
    readonly NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?: string;
    readonly RESEND_API_KEY?: string;
    readonly WALLETCONNECT_VERIFY_KEY?: string;
    readonly WORD_PHRASE_KEY?: string;
    readonly NEXT_PUBLIC_IS_TESTNET?: boolean;
    readonly WIDGET_SKIP_API_KEY?: string;

    readonly SKIP_API_KEY?: string;
    readonly ALLOWED_LIST_EDGE_CONFIG?: string;
    readonly NEXT_PUBLIC_COSMOS_DOMAIN?: string;
  }
}

declare type MaybePromise<T> = T | Promise<T>;
