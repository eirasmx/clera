# 📋 HTML Attribute Reference

Every attribute Clera reads and acts on.

---

## 📋 `<app>` attributes

| Attribute | Description |
|-----------|-------------|
| `layout` | Set automatically by the runtime. Value: `"mobile"` / `"tablet"` / `"desktop"`. Reflects the exact current layout tier. Read-only. Do not set manually. |
| `media` | Set automatically by the runtime. Value is a space-separated token list: `"mobile"` at mobile, `"mobile tablet"` at tablet, `"mobile tablet desktop"` at desktop. Use with the `~=` CSS selector for cascading responsive styles. Read-only. Do not set manually. |

---

## 📋 `<page>` attributes

| Attribute | Required | Description |
|-----------|----------|-------------|
| `name` | Yes | Unique page identifier. Used in navigation, `app.navigate()`, and `context.pageName`. Case-sensitive. |
| `id` | No | Copied to the mounted `<page>` element. Enables `#id` CSS selectors. |
| `class` | No | Copied to the mounted `<page>` element. Enables `page.class` CSS selectors. |
| `target` | No | Limits this page to specific platforms. Accepted values: `ios`, `android`, `web`, `pwa`, `native` (expands to `ios,android`), `desktop` (expands to `web,pwa`). Comma-separated combinations are allowed: `target="ios,web"`. Pages that do not match the current platform are removed from the DOM at boot and never registered. Absent means all platforms. |
| `keep-alive` | No | Prevents LRU eviction. Also accepted as `keepalive` or `keepAlive="true"`. |
| `oncreate` | No | Action name to call the first time this page mounts. |
| `onshow` | No | Action name to call every time this page becomes visible. |
| `onhide` | No | Action name to call when this page is hidden. |
| `ondestroy` | No | Action name to call when this page is removed from DOM (LRU eviction). |

---

## 📋 `<nav>` attributes

`<nav>` must be a direct child of `<app>`.

| Attribute | Description |
|-----------|-------------|
| `mobile` | Position at viewport 0 to 599px. Accepted values: `top`, `bottom`, `left`, `right`, `none`. |
| `tablet` | Position at viewport 600px to 1023px. Same accepted values. |
| `desktop` | Position at viewport 1024px and above. Same accepted values. |
| `default` | Fallback position when no layout-named attribute matches. Same accepted values. |

Position values: `"top"` pins to the top of the app, `"bottom"` pins to the bottom, `"left"` fixes to the left edge full-height, `"right"` fixes to the right edge full-height, `"none"` hides the nav at that layout.

If none of `mobile`, `tablet`, `desktop`, or `default` are present, Clera leaves the `<nav>` alone entirely. No click binding or positioning is applied.

---

## 📋 `<sidebar>` attributes

`<sidebar>` must be a direct child of `<app>`.

| Attribute | Description |
|-----------|-------------|
| `position` | `"left"` (default if absent) or `"right"`. Fixed to that edge of the screen. |

---

## 📋 `<tabbar>` attributes

| Attribute | Description |
|-----------|-------------|
| `position` | Controls where the tabbar appears. `"top"` places it above all pages with safe-area top inset padding applied automatically. Absent (default) places it below all pages with safe-area bottom inset padding applied automatically. |

---

## 📋 `<tab>` attributes

| Attribute | Description |
|-----------|-------------|
| `page` | Page name to navigate to when the tab is clicked. |
| `active` | Set automatically by the runtime. Present on the active tab, absent on all others. Use in CSS: `tab[active]`. |

---

## 📋 `<tab>` attributes (inside nav, sidebar, tabbar)

| Attribute | Description |
|-----------|-------------|
| `page` | Page name to navigate to when the tab is clicked. |
| `action` | Action function name to call when the tab is clicked. |

---

## 📋 Action attributes (any element)

| Attribute | Description |
|-----------|-------------|
| `action` | Name of the JavaScript function to call on click (non-form elements) or on submit (form elements). Must exactly match the function name. Supports inline arguments in two equivalent forms: colon syntax (`action="delete: {task.id}"`) and function-call syntax (`action="delete(42)"`). Supported argument types: number, string (quoted), boolean (`true`/`false`), null, and state binding (`{path}`). Multiple arguments are comma-separated. Arguments are available in the handler as `context.args` (array of all arguments) and `context.arg` (first argument shorthand, or `null` if no arguments). |
| `page` | Page name to navigate to on click. Works on any element. |
| `route` | Alias for `page`. Identical behavior. `page` takes priority if both are present. |
| `formaction` | On a submit button, overrides the parent `<form action="...">` for that button only. Standard HTML attribute. Clera respects it. |

---

## 📋 Gesture attributes (any element)

| Attribute | Description |
|-----------|-------------|
| `onswipe` | Name of the action function to call for every phase of a swipe gesture on this element. Resolves the same three ways as `action`. See [Gestures](../02-core-concepts/19-gestures.md). |

---

## 📋 `<form>` attributes

| Attribute | Description |
|-----------|-------------|
| `action` | Name of the JavaScript function to call on submit. If the value looks like a URL (`/`, `#`, `?`, `http`), Clera ignores it and lets the browser handle it normally. |

---

## 📋 Reusable block attributes

| Attribute | Element | Description |
|-----------|---------|-------------|
| `template` | Any element | Registers the element as a reusable source. Must be paired with `id`. |
| `id` | `<template>`, `[template]` | Names the reusable source. Required. Used in `<use template="...">`. |
| `slot` | Any element inside a template | Names this node so it can be referenced by `target=` on a `<use>` override child. Survives into the expanded clone. Optional but recommended over raw nid values. |
| `target` | Direct child of `<use>` | Identifies which node in the clone to override. Accepts a slot name or a raw `data-cre-nid` value. Slot names are resolved first. |
| `name` | `<use>` | Creates an isolated data scope for this instance, accessible via `context.name`. |

---

## 🔔 Window events dispatched by the runtime

| Event | Description |
|-------|-------------|
| `app:layoutchange` | Fired on `window` whenever the layout breakpoint changes. Detail shape: `{ layout: "mobile" \| "tablet" \| "desktop", width: number }`. Use `window.addEventListener("app:layoutchange", fn)` to listen. `app.onLayoutChange()` is the preferred Clera-managed form when inside app code. |

```js
window.addEventListener("app:layoutchange", function(event) {
  console.log(event.detail.layout); // "mobile", "tablet", or "desktop"
  console.log(event.detail.width);  // viewport width in px at time of change
});
```

---

## 🎯 Data attributes set by the runtime

These are set by Clera and can be read in CSS or JavaScript.

| Attribute | Element | Description |
|-----------|---------|-------------|
| `layout` | `<app>` | Current layout tier: `"mobile"` / `"tablet"` / `"desktop"` |
| `media` | `<app>` | Cascading layout tokens: `"mobile"` / `"mobile tablet"` / `"mobile tablet desktop"` |
| `position` | `<nav>` | The position Clera resolved for this nav at the current layout: `"top"`, `"bottom"`, `"left"`, or `"right"`. Absent when position is `"none"` or the nav has no position attributes. |
| `collapsed` | `<nav>`, `<sidebar>` | Present when collapsed via `app.collapse()`. Absent when expanded. Use in CSS to style the collapsed state. |
| `data-app-page` | Mounted `<page>` | The page name. Present on every mounted page element. |
| `data-submitting` | `<form>` | `"1"` while form submission is in progress. Removed when submission completes. |
| `data-clera-hidden` | Mounted `<page>` | Present when the page is hidden. Removed when the page becomes active. |
| `data-cre-nid` | Template descendant | Internal node identifier stamped by Clera at registration time in depth-first order. Used by `target=` as a fallback when no slot name matches. Do not write this yourself. |
| `active` | `<tab>` | Present on the active tab, absent on all others. |

---

## Next

[02 context Reference](./02-pagecontext-reference.md)
