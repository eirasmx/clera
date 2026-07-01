# 👂 Page Listeners


`context.listen()` attaches a persistent event listener rule to elements inside the current page. It runs inside Clera's execution cycle, patches bindings automatically, prevents duplicates, and rebinds automatically after every Clera-owned DOM update.

---

## 🎯 Why it exists

When you use `action="..."` attributes, Clera wires up click handlers for you. But sometimes you need to listen to events that `action=` does not cover (`input`, `change`, `scroll`, `keydown`, custom events), or you need to conditionally attach and detach listeners based on runtime logic.

`context.listen()` is the page-owned equivalent of `element.addEventListener()`, except Clera manages timing, rebinding, and cleanup for you.

---

## ⚙️ API

```js
const off = context.listen(selector, eventName, callback, options?)
off() // remove listener rule
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `selector` | string | CSS selector: resolved inside page root only |
| `eventName` | string | DOM event name: `"click"`, `"input"`, `"change"`, etc. |
| `callback` | function | Receives native Event. Runs in Clera-controlled execution. |
| `options` | object | Optional: passed to `addEventListener` |

Returns an `off()` function. Safe to call multiple times: calling it again after the listener is already removed does nothing.

---

## 💡 Basic usage

```js
function loadPage(context) {
  context.listen("#saveBtn", "click", (event) => {
    context.data({ saved: true });
    // bindings auto-patch
  });
}
```

---

## 🔄 Persistent rule: auto-rebinds after renders

`context.listen()` registers a **persistent rule**, not a one-time snapshot. When `context.render()` or `context.append()` injects new HTML, any elements matching the selector are automatically bound. No need to re-call `context.listen()`.

```js
function loadList(context) {
  // Register the rule once
  context.listen(".item", "click", (event) => {
    context.data({ selected: event.target.textContent });
  });

  // Render items: .item elements are bound automatically
  context.render("#list", `
    <div class="item">Apple</div>
    <div class="item">Banana</div>
  `);

  // Re-render later: new .item elements also auto-bound
  context.render("#list", `
    <div class="item">Cherry</div>
    <div class="item">Date</div>
  `);
}
```

---

## 🔁 Duplicate protection

Duplicate detection uses real callback reference identity (`===`). Calling `context.listen()` with the same selector, event, and callback reference a second time does not attach a duplicate: it returns an `off()` for the existing rule.

```js
// In onShow: safe to call every time the page becomes visible
function showHandler(context) {
  context.listen(".item", "click", myHandler); // no duplicate on repeat calls
}
```

---

## ♻️ Manual teardown

```js
const off = context.listen(".item", "click", handler);

// Later: remove this listener rule
off();
```

`off()` removes the rule and detaches the wrapped handler from all matching elements. Safe to call multiple times.

---

## 🔄 Lifecycle

| Stage | Behavior |
|-------|---------|
| Mount | Rules attach to matching elements |
| Show (keepAlive page) | Rules persist: no reattachment needed |
| Hide (keepAlive page) | Rules stay registered |
| Removed from memory | All rules deactivated and element attachments removed |
| Remount after eviction | Rules reattach to fresh DOM on next mount |

---

## ⚠️ Scope: page root only

`context.listen()` resolves selectors inside the page root only, never `document`. This prevents cross-page collisions.

---

## ⚠️ Missing target

If the selector matches nothing at call time, Clera warns `[CLERA:LISTEN_TARGET_NOT_FOUND]` in dev mode. The rule stays registered and will bind when matching elements appear after a future render.

---

## ⚠️ Dynamic DOM outside Clera

`context.listen()` rebinds after **Clera-owned** renders (`context.render()`, `context.append()`, `context.clear()`, page mount). If you mutate `innerHTML` manually outside Clera APIs, you own the rebinding.

---

## 🚫 Not for event delegation

`context.listen()` attaches directly to elements that exist at bind time. It does not automatically catch events from new children added later inside a container. For large dynamic lists, consider attaching the listener to a stable container element instead:

```js
// Better for large dynamic lists: attach to stable container
context.listen("#list", "click", (event) => {
  if (event.target.classList.contains("item")) {
    context.data({ selected: event.target.textContent });
  }
});
```

---

## 🔄 Relationship to other APIs

| API | Scope | Auto sync | Auto rebind |
|-----|-------|-----------|-------------|
| `context.listen()` | Page | ✅ | ✅ (Clera renders) |
| `app.listen()` | Global | ✅ | ❌ |
| `element.addEventListener()` | Manual | ❌ | ❌ |

---

## Next

[01 Styling in Clera](../03-styling/01-styling-in-clera.md)
