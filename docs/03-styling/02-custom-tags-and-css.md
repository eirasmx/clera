# 🏷️ Custom Tags and CSS

Clera's structural elements are custom HTML tags. You can style them directly with CSS, and you can register your own custom component tags too.

---

## ✅ Built-in Clera tags

| Tag | Role |
|-----|------|
| `app` | Root application container |
| `page` | A single screen, mounted on demand |
| `splash` | Shown during boot, hidden on first page mount |
| `tabbar` | Bottom navigation bar container |
| `tab` | Individual tab inside a `tabbar` |
| `import` | Fetches an external file and inlines its content at boot. Removed from the DOM once resolved. |
| `use` | Replaced by a clone of the named template at page mount. Removed from the DOM once expanded. |

The first five (`app`, `page`, `splash`, `tabbar`, `tab`) are structural elements treated as block-level by the Clera baseline CSS. `import` and `use` are processed and removed by the runtime. They are never visible in the final DOM.

> ⚠️ The navigation bar tag is `tabbar`, not `tab-bar`. One word, no hyphen.

---

## 🎨 Styling built-in tags

Style them like any HTML element:

```css
app {
  background: #fff;
  font-family: "DM Sans", system-ui, sans-serif;
}

tabbar {
  display: flex;
  height: 56px;
  border-top: 1px solid #e0e0e0;
  background: #fff;
}

tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #999;
}

tab[active] {
  color: #007aff;
  font-weight: 600;
}

splash {
  background: #fff;
}
```

---

## 🧩 Custom component tags

You can register your own custom HTML tags using `app.registerComponent()`. Every element with that tag name found inside any mounted page is automatically initialised with your parser function and optional styles.

```js
// Container component: wraps content, can have children
app.registerComponent("user-card", {
  style: { display: "block", borderRadius: "8px", padding: "16px" },
  parser(element, api) {
    const userId = element.getAttribute("user-id");
    element.innerHTML = `<p>User ${userId}</p>`;
  }
});

// Self-closing component: atomic, no children
app.registerComponent("icon", {
  selfClosing: true,
  parser(element, api) {
    const name = element.getAttribute("name");
    element.innerHTML = `<img src="/icons/${name}.svg">`;
  }
});
```

```html
<page name="team">
  <user-card user-id="1"></user-card>
  <user-card user-id="2"></user-card>
</page>
```

For the full API reference including timing rules, parser arguments, and return value, see [13 Components](../04-runtime-api/13-components.md).

---

## ⚠️ Protected tags

Clera reserves two categories of tag names. Neither category can be used for your own markup or registered as a custom component.

**Core structural tags** are the named screens and navigation elements Clera renders and manages. Passing any of these to `registerComponent` triggers a `COMP_PROTECTED` warning and the registration is ignored:

`app`, `page`, `splash`, `tabbar`, `tab`

**Runtime-processed tags** are consumed and removed by the runtime at specific points in the boot and render cycle. They are protected and cannot be registered as custom components:

| Tag | When it runs | What it does |
|-----|-------------|--------------|
| `<import src="...">` | Boot, before pages are extracted | Fetches the referenced file and inlines its content at the import site. Removed from the DOM once resolved. |
| `<use template="...">` | Page mount | Replaced by a clone of the named template. Removed from the DOM once expanded. |

Passing `"import"` or `"use"` to `registerComponent` triggers a `COMP_PROTECTED` warning and the registration is ignored, the same as the core structural tags.

---

## Next

[03 Layout Patterns](./03-layout-patterns.md)
