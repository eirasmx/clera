# 🚀 app.start(config?)

Boots the Clera runtime. Optionally accepts a configuration object.

```js
app.start({ initial: "home", dev: true });
```

---

## 💡 When to call it

`app.start()` is optional. If you do not call it, Clera boots automatically on `DOMContentLoaded` using any config accumulated via `app.config()`.

Call `start()` explicitly when you want deterministic control over boot timing.

---

## 🚀 Startup modes

**Mode 1: Auto-start (default, no call needed):**
```js
// Just write your HTML and JS. Clera boots itself.
app.config({ dev: true }); // optional config
```

**Mode 2: Explicit start:**
```js
app.start({ initial: "home", dev: true });
```

**Mode 3: Staged config then start:**
```js
app.config({ dev: true });
app.start({ initial: "home" });
```

---

## ⚙️ Configuration options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `initial` | string | none | Page to show on boot. Overrides all other initial page resolution. |
| `dev` | boolean | `false` | Enable verbose console warnings |
| `persistPage` | boolean | `false` | Restore the last visited page on reload |
| `expose` | string / object | none | Expose API methods globally (`"app"`, `"all"`, or `{ key: true }`) |
| `maxCachedPages` | number | `0` | Max mounted pages in memory. `0` means unlimited. |
| `router` | object | none | Inject a custom router object. Clera delegates navigation to `router.navigate()` when set. |
| `serviceWorker` | object | none | Service worker registration config |
| `php` | object | none | Base config for `app.php()` |
| `autoStart` | boolean | `true` | Set to `false` to suppress auto-boot on `DOMContentLoaded` |
| `forceLayoutWidth` | number | none | Override viewport width for layout detection (testing only) |

---

## 📋 Rules

- `start()` triggers boot exactly once per page lifetime
- A second call emits `[CLERA:DOUBLE_START]` and is ignored
- Calling `start()` suppresses auto-start automatically. No need to set `autoStart: false`.
- Config passed to `start()` is merged with any prior `app.config()` calls
- Once `start()` is called, `app.config()` is rejected

---

## Next

[03 config()](./03-config.md)
