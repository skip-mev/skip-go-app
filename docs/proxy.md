# Proxy Architecture

The skip-go-app acts as a server-side proxy layer for several external APIs. All proxy routes are Next.js API routes running on Vercel Edge Runtime. The proxy serves two purposes:

1. **API key injection** — keep secrets server-side and inject them into outbound requests so they never reach the browser.
2. **Domain whitelisting** — only allow requests from approved origins via Vercel Edge Config.

---

## Proxy Routes

### Skip API (`/api/skip/*`)


| Detail  | Value                                                             |
| ------- | ----------------------------------------------------------------- |
| Handler | `src/pages/api/skip/handler.ts`                                   |
| Target  | `https://api.skip.build` (configurable via `NEXT_PUBLIC_API_URL`) |
| Runtime | Edge                                                              |


The primary proxy. Routes like `/api/skip/v2/fungible/route` are forwarded to `https://api.skip.build/v2/fungible/route`.

**API key injection:**

1. The request `Origin` is looked up in Vercel Edge Config (`ALLOWED_LIST_EDGE_CONFIG`).
2. If the origin has an associated `apiKey`, it is set as the `authorization` header.
3. If no per-origin key is found, the fallback `SKIP_API_KEY` env var is used.

### Widget Skip API (`/api/widget/skip/*`)


| Detail  | Value                                  |
| ------- | -------------------------------------- |
| Handler | `src/pages/api/widget/skip/handler.ts` |
| Target  | `https://api.skip.build`               |
| Runtime | Edge                                   |


A separate proxy for widget consumers. Uses a dedicated `WIDGET_SKIP_API_KEY` env var set in the `authorization` header. No per-origin lookup — any request through this route gets the widget key.

### Cosmos REST (`/api/rest/:chainID/*`)


| Detail  | Value                           |
| ------- | ------------------------------- |
| Handler | `src/pages/api/rest/handler.ts` |
| Target  | Chain-specific REST endpoints   |
| Runtime | Edge                            |


Proxies Cosmos LCD/REST requests. The first path segment after `/api/rest/` is the `chainID`.

**Endpoint resolution order:**

1. **Whitelabel (Solana)** — Helius endpoints with `HELIUS_API_KEY` injected as a query param.
2. **Custom chain IDs** — hardcoded endpoints in `CUSTOM_API_CHAIN_IDS` (e.g. `secret-4` → Lavender Five).
3. **Whitelabel private nodes** — chains listed in `WHITELABEL_CHAINS` get a `cosmoslabs.kr` endpoint with the `WHITELABEL_KEY` sent as the `User-Agent` header. If the private node health-check fails, it falls through to the public fallback below.
4. **Public fallback** — uses endpoints from `src/chains/rest.json`, preferring Polkachu-hosted public nodes (see `findFirstWorkingEndpoint` in `src/utils/endpoint.ts` — unrelated to the whitelabel private nodes above), and health-checks until a working one is found.

### Cosmos RPC (`/api/rpc/:chainID/*`)


| Detail  | Value                          |
| ------- | ------------------------------ |
| Handler | `src/pages/api/rpc/handler.ts` |
| Target  | Chain-specific RPC endpoints   |
| Runtime | Edge                           |


Same resolution logic as REST but for Tendermint RPC. Uses `src/chains/rpc.json` as the public fallback source.

### Amplitude (`/api/amplitude/*`)


| Detail  | Value                                                                       |
| ------- | --------------------------------------------------------------------------- |
| Handler | `src/pages/api/amplitude/[[...path]].ts`                                    |
| Targets | `api2.amplitude.com`, `sr-client-cfg.amplitude.com`, `api-sr.amplitude.com` |
| Runtime | Node.js                                                                     |


Proxies analytics events to Amplitude. The `api_key` is provided by the client in the request body — no server-side key injection. The proxy reformats the payload from JSON to `application/x-www-form-urlencoded` for Amplitude's `httpapi` endpoint.

---

## API Key Injection Summary


| Proxy                            | Env Variable                                                 | Injection Method           |
| -------------------------------- | -------------------------------------------------------------| --------------------------- |
| Skip API                         | Per-origin key from Edge Config, or `SKIP_API_KEY` fallback | `authorization` header      |
| Widget Skip API                  | `WIDGET_SKIP_API_KEY`                                        | `authorization` header      |
| Cosmos REST/RPC (Whitelabel)     | `WHITELABEL_KEY`                                             | `User-Agent` header         |
| Cosmos REST/RPC (Helius/Solana)  | `HELIUS_API_KEY`                                             | `api-key` query parameter   |
| Amplitude                        | None (client-provided)                                       | —                            |


---

## Domain Whitelisting

Domain whitelisting controls which origins can call the proxy and which Skip API key they receive.

### How It Works

All `/api/*` requests pass through the CORS middleware in `src/middleware.ts`:

1. The `Origin` header is parsed and cleaned (protocol and `www.` prefix stripped).
2. If the origin matches a **preview domain pattern**, Edge Config's `new-preview-namespace` is checked. Preview patterns include:
  - `*.vercel.app`
  - `*.netlify.app`
  - `*.pages.dev` / `*.trycloudflare.com`
  - `*.amplifyapp.com`
  - `*.workers.dev`
  - Any domain containing `ingress`
3. Otherwise, Edge Config's `new-allowed-origins` is checked for an exact domain match.
4. If the origin is found, the response gets `Access-Control-Allow-Origin` set to the request origin (reflecting the allowed domain).
5. If the origin is **not** found, no `Access-Control-Allow-Origin` header is set — the browser will block the response.

### Edge Config Structure

The Edge Config stores two keys:

- `**new-allowed-origins`** — production domains (exact match on cleaned hostname).
- `**new-preview-namespace`** — preview/staging domains (partial match via `includes`).

Each entry maps a domain to an object:

`**new-allowed-origins**` (exact match on cleaned hostname):

```json
{
  "example.com": {
    "clientName": "Example App",
    "apiKey": "skip-api-key-for-this-client"
  },
  "anotherdapp.xyz": {
    "clientName": "Another Dapp",
    "apiKey": "skip-api-key-for-another-dapp"
  }
}
```

`**new-preview-namespace**` (partial match — the origin is checked with `includes` against each key):

```json
{
  "mypreview": {
    "clientName": "Vercel Previews",
    "apiKey": "skip-api-key-for-previews"
  }
}
```

An origin is classified as a preview domain if it matches any of these patterns:

| Provider | Pattern |
|----------|---------|
| Vercel | `*.vercel.app` |
| Netlify | `*.netlify.app` |
| Cloudflare Pages | `*.pages.dev` |
| Cloudflare Tunnel | `*.trycloudflare.com` |
| Cloudflare Workers | `*.workers.dev` |
| AWS Amplify | `*.amplifyapp.com` |
| Ingress | Any domain containing `ingress` |

Because preview lookups use `includes`, a request from `mypreview-git-feat-xyz.vercel.app` will match the `mypreview` key.

The `apiKey` field is used by the Skip API handler to set the `authorization` header, giving each whitelisted domain its own API key for usage tracking and rate limiting.

---

## Endpoint Configuration (`src/config/endpoints.js`)

This file controls how the REST and RPC proxies resolve a `chainID` to an upstream endpoint. It exports one function and three lookup tables.

### `getWhitelabelEndpoint(chainID, type)`

Called by `createProxyHandler` in `src/utils/api.ts` before falling back to the public chain registry. It checks the following in order:

1. **Solana** — `solana` and `solana-devnet` return Helius RPC endpoints with `isApiKey: true`. The proxy handler appends `HELIUS_API_KEY` as a query parameter.
2. **Custom chain IDs** — looks up `CUSTOM_API_CHAIN_IDS` (for REST) or `CUSTOM_RPC_CHAIN_IDS` (for RPC). These are chains with hardcoded third-party endpoints that don't follow the whitelabel naming convention.
3. **Whitelabel private nodes** — if the `chainID` exists in `WHITELABEL_CHAINS`, a `cosmoslabs.kr` URL is constructed from the entry's `chainName` and `isTestnet` flag. The result is marked `isPrivate: true` so the proxy adds a `User-Agent` auth header.
4. **No match** — returns `undefined`, causing the proxy to fall through to the public endpoint lists in `src/chains/rest.json` or `src/chains/rpc.json`.

### `CUSTOM_API_CHAIN_IDS` / `CUSTOM_RPC_CHAIN_IDS`

Chains that need a specific non-whitelabel endpoint. Currently only `secret-4` pointing to Lavender Five nodes.

### `WHITELABEL_CHAINS`

A map of `chainID → { chainName: string; isTestnet?: boolean }`. Chains in this list get routed to a whitelabel private node hosted on `cosmoslabs.kr`. The URL is built as:

```
https://{lcd|rpc}-{chainName}.{mainnet|testnet}.cosmoslabs.kr
```

- `lcd` is used for REST (`type: "api"`), `rpc` for Tendermint RPC (`type: "rpc"`).
- The network segment defaults to `mainnet`; set `isTestnet: true` on the entry to use `testnet` instead.
- `chainName` is **not** always the same as the `chainID` key — it's the short slug cosmoslabs.kr uses for the chain (e.g. `cosmoshub-4` → `cosmos`, `phoenix-1` → `terra`, `pacific-1` → `sei`). Testnet entries reuse the same `chainName` as their mainnet counterpart; the `mainnet`/`testnet` domain segment (driven by `isTestnet`) is what distinguishes them, not a `-testnet` suffix on `chainName`.
- Entries whose real endpoint isn't hosted on `cosmoslabs.kr` at all (custom third-party RPC providers) don't belong in this map — they'd get a broken `cosmoslabs.kr` URL built for them. Route those through `CUSTOM_API_CHAIN_IDS`/`CUSTOM_RPC_CHAIN_IDS` instead, or leave them out entirely so they fall through to the public endpoint lists.

---

## Rewrites

Next.js rewrites in `next.config.js` route wildcard paths to the correct handler files:


| Source Pattern                   | Destination                 |
| -------------------------------- | --------------------------- |
| `/api/rest/(.*)`                 | `/api/rest/handler`         |
| `/api/rpc/(.*)`                  | `/api/rpc/handler`          |
| `/api/skip/(.*)`                 | `/api/skip/handler`         |
| `/api/widget/skip/(.*)`          | `/api/widget/skip/handler`  |
| `/.well-known/walletconnect.txt` | `/api/walletconnect/verify` |


---

## Geo-Blocking

The middleware also geo-blocks the root path (`/`) for requests from sanctioned regions: Russia (RU), Cuba (CU), Iran (IR), North Korea (KP), Syria (SY), and specific Ukrainian regions (Donetsk, Luhansk, Crimea).

---

## Environment Variables


| Variable                   | Required                                  | Used By                               |
| -------------------------- | ----------------------------------------- | ------------------------------------- |
| `NEXT_PUBLIC_API_URL`      | No (defaults to `https://api.skip.build`) | Skip API proxy                        |
| `SKIP_API_KEY`             | Yes (production)                          | Skip API fallback key                 |
| `WIDGET_SKIP_API_KEY`      | Yes (production)                          | Widget Skip API proxy                 |
| `ALLOWED_LIST_EDGE_CONFIG` | Yes (production)                          | CORS middleware + Skip API handler    |
| `WHITELABEL_KEY`           | Yes (for private nodes)                   | Cosmos REST/RPC proxy (whitelabel chains) |
| `HELIUS_API_KEY`           | Yes (for Solana)                          | Cosmos REST/RPC proxy (Solana chains) |
