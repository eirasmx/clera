# ⚡ Actions

Actions are the bridge between HTML and JavaScript in Clera. An action is a JavaScript function that runs when an element is clicked or a form is submitted.

---

## 📝 Declaring an action

Add the `action` attribute to any element:

```html
<button action="openMenu">Menu</button>
<div action="dismissAlert">✕</div>
```

For forms, use `action` on the `<form>` element:

```html
<form action="addTask">
  <input name="title" placeholder="Task title">
  <button type="submit">Add</button>
</form>
```

---

## ✍️ Writing the function

Write a plain JavaScript function with the same name:

```js
function openMenu() {
  // runs when the button is clicked
}

function addTask(context) {
  const title = context.values.title;
  // runs when the form is submitted
}
```

That is all. No registration. No imports. Clera finds the function by name.

---

## ⚡ Action resolution order

When an action is triggered, Clera looks for the handler in this order:

1. **Page-local actions**: registered via `app.page("pageName", { actions: { ... } })`
2. **Global registered actions**: set via `app.actions = { ... }`
3. **Global functions**: plain `function myAction() {}` found via `window["myAction"]`

The first match wins. If nothing is found:

```
[CLERA:ACTION_NOT_FOUND] Action "addTask" not found on page "home".
```

---

## ⚠️ Exact name match

The HTML `action` attribute value must match the JavaScript function name exactly:

```html
<button action="addTask">Add</button>   <!-- looks for: function addTask() -->
<button action="AddTask">Add</button>   <!-- looks for: function AddTask(): different! -->
```

---

## 🎯 context is optional

Clera always passes `context` as the first argument. Declaring it in the function signature is optional:

```js
// Both are valid:
function openMenu() {
  console.log("Menu opened");
}

function openMenu(context) {
  console.log("On page:", context.pageName);
}
```

JavaScript ignores extra arguments automatically.

---

## ⚡ Async actions

Actions can be async. Clera handles the returned Promise and logs any unhandled rejections to the diagnostics console:

```js
async function loadData(context) {
  const response = await fetch("/api/data");
  const data = await response.json();
  context.render("#content", data.html);
}
```

---

## 🎯 Inline arguments

Arguments can be passed directly in the `action` attribute. Two syntaxes are supported and are fully equivalent:

**Colon syntax:** `action="fnName: arg1, arg2"`

```html
<button action="deleteTask: 42">Delete</button>
<button action="setMode: 'dark'">Dark</button>
<button action="toggle: true">On</button>
<button action="move: {task.id}, 'done'">Move</button>
```

**Function-call syntax:** `action="fnName(arg1, arg2)"`

```html
<button action="deleteTask(42)">Delete</button>
<button action="setMode('dark')">Dark</button>
<button action="toggle(true)">On</button>
<button action="move({task.id}, 'done')">Move</button>
```

The runtime converts function-call syntax into colon syntax before parsing. Both produce identical results. Use whichever reads more naturally in context.

---

### Reading args in the handler

Args land on `context.args` (frozen array) and `context.arg` (first item shorthand, `null` when no args):

```js
function deleteTask(context) {
  const id = context.arg;         // 42, first arg shorthand
}

function move(context) {
  const id     = context.args[0]; // resolved value of {task.id}
  const status = context.args[1]; // "done"
}

function noArgs(context) {
  context.arg;   // null
  context.args;  // []
}
```

---

### Supported arg types

| Written in HTML | JS type | Value in handler |
|----------------|---------|-----------------|
| `42` / `3.14` | number | `42` / `3.14` |
| `'text'` or `"text"` | string | `"text"` |
| `true` / `false` | boolean | `true` / `false` |
| `null` | null | `null` |
| `{path}` | state binding | value at `path` in page or global data, resolved at click time |

String args must be wrapped in single or double quotes. An unquoted word that is not a known literal (`true`, `false`, `null`) or a number is passed through as a plain string:

```html
<button action="setTab: overview">Overview</button>
<!-- context.arg === "overview" -->
```

State bindings (`{path}`) resolve from page-local data first, then global data, at the moment the element is clicked. They are not re-evaluated on render cycles.

---

## 💡 Button inside a form

A `<button type="submit">` inside a `<form action="...">` submits the form: it does not need its own `action` attribute. The form's action is what runs.

A `<button>` with its own `action` attribute that is **not** inside a form, or that is not `type="submit"`, triggers a click action:

```html
<form action="saveForm">
  <button type="submit">Save</button>           <!-- triggers saveForm -->
  <button type="button" action="cancel">Cancel</button>  <!-- triggers cancel -->
</form>
```

---

## Next

[05 Lifecycle](./05-lifecycle.md)
