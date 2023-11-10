// https://vercel.com/docs/projects/environment-variables/system-environment-variables

declare namespace NodeJS {
  interface ProcessEnv {
    readonly VERCEL?: "1";
    readonly CI?: "1";

    /** @see https://vercel.com/docs/edge-network/regions#region-list */
    readonly VERCEL_REGION?:
      | "arn1"
      | "bom1"
      | "cdg1"
      | "cle1"
      | "cpt1"
      | "dub1"
      | "fra1"
      | "gru1"
      | "hkg1"
      | "hnd1"
      | "iad1"
      | "icn1"
      | "kix1"
      | "lhr1"
      | "pdx1"
      | "sfo1"
      | "sin1"
      | "syd1"
      | "dev1";

    readonly VERCEL_ENV?: "production" | "preview" | "development";
    readonly VERCEL_URL?: string;
    readonly VERCEL_BRANCH_URL?: string;
    readonly VERCEL_AUTOMATION_BYPASS_SECRET?: string;
    readonly VERCEL_GIT_PROVIDER?: string;
    readonly VERCEL_GIT_REPO_SLUG?: string;
    readonly VERCEL_GIT_REPO_OWNER?: string;
    readonly VERCEL_GIT_REPO_ID?: string;
    readonly VERCEL_GIT_COMMIT_REF?: string;
    readonly VERCEL_GIT_COMMIT_SHA?: string;
    readonly VERCEL_GIT_COMMIT_MESSAGE?: string;
    readonly VERCEL_GIT_COMMIT_AUTHOR_LOGIN?: string;
    readonly VERCEL_GIT_COMMIT_AUTHOR_NAME?: string;
    readonly VERCEL_GIT_PREVIOUS_SHA?: string;
    readonly VERCEL_GIT_PULL_REQUEST_ID?: string;

    readonly NEXT_PUBLIC_VERCEL_ENV?: "production" | "preview" | "development";
    readonly NEXT_PUBLIC_VERCEL_URL?: string;
    readonly NEXT_PUBLIC_VERCEL_BRANCH_URL?: string;
    readonly NEXT_PUBLIC_VERCEL_AUTOMATION_BYPASS_SECRET?: string;
    readonly NEXT_PUBLIC_VERCEL_GIT_PROVIDER?: string;
    readonly NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG?: string;
    readonly NEXT_PUBLIC_VERCEL_GIT_REPO_OWNER?: string;
    readonly NEXT_PUBLIC_VERCEL_GIT_REPO_ID?: string;
    readonly NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF?: string;
    readonly NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?: string;
    readonly NEXT_PUBLIC_VERCEL_GIT_COMMIT_MESSAGE?: string;
    readonly NEXT_PUBLIC_VERCEL_GIT_COMMIT_AUTHOR_LOGIN?: string;
    readonly NEXT_PUBLIC_VERCEL_GIT_COMMIT_AUTHOR_NAME?: string;
    readonly NEXT_PUBLIC_VERCEL_GIT_PULL_REQUEST_ID?: string;
  }
}
