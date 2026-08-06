# 🔌 Plugins

Plugins extend the Clera runtime with lifecycle hooks that fire at specific points in the app and page lifecycle.

`app` is a global. You do not need it passed into hooks. Use it directly.

```js
app.use({
  id: "analytics",
  install() { },
  onReady() { },
  onPageMount(pageName, pageElement) { },
  onPageShow(pageName, pageElement) { },
  onPageHide(pageName, pageElement) { },
  onPageDestroy(pageName, pageElement) { },
  onRender(containerElement, pageName) { },
});
```

---

## 📋 Plugin shape

| Hook | When it fires | Arguments |
|------|--------------|-----------| 
| `install()` | Immediately when `app.use()` is called | none |
| `onReady()` | After boot completes, before the initial page mounts | none |
| `onPageMount(name, el)` | First time a page is mounted into the DOM | page name, `<page>` element |
| `onPageShow(name, el)` | Every time a page becomes visible | page name, `<page>` element |
| `onPageHide(name, el)` | When a page is hidden | page name, `<page>` element |
| `onPageDestroy(name, el)` | When a page is evicted from memory | page name, `<page>` element |
| `onRender(containerEl, name)` | After every `context.render()` or `context.append()` | the container element, page name |

All hooks are optional. Include only the ones you need. A plugin with no hooks is valid and will be registered without error.

The `id` field is optional but recommended. It appears in error messages when a hook throws, making debugging easier.

---

## 📋 Rules

- `app.use()` can be called before or after boot. Pre-boot calls are queued and replayed after boot completes.
- If a hook throws, Clera logs the error to diagnostics (`PLUGIN_READY_THROW`, `PLUGIN_HOOK_THROW`, `PLUGIN_RENDER_THROW`) and continues. A failing plugin does not crash the app.
- `onRender` fires after both `context.render()` and `context.append()`. It does not fire for `context.clear()`.

---

## 🔧 Minimal plugin

The smallest valid plugin is an object with an `id`:

```js
const myPlugin = {
  id: "my-plugin",
};

app.use(myPlugin);
```

No hooks required. The plugin registers and does nothing until you add hooks.

---

## 🔧 Full plugin shape

```js
app.use({
  id: "my-plugin",   // optional but recommended

  install() {
    // Runs immediately when app.use() is called.
    // Use for one-time setup: initialising third-party SDKs, setting defaults.
  },

  onReady() {
    // Runs after boot completes, before the first page mounts.
    // Use for anything that needs the runtime to be fully initialised.
  },

  onPageMount(pageName, pageElement) {
    // Runs the first time a page is mounted into the DOM.
    // pageElement is the live <page> element.
  },

  onPageShow(pageName, pageElement) {
    // Runs every time a page becomes visible, including the first time.
  },

  onPageHide(pageName, pageElement) {
    // Runs when a page is hidden by navigating away.
  },

  onPageDestroy(pageName, pageElement) {
    // Runs when a page is evicted from memory by the LRU cache.
  },

  onRender(containerElement, pageName) {
    // Runs after every context.render() or context.append() call.
    // containerElement is the element that was just rendered into.
    // Does not fire for context.clear().
  },
});
```

---

## 💡 Example: analytics plugin

```html
<!-- index.html -->
<script src="clera.js"></script>
<script src="plugins/analytics.js"></script>
<script src="script.js"></script>
```

```js
// plugins/analytics.js

const analyticsPlugin = {
  id: "analytics",

  install() {
    console.log("Analytics plugin installed");
  },

  onReady() {
    analytics.track("app_ready", { platform: app.platform() });
  },

  onPageShow(pageName) {
    analytics.track("page_view", { page: pageName });
  },
};
```

```js
// script.js

app.use(analyticsPlugin);
app.start({ initial: "home" });
```

---

## 💡 Example: auth guard plugin

Redirect unauthenticated users away from protected pages by marking them in HTML and checking in `onPageShow`.

```html
<!-- index.html -->
<page name="dashboard" requires-auth>
  ...
</page>

<page name="login">
  ...
</page>
```

```js
// plugins/auth-guard.js

const authGuardPlugin = {
  id: "auth-guard",

  onPageShow(pageName, pageElement) {
    const isProtected = pageElement.hasAttribute("requires-auth");
    const isLoggedIn = !!app.memory.session?.token;

    if (isProtected && !isLoggedIn) {
      app.navigate("login");
    }
  },
};
```

```js
// script.js

app.use(authGuardPlugin);
app.start({ initial: "home" });
```

---

## 💡 Example: dev tools plugin

```js
app.use({
  id: "dev-tools",

  onPageMount(pageName, pageElement) {
    console.log(`[dev] mounted: ${pageName}`);
  },

  onRender(containerEl, pageName) {
    console.log(`[dev] render in ${pageName}:`, containerEl);
  },
});
```

---

## 📋 Timing

`app.use()` can be called before or after `app.start()`.

- **Before `app.start()`:** the plugin is queued and installed after boot. All hooks fire at their normal lifecycle points.
- **After `app.start()`:** `install` and `onReady` run immediately since boot has already completed. Page hooks fire normally from that point forward.

Loading your plugin script before `script.js` and calling `app.use()` at the top level is the standard pattern. It guarantees the plugin is registered before `app.start()` is called.

---

## Next

[13 Components](./13-components.md)
