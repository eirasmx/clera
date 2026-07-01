# 🎯 context: The Action Object

`context` is the object Clera passes to every action function and lifecycle hook. It provides information about the current page and helpers for common tasks.

Think of it as your toolbox for that page. Navigation, data, DOM updates, form values, and network calls are all here.

**⚠️ `context` is only available inside action functions and lifecycle hooks.** It does not exist at the top level of your script. Accessing it outside a handler returns `null` and logs:

```
[CLERA:CONTEXT_OUTSIDE_HANDLER] context accessed outside an active handler.
context is only available inside action handlers and lifecycle hooks.
```

🌍 For things you need at the global level (timeouts, intervals, event listeners), use `app.*` equivalents:

| Need | Inside a function | Outside a function |
|------|------------------|--------------------|
| Timed callback | `context.timeout()` | `app.timeout()` |
| Repeating callback | `context.timeout()` in a loop | `app.interval()` |
| DOM event listener | `context.listen()` | `app.listen(element, ...)` |
| Trigger DOM update | `context.update()` | `app.update()` |
| Navigate | `context.navigate()` | `app.navigate()` |

---

## 🗺️ Overview

```js
function myAction(context) {
  context.pageName        // name of the current page
  context.params          // navigation params passed to this page
  context.event           // the triggering DOM event (or null)
  context.element         // the element that triggered the action (or null)

  context.navigate()      // navigate to another page
  context.back()          // go back

  // Data system
  context.data()          // attach page-local data
  context.update()        // manually patch DOM bindings
  context.fetch()         // Clera-aware fetch (auto-updates DOM)
  context.timeout()       // Clera-aware setTimeout (auto-updates DOM)
  context.myDataKey       // direct access to any key you attached via context.data()

  context.query()         // find an element in the page
  context.render()        // replace element content
  context.append()        // add to element content
  context.clear()         // empty an element

  // form actions only:
  context.values          // form field values as a plain object
  context.formData        // raw FormData object
  context.form            // the HTMLFormElement
  context.submitter       // the button that submitted the form
  context.resetForm()     // reset the form
  context.setSubmitting() // control the submitting lock

  context.log             // dev logging helpers
  context.unsafe          // escape hatches to raw DOM
}
```

---

## 📋 Properties

### 📌 `context.pageName`
The name of the page this action is running on.

```js
console.log(context.pageName); // "home"
```

### 📦 `context.params`
Parameters passed during navigation. Empty object if none were passed.

```js
app.navigate("profile", { userId: 42 });

// inside the profile page:
console.log(context.params.userId); // 42
```

### 🖱️ `context.event`
The raw DOM event that triggered the action. `null` for lifecycle hooks.

### 🔲 `context.element`
The element that triggered the action. For form actions, this is the submitter button (or `null`).

### 📦 `context.args` and `context.arg`

When an action is called with inline arguments, they are available on `context.args` (frozen array) and `context.arg` (first item shorthand, `null` when no args were passed).

Both syntaxes land identically:

```html
<button action="deleteTask: {task.id}">Delete</button>
<button action="deleteTask({task.id})">Delete</button>
```

```js
function deleteTask(context) {
  const id = context.arg;         // first arg shorthand
}

function move(context) {
  const id     = context.args[0];
  const status = context.args[1];
}
```

See [04 Actions](./04-actions.md) for the full argument syntax, all supported types, and binding resolution rules.

---

## 🧭 Navigation

### 🧭 `context.navigate(pageName, params?, options?)`
Navigate to another page.

```js
context.navigate("settings");
context.navigate("profile", { userId: 42 });
```

### ⬅️ `context.back()`
Go back using `window.history.back()`.

---

## 🗄️ Data system

### 📥 `context.data(sourceObject)`
Attach page-local data. Merges by reference: keys become directly accessible on `context.*`. Page data overrides global data of the same key on this page only.

```js
function loadHome(context) {
  const stats = { count: 0 };
  context.data({ stats });

  context.stats.count; // 0: direct access
}
```

> ⚠️ Avoid naming your data keys after Clera built-in properties like `navigate`, `render`, or `pageName`. Clera will reject them with `[CLERA:DATA_KEY_RESERVED]` and skip that key.


### 👂 `context.listen(selector, eventName, callback, options?)` → off()

Attaches an event listener to elements inside the current page. The callback runs inside Clera's execution cycle so DOM bindings update automatically after each event. Auto-rebinds after `context.render()`, `context.append()`, and `context.clear()`. Prevents duplicates via callback reference identity.

```js
const off = context.listen(".item", "click", (event) => {
  context.data({ selected: event.target.textContent });
});

off(); // remove rule and all element attachments
```

See [15 Page Listeners](./15-page-listeners.md) for full usage.

### 🔄 `context.update()`
Manually trigger a DOM binding patch. Use when data mutates outside Clera-controlled execution (raw `setTimeout`, raw `fetch`, WebSocket etc.).

```js
setTimeout(() => {
  context.stats.count += 1;
  context.update(); // manual trigger required
}, 1000);
```

### 🌐 `context.fetch(url, options?, callback?)` → Promise
Clera-aware fetch. DOM bindings update automatically after callback or `await` resolves. No `context.update()` needed.

```js
// Callback style
context.fetch("/api/data", function(result) {
  context.stats.count = result.count; // auto-updates DOM
});

// Async/await
const result = await context.fetch("/api/data", { method: "POST", body: { name } });
```

See [11 Async Helpers](./11-async-helpers.md) for full options reference.

### ⏱️ `context.timeout(callback, delay)` → timerId
Clera-aware `setTimeout`. DOM bindings update automatically after the callback runs.

```js
context.timeout(function() {
  context.message.text = "Done!"; // auto-updates DOM
}, 2000);
```

### 🔑 `context.myDataKey`
Any key attached via `context.data()` or `app.data()` is accessible directly on `context`:

```js
context.data({ stats, filters });
context.stats.count;    // direct access
context.filters.active; // direct access
```

---

## 🔍 DOM helpers

All DOM helpers are scoped to the current page. They cannot reach elements outside the active page.

### 🔍 `context.query(cssSelector)`
Find an element within the current page. Returns a safe wrapper object.

```js
const wrapper = context.query("#title");
wrapper.exists            // true or false
wrapper.element           // raw HTMLElement or null
wrapper.text("Hello")     // set text content
wrapper.text()            // get text content
wrapper.html("<b>Hi</b>") // set innerHTML
wrapper.value("new")      // set input value
wrapper.value()           // get input value
wrapper.on("click", fn)   // add event listener
```

### 🖊️ `context.render(selector, html, options?)`
Replace the inner HTML of an element. Processes `{path}` bindings in injected HTML automatically.

```js
context.render("#taskList", tasks.map(t => `<li>${t}</li>`).join(""));

// Prevent layout jump during swap:
context.render("#feedList", html, { reserveHeight: true });
```

### ➕ `context.append(selector, html)`
Add HTML to an element without clearing existing content. Processes `{path}` bindings in the appended fragment.

```js
context.append("#taskList", `<li>${newTask}</li>`);
```

### 🗑️ `context.clear(selector)`
Empty an element.

```js
context.clear("#taskList");
```

---

## 📝 Form helpers (form actions only)

### 📋 `context.values`
Form field values as a plain object. Fields with the same name become arrays.

```js
context.values.title  // "Buy milk"
context.values.tags   // ["design", "code"] (multiple checkboxes)
```

### 📄 `context.form`
The raw `HTMLFormElement`. `context.form.reset()` clears the form.

### 📦 `context.formData`
The raw `FormData` object for advanced use cases (file uploads etc.).

### 🖱️ `context.submitter`
The button that submitted the form, or `null`.

### 🔁 `context.resetForm()`
Resets the form. Equivalent to `context.form.reset()`.

### 🔒 `context.setSubmitting(boolean)`
Manually control the double-submit lock.

---

## 📟 Logging

`context.log` emits structured entries into the Clera diagnostics buffer from your own code. Entries appear in `app.diagnostics` alongside runtime entries and are formatted in the console as `[CRE:CODE] message`.

```js
context.log.warn("MY_CODE", "Something unexpected happened");
context.log.error("MY_CODE", "Something failed", caughtError);
```

| Method | Level | When to use |
|--------|-------|-------------|
| `context.log.warn(code, msg)` | `warn` | Unexpected but recoverable. Will not stop execution. |
| `context.log.error(code, msg, caughtError?)` | `error` | Failed operation. Pass the caught error as the third argument to append its message. |

`code` should be a stable ALL_CAPS string that identifies the call site. It appears in the console and in `app.diagnostics.logs()` entries for filtering and tooling support.

---

## 🚪 Escape hatches

`context.unsafe` gives direct access to raw DOM objects that Clera's scoped helpers cannot reach. Use only when the standard helpers are not sufficient.

```js
context.unsafe.root()      // the live <page> DOM element
context.unsafe.document()  // window.document
context.unsafe.window()    // window
```

Direct DOM manipulation via `context.unsafe` bypasses the binding engine. Changes made this way will not trigger `{path}` binding updates. Call `context.update()` after if bindings need to reflect any changes.

---

## Next

[07 Forms and Values](./07-forms-and-values.md)
