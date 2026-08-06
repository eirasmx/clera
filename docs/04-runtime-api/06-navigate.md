# 🧭 app.navigate(name, params?)

Navigates to a named page.

```js
app.navigate("settings");
app.navigate("profile", { userId: 42 });
```

---

## 📋 Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | The page name to navigate to |
| `params` | object | Optional parameters passed to the page |

---

## Params

Params are available in the target page's actions and lifecycle hooks via `context.params`:

```js
app.navigate("product", { id: "abc123", source: "search" });

// in the product page:
function loadProduct(context) {
  const productId = context.params.id;     // "abc123"
  const source    = context.params.source; // "search"
}
```

Params are replaced on every navigation. They do not accumulate.

---

## From inside an action

Use `context.navigate()` inside action functions. It is identical to `app.navigate()`:

```js
function submitLogin(context) {
  const username = context.values.username.trim();
  if (username) {
    context.navigate("dashboard", { username });
  }
}
```

---

## Validation

Clera validates that the target page exists before navigating. If the page is not registered:

```
[CLERA:PAGE_NOT_FOUND] Navigation target "typo" is not registered.
```

Navigation is aborted and the current page remains visible.

---

## 🧭 What happens on navigation

1. Current page `onHide` fires
2. Current page is hidden
3. Target page is mounted (if not already in DOM)
4. Target page `onCreate` fires (first visit only)
5. Target page `onShow` fires
6. Target page becomes visible
7. If `persistPage: true`, the page name is saved to `localStorage`

---

## Calling before boot

`app.navigate()` can be called before boot. The call is queued and replayed after boot completes.

---

## 📤 Return value

`app.navigate()` returns the `app` object.

---

## Next

[07 currentPage()](./07-current-page.md)
