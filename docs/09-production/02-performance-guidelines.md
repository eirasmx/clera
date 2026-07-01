# ⚡ Performance Guidelines

Clera is fast by default. These guidelines keep it that way as your app grows.

---

## 🧭 Navigation

✅ **Keep pages lightweight.** Each page's HTML is stored in memory after extraction. Large amounts of static HTML across many pages increases memory footprint. Put dynamic content in JavaScript rather than hardcoding it in the page template.

✅ **Use `keep-alive` for frequently visited pages.** Pages marked `keep-alive` are never evicted from the DOM cache. Use this for home screens, tab pages, and any page the user returns to constantly.

```html
<page name="home" keep-alive>...</page>
```

✅ **Set `maxCachedPages` for deep apps.** If your app has 10+ pages that the user rarely revisits, limit the cache so old pages are cleaned up:

```js
app.start({ maxCachedPages: 6 });
```

---

## 🖥️ Rendering

✅ **Prefer `render()` over manual DOM manipulation.** `context.render()` is scoped, safe, and readable. Manual `querySelector` chains are slower to write and harder to maintain.

✅ **Use `append()` for single-item additions.** Adding one item to a list with `append()` is faster than re-rendering the whole list with `render()`. Use `render()` when the full list content changes; use `append()` when you are adding to the end.

✅ **Use `reserveHeight: true` for content-heavy updates.** Prevents layout shift when replacing large containers:

```js
context.render("#feedList", html, { reserveHeight: true });
```

**Do not render inside tight loops.** Batch your data into a full HTML string first, then call `render()` once:

```js
// One render call
context.render("#list", items.map(itemHtml).join(""));

// Many render calls
items.forEach(item => context.append("#list", itemHtml(item)));
```

---

## 🔄 Lifecycle

✅ **Use `oncreate` for one-time setup.** Fetching initial data, registering listeners, and building static content belong in `oncreate`. It fires once and never again for that page.

✅ **Use `onshow` for refresh work.** Updating counts, timestamps, and live data belongs in `onshow`. It fires every time the user navigates to the page.

✅ **Use `onhide` to pause expensive work.** Stop polling, cancel timers, or pause animations when the user leaves a page:

```js
let pollTimer = null;

app.page("feed", {
  onShow() { pollTimer = setInterval(refreshFeed, 5000); },
  onHide() { clearInterval(pollTimer); }
});
```

---

## JavaScript

✅ **Keep actions small and focused.** Each action function should do one thing. Move shared logic into helper functions.

✅ **Avoid synchronous heavy work in actions.** Actions run on the main thread. Heavy computation blocks the UI. Use `async/await` with `fetch`, or defer with `setTimeout` when needed.

**Store state in plain variables.** Clera does not provide a state management system. Plain JavaScript variables and `localStorage` are the right tools for most apps.

---

## Next

[03 Debugging](./03-debugging.md)
