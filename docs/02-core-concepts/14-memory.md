# 🧠 Memory

When you fetch data from an API, you often get back far more than the current page needs to display. A product catalogue with 2,000 items. A message history with 500 entries. A full user dataset.

If you pass all of that into Clera's data system, the binding engine has to scan every key on every update cycle. For small UI state that overhead is nothing. For large datasets it adds up and the app slows down.

`app.memory` solves this. It is a plain JavaScript object that lives completely outside the binding engine. Clera never watches it, never scans it, and never patches the DOM because of it. You use it as an immediate data cache: load your full dataset once, keep it in memory, then pull only what the current view needs into the binding system.

```js
// 2,000 items loaded once: Clera never touches this
app.memory.products = apiResponse.products;

// Only 40 items enter the binding system
context.data({
  visibleProducts: app.memory.products.slice(0, 40)
});
```

The binding engine only ever sees 40 items no matter how large the full dataset grows. Memory access is instant because it is just a plain object lookup.

This is Clera's memory management model. `app.memory` is the holding layer. `context.data()` and `app.data()` are the display layer. Data flows one way:

```
app.memory  →  context.data / app.data  →  UI
```

---

## 🎯 The rule

> Store large or non-UI data in `app.memory`. Expose only what the current view needs via `context.data()` or `app.data()`.

---

## 🧠 The model

```
app.memory    →  holding layer: large datasets, cache, session state
app.data      →  global display layer: small, reactive, drives the DOM
context.data  →  page display layer: scoped to one page, reactive
```

**Memory holds data. Data drives the UI.**

---

## ⚙️ Basic usage

`app.memory` is a plain object. No methods, no wrappers. Standard JavaScript throughout:

```js
// Store
app.memory.products = result.products;

// Read
const all = app.memory.products;

// Mutate
app.memory.products.push(newProduct);
app.memory.products.splice(0, 1);

// Delete a key
delete app.memory.products;

// Check if a key exists
"products" in app.memory;

// List all keys
Object.keys(app.memory);

// Clear everything
Object.keys(app.memory).forEach(k => delete app.memory[k]);
```

---

## 💡 Load once, paginate from memory

The most common pattern. Fetch the full dataset once, then slice it on demand without re-fetching:

```js
async function loadStore(context) {
  const result = await context.fetch("/api/products");

  app.memory.products    = result.products;
  app.memory.currentPage = 0;

  context.data({
    visibleProducts: app.memory.products.slice(0, 40)
  });
}

function nextPage(context) {
  const page = (app.memory.currentPage || 0) + 1;
  app.memory.currentPage = page;

  context.data({
    visibleProducts: app.memory.products.slice(page * 40, (page + 1) * 40)
  });
}

function prevPage(context) {
  const page = Math.max(0, (app.memory.currentPage || 0) - 1);
  app.memory.currentPage = page;

  context.data({
    visibleProducts: app.memory.products.slice(page * 40, (page + 1) * 40)
  });
}
```

The full catalogue never touches the binding engine. Only the current page slice does.

---

## 💡 Cache across page navigation

`app.memory` survives navigation. Page-local context data does not. This makes memory the right place for results that multiple pages need:

```js
// Page A: load and cache
async function loadProducts(context) {
  if (!app.memory.products) {
    const result = await context.fetch("/api/products");
    app.memory.products = result.products;
  }
  context.data({ count: app.memory.products.length });
}

// Page B: read without re-fetching
function loadCart(context) {
  const product = app.memory.products.find(p => p.id === context.params.id);
  context.data({ product });
}
```

---

## 💡 Session and auth state

Good for data that is not UI state but needs to be accessible everywhere across the app:

```js
// After login
app.memory.session = {
  token:  result.token,
  userId: result.userId,
  role:   result.role
};

// Any page, any action
function loadAdminPanel(context) {
  if (app.memory.session.role !== "admin") {
    context.navigate("home");
    return;
  }
  // ...
}
```

---

## ⚠️ Memory is not bindable

`{memory.products}` in HTML does not work. `app.memory` is not in the binding engine's resolution chain. It resolves to `""` and logs `[CLERA:BINDING_UNRESOLVED]` in dev mode.

```html
<!-- does not work -->
<p>{memory.products.length} items</p>

<!-- correct: move the value into data first -->
<p>{productCount} items</p>
```

```js
context.data({ productCount: app.memory.products.length });
```

---

## 📋 What to store where

| Data | Store in | Reason |
|------|----------|--------|
| Full API datasets | `app.memory` | Too large for the binding engine |
| Cached results used across pages | `app.memory` | Survives navigation |
| Session and auth state | `app.memory` | Global, not UI |
| What is visible on screen right now | `context.data()` | Page-scoped, needs binding |
| Small global UI state (user, theme) | `app.data()` | Small, shared, needs binding |
| Page-local filters or view state | `context.data()` | Scoped, needs binding |

---

## Next

[15 Page Listeners](./15-page-listeners.md)
