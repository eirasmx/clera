# 📐 app.currentPage() and app.layout()

Two lightweight read-only methods for querying runtime state.

---

## app.currentPage()

Returns the name of the currently visible page, or `null` if no page is mounted yet.

```js
const page = app.currentPage(); // "home" | "settings" | null
```

### 💡 Common uses

Conditional logic based on current page:

```js
function handleBack() {
  if (app.currentPage() === "home") return; // already home
  app.navigate("home");
}
```

Analytics:

```js
app.onLayoutChange(() => {
  analytics.track("layout_change", {
    page: app.currentPage(),
    layout: app.layout()
  });
});
```

---

## 📐 app.layout()

Returns the current layout mode based on viewport width.

```js
const layout = app.layout(); // "mobile" | "tablet" | "desktop"
```

| Viewport width | Return value |
|---------------|-------------|
| 0 – 599px | `"mobile"` |
| 600px – 1023px | `"tablet"` |
| 1024px+ | `"desktop"` |

### 💡 Common uses

Adjust behaviour based on screen size:

```js
function openMenu(context) {
  if (app.layout() === "mobile") {
    context.navigate("menu");
  } else {
    context.query(".sidebar").element.classList.toggle("open");
  }
}
```

---

## 📐 app.onLayoutChange(handler)

Registers a listener that fires whenever the layout mode changes.

```js
app.onLayoutChange((event) => {
  const { layout, width } = event.detail;
  console.log(`Layout: ${layout} at ${width}px`);
});
```

The handler receives a standard `CustomEvent` with `detail: { layout, width }`.

Layout changes are debounced via `requestAnimationFrame` to avoid firing on every pixel of resize.

---

## Next

[08 hardware()](./08-hardware.md)
