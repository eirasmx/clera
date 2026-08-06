# 🎯 app.diagnostics: Runtime Log Buffer

Access the internal log buffer for debugging and IDE integration.

```js
// Get all buffered log entries
const logs = app.diagnostics.logs();

// Clear the buffer
app.diagnostics.clear();

// Attach an IDE hook. Receives all past and future entries.
app.diagnostics.attach((entry) => {
  console.log(entry.level, entry.code, entry.msg);
});

// Detach the hook
app.diagnostics.detach();
```

Each entry in the buffer has this shape:

```js
{
  level: "info" | "warn" | "error",
  code:  "ACTION_NOT_FOUND",  // stable string error code
  msg:   "...",               // human-readable message
  t:     1718000000000        // timestamp (Date.now())
}
```

Entries appear in the browser console formatted as `[CRE:CODE] message`.

---

## Next

[12 Plugins](./12-plugins.md)
