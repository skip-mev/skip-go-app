# Domain Whitelisting Guide

How to decide whether a domain goes into `new-allowed-origins` or `new-preview-namespace` in Vercel Edge Config.

---

## Decision Flowchart

```
Incoming domain
  │
  ├─ Is it a preview/staging URL on a known platform?
  │   (vercel.app, pages.dev, trycloudflare.com,
  │    netlify.app, workers.dev, amplifyapp.com)
  │   │
  │   YES → add to new-preview-namespace
  │   NO  → add to new-allowed-origins
```

---

## `new-preview-namespace`

Use this for **preview / staging deployments** hosted on platforms that generate dynamic subdomains. The lookup uses `includes`, so a single namespace key matches every preview URL that contains that string.

### When to use

The URL belongs to one of these platforms:

| Platform             | URL pattern              |
| -------------------- | ------------------------ |
| Vercel               | `*.vercel.app`           |
| Cloudflare Pages     | `*.pages.dev`            |
| Cloudflare Tunnel    | `*.trycloudflare.com`    |
| Cloudflare Workers   | `*.workers.dev`          |
| Netlify              | `*.netlify.app`          |
| AWS Amplify          | `*.amplifyapp.com`       |

### How to choose the namespace key

Ask the requester for their project namespace. If they don't know, pick the **most stable, recognizable segment** that appears across all their preview URLs.

**Example**

URL provided:

```
https://widget-nextjs-git-ds-updateeurekadocs-skip-protocol.vercel.app/
```

The dynamic parts (`git-ds-updateeurekadocs-skip-protocol`) change with every branch and commit. The stable prefix is `widget-nextjs`. Add `widget-nextjs` as the key:

```json
{
  "widget-nextjs": {
    "clientName": "Widget Nextjs Previews",
    "apiKey": "<their-skip-api-key>"
  }
}
```

This single entry whitelists every Vercel preview whose hostname contains `widget-nextjs`, such as:

- `widget-nextjs-abc123.vercel.app`
- `widget-nextjs-git-feat-new-ui-skip-protocol.vercel.app`

---

## `new-allowed-origins`

Use this for **production domains and custom subdomains** — any URL that is not on one of the preview platforms listed above.

### When to use

The requester provides a stable, fully owned hostname (e.g. `studio.skip.build`, `app.example.com`, `example.xyz`).

### How to choose the key

Use the **exact hostname** (no protocol, no path, no `www.` prefix).

**Example**

URL provided:

```
https://studio.skip.build/widget
```

Strip the protocol and path. The key is `studio.skip.build`:

```json
{
  "studio.skip.build": {
    "clientName": "Studio",
    "apiKey": "<their-skip-api-key>"
  }
}
```

---

## Quick Reference

| Scenario | Config key | Example URL | Entry key |
| --- | --- | --- | --- |
| Vercel preview | `new-preview-namespace` | `my-app-git-feat-xyz.vercel.app` | `my-app` |
| Cloudflare Pages preview | `new-preview-namespace` | `my-app-abc.pages.dev` | `my-app` |
| Netlify preview | `new-preview-namespace` | `my-app--branch.netlify.app` | `my-app` |
| Production domain | `new-allowed-origins` | `https://app.example.com/swap` | `app.example.com` |
| Custom subdomain | `new-allowed-origins` | `https://dex.mydao.xyz` | `dex.mydao.xyz` |
