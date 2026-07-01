# 🖥️ Running and Preview

Clera apps are just HTML files. To run one locally, you need a simple local web server. This chapter explains why that is, how to run one, and how to use the browser tools to debug your app.

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

## The development workflow

The basic loop is:

1. Edit a file (HTML, CSS, or JavaScript)
2. Save
3. Refresh the browser (or let Live Server do it automatically)
4. See the result

Because there is no build step, the save-to-refresh cycle is nearly instant. You change a function, refresh, and the change is live.

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

## 📱 Previewing on a mobile device

To preview your app on a phone connected to the same Wi-Fi network:

1. Find your computer's local IP address (e.g. `192.168.1.10`)
2. Start your local server
3. Open `http://192.168.1.10:8080` on the phone

Your phone and computer must be on the same network. This works with the Python and Node.js servers listed above.

---

## Next

[02 Core Concepts: The App Tag](../02-core-concepts/01-app-tag.md)
