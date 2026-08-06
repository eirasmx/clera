# 🧭 Nav

`<nav>` is a responsive navigation bar that Clera positions automatically based on the current layout. You declare where it should appear at each breakpoint using HTML attributes. Clera handles the rest.

---

## 📋 Basic structure

Place `<nav>` as a direct child of `<app>`, at the same level as your pages.

```html
<app>
  <nav default="bottom" desktop="left">
    <tab page="home">Home</tab>
    <tab page="search">Search</tab>
    <tab page="profile">Profile</tab>
  </nav>

  <page name="home">...</page>
  <page name="search">...</page>
  <page name="profile">...</page>
</app>
```

`<nav>` must be a direct child of `<app>`. Nested navs are not supported.

---

## 📍 Position attributes

Control where `<nav>` appears by setting layout-named attributes on it. Each attribute accepts a position value. Clera reads the attribute that matches the current layout tier.

| Attribute | When it applies |
|-----------|----------------|
| `mobile` | Viewport 0 to 599px |
| `tablet` | Viewport 600px to 1023px |
| `desktop` | Viewport 1024px and above |
| `default` | Fallback when no layout-specific attribute is present |

Position values:

| Value | Result |
|-------|--------|
| `"top"` | Pinned to the top of the app |
| `"bottom"` | Pinned to the bottom of the app |
| `"left"` | Fixed to the left edge, full height |
| `"right"` | Fixed to the right edge, full height |
| `"none"` | Hidden at this layout |

```html
<!-- Bottom on mobile and tablet, left sidebar on desktop -->
<nav default="bottom" desktop="left">
  ...
</nav>

<!-- Hidden on mobile, top bar on tablet and desktop -->
<nav mobile="none" default="top">
  ...
</nav>

<!-- Always on the left -->
<nav default="left">
  ...
</nav>
```

`default` is evaluated when no attribute matches the current layout. If no position is resolved at all, Clera leaves the `<nav>` completely alone and applies no positioning or click binding.

---

## 🔗 Navigation items

Use `<tab>` elements inside `<nav>`. Any `<tab>` with a `page` attribute navigates to that page when clicked.

```html
<nav default="bottom" desktop="left">
  <tab page="home">
    <span>Home</span>
  </tab>
  <tab page="library">
    <span>Library</span>
  </tab>
  <tab page="settings">
    <span>Settings</span>
  </tab>
</nav>
```

Tabs with an `action` attribute fire an action instead of navigating:

```html
<tab action="openSearch">Search</tab>
```

---

## 🎨 Styling nav

Clera sets a `position` attribute on `<nav>` to reflect the resolved position at the current layout. Use it in CSS to style nav elements based on where the nav is placed.

```css
/* Style the nav when it is at the bottom */
nav[position="bottom"] {
  background: #fff;
  border-top: 1px solid #e0e0e0;
  height: 64px;
}

/* Style the nav when it is on the left */
nav[position="left"] {
  background: #1a1a2e;
  width: 220px;
}

/* Tabs inside a left nav */
nav[position="left"] tab {
  padding: 12px 20px;
  color: #fff;
}
```

Clera also sets a `--item-direction` CSS variable on `<nav>`:

- `column` when the nav is at top or bottom (icon above label)
- `row` when the nav is on the left or right (icon beside label)

Use it to orient tab content automatically:

```css
nav[position] tab {
  flex-direction: var(--item-direction, column);
}
```

---

## ↕️ Collapsed state

Navs at left or right positions support a collapsed state. When collapsed, the nav is visually narrowed. You control what "collapsed" looks like in CSS using the `[collapsed]` attribute Clera sets.

```css
nav[position="left"] {
  width: 220px;
  transition: width 0.2s ease;
}

nav[position="left"][collapsed] {
  width: 64px;
  overflow: hidden;
}

nav[position="left"][collapsed] .nav-label {
  display: none;
}
```

Toggle the collapsed state from JavaScript using the nav API:

```js
app.expand("nav");    // removes [collapsed]
app.collapse("nav");  // adds [collapsed]
app.toggle("nav");    // flips between the two
```

The selector passed to `expand`, `collapse`, and `toggle` is a standard CSS selector applied within `<app>`. Pass any selector that uniquely identifies your nav.

```js
// If you have multiple navs, target by id
app.collapse("#mainNav");
app.toggle(".sidebar-nav");
```

---

## 🔁 Multiple navs

You can have more than one `<nav>` inside `<app>`. Each one resolves its position independently. If two navs would resolve to the same position at the same time, Clera logs a `NAV_POSITION_CONFLICT` warning in dev mode and leaves the conflicting nav in place unchanged.

```html
<!-- Primary nav: bottom on mobile, left on desktop -->
<nav id="mainNav" default="bottom" desktop="left">
  <tab page="home">Home</tab>
  <tab page="explore">Explore</tab>
</nav>

<!-- Secondary nav: only visible on desktop, at the top -->
<nav id="topBar" mobile="none" tablet="none" desktop="top">
  <tab action="openSearch">Search</tab>
  <tab action="openAccount">Account</tab>
</nav>

<page name="home">...</page>
<page name="explore">...</page>
```

---

## Next

[17 Sidebar](./17-sidebar.md)
