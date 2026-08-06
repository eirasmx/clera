# 🤖 Rules for AI

A condensed ruleset for AI tools generating Clera code. These rules prevent the most common mistakes.

---

## 📋 Structure rules

✅ Always wrap everything in `<app>`
✅ Every screen is a `<page name="...">` inside `<app>`
✅ Set `id` and `class` on `<page>` elements for CSS targeting
✅ Include `<script src="clera.js"></script>` before your own scripts
✅ One `<app>` per file. Never two.

❌ Never put content outside `<app>` except `<script>` and `<link>` tags
❌ Never nest `<app>` inside another element
❌ Never create multiple `<app>` elements

---

## 📋 JavaScript rules

✅ Write plain global functions: `function myAction() {}`
✅ Use `context` as the first parameter when you need it
✅ Use `async function` for async work
✅ Keep functions focused. One action, one job.

❌ Never use `import` or `export`
❌ Never use React, Vue, Svelte, or any framework
❌ Never write classes for actions or page logic
❌ Never use arrow functions as top-level action declarations. They do not get hoisted and may not be available at action resolution time.
❌ Never register actions before using them. Just write the function.

---

## 📋 Action rules

✅ HTML `action` attribute value must exactly match the JS function name
✅ Functions can ignore `context` if not needed
✅ Async actions are fine. Clera handles the returned Promise.

❌ Never use `app.actions = { ... }` unless you need page-local scoping
❌ Never use `onclick="..."` for actions. Use `action="..."` instead.
❌ Never assume `context` is available outside an action function

---

## 📋 Form rules

✅ Use `<form action="functionName">` for form submissions
✅ Read values with `context.values.fieldName`
✅ Reset with `context.form.reset()`
✅ Multiple fields with the same name become arrays automatically

❌ Never use `document.querySelector` to read form values
❌ Never construct `FormData` manually for normal form fields
❌ Never add `onsubmit="..."`. The `action` attribute handles submission.

---

## 📋 DOM rules

✅ Use `context.render("#selector", html)` to replace content
✅ Use `context.append("#selector", html)` to add content
✅ Use `context.clear("#selector")` to empty an element
✅ Use `context.query("#selector").text(value)` for text updates
✅ Use `{ reserveHeight: true }` on render() for content-heavy containers

❌ Never use `document.querySelector` for DOM updates. Use `context` helpers instead.
❌ Never set `innerHTML` directly. Use `context.render()`.
❌ Never reach outside the current page's DOM in action functions

---

## 🎨 Styling rules

✅ Target pages with `page { }`, `#home { }`, `.myClass { }`
✅ Set `id` and `class` on `<page>` in HTML to enable these selectors
✅ Use `app[data-layout="mobile"]` for responsive breakpoints
✅ Use standard CSS with no preprocessors required

❌ Never target `div[data-pwa-page]` directly. Use `page` selectors.
❌ Never target the original `<page>` element expecting it to be in the DOM. It is extracted at boot.

---

## 🧭 Navigation rules

✅ Use `page="pageName"` attribute for declarative navigation
✅ Use `context.navigate("pageName")` for programmatic navigation
✅ Use `context.params` to receive data on the target page

❌ Never use `href` for in-app navigation. Use `page="..."` instead.
❌ Never manipulate `window.location` for page navigation

---

## 🗄️ Memory rules

✅ Use `app.memory` for large datasets, cached API results, session state
✅ Use standard JS to read, mutate, and delete: `app.memory.x = y`, `delete app.memory.x`
✅ Move data into `context.data()` or `app.data()` when the UI needs it
✅ Use memory for data that should survive page navigation without re-fetching

❌ Never use `{memory.x}` in HTML. It is not supported and resolves to `""`.
❌ Never put large datasets directly into `context.data()`. Use memory and slice instead.
❌ Never expect memory mutations to update the DOM automatically

| Mistake | Correct pattern |
|---------|----------------|
| `context.data({ products: allProducts })` with 1000+ items | `app.memory.products = allProducts; context.data({ visible: allProducts.slice(0, 40) })` |
| `<p>{memory.count}</p>` | `context.data({ count: app.memory.products.length })` then `<p>{count}</p>` |

---

## 🧩 Reusable block rules

✅ Use `<template id="...">` for definition-only reusable sources
✅ Use `<div template id="...">` when the source should also render in place
✅ Every template source must have an `id` attribute
✅ Use `<use template="id" />` to instantiate a template
✅ Use `name="..."` on `<use>` when each instance needs independent data
✅ Use `app.map(obj, string)` to build `<use>` strings in loops
✅ Set instance data via `context.instanceName.key = value`

❌ Never put `id` attributes on elements inside templates. They duplicate across clones.
❌ Never use `querySelectorAll("use")`. It hits SVG. Clera uses `use[template]` internally.
❌ Never try to use `app.map()` as a loop. It maps one object to one string only.
❌ Never use a reserved context name as an instance name (`navigate`, `render`, `data`, etc.)
❌ Never share the same `name` across two `<use>` elements on the same page

| Mistake | Correct pattern |
|---------|----------------|
| `<div id="card-title">` inside template | `<div class="card-title">` |
| `<use template="card"></use>` | `<use template="card" />` |
| Loop with `app.map()` expecting DOM output | `app.map()` builds a string; `context.render()` does DOM |
| `context.featured = { name: "X" }` | `context.featured.name = "X"` (mutate the object, do not replace it) |

---

## 👂 Page listener rules

✅ Use `context.listen(selector, event, callback)` for page-scoped event listeners
✅ Register listeners in `onCreate`. They persist across renders automatically.
✅ Use `off()` to remove a listener rule when no longer needed
✅ Listeners rebind automatically after `context.render()`, `context.append()`, and `context.clear()`

❌ Never re-call `context.listen()` with the same callback after a render. It is idempotent.
❌ Never use raw `element.addEventListener()` expecting Clera to auto-sync. Use `context.listen()` instead.
❌ Never assume `context.listen()` works outside a mounted page. It requires `pageRecord.rootElement`.

| Mistake | Correct pattern |
|---------|----------------|
| `element.addEventListener("click", handler)` then `app.update()` | `context.listen("#el", "click", handler)` |
| Re-calling `context.listen()` after every `context.render()` | Register once in `onCreate`. Rebind is automatic. |

---

## 🗄️ Data system rules

✅ Use `app.data({ key })` for global data shared across all pages
✅ Use `context.data({ key })` for page-local data
✅ Access bound data directly: `context.stats.count`, `app.user.name`
✅ Use `{path}` dot-notation bindings in HTML: `{user.name}`, `{stats.count}`
✅ Use `context.fetch()` for network requests. It auto-updates the DOM.
✅ Use `context.timeout()` for delayed mutations. It auto-updates the DOM.
✅ Call `context.update()` or `app.update()` after mutations outside Clera handlers

❌ Never use a reserved key name as a data key (`navigate`, `render`, `pageName`, etc.)
❌ Never call `context.update()` inside a Clera handler. It is automatic there.
❌ Never deep-clone data before passing to `context.data()`. References are the point.
❌ Never use `{user.getName()}`. Binding syntax accepts data paths only, not expressions.

| Mistake | Correct pattern |
|---------|----------------|
| `setTimeout(() => { context.stats.count++; })` | `context.timeout(() => { context.stats.count++; }, 0)` |
| `fetch("/api").then(r => r.json()).then(d => { ... context.update(); })` | `await context.fetch("/api")` |
| `context.data({ navigate: {...} })` | Choose a non-reserved key name |
| `{user.getName()}` in HTML | `{user.name}` (paths only) |

---

## ⚠️ Common mistakes to avoid

| Mistake | Correct pattern |
|---------|----------------|
| `const addTask = (ctx) => { }` as a top-level action | `function addTask(context) { }` |
| `document.querySelector('#title').value` | `context.values.title` |
| `document.getElementById('list').innerHTML = html` | `context.render('#list', html)` |
| `<button onclick="doThing()">` | `<button action="doThing">` |
| `import { something } from './module'` | Just write the function globally |
| Styling `page[name="home"]` | `#home` with `id="home"` on the page element |

---

## Next

[04 Component Generation and App Scaffolding Prompts](./04-prompts.md)
