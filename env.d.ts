declare namespace NodeJS {
  interface ProcessEnv {
    readonly APP_URL?: string;
    readonly NEXT_PUBLIC_API_URL?: string;
    readonly NEXT_PUBLIC_CLIENT_ID?: string;

    readonly POLKACHU_USER?: string;
    readonly POLKACHU_PASSWORD?: string;

    readonly NEXT_PUBLIC_EDGE_CONFIG?: string;
    readonly NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?: string;
    readonly RESEND_API_KEY?: string;
    readonly WALLETCONNECT_VERIFY_KEY?: string;
    readonly WORD_PHRASE_KEY?: string;
    readonly NEXT_PUBLIC_IS_TESTNET?: boolean;

    readonly SKIP_API_KEY?: string;
  }
}

declare type MaybePromise<T> = T | Promise<T>;
