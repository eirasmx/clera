# 📦 Installation

Clera is a single JavaScript file. There is nothing to install, no package manager to run, and no build step to configure.

You get the file, you drop it in your project folder, and you include it with a `<script>` tag. That is the entire setup.

---

## Getting the file

The Clera runtime is distributed as `clera.js`. Place it in your project folder alongside your HTML file.

```
my-app/
  index.html
  clera.js
  style.css
  script.js
```

---

## Including it in your HTML

Add a single `<script>` tag to your HTML file. Place it at the end of `<body>`, after your page HTML, so Clera can read the DOM as it boots.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My App</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

<app>
  <page name="home">
    <h1>Hello</h1>
  </page>
</app>

<script src="clera.js"></script>
<script src="script.js"></script>
</body>
</html>
```

Alternatively, you can place both script tags in `<head>` without any attributes. Clera's internal boot sequence waits for the DOM to be ready before scanning.

```html
  ...
  <script src="clera.js"></script>
</body>
```

Both approaches work. The end-of-body placement makes the load order explicit.

---

## ✅ No npm. No build step. No Node.js.

Clera has no dependencies. You do not need Node.js installed. You do not need to run any install commands. Open the HTML file and it runs.

---

## Running locally

Browsers block certain features (like `fetch` for loading data from an API) when you open an HTML file directly from your filesystem using a `file://` URL. To avoid this, run a simple local server from your project folder.

Any of these work:

```bash
# Python (usually already installed on macOS and Linux)
python3 -m http.server 8080

# Node.js
npx serve .

# VS Code
# Install the "Live Server" extension, then click "Go Live" in the status bar
```

Then open `http://localhost:8080` in your browser.

> ⚠️ If you see errors about blocked requests or missing resources, you are likely opening the file directly. Use a local server instead.

---

## 📱 For iOS and Android

To package a Clera app for iOS or Android, use Clera Studio or Clera Packager. Both tools handle the native build process without requiring you to work with Xcode or Android Studio directly.

The same `clera.js` file that runs in a browser runs identically inside a WebView. No changes to the runtime are needed.

---

## Next

[02 Your First App](./02-first-app.md)
