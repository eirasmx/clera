# 🎯 What is Clera?

Clera is a JavaScript runtime that lets you build multi-page apps using plain HTML, CSS, and JavaScript.

You write a single HTML file. You write some JavaScript functions. Clera reads both and wires them together into a working app. That is the whole model.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My App</title>
</head>
<body>

<app>
  <page name="home">
    <h1>Hello</h1>
    <button action="greet">Say hello</button>
  </page>
</app>

<script src="clera.js"></script>
<script>
  function greet() {
    alert("Hello from Clera!");
  }
</script>

</body>
</html>
```

That is a complete, working Clera app. No build step. No npm install. No configuration files.

---

## ✅ What Clera is

- **A single JavaScript file.** `clera.js` is everything. Drop it in your folder and include it with a `<script>` tag.
- **A runtime.** It reads your HTML at boot time and manages pages, navigation, and actions for you.
- **Multi-platform.** Clera apps run in any browser, and inside iOS and Android WebViews without changes.
- **Beginner-friendly.** If you know HTML, CSS, and basic JavaScript, you already know most of Clera.

---

## ❌ What Clera is not

- **Not a framework.** You are not writing code inside a framework's model. Clera reads your code, not the other way around.
- **Not a templating language.** Your HTML is your app. Clera does not compile it into something else.
- **Not a component system.** There are no components to define, register, or import.
- **Not a build tool.** There is no bundler, no transpiler, and no `node_modules`.

---

## 🧠 The core idea

Most apps are simpler than frameworks make them feel.

A typical app has a handful of pages, some buttons that do things, some forms that collect input, and some lists that update. Clera handles all of that with HTML attributes and plain functions.

```html
<!-- A button that runs a JavaScript function -->
<button action="saveNote">Save</button>

<!-- A button that navigates to another page -->
<button page="settings">Settings</button>

<!-- A form that submits to a function -->
<form action="createAccount">
  <input name="email" type="email">
  <button type="submit">Create account</button>
</form>
```

The developer writes the functions. Clera finds them by name and calls them. No registration, no imports, no boilerplate.

---

## 📱 Web, iOS, and Android

A Clera app is a folder of files: `index.html`, `clera.js`, your stylesheets, and your JavaScript. That same folder runs:

- In any desktop or mobile browser via a local server
- Inside an iOS app using a WKWebView shell
- Inside an Android app using a WebView shell

Use Clera Studio or Clera Packager to build and package your app for native distribution on iOS and Android.

---

## Next

[02 Design Philosophy](./02-design-philosophy.md)
