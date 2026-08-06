# 🧭 Built-in Routing

Clera has built-in page routing that works without any configuration. You declare page names in HTML and navigate between them. Clera handles the rest.

---

## 🔧 How it works

Pages are identified by name. Navigation happens by name. There is no URL involved by default.

```html
<!-- Declare pages -->
<page name="home">...</page>
<page name="settings">...</page>
<page name="profile">...</page>

<!-- Navigate by name via an attribute -->
<button page="settings">Settings</button>
```

```js
// Navigate programmatically
app.navigate("profile", { userId: 42 });
```

That is the entire routing system for most apps.

---

## 🎯 Initial page resolution

On boot, Clera resolves the first page to show in this priority order:

| Priority | Source |
|----------|--------|
| 1 | `config.initial` (explicit developer setting) |
| 2 | Persisted page (if `persistPage: true` and a page was saved) |
| 3 | A page named `"home"` (conventional default) |
| 4 | First `<page>` defined in the HTML |

A zero-config app with a `<page name="home">` just works. No configuration needed.

---

## 🗂️ Navigation stack

Every navigation is pushed onto an internal stack. The stack is in-memory and resets on reload unless `persistPage` is enabled.

```js
// Read the full navigation history at any time
app.navigationStack; // [{ pageName: "home", params: {} }, { pageName: "settings", params: {} }]
```

Use `context.back()` inside an action to go back one step. If a router is active, `context.back()` delegates to the router. Otherwise it calls `window.history.back()`.

---

## 💾 Page caching

By default, all visited pages stay mounted in the DOM (hidden). Navigating back to a page is instant: no remounting and no re-render.

Limit memory usage with `maxCachedPages`:

```js
app.start({ maxCachedPages: 4 });
```

When the limit is reached, the least recently visited page is evicted. Its `onDestroy` hook fires and its DOM element is removed. Pages marked `keep-alive` are never evicted.

```html
<page name="home" keep-alive>...</page>
```

The `keep-alive` attribute is also accepted as `keepalive` (lowercase) or as `keepAlive="true"`.

---

## 🚫 No URL routing by default

Clera does not read or write the browser URL by default. This keeps the model simple and works correctly in WebView environments where URL routing is irrelevant.

For apps that need URL-based routing (shareable links, browser back/forward), see the next section.

---

## ⚠️ Warning: PAGE_NOT_FOUND

If `app.navigate()` is called with a page name that is not registered, the runtime logs a warning:

```
[CLERA:PAGE_NOT_FOUND] Navigation target "about" is not registered.
```

The navigation is cancelled. No error is thrown.

---

## Next

[02 Persisted Page Routing](./02-persisted-page-routing.md)
