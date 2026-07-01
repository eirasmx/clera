# 🗂️ Project Structure

Clera does not require a specific folder structure. There is no scaffolding tool, no required config file, and no folder names the runtime depends on. You can organise your files however makes sense for your project.

That said, the structure below works well for most apps and is a good starting point.

---

## Minimal structure

For a simple app, everything can live in one folder:

```
my-app/
  index.html      the app (all pages are defined here)
  clera.js        the runtime
  style.css       all styles
  script.js       all JavaScript
```

This is enough for small apps. Keep it flat until you have a reason to add folders.

---

## Recommended structure for larger apps

As an app grows, splitting JavaScript by page keeps things manageable:

```
my-app/
  index.html
  clera.js

  css/
    base.css        reset overrides, custom properties, typography
    pages.css       per-page styles
    components.css  shared UI pieces

  js/
    home.js         actions and logic for the home page
    profile.js      actions and logic for the profile page
    settings.js     actions and logic for the settings page
    shared.js       helper functions used across pages

  assets/
    icons/
    images/
    fonts/
```

Include each JavaScript file in `index.html`:

```html
<script src="js/shared.js"></script>
<script src="js/home.js"></script>
<script src="js/profile.js"></script>
<script src="js/settings.js"></script>
```

Order matters only if one file uses functions defined in another. `shared.js` should come first if other files call functions from it.

---

## Splitting pages across files with `<import>`

For large apps, you can split pages into separate HTML files and pull them in with `<import src="...">`. Clera resolves each import at boot, inline, before pages are extracted.

```html
<!-- index.html -->
<app>
  <import src="pages/home.html">
  <import src="pages/profile.html">
  <import src="pages/settings.html">
</app>
```

Each imported file holds one or more `<page>` elements:

```html
<!-- pages/home.html -->
<page name="home">
  <h1>Home</h1>
  <button action="loadFeed">Load</button>
</page>
```

Scripts in imported files are resolved too. A `<script>` tag in the `<head>` or body of an imported file is injected into the document at the import site:

```html
<!-- pages/home.html -->
<script src="js/home.js"></script>

<page name="home">
  ...
</page>
```

`<import>` tags must be direct children of `<app>` or `<head>`. They are removed from the DOM once resolved.

Imports are recursive. An imported file can itself contain `<import>` tags. Circular imports are detected and blocked:

```
[CRE:CIRCULAR_IMPORT] Circular import detected: "pages/home.html" has already been visited in this import chain.
```

If a file fails to load, the import is skipped and a warning is logged:

```
[CRE:IMPORT_FETCH_FAILED] Failed to fetch import "pages/missing.html": HTTP 404.
```

---

## The HTML file

All of your pages are defined in `index.html`. There is no file-per-page system in Clera. Every `<page>` element lives in the same HTML file inside `<app>`:

```html
<app>
  <page name="home">...</page>
  <page name="profile">...</page>
  <page name="settings">...</page>
</app>
```

For very large apps with many pages, this file can get long. That is fine. The pages are extracted by the runtime at boot and do not affect performance based on how many are defined.

---

## Assets

Clera places no restrictions on how you organise assets. Reference them in your HTML and CSS using relative paths from `index.html`:

```html
<img src="assets/images/logo.png">
```

```css
@font-face {
  font-family: "DM Sans";
  src: url("assets/fonts/DMSans-Regular.woff2") format("woff2");
}
```

---

## What Clera itself needs

The runtime only requires two things to be true:

1. `clera.js` is included via a `<script>` tag
2. There is exactly one `<app>` element in the document with at least one `<page name="...">` inside it

Everything else is up to you.

---

## Next

[05 Running and Preview](./05-running-and-preview.md)
