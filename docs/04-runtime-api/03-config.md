# ⚙️ app.config(config)

Declares configuration for the runtime without triggering boot.

```js
app.config({ initial: "home", dev: true });
```

---

## 💡 When to use it

Use `config()` when you want to set configuration but let auto-start handle the boot timing, or when configuration must be split across multiple calls or files.

```js
// In one file:
app.config({ dev: true });

// In another file:
app.config({ initial: "dashboard", persistPage: true });

// Clera merges both before booting
```

---

## 🚀 Staged config with explicit start

```js
app.config({ dev: true });

// later, after an async check:
checkAuth().then(() => {
  app.start({ initial: "dashboard" });
});
```

---

## 🚀 Disabling auto-start

If you need to delay boot beyond `DOMContentLoaded`:

```js
app.config({ autoStart: false });

// auto-start is now suppressed. Call start() manually when ready.
setTimeout(() => {
  app.start({ initial: "home" });
}, 2000);
```

---

## 📋 Rules

- `config()` never triggers boot
- Multiple calls are merged via shallow `Object.assign`. Later calls overwrite earlier keys.
- Must be called before `start()`. Once `start()` is called, config is locked and further `config()` calls log `[CLERA:CONFIG_AFTER_START]` and return `false`
- Accepts the same keys as `start()`

---

## 📤 Return value

`true` if the config was accepted. `false` if it was rejected (called after start, or passed a non-object).

---

## Next

[04 Accessibility](./04-accessibility.md)
