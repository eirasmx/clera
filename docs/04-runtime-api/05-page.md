# ⚙️ app.page(name, config)

Attaches lifecycle hooks and page-local actions to a named page from JavaScript.

```js
app.page("home", {
  onCreate(context) { loadData(context); },
  onShow(context)   { refreshStats(context); },
  onHide(context)   { stopPolling(); },
  onDestroy(context){ clearState(); },
  actions: {
    addTask(context) { ... },
    removeTask(context) { ... }
  }
});
```

---

## 💡 When to use it

Use `app.page()` when you want to keep page logic organised in JavaScript rather than declaring action names in HTML attributes.

For simple apps, using plain global functions and `oncreate`/`onshow` HTML attributes is often enough. `app.page()` becomes useful when:

- a page has many actions and you want them grouped
- you want TypeScript-friendly action registration
- you want page-local actions that cannot be triggered from other pages

---

## ⚡ Page-local vs global actions

Actions registered via `app.page()` are page-local. They are only resolved when an action fires on that specific page, and they take priority over global registered actions and global functions of the same name.

This means two pages can have an action both named `"save"` that do different things:

```js
app.page("notes", {
  actions: { save(context) { saveNote(context); } }
});

app.page("settings", {
  actions: { save(context) { saveSettings(context); } }
});
```

---

## ⚙️ Config options

| Key | Type | Description |
|-----|------|-------------|
| `onCreate` | function | Fires once on first mount |
| `onShow` | function | Fires every time the page becomes visible |
| `onHide` | function | Fires when the page is hidden |
| `onDestroy` | function | Fires when the page is evicted from cache |
| `actions` | object | Map of action name to function |

All lifecycle functions receive `context` as their first argument.

---

## Calling before boot

`app.page()` can be called before boot. Clera queues the call and replays it after boot completes, so page registration always lands before `onCreate` fires.

Multiple calls with the same page name are merged, not replaced. A second `app.page("home", { actions: { b } })` call keeps any actions already registered for `"home"`.

---

## 📤 Return value

`app.page()` returns the `app` object. Calls can be chained:

```js
app
  .page("home", { onCreate(context) { loadHome(context); } })
  .page("settings", { onCreate(context) { loadSettings(context); } });
```

---

## Next

[06 navigate()](./06-navigate.md)
