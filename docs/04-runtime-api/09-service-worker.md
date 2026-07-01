# ⚙️ app.sw: Service Worker

Helpers for registering and configuring a service worker.

### Register a service worker

```js
app.start({
  serviceWorker: {
    enabled: true,
    url:     "/sw.js",
    mode:    "network-first", // or "cache-first" / "offline-first"
    cache: {
      pages:  true,
      assets: true
    }
  }
});
```

### Manual control

```js
// Register
await app.sw.register({ url: "/sw.js" });

// Configure caching strategy
app.sw.setup({ mode: "cache-first", cache: { pages: true, assets: false } });

// Read current config
const config = app.sw.getConfig();

// Push config to active service worker
await app.sw.flush();
```

---

## Next

[10 php()](./10-php.md)
