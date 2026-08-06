# 📐 Layout Patterns

Common layout patterns for Clera apps, using standard CSS. All patterns build on the flex column model Clera uses internally: `<app>` is a vertical flex container, and each mounted `<page>` fills the available space.

---

## 📐 Full page layout

The default. Each page fills the mount zone completely and scrolls vertically.

```css
page {
  padding: 20px;
}
```

Clera already sets `overflow: auto`, `flex: 1`, and `box-sizing: border-box` on mounted pages via the baseline CSS. You only need to add your own padding and styles.

---

## Page with fixed header

A page split into a header that stays in place and a scrollable content area below it.

```css
#feed {
  display: flex;
  flex-direction: column;
}

#feed .feed-header {
  flex-shrink: 0;
  height: 56px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
}

#feed .feed-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}
```

```html
<page name="feed" id="feed">
  <div class="feed-header">
    <h1>Feed</h1>
  </div>
  <div class="feed-content">
    <ul id="feedList"></ul>
  </div>
</page>
```

---

## Page with fixed header and footer

A page with a pinned header at the top, a pinned footer at the bottom, and a scrollable body in between.

```css
#compose {
  display: flex;
  flex-direction: column;
}

#compose .compose-header  { flex-shrink: 0; height: 56px; padding: 0 16px; display: flex; align-items: center; }
#compose .compose-body    { flex: 1; overflow-y: auto; padding: 16px; }
#compose .compose-footer  { flex-shrink: 0; padding: 12px 16px; border-top: 1px solid #e0e0e0; }
```

```html
<page name="compose" id="compose">
  <div class="compose-header"><h1>New Message</h1></div>
  <div class="compose-body"><textarea id="messageBody"></textarea></div>
  <div class="compose-footer"><button action="sendMessage">Send</button></div>
</page>
```

---

## 📐 Sidebar layout (desktop)

A two-column layout with a fixed sidebar on the left and a scrollable main area on the right. The sidebar hides automatically on mobile using the `layout` attribute Clera sets on `<app>`.

```css
#dashboard {
  display: flex;
  overflow: hidden;
}

#dashboard .dashboard-sidebar {
  width: 240px;
  flex-shrink: 0;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
}

#dashboard .dashboard-main {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* Hide sidebar on mobile */
app[layout="mobile"] #dashboard .dashboard-sidebar {
  display: none;
}
```

```html
<page name="dashboard" id="dashboard">
  <div class="dashboard-sidebar"><nav id="sidebarNav"></nav></div>
  <div class="dashboard-main"><div id="dashboardContent"></div></div>
</page>
```

---

## 📐 Tab bar layout

An app with a bottom navigation bar. The tab bar stays pinned at the bottom while the active page fills the space above it. Clera handles this layout automatically when you include a `<tabbar>` inside `<app>`.

```css
tabbar {
  display: flex;
  height: 56px;
  border-top: 1px solid #e0e0e0;
  background: #fff;
}

tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  color: #999;
}

tab[active] {
  color: #007aff;
}
```

---

## Card grid

A responsive grid of cards that adjusts the number of columns to fit the available width.

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
  padding: 16px;
}

.card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

---

## Next

[04 Responsive Behavior](./04-responsive-behavior.md)
