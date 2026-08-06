# 📱 Responsive Behavior

Clera automatically tracks the viewport width and sets attributes on `<app>` that you can use to write responsive CSS without media queries.

---

## Breakpoints

| Viewport width | `layout` value |
|----------------|----------------|
| 0 to 599px | `mobile` |
| 600px to 1023px | `tablet` |
| 1024px and above | `desktop` |

Both attributes described below are set on boot and updated whenever the window is resized past a breakpoint boundary.

---

## 🎯 Two attributes, two use cases

Clera sets two attributes on `<app>` at all times:

| Attribute | Value at mobile | Value at tablet | Value at desktop |
|-----------|----------------|-----------------|------------------|
| `layout` | `"mobile"` | `"tablet"` | `"desktop"` |
| `media` | `"mobile"` | `"mobile tablet"` | `"mobile tablet desktop"` |

**Use `layout` when you want a style to apply at exactly one tier.** The value is always a single word.

**Use `media` when you want a style to cascade upward the way `min-width` media queries do.** The value is a space-separated list of every tier at or below the current viewport.

---

## 📐 `layout`: exact tier targeting

`app[layout="..."]` matches only when the viewport is at that exact tier. Use it when a style belongs to one breakpoint and nothing else.

```css
/* Applies only on mobile */
app[layout="mobile"] nav {
  display: none;
}

/* Applies only on tablet */
app[layout="tablet"] .sidebar {
  width: 180px;
}

/* Applies only on desktop */
app[layout="desktop"] .sidebar {
  width: 260px;
}
```

---

## 📐 `media`: cascading tier targeting

`app[media~="..."]` uses the CSS token selector (`~=`), which matches when the attribute value contains that word in a space-separated list.

Because `media` is `"mobile tablet desktop"` at desktop and `"mobile tablet"` at tablet, a rule targeting `"tablet"` will fire at both tablet and desktop. This matches the mental model of `min-width` media queries.

```css
/* Applies at tablet and above (not on mobile) */
app[media~="tablet"] .sidebar {
  display: block;
}

/* Applies on all screen sizes */
app[media~="mobile"] body {
  font-size: 16px;
}

/* Applies only on desktop */
app[media~="desktop"] .sidebar {
  width: 260px;
}
```

The cascade works like this:

| Rule | Mobile | Tablet | Desktop |
|------|--------|--------|---------|
| `app[media~="mobile"]` | Fires | Fires | Fires |
| `app[media~="tablet"]` | No | Fires | Fires |
| `app[media~="desktop"]` | No | No | Fires |

If you set a tablet style and no mobile override, mobile gets the browser default for that property. The same behavior as leaving out a `min-width` breakpoint in standard CSS.

---

## 📐 Mixing both attributes

You can use both in the same stylesheet. They are independent and both always reflect the current layout.

```css
/* Sidebar visible at tablet and up */
app[media~="tablet"] .sidebar {
  display: flex;
  width: 200px;
}

/* On desktop specifically, make it wider */
app[layout="desktop"] .sidebar {
  width: 280px;
}

/* On mobile, hide it entirely */
app[layout="mobile"] .sidebar {
  display: none;
}
```

---

## 📐 Reading layout in JavaScript

Call `app.layout()` to get the current exact tier as a string.

```js
function onShow(context) {
  const currentLayout = app.layout(); // "mobile" | "tablet" | "desktop"

  if (currentLayout === "mobile") {
    context.render("#sidebar", "");
  }
}
```

---

## 📐 Reacting to layout changes

Use `app.onLayoutChange()` to run a function whenever the layout changes. The callback receives a `CustomEvent` with the new layout and viewport width in `event.detail`.

```js
app.onLayoutChange((event) => {
  const { layout, width } = event.detail;
  console.log("Layout changed to:", layout, "at", width, "px");
});
```

The callback fires on every breakpoint crossing, including at boot if you register it before `app.start()`.

---

## Combining with standard media queries

`layout` and `media` attribute selectors work alongside standard `@media` rules. They are independent. Use whichever fits the situation. The attributes are convenient when you want the same breakpoint state accessible in both CSS and JavaScript without duplicating the threshold values.

---

## Next

[05 Baseline CSS](./05-baseline-css.md)
