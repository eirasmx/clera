# 📦 Splitting Your App Across Files

As an app grows, keeping everything in one `index.html` becomes difficult to manage. Clera's `<import>` tag lets you split your HTML across multiple files and assemble them at boot time. The result is identical to writing everything in one file. Where you place `<import>` is where the content appears.

---

## 🧩 The model

`<import>` is a static file assembler, not a dynamic loader. It runs once at boot, before any pages are registered. By the time your lifecycle functions run, Clera has already assembled the full DOM and has no knowledge of which content came from which file.

```html
<!-- index.html -->
<app>
  <import src="./auth.html">
  <import src="./dashboard.html">
  <page name="home">...</page>
</app>
```

After resolution, the DOM looks exactly as if all the content had been written inline. The two `<import>` elements are replaced by whatever is inside `auth.html` and `dashboard.html`.

---

## 📝 Syntax

```html
<import src="path/to/file.html">
<import src="path/to/file.html" scope="page,template">
```

`src` is required. The path is relative to the file containing the `<import>` tag.

`scope` is optional. When present, only elements whose tag name appears in the comma-separated list are pulled through. When absent, everything is imported.

---

## 📍 Valid placement

`<import>` is valid in three positions:

- Direct child of `<app>`
- Direct child of `<head>`
- Direct child of `<body>` (uncommon, but supported)

Placing it inside a `<page>`, `<tabbar>`, or any other nested element is not allowed. Clera emits a warning and removes the element:

```
[CLERA:IMPORT_WRONG_SCOPE] <import src="./components.html"> found inside <page>. <import> is only valid as a direct child of <app> or the document body.
```

```html
<!-- Valid: inside <app> -->
<app>
  <import src="./auth.html">
  <page name="home">...</page>
</app>

<!-- Valid: inside <head>, for pulling in shared stylesheets or scripts -->
<head>
  <import src="./shared-head.html">
</head>

<!-- Invalid: <import> is inside a <page> -->
<app>
  <page name="home">
    <import src="./components.html">
  </page>
</app>
```

---

## 📂 Imported file shapes

An imported file can be written in three ways. All three produce identical output.

**Full HTML document:**

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="./auth.css">
    <script src="./auth.js"></script>
  </head>
  <body>
    <page name="login">...</page>
    <page name="register">...</page>
  </body>
</html>
```

**Bare fragment:**

```html
<page name="login">...</page>
<page name="register">...</page>
```

**App-wrapped:**

```html
<app>
  <page name="login">...</page>
  <page name="register">...</page>
</app>
```

Clera strips the `<!DOCTYPE>`, `<html>`, `<head>`, `<body>`, and `<app>` wrappers as needed. What remains is the content that gets assembled into the host document.

---

## 🏗️ What gets imported

### Head content

All children of `<head>` in the imported file are hoisted to the `<head>` of the host document. This includes `<script>`, `<link>`, `<style>`, `<meta>`, and anything else valid in a document head.

`<script src="...">` elements are reconstructed with resolved absolute URLs so the path remains correct relative to the host document. All other head elements are copied as-is.

> ⚠️ Relative URLs in `<link href="...">` and inline `<style>` blocks are not rewritten. Use paths that are correct relative to your host document, or use absolute URLs.

Deduplication is not performed. If two imported files declare the same stylesheet, both `<link>` tags are appended. Avoid duplicate declarations across imported files.

### Body content

Everything inside `<body>`, inside an `<app>` wrapper, or at the bare fragment root expands in place at the `<import>` position.

Inline `<style>` elements found in body content are hoisted to the host document head alongside head content. Inline styles have no timing dependency and belong in `<head>`.

Inline `<script>` elements found in body content expand in place at the `<import>` position, preserving your intended execution order relative to the DOM. A `<script>` at the bottom of a body runs after the DOM is parsed. Hoisting it to `<head>` would change that behaviour, so Clera does not.

---

## 🔽 Position matters

The `<import>` element is replaced by the resolved content at its exact position. This determines where imported content lands relative to inline content.

```html
<!-- Before resolution -->
<app>
  <import src="./auth.html">
  <page name="home">...</page>
  <import src="./ui.html" scope="template">
</app>

<!-- After resolution -->
<app>
  <page name="login">...</page>     <!-- from auth.html -->
  <page name="register">...</page>  <!-- from auth.html -->
  <page name="home">...</page>      <!-- inline -->
  <template id="card">...</template> <!-- from ui.html, scope filtered -->
</app>
```

If you import content that should appear after your inline pages, place the `<import>` after them.

---

## 🔍 Scope filtering

When `scope="tagname,tagname"` is present, only elements whose tag name matches the list are pulled through. The filter applies to both head and body content.

```html
<!-- Import only pages -->
<import src="./ui.html" scope="page">

<!-- Import only templates -->
<import src="./ui.html" scope="template">

<!-- Import templates and their stylesheet dependencies -->
<import src="./ui.html" scope="template,link">

<!-- Import only head resources -->
<import src="./ui.html" scope="link,style,script,meta">
```

Tag names in `scope` are case-insensitive. Whitespace around commas is ignored. An unrecognised tag name silently matches nothing.

Scope filtering is applied after all nested imports inside the imported file have been fully resolved. The filter sees the final merged content, not the raw source.

---

## 🔗 Nested imports

Imported files can themselves contain `<import>` tags at their content root level. These resolve depth-first before the parent import expands.

```html
<!-- dashboard.html -->
<app>
  <import src="./charts.html">
  <page name="dashboard">...</page>
</app>
```

Resolution order: `charts.html` resolves fully first, then `dashboard.html`'s content expands into the host document. Any `scope=` on the host's `<import src="dashboard.html">` applies after this full resolution.

---

## 🔄 Circular import protection

If file A imports file B and file B imports file A, the second visit to file A is detected and stopped. Clera emits an error and removes the circular `<import>`:

```
[CLERA:CIRCULAR_IMPORT] Circular import detected: "auth.html" has already been visited in this import chain.
```

---

## ⚠️ Diagnostic codes

| Code | When it fires |
|---|---|
| `IMPORT_WRONG_SCOPE` | `<import>` found inside a `<page>` or other non-root element |
| `IMPORT_MISSING_SRC` | `<import>` has no `src` attribute |
| `IMPORT_FETCH_FAILED` | File could not be fetched (network error or HTTP error) |
| `CIRCULAR_IMPORT` | Import chain revisited an already-visited file |

`IMPORT_WRONG_SCOPE` and `IMPORT_MISSING_SRC` are warnings. `IMPORT_FETCH_FAILED` and `CIRCULAR_IMPORT` are errors. In all four cases the `<import>` element is removed and resolution continues.

---

## 💡 Practical example

A medium-sized app split into three files:

```
my-app/
  index.html
  auth.html
  dashboard.html
  clera.js
  style.css
  script.js
```

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>My App</title>
    <script src="clera.js"></script>
    <script src="script.js"></script>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <app>
      <import src="./auth.html">
      <import src="./dashboard.html">
      <tabbar>
        <tab page="home">Home</tab>
        <tab page="settings">Settings</tab>
      </tabbar>
    </app>
  </body>
</html>
```

```html
<!-- auth.html -->
<page name="login">
  <h1>Sign in</h1>
  <input type="email" name="email" placeholder="Email">
  <input type="password" name="password" placeholder="Password">
  <button action="submitLogin">Sign in</button>
</page>

<page name="register">
  <h1>Create account</h1>
  <input type="email" name="email" placeholder="Email">
  <button action="submitRegister">Create account</button>
</page>
```

```html
<!-- dashboard.html -->
<page name="home">
  <h1>Welcome back</h1>
  <div id="summary"></div>
</page>

<page name="settings">
  <h1>Settings</h1>
</page>
```

At boot, Clera resolves both imports in order. The final DOM is identical to writing all four pages in `index.html` directly.

---

## ❌ What `<import>` does not do

`<import>` is a static assembler only. It has no dynamic capabilities:

- No `lazy` loading after boot
- No `if` conditional imports
- No runtime re-importing

If you need to load content dynamically after the page has booted, use navigation and page lifecycle hooks. Pages in Clera are lazy-mounted by default: a page's content is not processed until the first time a user navigates to it.

---

## Next

[14 Memory](./14-memory.md)
