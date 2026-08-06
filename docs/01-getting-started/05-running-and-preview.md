# 🖥️ Running and Preview

There are two ways to run and preview a Clera app: through Clera Studio, or manually with a local server and a browser. This chapter covers both, starting with Studio.

---

## 🧭 The Clera Studio workflow

Clera Studio wires the whole loop together in one place:

```
Create project
      ↓
Open in Clera Studio
      ↓
Edit HTML/CSS/JS
      ↓
Live preview
      ↓
Test on devices
      ↓
Build for web/PWA/native
```

Open your project folder in Studio and it renders a live preview as you edit, no manual server or manual device connection required. Save a file and the preview updates. Studio also handles device preview directly, so you do not need to find your computer's local IP address or configure anything on the phone yourself.

The rest of this chapter covers the manual path: running a local server yourself and previewing in a regular browser. Use it when you are not using Studio, or want to understand what Studio is doing under the hood.

---

## Why you need a local server

If you try to open `index.html` by double-clicking it, the browser opens it using a `file://` URL. Browsers apply strict security restrictions to `file://` pages, including blocking `fetch` requests, which Clera uses internally.

Running a local server serves your files over `http://localhost`, which has no such restrictions.

---

## Starting a local server

Pick whichever option matches what you already have installed.

**Python** (usually pre-installed on macOS and Linux):

```bash
cd my-app
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

**Node.js:**

```bash
cd my-app
npx serve .
```

**VS Code Live Server extension:**

1. Install the "Live Server" extension from the Extensions panel
2. Open your project folder in VS Code
3. Click "Go Live" in the bottom status bar

Live Server has the advantage of auto-reloading the browser whenever you save a file, which speeds up iteration.

---

## The manual development loop

The basic loop with a local server is:

1. Edit a file (HTML, CSS, or JavaScript)
2. Save
3. Refresh the browser (or let Live Server do it automatically)
4. See the result

Because there is no build step, the save-to-refresh cycle is nearly instant. Studio's live preview shortens this loop further by removing the refresh step. Either way, the advantage is not a faster refresh on its own. It is a shorter distance between changing a line of code and seeing a running app.

---

## 🔍 Using the browser DevTools

Open DevTools with `F12` (or `Cmd+Option+I` on macOS). The most useful panels for Clera development are:

### Console

Clera logs all warnings and errors to the console using a consistent format:

```
[CLERA:ACTION_NOT_FOUND] Action "savNote" not found.
```

The code in brackets (like `ACTION_NOT_FOUND`) is the error code. If something is not working, check the console first. Clera almost always logs a message explaining what went wrong.

In development mode (`dev: true` in your `app.start()` config), Clera logs additional diagnostic information including binding resolution warnings.

### Elements

When a page is active, you can inspect its DOM structure under the `<app>` element. You will see the live `<page>` element with the `data-app-page` attribute set to the current page name:

```html
<app>
  <page data-app-page="home" id="home">
    ...
  </page>
</app>
```

This is useful for checking that your CSS selectors are targeting the right elements.

### Network

If your app loads data using `context.fetch()` or the native `fetch()` API, the Network panel shows every request, its status, and its response. This is the first place to check if data is not loading.

---

## Enabling development mode

Pass `dev: true` to `app.start()` to get extra console output:

```html
<script>
  app.start({ dev: true });
</script>
```

In development mode, Clera logs additional warnings such as unresolved `{binding}` placeholders in your HTML. Remove `dev: true` before shipping to production.

---

## 📱 Previewing on a mobile device manually

Studio handles device preview directly, covered above. If you are running the manual local server path instead, you can still preview on a phone on the same network:

1. Find your computer's local IP address (e.g. `192.168.1.10`)
2. Start your local server
3. Open `http://192.168.1.10:8080` on the phone

Your phone and computer must be on the same network. This works with the Python and Node.js servers listed above.

---

## Next

You built and ran your first app. From here:

```
Understand the runtime
      ↓
Use Clera Studio
      ↓
Add native capabilities
      ↓
Build your first mobile app
```

[02 Core Concepts: The App Tag](../02-core-concepts/01-app-tag.md) starts the first step.
