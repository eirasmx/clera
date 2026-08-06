# 🔍 Debugging

---

## 🔧 Enable dev mode

The first thing to do when debugging a Clera app:

```js
app.start({ dev: true });
```

With dev mode on, Clera logs detailed warnings for:
- Missing action handlers
- Duplicate page names
- Navigation to unknown pages
- Lifecycle errors
- Double start attempts
- Config called after start

Without dev mode, only hard errors appear.

---

## 🔍 Reading Clera logs

All Clera log messages use a stable `[CLERA:CODE]` prefix. Filter the console by `[CLERA` to see only runtime messages:

```
[CLERA:ACTION_NOT_FOUND] Action "addTask" not found (page "home").
Expected a global function named addTask(), a registered action via app.actions,
or a page-local action via app.page().
```

The code (`ACTION_NOT_FOUND`) is stable across versions. See the error code reference for the full list.

---

## ⚠️ Common issues and fixes

### ⚠️ Action not firing

**🔍 Symptom:** Clicking a button or submitting a form does nothing.

**📋 Check:**
1. The `action` attribute value exactly matches the function name (case-sensitive)
2. The function is declared at global scope (`function myAction()`, not inside another function)
3. The script tag is loaded after `clera.js`
4. Dev mode is on. Look for `[CLERA:ACTION_NOT_FOUND]`

---

### ⚠️ Page not showing

**Symptom:** Navigating to a page does nothing or logs a warning.

**Check:**
1. The `<page name="...">` name matches exactly what is passed to `navigate()` or `page="..."` (case-sensitive)
2. The page is inside `<app>` in the HTML
3. Look for `[CLERA:PAGE_NOT_FOUND]`

---

### ⚠️ Styles not applying to pages

**Symptom:** CSS targeting `#id` or `.class` on a page has no effect.

**Check:**
1. The `id` or `class` attribute is set on the `<page>` element in HTML
2. The mounted page element in DevTools has the expected `id` and `class`
3. Inspect the `<page data-app-page="...">` element in the Elements panel

---

### 📝 Form values are undefined

**Symptom:** `context.values.fieldName` is `undefined`.

**Check:**
1. The `name` attribute is set on the input element
2. The field is inside the `<form action="...">` element
3. The field is not `disabled` (disabled fields are not included in `FormData`)

---

## 🔍 The diagnostics buffer

Access the full runtime log history programmatically:

```js
const logs = app.diagnostics.logs();
logs.forEach(entry => {
  console.log(entry.level, entry.code, entry.message, entry.page);
});
```

Each entry has: `level`, `code`, `message`, `stack`, `page`, `environment`, `time`.

The buffer holds the last 100 entries and is available even after dev mode is off.

---

## 🔍 Inspecting the DOM

Clera apps are plain DOM. Use browser DevTools normally.

- Mounted pages appear as `<page data-app-page="pageName">` in the Elements panel
- The current page is `display: block`; hidden pages are `display: none`
- Pages are mounted directly inside `<app>`
- The baseline CSS is a `<style id="cre-baseline">` in `<head>`
- The persisted page name is `localStorage["CLERA_ACTIVE_PAGE"]`

---

## Next

[04 Error Handling](./04-error-handling.md)
