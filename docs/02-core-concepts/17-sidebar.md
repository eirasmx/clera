# 📂 Sidebar

`<sidebar>` is a fixed panel that overlays the left or right edge of the app. It is independent of `<nav>` and does not reposition based on layout. Use it for drawers, menus, and secondary panels that slide in from the side.

---

## 📋 Basic structure

Place `<sidebar>` as a direct child of `<app>`, at the same level as your pages.

```html
<app>
  <sidebar id="mainSidebar">
    <tab page="home">Home</tab>
    <tab page="settings">Settings</tab>
    <tab action="logout">Log out</tab>
  </sidebar>

  <page name="home">...</page>
  <page name="settings">...</page>
</app>
```

`<sidebar>` must be a direct child of `<app>`. It does not reposition at different layouts. Position it once using the `position` attribute.

---

## 📍 Position

| Attribute | Value | Result |
|-----------|-------|--------|
| `position` | `"left"` or absent | Fixed to the left edge |
| `position` | `"right"` | Fixed to the right edge |

```html
<!-- Left sidebar (default) -->
<sidebar>...</sidebar>

<!-- Right sidebar -->
<sidebar position="right">...</sidebar>
```

---

## 🔗 Navigation items

Use `<tab>` elements inside `<sidebar>`. Tabs with a `page` attribute navigate to that page when clicked. Tabs with an `action` attribute fire an action.

```html
<sidebar id="appDrawer">
  <tab page="home">Home</tab>
  <tab page="profile">My Profile</tab>
  <tab page="settings">Settings</tab>
  <tab action="openHelp">Help</tab>
</sidebar>
```

---

## 🎨 Styling sidebar

`<sidebar>` is positioned fixed by default, spanning the full height of the screen. Set a width and background to make it visible.

```css
sidebar {
  width: 280px;
  background: #fff;
  border-right: 1px solid #e0e0e0;
  padding: 20px 0;
}

sidebar tab {
  padding: 12px 20px;
  font-size: 16px;
  cursor: pointer;
}

sidebar tab:hover {
  background: #f5f5f5;
}
```

For a right-positioned sidebar:

```css
sidebar[position="right"] {
  border-right: none;
  border-left: 1px solid #e0e0e0;
}
```

---

## ↕️ Collapsed state

Like `<nav>`, `<sidebar>` supports a collapsed state. Use `[collapsed]` in CSS to control the collapsed appearance.

```css
sidebar {
  width: 280px;
  transition: width 0.2s ease;
}

sidebar[collapsed] {
  width: 0;
  overflow: hidden;
}
```

Toggle the collapsed state using the same API methods used for nav:

```js
app.expand("#appDrawer");    // removes [collapsed]
app.collapse("#appDrawer");  // adds [collapsed]
app.toggle("#appDrawer");    // flips between the two
```

A common pattern is to start the sidebar collapsed and open it on a button press:

```html
<page name="home" id="home">
  <button action="openSidebar">Menu</button>
  ...
</page>
```

```js
function openSidebar() {
  app.expand("#appDrawer");
}
```

---

## 🔁 Using sidebar with layout

`<sidebar>` does not reposition automatically. Use `app[media~="..."]` or `app[layout="..."]` in CSS to control its visibility or size at different breakpoints.

```css
/* Hidden on mobile, visible on tablet and up */
app[layout="mobile"] sidebar {
  display: none;
}

/* On desktop, always show it expanded */
app[layout="desktop"] sidebar {
  width: 260px;
}
```

---

## Next

[01 Styling in Clera](../03-styling/01-styling-in-clera.md)
