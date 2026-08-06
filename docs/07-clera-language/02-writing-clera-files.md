# 📁 Writing .clera Files

A `.clera` file supports two authoring styles. Both produce identical HTML output. Use whichever feels more natural.

Clera Studio handles `.clera` files natively. Open any `.clera` file in Clera Studio and it provides syntax highlighting, live preview, and one-click export to HTML. No manual transpiler setup required.

---

## Style A: Top-level declarations

Head content is declared at the top of the file, before `<app>`. This is the most compact style.

```html
<title>My App</title>
<link rel="stylesheet" href="style.css">
<meta name="description" content="My Clera app">

<app>
  <page name="home" id="home">
    <h1>Welcome</h1>
    <button page="settings">Settings</button>
  </page>

  <page name="settings" id="settings">
    <h1>Settings</h1>
    <button page="home">Back</button>
  </page>
</app>

<script src="script.js"></script>
```

---

## Style B: Head inside app

Head content is declared inside a `<head>` block within `<app>`. This style mirrors standard HTML structure more closely.

```html
<app>
  <head>
    <title>My App</title>
    <link rel="stylesheet" href="style.css">
  </head>

  <page name="home" id="home">
    <h1>Welcome</h1>
  </page>
</app>

<script src="script.js"></script>
```

---

## Combined style

Both styles can coexist in one file. The transpiler merges them:

```html
<title>Default Title</title>

<app>
  <head>
    <title>Real Title</title>
    <link rel="stylesheet" href="style.css">
  </head>

  <page name="home">
    <h1>Hello</h1>
  </page>
</app>
```

**Title rule: the last `<title>` wins.** In the example above, "Real Title" is used because the inner `<head>` title appears after the top-level one.

---

## 🔧 What the transpiler injects automatically

Even if you declare nothing, the transpiler always produces a valid document:

```html
<app>
  <page name="home">
    <h1>Hello</h1>
  </page>
</app>
```

Output includes:
- `<!DOCTYPE html>`
- `<meta charset="UTF-8">`
- `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- `<script src="clera.js"></script>`

---

## Allowed tags before `<app>`

Only these tags are allowed between the top of the file and `<app>`:

- `<title>`
- `<meta>`
- `<link>`
- `<style>`
- `<script>`

Any other tag before `<app>` is an error:

```
[CleraTranspiler:INVALID_TOP_LEVEL_TAG] Unsupported top-level tag <div> before <app>.
```

---

## Allowed tags after `</app>`

Only `<script>` tags are allowed after `</app>`. These become body-end scripts in the output, placed after the `clera.js` script tag:

```html
<app>
  ...
</app>

<script src="script.js"></script>
<script src="analytics.js"></script>
```

Any other tag after `</app>` is an error:

```
[CleraTranspiler:INVALID_POST_APP_TAG] Unsupported top-level tag <div> after </app>.
```

---

## Next

[03 Clera Language Errors](./03-errors.md)
