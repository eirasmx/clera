# 🧭 Navigation

Clera supports two navigation styles: declarative (HTML attributes) and programmatic (JavaScript).

---

## 🧭 Declarative navigation

Use the `page` attribute on any element to navigate when it is clicked:

```html
<button page="settings">Open Settings</button>
<a page="about">About</a>
<div page="profile">View Profile</div>
```

Any element works. Not just buttons and links. Clera attaches a click listener automatically.

The `route` attribute is an alias for `page` and behaves identically:

```html
<a route="home">Home</a>
```

### 🎯 Priority rule

If an element has both `page` and `route`, `page` wins:

```html
<!-- navigates to "home", not "feed" -->
<button page="home" route="feed">Go</button>
```

---

## 🧭 Programmatic navigation

Call `app.navigate()` from JavaScript:

```js
app.navigate("settings");
```

With parameters:

```js
app.navigate("profile", { userId: 42 });
```

Parameters are available in the target page's action functions via `context.params`:

```js
function loadProfile(context) {
  console.log(context.params.userId); // 42
}
```

---

## 🧭 Navigation from inside an action

Use `context.navigate()` inside action functions. It is the same as `app.navigate()` but scoped to the current action:

```js
function submitLogin(context) {
  const username = context.values.username;
  if (username) {
    context.navigate("dashboard", { username });
  }
}
```

---

## ⬅️ Going back

```js
function goBack(context) {
  context.back();
}
```

This calls `window.history.back()`. If there is no browser history to go back to, the browser does nothing. For single-page apps opened directly, this means `back()` may have no effect on the first navigation.

---

## 🧭 Navigation validation

Clera validates that the target page exists in the registry before navigating. If not found, it logs a warning and does nothing:

```
[CLERA:PAGE_NOT_FOUND] Navigation target "typo" is not registered.
```

---

## 🧭 What navigation does

When `navigate("pageName")` is called:

1. The current page's `onHide` hook fires
2. The current page is hidden (`display: none`)
3. The target page is mounted if not already in the DOM
4. The target page's `onCreate` hook fires (first visit only)
5. The target page's `onShow` hook fires
6. The target page is made visible

Lifecycle hooks (`onCreate`, `onShow`, `onHide`) are covered in [05 Lifecycle](./05-lifecycle.md).

---

## Next

[04 Actions](./04-actions.md)
