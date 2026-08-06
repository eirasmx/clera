# 🧩 Reusable Blocks

Clera's reusable block system lets you mark any HTML element as a reusable source and instantiate it anywhere with `<use />`. It is not a component system: it is reusable HTML with minimal syntax.

---

## 🎯 The model

Five pieces that work together:

| Piece | Role |
|-------|------|
| `<template id="...">` | Definition-only source: not rendered |
| `<div template id="...">` | Live source: renders in place and is reusable |
| `<use template="..." />` | Void instantiation: no overrides |
| `<use template="..."></use>` | Container instantiation: with `target=` overrides |
| `app.map(data, string)` | Builds `<use>` strings from objects |

---

## 🧩 Declaring a reusable source

### `<template id="...">`: definition only

Native HTML `<template>` element. Not rendered. Used only as a reusable source. Preferred for blocks you never want appearing inline.

```html
<template id="card">
  <div class="card">
    <h2>{name}</h2>
    <p>{price}</p>
  </div>
</template>
```

---

### `[template]` attribute: live reusable

Any element with the `template` attribute renders normally and is registered as a reusable source. Its clones become the binding targets, not the source itself.

```html
<div template id="hero-card">
  <div class="hero">
    <h2>{title}</h2>
    <p>{subtitle}</p>
  </div>
</div>
```

---

### 📋 ID is required

Every reusable source must have an `id`. Without it, Clera warns in dev mode:

```
[CLERA:TEMPLATE_ID_REQUIRED] A [template] element is missing an id attribute.
```

---

### ⚠️ No inner ids

Elements inside templates must not use `id` attributes. Each clone would produce a duplicate `id` in the DOM. Clera warns in dev mode:

```
[CLERA:TEMPLATE_INNER_ID]
```

Use `class` for styling. Use `slot=` to name nodes for targeting (see below). Do not use `id` attributes inside templates.

---

## ⚡ Instantiating with `<use />`

`<use template="id" />` is replaced by a clone of the referenced template when the page mounts. Clera uses `querySelectorAll("use[template]")` internally. SVG `<use href="...">` elements are never affected.

---

## 🔄 Two template classifications

Clera classifies every registered template as either **void** or **container** at registration time.

| Classification | Condition | Required `<use>` form |
|---|---|---|
| Void | Source is a `<template>` tag, or a live element with no children | Self-closing: `<use template="..." />` |
| Container | Source is a live element with child elements | Open/close: `<use template="..."></use>` |

The names come from HTML: void elements are self-closing (`<br>`, `<img>`). Same idea here. If your template has no children it is void and uses self-closing syntax. If it has children it is a container and uses open/close syntax.

Using the wrong form produces a shape mismatch warning and the `<use>` is removed:

```
[CLERA:USE_SHAPE_MISMATCH] <use template="card">: shape mismatch.
Void template requires self-closing <use />
```

---

## 🏷️ Naming nodes with `slot=`

Container templates can give any descendant a name using the `slot=` attribute. Named nodes are the recommended way to identify targets for overrides.

```html
<template id="product-row">
  <div class="row">
    <img slot="thumbnail" src="{img}" alt="">
    <span slot="label">{name}</span>
    <span slot="price">{price}</span>
  </div>
</template>
```

`slot=` names survive into the expanded clone and are never stripped. This means you can also target them with CSS:

```css
[slot="price"] { font-weight: bold; }
```

Slot names are your stable, readable handles for overrides. You write the name yourself, so it never changes unless you change it.

> ⚠️ `slot=` is a Clera targeting attribute. It is not the same as the `slot` attribute used by native Web Components shadow DOM. Clera does not use shadow DOM.

---

## 🎯 Container overrides with `target=`

Container `<use>` elements can override specific nodes inside the clone. Each direct child of the `<use>` must carry a `target=` attribute identifying which node to replace.

`target=` accepts either a slot name or a raw `data-cre-nid` value. Slot names are resolved first.

```html
<template id="product-row">
  <div class="row">
    <img slot="thumbnail" src="{img}" alt="">
    <span slot="label">{name}</span>
    <span slot="price">{price}</span>
  </div>
</template>

<use template="product-row">
  <span target="price">$49.00</span>
</use>
```

The `target="price"` child replaces the node with `slot="price"` in the clone.

### About `data-cre-nid`

When Clera registers a container template it stamps each descendant with a `data-cre-nid` attribute in depth-first order starting from `0`. These are internal identifiers used by the renderer. You do not write them yourself.

`target=` accepts raw nid values as a fallback when no matching `slot=` name is found. Raw nids are supported for backward compatibility, but slot names are the recommended way to reference template nodes because they are readable and stable across structural changes.

> 💡 Clera Studio overlays both slot names and nid values on the rendered template so you can see which nodes are targetable without inspecting the DOM manually.

---

### Symmetric override

The override element has the same tag as the template node it targets. Clera replaces only the text content. All attributes and the `data-cre-nid` value on the template node are preserved.

Use this when the structure stays the same and only the text changes.

```html
<template id="price-row">
  <div class="row">
    <span slot="label">{label}</span>
    <span slot="value">{value}</span>
  </div>
</template>

<use template="price-row">
  <span target="value">$49.00</span>
</use>
```

Result: the `<span slot="value">` in the clone keeps its tag and attributes, but its text becomes `$49.00`.

---

### Asymmetric override

The override element has a different tag than the template node it targets. Clera removes the template node entirely and inserts the override element in its place. The node is also removed from Clera's internal renderer cache so it is not reused in future clones.

Use this when you need to swap the element type, for example replacing a `<span>` with an `<a>` or a `<p>` with an `<h3>`.

```html
<template id="card">
  <div class="card">
    <span slot="title">{title}</span>
    <p slot="body">{body}</p>
  </div>
</template>

<use template="card">
  <h2 target="title">Featured Product</h2>
</use>
```

Result: `<span slot="title">` is removed and replaced with `<h2>Featured Product</h2>`. The `<p slot="body">` is untouched and resolves from page data.

If a direct child of `<use>` is missing `target=`, Clera warns and discards the entire `<use>`:

```
[CLERA:USE_TARGET_REQUIRED] Direct child of <use template="product-row"> is missing a target= attribute.
```

If the `target=` value does not match any slot name or nid in the clone, Clera warns and discards the entire `<use>`:

```
[CLERA:UNKNOWN_TARGET] <use template="product-row">: target="badge" not found in clone.
```

---

## 🔄 Two instantiation modes

### Shared mode: no `name`

The clone resolves bindings against page and global data. No instance scope is created.

```html
<use template="card" />
```

```js
function loadHome(context) {
  context.data({ name: "Notebook Pro", price: 1200 });
}
```

---

### Named instance mode: with `name`

Each named `<use>` gets its own isolated data scope, addressable directly on `context`.

```html
<use template="card" name="featured" />
<use template="card" name="sale" />
```

```js
function loadStore(context) {
  context.featured.name  = "Notebook Pro";
  context.featured.price = 1200;

  context.sale.name  = "Clera Phone";
  context.sale.price = 699;
}
```

Duplicate `name` values on the same page produce a warning in dev mode. The second instance reuses the existing scope rather than creating a new one:

```
[CLERA:USE_NAME_DUPLICATE] Duplicate <use> instance name "featured" on page "store". Reusing existing scope.
```

---

## 🔍 Data resolution order

### Shared mode
1. Page-local data (`context.data(...)`)
2. Global data (`app.data(...)`)
3. `""` fallback

### Named instance mode
1. Instance-local data (`context.instanceName.*`)
2. Page-local data
3. Global data
4. `""` fallback

---

## 🗺️ app.map(dataObject, string)

`app.map()` takes a data object and a string containing `{key}` placeholders, and returns a new string with those placeholders replaced by the matching values from the object.

```js
app.map({ id: "a", name: "Notebook" }, `<use template="card" name="{id}" />`)
// returns: '<use template="card" name="a" />'
```

That is all it does. It is a find-and-replace helper that works on strings. It does not loop over a list, it does not touch the page, and it does not render anything. You call it once per item and collect the results yourself.

```js
const products = [
  { id: "notebook-pro", name: "Notebook Pro" },
  { id: "clera-phone", name: "Clera Phone" }
];

let html = "";
for (const product of products) {
  html += app.map(product, `<use template="card" name="{id}" />`);
}

// html is now:
// '<use template="card" name="notebook-pro" /><use template="card" name="clera-phone" />'

context.render("#products", html);
```

Each call to `app.map()` produces one `<use>` string. Joining them all and passing the result to `context.render()` is what puts the list on screen.

### Three placeholder systems

When building dynamic lists you will encounter three different placeholder syntaxes. They look similar but they are handled at completely different stages, by different systems.

| Syntax | What handles it | When |
|--------|----------------|------|
| `${...}` | JavaScript | Before anything else. Evaluated when your script runs. |
| `{key}` | `app.map()` | When you call `app.map()`. Replaced with values from your data object. |
| `{path}` | Clera | Later, when Clera patches the DOM with reactive data. |

The rule is: **each placeholder is handled exactly once, by exactly one system, in the order above.**

This means you can use all three in the same string without them interfering:

```js
const label = "Price";

app.map(
  { id: "notebook-pro", currency: "USD" },
  `<use template="price-row" name="{id}" data-label="${label}" data-currency="{currency}" />`
)
```

Here `${label}` is replaced by JavaScript when the line runs. `{id}` and `{currency}` are replaced by `app.map()`. Any `{path}` inside the template itself is replaced by Clera at render time. None of them overlap.

---

## 💡 Dynamic list rendering

```html
<template id="product-card">
  <div class="product">
    <h3 slot="name">{name}</h3>
    <p slot="price">{price}</p>
  </div>
</template>

<div id="products"></div>
```

```js
async function loadProducts(context) {
  const products = await context.fetch("/api/products");

  let html = "";
  for (const product of products) {
    html += app.map(product, `<use template="product-card" name="{id}" />`);
  }

  context.render("#products", html);

  for (const product of products) {
    context[product.id].name  = product.name;
    context[product.id].price = `$${product.price}`;
  }
}
```

---

## 💡 Static named instances

For a small fixed number of known instances, declare them directly without a loop:

```html
<template id="stat-card">
  <div class="stat">
    <span slot="label" class="label">{label}</span>
    <span slot="value" class="value">{value}</span>
  </div>
</template>

<use template="stat-card" name="users" />
<use template="stat-card" name="sales" />
<use template="stat-card" name="revenue" />
```

```js
function loadDashboard(context) {
  context.users.label   = "Total Users";
  context.users.value   = "12,481";
  context.sales.label   = "Sales Today";
  context.sales.value   = "342";
  context.revenue.label = "Revenue";
  context.revenue.value = "$48,200";
}
```

---

## ⚠️ Reserved instance names

Instance names that match Clera's built-in context properties (`navigate`, `render`, `data`, etc.) are rejected. Choose a different name.

---

## Next

[13 Splitting Your App Across Files](./13-import.md)
