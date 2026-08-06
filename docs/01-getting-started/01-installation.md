# 📦 Installation

Clera apps start with standard web files. The runtime requires no dependency installation, but the full Clera workflow (editing, live preview, debugging, and packaging) is available through Clera Studio.

There are two ways to build:

- **Simple:** HTML + CSS + JS + `clera.js`, edited in any text editor and run through a local server.
- **Full workflow:** Clera Studio, which takes you from editing through live preview, debugging, and build.

This chapter covers the simple path, since it requires nothing beyond a text editor. [The Clera Experience](../00-introduction/02-the-clera-experience.md) covers the Studio workflow, and [Running and Preview](./05-running-and-preview.md) in this chapter shows both side by side.

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

## ✅ Clera manages the tooling for you

Your application code requires no frontend build step. There is no package manager to run, no Node.js requirement, and no config file to write before your app runs. Open the HTML file, or run it through a local server, and it works.

That does not mean there is no tooling. Native packaging, cloud builds, and deployment are real steps with real tools behind them. Clera handles them for you through Clera Studio and Clera Packager when you are ready to ship, so you do not manage that tooling yourself during development.

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

## 📱 Where this app can run

The same project you just set up can also:

- Install as a PWA
- Package as a native iOS app
- Package as a native Android app

Use Clera Studio or Clera Packager to build and package your app for native distribution. Both tools handle the platform build process without requiring you to work with Xcode or Android Studio directly.

> 🔭 Packaged desktop apps (Windows, macOS, Linux) are a planned target. Not available yet. See `todo.md` for status.

---

## Next

[02 Your First App](./02-first-app.md)
