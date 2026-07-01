# 📝 The Clera Language

`.clera` is a minimal source format for writing Clera apps. It is a slight simplification of HTML that a transpiler converts into a standard, runtime-ready HTML document.

---

## Why it exists

A standard HTML file requires boilerplate before you write any app code:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My App</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
<app>
  ...
</app>
<script src="clera.js"></script>
<script src="app.js"></script>
</body>
</html>
```

In a `.clera` file, you skip the scaffolding and write only what matters:

```html
<title>My App</title>
<link rel="stylesheet" href="style.css">

<app>
  ...
</app>

<script src="app.js"></script>
```

The transpiler produces the full HTML document from this. The `DOCTYPE`, `<html>`, `<head>`, `<body>`, charset, viewport, and `clera.js` script tag are all handled automatically.

---

## 🔧 What the transpiler does

1. Collects head declarations (`title`, `meta`, `link`, `style`, `script`) from the source
2. Validates that exactly one `<app>` block exists
3. Injects `charset` and `viewport` defaults if not declared
4. Wraps everything in a proper `<!DOCTYPE html>` document
5. Places `clera.js` before any body-end scripts
6. Returns the complete HTML string

---

## 🔧 What it does not do

The transpiler is intentionally minimal. It does not:

- Transform JavaScript
- Process CSS
- Support imports or includes
- Minify or bundle assets
- Add any runtime behaviour

It is a document normaliser, not a build tool.

---

## 🛠️ Clera Studio support

Clera Studio handles `.clera` files natively. Open a `.clera` file in Clera Studio and you get syntax highlighting, live preview, and one-click HTML export without any manual transpiler setup. The transpiler runs automatically in the background as you edit.

---

## 🏷️ Clera core tags

The Clera runtime recognises these tags and manages them directly. They are not standard HTML elements.

| Tag | Purpose |
|-----|---------|
| `<app>` | Root of every Clera application. Required. |
| `<page>` | A single screen. Mounted and unmounted by the router. |
| `<splash>` | Shown during boot, hidden once the first page mounts. |
| `<tabbar>` | Fixed tab strip for bottom or top navigation. |
| `<tab>` | A single tab inside `<tabbar>`. |
| `<nav>` | Responsive navigation bar. Repositions automatically at different screen sizes. |
| `<sidebar>` | Fixed side drawer. Slides in from the left or right edge. |

All other tags inside a Clera app are treated as standard HTML.

---

## Next

[02 Writing .clera Files](./02-writing-clera-files.md)
