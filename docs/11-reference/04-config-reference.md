# ⚙️ Config Reference

All configuration keys accepted by `app.start()` and `app.config()`.

---

## 📋 Top-level keys

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `initial` | string | none | Page name to show on boot. Takes priority over persisted page and "home" fallback. |
| `dev` | boolean | `false` | Enable verbose console warnings. Disable in production. |
| `persistPage` | boolean | `false` | Save and restore the active page across reloads via `localStorage`. |
| `expose` | string \| object | none | Expose API methods as globals. `"app"` exposes the main API. `"all"` also exposes `registerComponent` and `use`. Or pass `{ navigate: true }` to expose specific methods. Note: `"clera"` is an alias for `"app"` and exposes the same set. |
| `maxCachedPages` | number | `0` | Maximum mounted pages kept in the DOM. `0` means unlimited. When exceeded, the least recently visited non-keepAlive page is evicted. |

| `autoStart` | boolean | `true` | Set to `false` to suppress auto-start and call `app.start()` manually at a later time. |

| `routerEnabled` | boolean | `false` | Enable external router integration via `window.AppRouter`. |
| `routerMode` | string | `"hash"` | `"hash"` or `"history"`. Used when `routerEnabled` is `true`. |
| `forceLayoutWidth` | number | none | Override the viewport width used for layout detection. For testing only. |
| `accessibility` | boolean \| string \| object | `"auto"` | Platform comfort layer. Prevents iOS zoom, removes tap highlights, disables accidental text selection. `"auto"` activates only in PWA/native shell contexts. |

---

## 🌐 `php` object

Configures `app.php()`.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `php.baseUrl` | string | `""` | Prepended to relative URLs passed to `app.php()`. |
| `php.timeout` | number | `0` | Request timeout in milliseconds. `0` means no timeout. |
| `php.csrf.header` | string | `"X-CSRF-Token"` | Header name for the CSRF token. |
| `php.csrf.token` | string \| function | none | Static token string or factory function that returns the token. |

---

## ⚙️ `serviceWorker` object

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `serviceWorker.enabled` | boolean | `false` | Register the service worker at boot. |
| `serviceWorker.url` | string | `"/sw.js"` | Path to the service worker script. |
| `serviceWorker.mode` | string | `"network-first"` | Caching strategy: `"network-first"`, `"cache-first"`, or `"offline-first"`. |
| `serviceWorker.cache.pages` | boolean | `true` | Cache page HTML. |
| `serviceWorker.cache.assets` | boolean | `true` | Cache static assets. |
| `serviceWorker.autoReloadOnFirstControl` | boolean | `true` | Reload the page once the service worker takes control for the first time. |
| `serviceWorker.reloadBehindSplash` | boolean | `true` | Show the splash screen during the reload triggered by first control. |

---

## 🎯 Initial page resolution priority

When multiple sources compete, this is the order Clera uses:

| Priority | Source | Condition |
|----------|--------|-----------|
| 1 | `config.initial` | Always wins when set and the page exists |
| 2 | `localStorage["CLERA_ACTIVE_PAGE"]` | Only when `persistPage: true` and the saved page exists |
| 3 | Page named `"home"` | If registered |
| 4 | First registered page | Insertion order |

---

## ♿ `accessibility`

Runtime-level platform comfort layer. Reduces zoom, touch awkwardness, and app-feel breakage in PWA and native shell contexts.

| Input | Behaviour |
|-------|-----------|
| _(unset)_ | Same as `"auto"` |
| `"auto"` | Activates in PWA/native shell only |
| `true` or `"on"` | Accessibility stays on. Comfort layer never applies. |
| `false` or `"off"` | Accessibility turned off. Comfort layer always applies. |
| `{ mode: "auto", ios: true, android: false }` | Per-platform control |

**`"auto"` activates when:**
- `(display-mode: standalone)` media query matches (installed PWA)
- `navigator.standalone === true` (iOS homescreen)
- Clera native bridge is detected (iOS WKWebView / Android WebView shell)

Does **not** activate in ordinary browser tabs.

**iOS rules applied when active:**
- `input, textarea, select { font-size: max(16px, 1em) }` (prevents focus-zoom)
- `* { -webkit-tap-highlight-color: transparent }` (removes blue tap ring)
- `body { -webkit-user-select: none; user-select: none }` (prevents accidental text selection; inputs/textareas remain selectable)
- `body { -webkit-touch-callout: none }` (prevents long-press callout on non-interactive elements)

```js
app.start({ accessibility: "auto" });   // default, no config needed
app.start({ accessibility: true });    // accessibility stays on, comfort layer never applies
app.start({ accessibility: false });   // accessibility off, comfort layer always applies
app.start({ accessibility: { mode: "auto", ios: true, android: false } });
```

---

## 💡 Full config example

```js
app.start({
  initial:        "home",
  dev:            false,
  persistPage:    true,
  expose:         "app",
  maxCachedPages: 5,
  php: {
    baseUrl: "https://api.example.com",
    timeout: 8000,
    csrf: {
      header: "X-CSRF-Token",
      token:  () => document.querySelector('meta[name="csrf"]').content
    }
  },
  serviceWorker: {
    enabled:  true,
    url:      "/sw.js",
    mode:     "network-first",
    cache:    { pages: true, assets: true }
  }
});
```

---

## Next

[05 Error Codes](./05-error-codes.md)
