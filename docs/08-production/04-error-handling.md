# ⚠️ Error Handling and Security

---

## 🎯 Runtime error behaviour

Clera never throws errors that crash the app. All internal errors are caught, logged, and handled gracefully:

- **Missing action:** logs a warning, no-ops
- **Missing DOM element:** logs a warning, no-ops
- **Lifecycle error:** logs the error, continues
- **Plugin install error:** logs the error, skips the plugin
- **Hardware capability error:** rejects the Promise with a clear message

Your own action functions are wrapped in try/catch. An unhandled exception inside an action logs the error but does not crash the page:

```
[CLERA:ACTION_THROW] Action "addTask" threw (page "home").
```

---

## ⚡ Handling errors in async actions

Clera catches synchronous throws automatically. For async actions, unhandled Promise rejections are also caught and logged. But for user-facing errors, handle them explicitly:

```js
async function loadData(context) {
  try {
    const response = await fetch("/api/data");
    if (!response.ok) throw new Error("Server error");
    const data = await response.json();
    context.render("#content", buildHtml(data));
  } catch (error) {
    context.render("#content", `
      <div class="error-state">
        Failed to load data. <button action="loadData">Retry</button>
      </div>
    `);
  }
}
```

---

## 📱 Hardware capability errors

Always handle hardware rejections. The user may deny permission, cancel the picker, or be on a device that does not support the feature:

```js
async function pickPhoto(context) {
  try {
    const result = await app.hardware.files.pick({ accept: "image/*" });
    showPhoto(result.files[0].uri, context);
  } catch (error) {
    if (error.message !== "File picker cancelled.") {
      context.render("#status", "Could not access files.");
    }
  }
}
```

---

## 📝 Security notes

### innerHTML and user content

`context.render()`, `append()`, and `clear()` all use `innerHTML`. If you render user-supplied content, sanitize it first to prevent XSS:

```js
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

context.render("#messages", messages.map(msg =>
  `<div class="message">${escapeHtml(msg.text)}</div>`
).join(""));
```

Never render raw user input directly into innerHTML without escaping.

### localStorage

`localStorage` data is readable by any JavaScript on the same origin. Do not store sensitive data (tokens, passwords, private user data) in localStorage. Use `sessionStorage` or secure HttpOnly cookies for sensitive values.

### 🌐 CSRF with app.php()

For backend requests, use the built-in CSRF support:

```js
app.start({
  php: {
    baseUrl: "https://api.example.com",
    csrf: {
      header: "X-CSRF-Token",
      token:  () => document.querySelector('meta[name="csrf-token"]').content
    }
  }
});
```

---

## Next

[05 Deployment](./05-deployment.md)
