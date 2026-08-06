# 💾 Persist Page

By default, reloading a Clera app always returns to the initial page. With `persistPage` enabled, the app restores the page the user was on before the reload.

---

## Enabling it

```js
app.start({ persistPage: true });
```

or with `app.config()` if you want to set options before calling `app.start()`:

```js
app.config({ persistPage: true });
// ... other setup ...
app.start();
```

---

## 🔧 What it does

When `persistPage: true` is set:

- ✅ Every navigation saves the current page name to `localStorage` under the key `CLERA_ACTIVE_PAGE`
- On boot, Clera reads that key and restores the saved page

The user stays where they were. The app feels stateful.

---

## 🎯 Priority order on boot

`persistPage` fits into the full initial page resolution order:

| Priority | Source | Notes |
|----------|--------|-------|
| 1 | `config.initial` | Always wins: use for login flows |
| 2 | `localStorage` | The persisted page: only when `persistPage: true` |
| 3 | Page named `"home"` | Default fallback |
| 4 | First registered page | Last resort |

If `config.initial` is set, it always wins: even if a page was persisted. This means login flows and forced landing pages are unaffected.

---

## ⚠️ Edge cases

**Page no longer exists**: if the saved page name was removed from the app, Clera ignores it and falls through to the next priority tier silently.

**Private browsing / storage blocked**. `localStorage` access is wrapped in a `try/catch`. If storage is unavailable, Clera falls through to the next priority tier without throwing.

---

## Clearing on logout

When the user logs out, clear the persisted page so the next boot starts fresh:

```js
function logout(context) {
  localStorage.removeItem("CLERA_ACTIVE_PAGE");
  context.navigate("login");
}
```

---

## 💡 When to use it

Use `persistPage: true` for any app where:
- ✅ the user navigates between multiple pages
- ✅ a reload should feel like resuming, not restarting
- ✅ you want the app to feel native and stateful

Do not use it if:
- ❌ your app always boots on a specific page (use `config.initial` instead)
- ❌ you have a login gate and need boot to always check auth first

---

## Next

[10 Data System](./10-data-system.md)
