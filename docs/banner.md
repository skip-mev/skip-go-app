# Banner

A dismissible notification card used to surface time-sensitive announcements (e.g. promotions, incidents, new features). Its content is entirely driven by environment variables, so no code changes are needed to update or toggle it.

**File:** `src/components/Banner.tsx`

---

## Environment Variables


| Variable                     | Required | Description                             |
| ---------------------------- | -------- | --------------------------------------- |
| `NEXT_PUBLIC_SHOW_BANNER`    | Yes      | Set to `"true"` to display the banner   |
| `NEXT_PUBLIC_BANNER_TITLE`   | Yes      | Bold heading text                       |
| `NEXT_PUBLIC_BANNER_MESSAGE` | Yes      | Body / description text                 |
| `NEXT_PUBLIC_BANNER_LINK`    | No       | URL the banner links to when clicked    |


All three required variables must be set for the banner to render. `NEXT_PUBLIC_BANNER_LINK` is used as the `href` on the banner's anchor element — if omitted, the banner still appears but won't navigate anywhere.

---

## Rendering

The banner renders as a styled card with a bold title, a close icon, and a body message. It supports `"dark"` and `"light"` themes passed via the `theme` prop, which controls background and text colors.

On viewports **≥ 900 px** (desktop), the component uses `ReactDOM.createPortal` to render into a dedicated `#banner-root` element appended to `document.body`. On narrower viewports it renders inline.

---

## Dismiss Behaviour

When a user clicks the close icon:

1. The component sets its local `hideBanner` state to `true`, immediately hiding the banner.
2. The current `NEXT_PUBLIC_BANNER_TITLE` value is saved to `localStorage` under the key `hideBanner`.

On subsequent visits the component reads `localStorage("hideBanner")` and compares it to the current `NEXT_PUBLIC_BANNER_TITLE`:

- **Titles match** → banner stays hidden.
- **Titles differ** → banner reappears.

Changing `NEXT_PUBLIC_BANNER_TITLE` to a new value therefore resets the dismiss state for all users, causing the updated banner to show again without clearing any storage.

---

## Quick-Start: Publishing a New Banner

1. Set the environment variables in your deployment platform (e.g. Vercel):

```
NEXT_PUBLIC_SHOW_BANNER=true
NEXT_PUBLIC_BANNER_TITLE=🎉 New Feature Available
NEXT_PUBLIC_BANNER_MESSAGE=Check out our latest integration with Cosmos Hub.
NEXT_PUBLIC_BANNER_LINK=https://example.com/blog/new-feature
```

2. Deploy. The banner will appear for all users.
3. To take it down, set `NEXT_PUBLIC_SHOW_BANNER` to any value other than `"true"` (or remove it) and redeploy.
4. To show a different banner later, change `NEXT_PUBLIC_BANNER_TITLE` to a new value — this automatically un-dismisses the banner for users who closed the previous one.
