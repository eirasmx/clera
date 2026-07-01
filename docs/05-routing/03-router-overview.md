# 🧭 External Router Overview

For apps that need URL-based routing (shareable links, browser back/forward, deep linking), Clera supports integration with an external router via `routerEnabled`.

---

## 💡 When you need it

Most Clera apps do not need URL routing. If your app runs in a WebView, or if users never share URLs, the built-in page system is all you need.

Use an external router when:

- You want `example.com/#settings` to open directly to the settings page
- You want the browser back button to navigate between Clera pages
- You need deep links from emails, notifications, or external sources

---

## 🧭 Enabling router integration

```js
app.start({
  routerEnabled: true,
  routerMode:    "hash" // or "history"
});
```

When `routerEnabled` is true, Clera looks for `window.AppRouter` at boot. If found, Clera calls `AppRouter.createRouter()` and delegates the initial navigation to it. The router reads the current URL and calls the provided `onNavigate` callback with the target page name.

> The runtime refers to itself as `CLERA` in console messages. In your code, use `app.*`. Both names point to the same object.

---

## 🔑 The router global

The external router must be available as `window.AppRouter` before `app.start()` runs. `AppRouter` must expose a `createRouter` method.

> ⚠️ The global is `window.AppRouter`, not `window.PWARouter` or any other name. The runtime checks for `window.AppRouter` exactly.

---

## Hash mode

With `routerMode: "hash"`, pages map to URL fragments:

```
https://myapp.com/#home
https://myapp.com/#settings
https://myapp.com/#profile
```

Navigation updates the hash. The browser back button steps through the hash history.

---

## History mode

With `routerMode: "history"`, pages map to URL paths:

```
https://myapp.com/home
https://myapp.com/settings
https://myapp.com/profile
```

History mode requires server-side configuration to serve `index.html` for all routes. Without it, a direct visit to `/settings` returns a 404.

---

## 🔌 Router interface

`AppRouter.createRouter()` receives a config object and must return a router object. Clera then calls `.start()` on the returned router to trigger the initial navigation.

```js
window.AppRouter = {
  createRouter({ mode, onNavigate }) {
    // mode: "hash" or "history"
    // onNavigate: call this when the URL changes to tell Clera which page to show

    return {
      navigate(pageName, params) {
        // Update the URL to reflect the new page
      },
      back() {
        window.history.back();
      },
      start() {
        // Read the current URL and call onNavigate with the initial page
        const page = readPageFromUrl(mode);
        onNavigate({ page, query: {} });
      }
    };
  }
};

app.start({
  routerEnabled: true,
  routerMode:    "hash"
});
```

Clera calls `onNavigate` with `{ page, query }` whenever the URL changes. The `page` field is the page name to navigate to. The `query` field is an object of additional parameters passed to the page.

---

## 🔁 Two-way sync

Clera and the router stay in sync automatically. When the user taps a button or calls `app.navigate()` from code, Clera notifies the router so the URL updates. When the URL changes (browser back, direct link), the router calls `onNavigate` so Clera updates the visible page. Neither side goes out of sync.

---

## Injecting a router after boot

A router can also be injected after `app.start()` using the `app.router` setter:

```js
app.start({ routerEnabled: false });

// Attach later
app.router = myRouterInstance;
```

The assigned value must be an object. Assigning a non-object logs `[CLERA:ROUTER_INVALID]` and the assignment is rejected.

---

## config.router shorthand

Instead of relying on `window.AppRouter`, you can pass a router object directly in the config:

```js
app.start({
  router: myRouterInstance
});
```

This stores the router immediately at boot before any navigation runs, which is useful if you build the router inline and do not want a global.

---

## Next

[06 Native Features: Bridge Overview](../06-native-features/01-bridge-overview.md)
