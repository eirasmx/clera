# 🎯 context Reference

Complete reference for every property and method on `context`.

`context` is passed as the first argument to every action function and lifecycle hook. Declaring it in the function signature is optional.

---

## 📋 Properties

### `context.pageName`
**Type:** `string`

The name of the page this action is running on.

```js
console.log(context.pageName); // "home"
```

---

### `context.params`
**Type:** `object`

Parameters passed to this page during navigation. Empty object if none were passed.

```js
app.navigate("profile", { userId: 42 });

// inside profile page:
context.params.userId // 42
```

---

### `context.event`
**Type:** `Event | null`

The raw DOM event that triggered the action. `null` for lifecycle hooks.

---

### `context.element`
**Type:** `HTMLElement | null`

The element that triggered the action. For form submissions, this is the submitter button or `null`.

---

### `context.args`
**Type:** `readonly any[]`

Arguments passed via the inline action syntax. Empty array if no arguments were provided.

```html
<button action="remove: {task.id}">Remove</button>
<button action="setPage(2)">Page 2</button>
```

```js
function remove(context) {
  const taskId = context.args[0]; // the resolved value of {task.id}
}

function setPage(context) {
  const page = context.args[0]; // 2
}
```

Supported argument types: number, string (quoted), boolean (`true`/`false`), `null`, and state binding (`{path}`). Multiple arguments are comma-separated.

---

### `context.arg`
**Type:** `any | null`

Shorthand for `context.args[0]`. `null` if no arguments were passed.

```js
function remove(context) {
  console.log(context.arg); // same as context.args[0]
}
```

---

## 🧭 Navigation methods

### `context.navigate(pageName, params?, options?)`
Navigate to a page.

```js
context.navigate("settings");
context.navigate("profile", { userId: 42 });
```

---

### `context.back()`
Go back. Delegates to `window.history.back()` or the configured router.

```js
context.back();
```

---

## 🔍 DOM query

### `context.query(cssSelector)`
Find an element within the current page. Returns a safe wrapper. It does not throw even if the element is missing.

```js
const wrapper = context.query("#title");
```

**Wrapper properties and methods:**

| Name | Description |
|------|-------------|
| `wrapper.exists` | `true` if the element was found |
| `wrapper.element` | Raw `HTMLElement` or `null` |
| `wrapper.text()` | Get text content |
| `wrapper.text(value)` | Set text content |
| `wrapper.html()` | Get innerHTML |
| `wrapper.html(value)` | Set innerHTML |
| `wrapper.value()` | Get input/select value |
| `wrapper.value(newValue)` | Set input/select value |
| `wrapper.on(event, handler)` | Add event listener |

Warns with `[CLERA:DOM_MISSING]` and no-ops if element not found.

---

## 🖥️ DOM update methods

All three are scoped to the current page and warn if the selector matches nothing.

### `context.render(selector, html, options?)`
Replace inner HTML.

```js
context.render("#list", items.map(itemHtml).join(""));
context.render("#list", html, { reserveHeight: true }); // prevent layout jump
```

---

### `context.append(selector, html)`
Add HTML to the end of an element without clearing it.

```js
context.append("#list", `<li>${newItem}</li>`);
```

---

### `context.clear(selector)`
Empty an element. Equivalent to `render(selector, "")`.

```js
context.clear("#list");
```



---

### `context.listen(selector, eventName, callback, options?)` → off()

Persistent page-scoped event listener rule. Auto-rebinds after Clera-owned renders.

| Parameter | Type | Description |
|-----------|------|-------------|
| `selector` | string | CSS selector inside page root only |
| `eventName` | string | DOM event name |
| `callback` | function | Receives native Event; runs in Clera-controlled execution |
| `options` | object | Passed to `addEventListener` |

Duplicate detection uses callback reference (`===`), not string equality.

Returns `off()`, an idempotent unsubscribe. Deactivates the rule and removes element attachments.

Warns `[CLERA:LISTEN_TARGET_NOT_FOUND]` in dev mode if no elements match at call time (rule stays registered).

```js
const off = context.listen(".item", "click", (event) => {
  context.data({ selected: event.target.textContent });
});
off();
```

---

## 🗄️ Data system methods

### `context.data(sourceObject)`
Attach page-local data. Merges by reference. Keys become directly accessible on `context.*`. Page data overrides global data of the same key on this page only.

```js
context.data({ stats, filters });
context.stats.count;    // direct access
context.filters.active; // direct access
```

> ⚠️ Keys matching built-in Clera property names are rejected with `[CLERA:DATA_KEY_RESERVED]`.

---

### `context.update()`
Manually trigger a DOM binding patch for this page. Use when data mutates outside Clera-controlled execution.

```js
setTimeout(() => {
  context.stats.count += 1;
  context.update();
}, 1000);
```

---

### `context.fetch(url, options?, callback?)` → Promise
Clera-aware fetch. Stays inside Clera's execution context. DOM bindings update automatically after the callback or `await` resolves.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `method` | string | `"GET"` | HTTP method |
| `headers` | object | `{}` | Request headers |
| `body` | any | none | Auto JSON-stringified if object |
| `query` | object | none | Appended as `?key=value` |
| `json` | boolean | `true` | Parse response as JSON |
| `timeout` | number | none | Abort after N ms |
| `credentials` | string | `"same-origin"` | Fetch credentials mode |

```js
// Callback
context.fetch("/api/data", function(result) {
  context.stats.count = result.count;
});

// Async/await
const result = await context.fetch("/api/data", { method: "POST", body: { name } });
```

---

### `context.timeout(callback, delay)` → timerId
Clera-aware `setTimeout`. DOM bindings update automatically after the callback runs. Returns the timer ID.

```js
context.timeout(function() {
  context.message.text = "Done!";
}, 2000);
```

---

### `context.myDataKey`
Any key attached via `context.data()` or `app.data()` is directly accessible on context:

```js
context.data({ stats });
context.stats.count += 1; // direct read/write
```

---

## 📝 Form-only properties

Available only in form action functions.

### `context.values`
**Type:** `object`

Form field values as a plain object. Fields with the same name become arrays.

```js
context.values.title   // "Buy milk"
context.values.tags    // ["design", "code"] (multiple checkboxes)
```

---

### `context.formData`
**Type:** `FormData`

The raw `FormData` object for advanced use cases (file uploads, etc.).

---

### `context.form`
**Type:** `HTMLFormElement`

The form element that was submitted.

```js
context.form.reset();
```

---

### `context.submitter`
**Type:** `HTMLElement | null`

The button that submitted the form, or `null`.

```js
if (context.submitter?.value === "draft") { saveDraft(); }
```

---

### `context.resetForm()`
Reset the form. Equivalent to `context.form.reset()`.

---

### `context.setSubmitting(boolean)`
Manually control the double-submit lock.

```js
context.setSubmitting(false); // re-enable after handling an error
```

---

## 🔍 Logging

### `context.log.warn(code, message)`
Log a warning to the Clera diagnostics buffer.

### `context.log.error(code, message, caughtError?)`
Log an error to the Clera diagnostics buffer.

```js
context.log.warn("MY_CODE", "Something unexpected");
context.log.error("MY_CODE", "Something failed", caughtError);
```


---

## 🧩 Named instance scope

### `context.instanceName`

Any `<use template="..." name="instanceName" />` element creates an instance scope exposed directly on `context` as `context.instanceName`.

```html
<use template="card" name="featured" />
<use template="card" name="sale" />
```

```js
function loadStore(context) {
  context.featured.name  = "Notebook Pro";  // updates featured card
  context.featured.price = 1200;

  context.sale.name  = "Clera Phone";       // updates sale card
  context.sale.price = 699;
}
```

Instance data resolves before page data and global data:

| Priority | Scope |
|----------|-------|
| 1 | Instance-local (`context.instanceName.*`) |
| 2 | Page-local (`context.data(...)`) |
| 3 | Global (`app.data(...)`) |
| 4 | `""` fallback |

> ⚠️ Instance names matching Clera built-in properties (`navigate`, `render`, `data` etc.) are rejected with `[CLERA:USE_NAME_RESERVED]`.

---

## ⚠️ Escape hatches

### `context.unsafe.root()`
Returns the page's root DOM element.

### `context.unsafe.document()`
Returns `window.document`.

### `context.unsafe.window()`
Returns `window`.

Use these only when standard helpers are insufficient.

---

## Next

[03 Lifecycle Reference](./03-lifecycle-reference.md)
