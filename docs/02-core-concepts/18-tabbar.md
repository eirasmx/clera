# 📑 Tab Bar

`<tabbar>` is a fixed navigation bar that Clera places at the bottom or top of the app. Each `<tab>` inside it navigates to a page when clicked. The active tab is marked automatically as the user navigates.

---

## 📋 Basic structure

Place `<tabbar>` as a direct child of `<app>`, at the same level as your pages.

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

Each `<tab>` must have a `page` attribute that matches the `name` of a `<page>` in the app.

---

## 🎯 Active tab

Clera automatically sets the `active` attribute on the tab that matches the current page. Use it in CSS to style the selected state.

```css
tab {
  opacity: 0.5;
}

tab[active] {
  opacity: 1;
  color: #007aff;
}
```

---

## 📍 Position

By default, `<tabbar>` is pinned to the bottom of the screen. Use `position="top"` to move it to the top.

```html
<tabbar position="top">
  <tab page="home">Home</tab>
  <tab page="feed">Feed</tab>
</tabbar>
```

Safe-area inset padding is applied automatically on both positions. On bottom, the bottom safe area is padded. On top, the top safe area is padded. You do not need to handle device notches or home indicators manually.

---

## 🎨 Styling tabbar

`<tabbar>` is a block element. Style it directly with CSS.

```css
tabbar {
  background: #ffffff;
  border-top: 1px solid #e0e0e0;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  cursor: pointer;
}
```

---

## 🔀 When to use tabbar vs nav

`<tabbar>` and `<nav>` both provide in-app navigation, but they serve different purposes.

Use `<tabbar>` when:

- You want a fixed tab strip at the top or bottom
- The navigation does not need to reposition across layouts
- You are building a tab-driven interface with a fixed set of top-level pages

Use `<nav>` when:

- You want navigation that repositions automatically at different screen sizes (for example, bottom on mobile and a left sidebar on desktop)
- You need layout-aware positioning without writing media queries

See [16 Nav](./16-nav.md) for full `<nav>` documentation.

For a side drawer that slides in from the edge independently of the main navigation, see [17 Sidebar](./17-sidebar.md).

---

## Next

[16 Nav](./16-nav.md)
