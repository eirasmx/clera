# 📄 The Page Tag

`<page>` defines a screen in your app. Each page has a name and contains its own HTML content.

```html
<page name="home">
  <h1>Home</h1>
  <p>Welcome to the app.</p>
</page>
```

---

## 🔧 How pages work

Pages are **not rendered as written**. At boot, Clera extracts every `<page>` from the DOM, stores its HTML content, and removes it. Pages are mounted on demand when navigated to.

A mounted page is a live `<page>` element in the DOM with:
- a `data-app-page` attribute set to the page name
- an `id` attribute set to the page's `id` if present, or the page name if not
- the `class` attribute copied from the original template, if present

This means your CSS targets work exactly as written:

```css
page           { padding: 20px; }        /* all pages */
#home      { background: #f0f4ff; }  /* by id */
page.dashboard { font-size: 14px; }      /* by class */
```

---

## 📋 Attributes

| Attribute | Required | Description |
|-----------|----------|-------------|
| `name` | ✅ Yes | Unique page identifier used for navigation |
| `id` | No | Used as the `id` of the mounted element. If omitted, the page name is used instead. So `#home` works without writing `id="home"`. |
| `class` | No | Copied to mounted element to enable `.class` CSS selectors |
| `keep-alive` | No | Keeps the page in memory permanently. Without it, rarely visited pages may be removed from memory to free space (see `maxCachedPages` in [09 Persist Page](./09-persist-page.md)). |
| `target` | No | Restricts this page to specific platforms. See below. |
| `oncreate` | No | Action name to call the first time this page is mounted |
| `onshow` | No | Action name to call every time this page becomes visible |
| `onhide` | No | Action name to call when this page is hidden |
| `ondestroy` | No | Action name to call when this page is removed from the DOM |

---

## 🎯 Platform-targeted pages

Use `target` to restrict a page to specific platforms. Pages that do not match the current platform are removed from the DOM at boot and never registered. They do not exist at runtime.

```html
<page name="home" target="native">...</page>      <!-- ios and android only -->
<page name="home" target="web,pwa">...</page>      <!-- browser and PWA only -->
<page name="home" target="ios">...</page>          <!-- ios only -->
<page name="home" target="ios,android">...</page>  <!-- same as native -->
```

**Meta-tokens** expand to their full platform set:

| Token | Expands to |
|-------|-----------|
| `native` | `ios`, `android` |
| `desktop` | `web`, `pwa` |

Multiple tokens are comma-separated. Absent `target` means all platforms.

`app.platform()` returns the current platform: `"ios"`, `"android"`, `"web"`, or `"pwa"`.

A common pattern is providing two versions of a page (one for native, one for web) with the same `name`:

```html
<page name="profile" target="native">
  <!-- native layout with hardware.camera support -->
</page>

<page name="profile" target="web,pwa">
  <!-- web layout with file input fallback -->
</page>
```

Only the matching page is registered. Navigation to `"profile"` always works regardless of platform.

---

## 🔒 keep-alive forms

The runtime accepts three equivalent forms of `keep-alive`:

```html
<page name="home" keep-alive>...</page>       <!-- recommended -->
<page name="home" keepalive>...</page>
<page name="home" keepAlive="true">...</page>
```

All three are treated identically. The attribute form (`keep-alive`) is recommended for consistency.

---

## 💡 Example with all attributes

```html
<page
  name="dashboard"
  id="dashboard"
  class="main-page"
  keep-alive
  oncreate="initDashboard"
  onshow="refreshDashboard"
  onhide="pauseDashboard"
>
  <h1>Dashboard</h1>
</page>
```

---

## 📋 Page names

Page names must be unique within the app. If two pages share the same name, Clera keeps the first and removes the duplicate, logging a warning.

Page names are used in:
- `<button page="pageName">`: declarative navigation
- `app.navigate("pageName")`: programmatic navigation
- `context.pageName`: reading the current page name in an action

Because the page name becomes the mounted element's `id` when no explicit `id` is set, page names are effectively reserved DOM identifiers. Never use a page name as the `id` of any other element in your app. Two elements sharing the same `id` in the DOM at the same time is invalid HTML and will cause unpredictable behaviour in CSS and JavaScript.

---

## ⚠️ Duplicate page warning

```
[CLERA:PAGE_DUP] Duplicate <page name="home">. First wins; removing duplicate.
```

---

## Next

[03 Navigation](./03-navigation.md)
