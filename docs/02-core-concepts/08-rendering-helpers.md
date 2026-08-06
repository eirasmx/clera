# 🖥️ Rendering Helpers

Clera provides three DOM helpers for updating page content from action functions. All three are scoped to the current page and warn if the target element is not found.

---

## 🎯 context.render(selector, html)

Replaces the inner HTML of the matched element.

```js
function loadTasks(context) {
  context.render("#taskList", tasks.map(task =>
    `<li>${task.title}</li>`
  ).join(""));
}
```

Use this when you want to fully replace a list, a card's content, or any container.

### reserveHeight option

When replacing content that already has height, pass `{ reserveHeight: true }` to prevent a layout jump during the swap:

```js
context.render("#feedList", html, { reserveHeight: true });
```

How it works: Clera reads the container's current height before the swap, pins it as a `minHeight`, replaces the content, then removes the `minHeight`. The browser handles the transition to the new natural height. No canvas, no measurement engine: just one `offsetHeight` read.

Use `reserveHeight` for content-heavy containers like feeds and chat lists where visible height changes are noticeable.

---

## 🎯 context.append(selector, html)

Adds HTML to the end of the matched element without clearing existing content.

```js
function addMessage(context) {
  const title = context.values.title.trim();
  if (!title) return;

  context.append("#taskList", `<li>${title}</li>`);
  context.form.reset();
}
```

Use this when you are adding single items to an existing list rather than re-rendering the whole thing.

---

## 🎯 context.clear(selector)

Empties the matched element. Equivalent to `render(selector, "")`.

```js
function resetList(context) {
  context.clear("#taskList");
}
```

Use this to clear a container before populating it, or to show an empty state.

---

## All three are page-scoped

All three helpers query within the current page's root element only. They cannot accidentally reach elements on other pages or outside the current page.

If the selector matches nothing, Clera logs a warning and does nothing (no error thrown):

```
[CLERA:DOM_MISSING] render("#taskList") found no element in page "home".
```

---

## 💡 When to use each

| Situation | Helper |
|-----------|--------|
| Re-render a full list from data | `render` |
| Add a single item to an existing list | `append` |
| Empty a container | `clear` |
| Target a specific element for text or value | `query` |

---

## Next

[09 Persist Page](./09-persist-page.md)
