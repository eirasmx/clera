# 🧱 Components

`app.registerComponent()` teaches the runtime how to handle a custom HTML tag. When the runtime encounters that tag inside a page on mount or after a render, it calls your `parser` function with the element.

`app.registerComponent()` returns `true` if registration succeeded and `false` if the tag name was empty or protected.

---

## 📋 Config shape

```js
app.registerComponent("tag-name", {
  selfClosing: false,   // set true if the tag is used as <tag-name />

  style: {              // CSS properties applied to the element on parse
    display: "block",
    position: "relative",
  },

  parser(element, app, { selfClosing }) {
    // Runs once per element instance when the page mounts or after render.
    // element: the live DOM element for this component instance.
    // app: the full Clera API.
    // selfClosing: reflects the selfClosing value this component was registered with.
  },

  destroy(element, app) {
    // Optional. Runs when the page this element lives in is evicted from memory.
    // Use to clean up timers, observers, or event listeners created in parser.
  },
});
```

> ⚠️ Each element is initialised exactly once. Clera tracks parsed elements with a `WeakSet` internally. `parser` is never called twice on the same element, even across remounts.

---

## 📋 Minimal component

```js
app.registerComponent("loading-spinner", {
  parser(element) {
    element.innerHTML = `<div class="spinner"></div>`;
  },
});
```

```html
<page name="home">
  <loading-spinner></loading-spinner>
</page>
```

---

## 📋 Self-closing component

Use `selfClosing: true` for components that do not wrap child content.

```js
app.registerComponent("user-avatar", {
  selfClosing: true,

  parser(element) {
    const userId = element.getAttribute("user-id");
    element.innerHTML = `<img src="/avatars/${userId}.png" alt="Avatar">`;
  },
});
```

```html
<user-avatar user-id="42" />
```

> 🔧 **Browser note:** browsers parse `<tag />` and `<tag></tag>` into identical DOM nodes for custom elements. The runtime cannot distinguish the two forms from the DOM alone. Declaring `selfClosing: true` is a semantic contract. The runtime enforces that the element is empty, but the source-level `<tag />` syntax is handled by the `.clera` transpiler.

---

## 📋 Container component

A container component wraps child content. Leave `selfClosing` absent or `false`.

```js
app.registerComponent("info-card", {
  style: {
    display: "block",
    padding: "16px",
    borderRadius: "8px",
    background: "#f5f5f5",
  },

  parser(element) {
    element.setAttribute("role", "region");
  },
});
```

```html
<info-card>
  <h2>Title</h2>
  <p>Body text here.</p>
</info-card>
```

---

## 📋 Component with cleanup

If `parser` sets up a timer, observer, or event listener, use `destroy` to tear it down when the page is evicted.

```js
app.registerComponent("live-clock", {
  parser(element) {
    function tick() {
      element.textContent = new Date().toLocaleTimeString();
    }
    tick();
    element._clockInterval = setInterval(tick, 1000);
  },

  destroy(element) {
    clearInterval(element._clockInterval);
  },
});
```

```html
<page name="home">
  <live-clock></live-clock>
</page>
```

---

## 📋 Choosing a shape

| Shape | Use for | Examples |
|-------|---------|---------|
| Container (`selfClosing: false`) | Wrapping or decorating content | `card`, `modal`, `panel`, `section` |
| Self-closing (`selfClosing: true`) | Single atomic UI units | `icon`, `spinner`, `divider`, `status-dot` |

---

## 📋 Combining components and a plugin in one file

A single file can register both components and a lifecycle plugin. One `<script>` tag covers everything.

```js
// extensions/ui-kit.js

app.registerComponent("ui-badge", {
  selfClosing: true,

  parser(element) {
    const label = element.getAttribute("label") ?? "";
    const count = element.getAttribute("count") ?? "0";
    element.innerHTML = `<span class="badge-label">${label}</span>
                         <span class="badge-count">${count}</span>`;
  },
});

app.registerComponent("ui-divider", {
  selfClosing: true,
  style: { display: "block", borderTop: "1px solid #e0e0e0", margin: "12px 0" },
  parser() {},
});

app.use({
  id: "ui-kit",

  onReady() {
    document.documentElement.setAttribute("data-ui-kit", "loaded");
  },
});
```

```html
<script src="clera.js"></script>
<script src="extensions/ui-kit.js"></script>
<script src="script.js"></script>
```

```js
// script.js
app.start({ initial: "home" });
```

---

## ⚠️ Protected tag names

These tags are reserved by Clera and cannot be used with `registerComponent`:

`app`, `page`, `splash`, `nav`, `tabbar`, `tab`, `sidebar`, `import`, `use`

Attempting to register any of them logs `COMP_PROTECTED` and returns `false`.

---

## 📋 Timing

`app.registerComponent()` can be called before or after `app.start()`.

- **Before `app.start()`:** the component is available to all pages from the first mount.
- **After `app.start()`:** the component applies to all subsequent mounts and renders but will miss pages already mounted.

---

## 📋 Error codes

| Code | Source |
|------|--------|
| `COMP_PARSER_THROW` | Component `parser` threw |
| `COMP_DESTROY_THROW` | Component `destroy` threw |
| `COMP_PROTECTED` | Attempted to override a core tag |
| `COMP_INVALID` | `registerComponent` called with empty tag name |

---

## Next

[05-routing: Built-in Routing](../05-routing/01-built-in-routing.md)
