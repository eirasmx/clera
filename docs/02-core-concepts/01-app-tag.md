# 🏗️ The App Tag

`<app>` is the root of every Clera application.

```html
<app>
  <page name="home">...</page>
  <page name="settings">...</page>
</app>
```

Clera finds this element at boot. Everything inside it is managed by the runtime.

---

## 📋 Rules

- There must be exactly one `<app>` element per document. If Clera cannot find it at boot the app does not start.
- All `<page>` elements must be direct or nested children of `<app>`
- `<app>` fills the full viewport by default (`height: 100vh; width: 100%`)

---

## 📐 Layout attribute

Clera automatically sets a `layout` attribute on `<app>` based on the current viewport width:

| Viewport width | Value |
|---------------|-------|
| ≤ 599px | `mobile` |
| 600px – 1023px | `tablet` |
| ≥ 1024px | `desktop` |

This lets you write responsive CSS without media queries:

```css
app[layout="mobile"] .sidebar {
  display: none;
}

app[layout="desktop"] .sidebar {
  display: block;
}
```

The attribute updates automatically on resize.

---

## 📑 Tab bar

A `<tabbar>` can be placed inside `<app>` for bottom navigation:

```html
<app>
  <tabbar>
    <tab page="home">Home</tab>
    <tab page="feed">Feed</tab>
    <tab page="settings">Settings</tab>
  </tabbar>

  <page name="home">...</page>
  <page name="feed">...</page>
  <page name="settings">...</page>
</app>
```

The active tab is automatically marked with `active` as the user navigates.

See [18 Tab Bar](./18-tabbar.md) for full tabbar documentation.

For navigation that repositions automatically across screen sizes, see [16 Nav](./16-nav.md).

For a side drawer that slides in from the edge, see [17 Sidebar](./17-sidebar.md).

---

## 📐 Layout change event

When the layout changes on resize, Clera fires an `app:layoutchange` event on `window`:

```js
window.addEventListener("app:layoutchange", (e) => {
  console.log(e.detail.layout); // "mobile" | "tablet" | "desktop"
  console.log(e.detail.width);  // viewport width in px
});
```

This is the underlying event that `app.onLayoutChange()` wraps. Use the raw event for vanilla JS listeners outside Clera-managed handlers. Use `app.onLayoutChange()` when working inside the Clera API.

---

## 📦 Importing blocks

`<import>` elements placed inside `<app>` load reusable block definitions at boot. The runtime processes them as direct children of `<app>` before any page mounts.

```html
<app>
  <import src="./components/card.html"></import>
  <import src="./components/modal.html"></import>

  <page name="home">
    <use template="card"></use>
  </page>
</app>
```

See [12 Reusable Blocks](./12-reusable-blocks.md) for full `<import>` and `<use>` documentation.

---

## ✨ Splash screen

A `<splash>` element inside `<app>` is shown during boot and hidden once the first page mounts:

```html
<app>
  <splash>
    <img src="logo.png">
  </splash>

  <page name="home">...</page>
</app>
```

---

## Next

[02 The Page Tag](./02-page-tag.md)
