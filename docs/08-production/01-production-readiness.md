# 🚀 Production Readiness

A checklist for taking a Clera app from development to production.

---

## 🚀 Before you ship

### Turn off dev mode

Dev mode logs verbose warnings to the console. Disable it in production:

```js
app.start({ dev: false }); // or just omit it. false is the default
```

### 🎯 Set the correct runtime path

Make sure `clera.js` is referenced with the correct path for your production file structure:

```html
<script src="/assets/clera.js"></script>
```

### Verify all action names match

With dev mode off, missing actions fail silently. Run through your app once with `dev: true` before deploying to catch any `ACTION_NOT_FOUND` warnings.

### Test on target devices

If deploying to iOS or Android WebView, test on device and not just in a desktop browser. Font rendering, touch targets, scroll behaviour, and hardware API support all differ.

---

## ⚡ Performance

### 💾 Page caching

By default Clera keeps all visited pages mounted in the DOM. This is fast but uses memory. For apps with many pages, set a cache limit:

```js
app.start({ maxCachedPages: 5 });
```

Mark pages that must never be evicted:

```html
<page name="home" keep-alive>...</page>
```

### Avoid heavy oncreate work

`oncreate` fires on first mount, before the page is visible. Avoid synchronous heavy work here. Use `onshow` for work that can wait until the page is displayed, or defer with `setTimeout`.

### Keep render() calls lean

`context.render()` replaces `innerHTML`. The browser re-parses and re-renders the content. For large lists, only re-render what changed. For appending single items, use `context.append()` instead.

---

## 📦 Asset bundling

Clera itself requires no bundler or build step. Your JavaScript and CSS files are referenced directly from `index.html`. For native builds, use Clera Studio or Clera Packager.

---

## 📡 Offline support

Use the built-in service worker helper for offline support:

```js
app.start({
  serviceWorker: {
    enabled: true,
    url:     "/sw.js",
    mode:    "cache-first",
    cache:   { pages: true, assets: true }
  }
});
```

See the service worker docs for full setup.

---

## Next

[02 Performance Guidelines](./02-performance-guidelines.md)
