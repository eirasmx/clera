# 🎯 What is Clera?

Clera is an app development platform for building web, PWA, and native mobile applications with HTML, CSS, and JavaScript.

At its core, Clera is a runtime that turns standard web files into a structured application. Around that runtime sits the rest of the platform: an editor, a live preview, a debugger, and a packaging pipeline that ships your app to every target.

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

- **A development platform.** An editor, a live preview, a debugger, and a packaging system built around one application model.
- **A runtime.** `clera.js` reads your HTML at boot time and manages pages, navigation, and actions for you.
- **Multi-platform.** The same app runs in any browser, as a PWA, and packages natively for iOS and Android.
- **A packaging system.** Clera Studio and Clera Packager take your project from source files to a distributable build for each target.
- **Beginner-friendly.** If you know HTML, CSS, and basic JavaScript, you already know most of Clera.

---

## ❌ What Clera is not

- **Not a framework.** You are not writing code inside a framework's model. Clera reads your code, not the other way around.
- **Not a templating language.** Your HTML is your app. Clera does not compile it into something else.
- **Not a component system.** There are no components to define, register, or import.
- **Not a bridge library.** Tools like Capacitor wrap an existing web app so it can run inside a native shell. Clera covers the workflow before that step too: application structure, the runtime, live preview, debugging, and packaging all come from the same platform.

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

## 📱 Where a Clera app runs

A Clera app is a folder of files: `index.html`, `clera.js`, your stylesheets, and your JavaScript. That same folder runs:

- In any desktop or mobile browser via a local server
- As an installable PWA
- Packaged as a native iOS app
- Packaged as a native Android app

Use Clera Studio or Clera Packager to build and package your app for native distribution on iOS and Android.

> 🔭 A packaged desktop app (Windows, macOS, Linux) is a planned target. It is not available yet. See `todo.md` for status.

---

## Next

[02 The Clera Experience](./02-the-clera-experience.md)
