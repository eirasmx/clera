# 🔄 Lifecycle

Every Clera page has four lifecycle hooks that fire at specific moments. You can use them to load data, clean up, or react to page visibility changes.

---

## 📋 The four hooks

| Hook | When it fires |
|------|--------------|
| `onCreate` | Once, the first time the page is mounted |
| `onShow` | Every time the page becomes visible |
| `onHide` | Every time the page is hidden |
| `onDestroy` | When the page is removed from the DOM to free memory |

---

## 🔄 Declaring lifecycle hooks in HTML

Use attributes on the `<page>` element:

```html
<page
  name="feed"
  oncreate="initFeed"
  onshow="refreshFeed"
  onhide="pauseFeed"
  ondestroy="cleanupFeed"
>
  ...
</page>
```

Write matching functions in JavaScript:

```js
function initFeed(context) {
  // runs once when the page is first created
  loadInitialData(context);
}

function refreshFeed(context) {
  // runs every time the user navigates to this page
  updateStats(context);
}

function pauseFeed(context) {
  // runs when the user leaves this page
  stopPolling();
}

function cleanupFeed(context) {
  // runs when the page is evicted from cache
  clearLocalState();
}
```

---

## 🔄 Declaring lifecycle hooks in JavaScript

Use `app.page()` to attach hooks programmatically:

```js
app.page("feed", {
  onCreate(context) {
    loadInitialData(context);
  },
  onShow(context) {
    updateStats(context);
  },
  onHide(context) {
    stopPolling();
  },
  onDestroy(context) {
    clearLocalState();
  }
});
```

Both styles can coexist. If you declare a hook in HTML and also in `app.page()`, both run. The `app.page()` JavaScript hook fires first, then the HTML attribute hook.

---

## 💡 onCreate vs onShow

This is the most important distinction:

- `onCreate` fires **once**: use it for one-time setup like fetching initial data or registering listeners
- `onShow` fires **every visit**: use it for things that should refresh when the user returns

```js
function initProfile(context) {
  // onCreate: runs once
  // Good for: fetch user data, set up WebSocket
}

function showProfile(context) {
  // onShow: runs every time
  // Good for: refresh counts, update timestamps, restart animations
}
```

---

## 🔧 onDestroy

`onDestroy` only fires when a page is removed from memory to make room for others. By default Clera keeps every visited page in memory indefinitely, so `onDestroy` never fires unless you set a memory limit:

```js
app.start({ maxCachedPages: 3 });
```

---

## 🔄 Lifecycle and context

All lifecycle hooks receive `context` as their first argument, just like action functions. This gives access to `navigate`, `render`, `query`, and all other helpers.

---

## Next

[06 context](./06-pagecontext.md)
