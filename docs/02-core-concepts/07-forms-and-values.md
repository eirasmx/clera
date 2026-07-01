# 📝 Forms and Values

Clera automatically collects form values on submission and exposes them on `context`. No manual `FormData` construction or `querySelector` needed.

---

## 💡 Basic usage

```html
<form action="addTask">
  <input name="title" placeholder="Task title">
  <select name="priority">
    <option value="low">Low</option>
    <option value="high">High</option>
  </select>
  <button type="submit">Add</button>
</form>
```

```js
function addTask(context) {
  console.log(context.values.title);    // "Buy milk"
  console.log(context.values.priority); // "high"
}
```

---

## 🔧 How it works

When a form with an `action` attribute is submitted, Clera:

1. Prevents the default browser submission
2. Collects all form values into a plain object
3. Passes it to the action function as `context.values`

This replaces the need to write:

```js
// You never need to write this in Clera:
const input = document.querySelector('input[name="title"]');
const value = input.value;
```

---

## 📝 Multiple values (checkboxes, multi-selects)

If multiple fields share the same name, `context.values[name]` becomes an array:

```html
<input type="checkbox" name="tags" value="design" checked>
<input type="checkbox" name="tags" value="code" checked>
```

```js
context.values.tags // ["design", "code"]
```

---

## 📋 Empty fields

If a field is present but empty, its value is an empty string:

```js
context.values.title // ""
```

Fields not submitted by the browser (unchecked checkboxes, disabled inputs) do not appear in `context.values`: this matches standard `FormData` behaviour.

---

## 🔧 Resetting the form

Clera does not automatically reset forms after submission. The developer controls this explicitly:

```js
function addTask(context) {
  const title = context.values.title.trim();
  if (!title) return;

  tasks.push(title);
  context.form.reset(); // or: context.resetForm()
  renderTasks(context);
}
```

---

## ⚠️ Double-submit protection

Clera blocks duplicate submissions automatically. If a form is already submitting (e.g. waiting for an async action to complete), a second submit is ignored and a warning is logged:

```
[CLERA:FORM_DOUBLE_SUBMIT] Blocked duplicate submit (page "home").
```

---

## 🔧 Advanced: raw FormData

For file uploads or other low-level needs, the raw `FormData` object is available:

```js
function uploadFile(context) {
  const file = context.formData.get("attachment");
  // use file as needed
}
```

---

## 🔧 Advanced: submitter button

If the form has multiple submit buttons with different values, check which one was used:

```html
<form action="savePost">
  <button type="submit" value="draft">Save Draft</button>
  <button type="submit" value="publish">Publish</button>
</form>
```

```js
function savePost(context) {
  const action = context.submitter?.value; // "draft" or "publish"
}
```

---

## Next

[08 Rendering Helpers](./08-rendering-helpers.md)
