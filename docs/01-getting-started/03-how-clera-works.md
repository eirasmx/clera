# ⚙️ How Clera Works

When your browser loads a Clera app, the runtime goes through a fixed sequence of steps before anything is shown on screen. Understanding this sequence makes it much easier to reason about what is happening when something works (or does not work).

---

## The boot sequence

Here is what happens, in order, from the moment the browser parses the `<script src="clera.js">` tag.

### 1. Baseline CSS is injected

Before anything else, Clera injects a minimal CSS reset into the page. This ensures all Clera elements (`app`, `page`, `tabbar`, etc.) have sensible default display values and that your own CSS starts from a clean, consistent baseline.

This happens immediately when the script tag is parsed, before the DOM is even ready.

### 2. DOMContentLoaded fires

Clera waits for the browser to finish parsing the HTML. Once the DOM is ready, the boot process begins.

### 3. Clera finds `<app>`

The runtime searches the document for an `<app>` element. If none is found, it logs an error and stops:

```
[CLERA:BOOT_NO_APP] No <app> element found. Clera cannot boot.
```

### 4. Imports are resolved

If your HTML contains `<import src="...">` elements inside `<head>` or `<app>`, Clera fetches each referenced file and inlines its content at the import site before doing anything else. This step is recursive: imported files can themselves contain `<import>` tags.

Once all imports are resolved, the DOM looks as if all the content had been written inline from the start.

### 5. Pages are extracted

Clera finds every `<page name="...">` element inside `<app>`, reads its HTML content and attributes, stores it internally, and then removes the `<page>` element from the DOM.

After this step, the original `<page>` elements no longer exist in the document. The runtime holds their content in memory, ready to mount on demand.

> This is why you never see a flash of all your pages at once. They are extracted before anything is shown.

### 6. The initial page is resolved

Clera decides which page to show first using this order of priority:

1. The `initial` option from `app.start()`, if provided
2. The last visited page, if `persistPage` is enabled and a previous session was saved
3. A page named `"home"`, if one exists
4. The first page defined in the HTML, as a fallback

### 7. The first page is mounted

Clera takes the stored HTML for the initial page, creates a `<page>` element in the DOM, fills it with that HTML, and appends it to `<app>`. The page is now live in the document.

This triggers the page's `onCreate` lifecycle hook, then its `onShow` hook.

### 8. The splash screen is hidden

If your app has a `<splash>` element inside `<app>`, it is hidden once the first page is mounted. Until this moment, the splash is shown to cover the boot process from the user.

### 9. The app is ready

The runtime fires a `cre:ready` event on `window`. Any code listening for this event can now safely interact with the app.

---

## What happens when you navigate

When you click a `<button page="about">` or call `app.navigate("about")`:

1. The current page's `onHide` hook fires
2. The current page is hidden
3. If the "about" page has never been visited, it is mounted fresh (this triggers `onCreate`, then `onShow`)
4. If the "about" page was already mounted and is still in the page cache, it is shown again (this triggers only `onShow`)
5. The tab bar, if present, updates to highlight the correct tab

Pages stay in the DOM after they are first mounted. Navigating away just hides them. Navigating back just shows them again. This is why returning to a page feels instant.

---

## What happens when you use an action

When you click a `<button action="saveNote">` or submit a `<form action="addTask">`:

1. Clera intercepts the click or form submission
2. It searches for a handler function named `saveNote` (or `addTask`) in this order:
   - Page-local actions registered via `app.page("pageName", { actions: { ... } })`
   - Global actions set via `app.actions = { ... }`
   - A plain function on `window` (a global function you wrote in a script tag)
3. The first match is called with a `context` object
4. If no match is found, a warning is logged:

```
[CLERA:ACTION_NOT_FOUND] Action "saveNote" not found.
```

---

## Keeping this in mind

A few practical things that follow from this:

- **Your pages do not exist in the DOM on load.** Clera removes them during boot. Do not write code that tries to `querySelector` a page element before it has been navigated to.
- **The first page is the only page mounted at boot.** All other pages are mounted on first navigation to them.
- **Functions must exist by the time an action is triggered.** Because Clera searches `window` for functions by name at the moment the action fires, your scripts just need to be loaded before the user can click anything, not before Clera boots.
- **`app.start()` is optional.** If you do not call it yourself, Clera auto-boots with default settings on `DOMContentLoaded`. Call it only when you need to pass configuration.

---

## Next

[04 Project Structure](./04-project-structure.md)
