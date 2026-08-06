# 👋 Hello World

The smallest possible Clera app. One page, no JavaScript required.

---

## index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hello</title>
</head>
<body>

<app>
  <page name="home" id="home">
    <h1>Hello, Clera.</h1>
  </page>
</app>

<script src="clera.js"></script>
</body>
</html>
```

---

## What this demonstrates

- `<app>` as the root container
- A single `<page>` with a name
- No JavaScript, no configuration, no `app.start()`. The runtime boots automatically.

---

## 📁 As a .clera file

```html
<title>Hello</title>

<app>
  <page name="home" id="home">
    <h1>Hello, Clera.</h1>
  </page>
</app>
```

---

## Next

[02 Counter](./02-counter.md)
