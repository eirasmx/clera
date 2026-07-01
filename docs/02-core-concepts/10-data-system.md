# 🗄️ Data System


Clera provides a lightweight data system for keeping UI in sync with application state, without a reactive framework. You assign values to plain JavaScript objects and Clera automatically updates the matching parts of the page.

---

## 🎯 The model

Two scopes. Plain JavaScript objects. Automatic DOM updates inside Clera-controlled execution.

```js
// 🌍 Global: shared across all pages
const user = { name: "Michael" };
app.data({ user });

// 📄 Page-local: belongs to one page only
function loadHome(context) {
  const stats = { count: 0 };
  context.data({ stats });
}
```

```html
<!-- {path} bindings resolve automatically -->
<h1>Hello, {user.name}</h1>
<p>{stats.count} tasks</p>
```

---

## 🌍 app.data(sourceObject)

Attaches global data available across the entire app. Merges by reference. It never replaces existing global data.

```js
const user  = { name: "Michael" };
const theme = { mode: "dark" };

app.data({ user, theme });
```

After this call:
- `app.user` → direct reference to the `user` object
- `app.theme` → direct reference to the `theme` object
- Every page's `context.user` and `context.theme` resolve from global data

⚠️ **Merge rule**: multiple calls merge, not replace:

```js
app.data({ user });   // global: { user }
app.data({ theme });  // global: { user, theme }: user is still there
```

---

## 📄 context.data(sourceObject)

Attaches page-local data for the current page only. Merges into the page's own data scope.

```js
function loadDashboard(context) {
  const stats   = { count: 0, total: 100 };
  const filters = { active: true };
  context.data({ stats, filters });
}
```

After this call:
- `context.stats` and `context.filters` are available directly
- These values do not leak to other pages
- If global data has a key with the same name, the page-local value wins on this page

---

## 🔍 Resolution order

When Clera resolves a `{path}` binding:

| Priority | Source |
|----------|--------|
| 1 | Page-local data (`context.data`) |
| 2 | Global data (`app.data`) |
| 3 | `""` empty string fallback |

```js
app.data({ user: { name: "Global Michael" } });

function loadProfile(context) {
  context.data({ user: { name: "Page Paul" } });
}
```

```html
<h1>{user.name}</h1>
<!-- On the profile page: "Page Paul" -->
<!-- On all other pages:  "Global Michael" -->
```

---

## 🔗 Objects are shared, not copied

Clera stores a reference to the object you pass in, not a copy of it. Mutating through context or through the original object are identical:

```js
const stats = { count: 0 };
context.data({ stats });

context.stats === stats  // true: same object

context.stats.count = 5;  // both paths mutate the same object
stats.count = 5;          // identical result
```

---

## 🧩 {path} binding syntax

Use dot-notation paths directly in HTML text content or attributes:

```html
<h1>Hello, {user.name}</h1>
<p class="{theme.mode}">{stats.count} items</p>
<input placeholder="{form.placeholder}">
```

**Rules:**
- ✅ Dot notation. `{user.name}`, `{stats.count}`
- ✅ Multiple bindings per text node or attribute
- ❌ No expressions. `{count + 1}` does not work
- ❌ No function calls. `{user.getName()}` does not work
- ❌ No conditionals or loops. Bindings are for values only.

Bindings are scanned when a page mounts and when `render()` or `append()` injects new HTML.

---

## ⚡ Auto-update: inside Clera execution

When data mutates inside a Clera-controlled handler, the DOM updates automatically. No extra call needed:

```js
function increment(context) {
  context.stats.count += 1;
  // DOM updates automatically
}
```

Clera-controlled execution includes:
- ✅ Action handlers (`action="..."`)
- ✅ Form action handlers
- ✅ Lifecycle hooks (`oncreate`, `onshow`, `onhide`, `ondestroy`)
- ✅ `context.fetch()` callbacks and `await` resolution
- ✅ `context.timeout()` callbacks

---

## 🛠️ Manual update: outside Clera execution

Raw `setTimeout`, raw `fetch`, or any code outside a Clera handler requires a manual update call:

```js
// Raw setTimeout: Clera doesn't know when this runs
setTimeout(() => {
  context.stats.count += 1;
  context.update();  // manual trigger required
}, 1000);

// Raw fetch: same rule
fetch("/api/data").then((res) => res.json()).then((data) => {
  app.user.name = data.name;
  app.update();   // manual trigger required
});
```

Use `context.fetch()` and `context.timeout()` to avoid needing manual updates. See [11 Async Helpers](./11-async-helpers.md).

---

## ⚠️ Reserved key names

Data keys that match Clera's built-in property names are rejected with a `[CLERA:DATA_KEY_RESERVED]` warning and skipped. Choose a different key name.

If you try to use a reserved name, Clera logs `[CLERA:DATA_KEY_RESERVED]` and skips that key. Choose a different name.

**Reserved context keys:** `pageName`, `params`, `event`, `element`, `navigate`, `back`, `data`, `update`, `fetch`, `timeout`, `query`, `render`, `append`, `clear`, `unsafe`, `log`

**Reserved CLERA keys:** `version`, `start`, `config`, `page`, `navigate`, `currentPage`, `layout`, `onLayoutChange`, `hardware`, `bridge`, `sw`, `actions`, `data`, `update`, `php`, `diagnostics`

---

## 💡 Recommended mental model

```js
// Global app-wide data: set before or after boot
app.data({ user, theme, session });

// Page-local data: set in lifecycle hooks
function loadHome(context) {
  context.data({ stats, filters, draft });
}

// Mutate naturally: auto-updates inside Clera handlers
function rename(context) {
  context.user.name = "Paul";     // updates DOM automatically
}

// Manual update when outside Clera execution
app.user.name = "Paul";
app.update();
```

---

## Next

[11 Async Helpers](./11-async-helpers.md)
