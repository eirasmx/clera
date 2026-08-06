# 💾 Persisted Page Routing

Persisted page routing makes Clera apps feel stateful across reloads. The user stays on the page they were on before the reload. A reload does not reset the app to the start.

---

## Enable it

```js
app.start({ persistPage: true });
```

---

## 🔧 What happens

Every time the user navigates to a page, Clera saves the page name to `localStorage`:

```
localStorage["CLERA_ACTIVE_PAGE"] = "settings"
```

On the next boot, Clera reads this value and restores that page instead of starting at "home".

---

## 🎯 Priority

`config.initial` always wins over the persisted page. This lets you force a landing page regardless of what was saved:

```js
// Always boot on the login page, regardless of what was saved
app.start({ initial: "login", persistPage: true });
```

Full priority order:

| Priority | Source |
|----------|--------|
| 1 | `config.initial` |
| 2 | Persisted page (`localStorage`) |
| 3 | Page named `"home"` |
| 4 | First registered page |

---

## Clearing on logout

When the user logs out, remove the persisted page so the next boot starts fresh:

```js
function logout(context) {
  localStorage.removeItem("CLERA_ACTIVE_PAGE");
  context.navigate("login");
}
```

---

## ⚠️ Edge cases handled automatically

**Page no longer exists.** If the saved page name was removed from the app, Clera ignores it silently and falls through to the next priority tier.

**Storage unavailable.** If `localStorage` is blocked (private browsing, storage quota exceeded), the read is wrapped in a `try/catch`. Clera falls through gracefully without throwing.

---

## 💡 When to use it

Use persisted page routing for:

- Apps with multiple peer pages (tabs, sections)
- Any app where a reload should feel like resuming
- Mobile WebView apps where native feel matters

Do not use it for:

- Apps with a mandatory login gate. Use `config.initial: "login"` instead so every boot lands on login regardless of saved state.
- Apps where every session should start at a fixed screen.

---

## Next

[03 External Router Overview](./03-router-overview.md)
