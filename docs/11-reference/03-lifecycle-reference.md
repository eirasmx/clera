# 🔄 Lifecycle and Action Resolution Reference

---

## 🔄 Lifecycle hooks

### Hook firing order

| Event | Hooks that fire |
|-------|----------------|
| First navigation to a page | `onCreate` then `onShow` |
| Returning to a previously visited page | `onShow` only |
| Leaving a page | `onHide` |
| Page evicted from LRU cache | `onDestroy` |

### 📝 Declaring hooks

**In HTML:**
```html
<page name="feed" oncreate="initFeed" onshow="refreshFeed" onhide="pauseFeed" ondestroy="cleanupFeed">
```

**In JavaScript:**
```js
app.page("feed", {
  onCreate(context)  { initFeed(context); },
  onShow(context)    { refreshFeed(context); },
  onHide(context)    { pauseFeed(context); },
  onDestroy(context) { cleanupFeed(context); }
});
```

Both can coexist. If the same hook is declared in HTML and in `app.page()`, both run. The JavaScript function fires first, then the HTML attribute action.

### Hook signatures

All hooks receive `context` as their first argument.

```js
function initFeed(context) {
  // context.pageName, .params, .navigate(), .render() etc. all available
}
```

---

## ⚡ Action resolution

When an action is triggered (click or form submit), Clera resolves the handler in this priority order:

### ⚡ Tier 1: Page-local actions

Registered via `app.page()`:

```js
app.page("home", {
  actions: {
    addTask(context) { ... }
  }
});
```

Page-local actions only fire on the page they are registered for. Two pages can have actions with the same name that do different things.

### ⚡ Tier 2: Global registered actions

Set via the `app.actions` setter:

```js
app.actions = {
  openMenu(context) { ... },
  closeMenu(context) { ... }
};
```

Multiple assignments merge. Later assignments do not overwrite earlier ones.

### Tier 3: Global functions

Plain functions declared at global scope:

```js
function addTask(context) { ... }
```

Clera looks up `window["addTask"]` by exact name match. Write the function and use its name in HTML.

### 🤖 Resolution failure

If no handler is found at any tier:

```
[CLERA:ACTION_NOT_FOUND] Action "addTask" not found (page "home").
Expected a global function named addTask(), a registered action via app.actions,
or a page-local action via app.page().
```

---

## 🔧 Action call queue

`app.page()`, `app.use()`, and `app.navigate()` can be called before boot. Calls are queued and replayed after boot completes, in the order they were called, before the initial page mounts.

This means lifecycle hooks registered via `app.page()` are always attached before `onCreate` fires, even if `app.page()` was called synchronously in a script before the DOM was ready.

---

## Next

[04 Config Reference](./04-config-reference.md)
