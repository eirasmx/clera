# ⚡ Async Helpers


`context.fetch()` and `context.timeout()` are Clera-aware wrappers around native `fetch` and `setTimeout`. They keep async operations inside Clera's execution context so DOM bindings update automatically. No `context.update()` required.

---

## 🌐 context.fetch(url, options?, callback?)

Performs a network request inside Clera's execution context.

```js
// Callback style
context.fetch("/api/data", function(result) {
  context.stats.count = result.count;
  // DOM updates automatically
});

// Async/await style
async function load(context) {
  const result = await context.fetch("/api/data");
  context.stats.count = result.count;
  // DOM updates automatically
}
```

---

## 📋 Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `method` | string | `"GET"` | HTTP method |
| `headers` | object | `{}` | Request headers |
| `body` | any | | Request body: objects auto JSON-stringified |
| `query` | object | | Appended to URL as `?key=value` |
| `json` | boolean | `true` | Parse response as JSON. `false` returns raw `Response` |
| `timeout` | number | | Abort after N milliseconds |
| `credentials` | string | `"same-origin"` | `"include"` / `"same-origin"` / `"omit"` |

---

## 💡 Usage examples

**Simple GET:**
```js
context.fetch("/api/tasks", function(tasks) {
  context.render("#list", tasks.map(taskHtml).join(""));
});
```

**With query params:**
```js
context.fetch("/api/tasks", { query: { page: 1, limit: 20 } }, function(result) {
  context.stats.total = result.total;
});
```

**POST with JSON body:**
```js
async function saveTask(context) {
  const result = await context.fetch("/api/tasks", {
    method: "POST",
    body: { title: context.values.title }
  });
  if (result.ok) context.navigate("tasks");
}
```

**With auth header and timeout:**
```js
context.fetch("/api/secure", {
  headers: { Authorization: "Bearer " + token },
  timeout: 5000
}, function(data) {
  context.user.role = data.role;
});
```

**Raw response (no JSON parse):**
```js
const response = await context.fetch("/api/file", { json: false });
const text = await response.text();
```

---

## ⚠️ Body auto-serialization

If `body` is a plain object or array, `context.fetch()` automatically:
- JSON-stringifies it
- Sets `Content-Type: application/json`

No manual `JSON.stringify()` or header setting needed.

---

## ⚠️ Error handling

`context.fetch()` returns a Promise that rejects on network failure or timeout. Handle errors with try/catch:

```js
async function load(context) {
  try {
    const data = await context.fetch("/api/data", { timeout: 5000 });
    context.stats.count = data.count;
  } catch (err) {
    context.render("#status", "Failed to load. Try again.");
  }
}
```

Errors are also logged as `[CLERA:FETCH_FAIL]` in the diagnostics buffer.

If `fetch` is not available in the environment, a `[CLERA:FETCH_UNSUPPORTED]` error is logged and the Promise rejects immediately.

---

## ⏱️ context.timeout(callback, delay)

Schedules a callback inside Clera's execution context. DOM bindings update automatically after the callback runs.

```js
function showMessage(context) {
  context.timeout(function() {
    context.message.text = "Done!";
    // DOM updates automatically
  }, 2000);
}
```

Returns the timer ID: cancel with `clearTimeout()` if needed:

```js
function startPolling(context) {
  const timerId = context.timeout(function() {
    refreshData(context);
  }, 5000);

  // Cancel later if needed
  clearTimeout(timerId);
}
```

---

## 🔁 Why use these instead of raw async?

| | Raw `fetch` / `setTimeout` | `context.fetch()` / `context.timeout()` |
|--|--|--|
| DOM updates after | ❌ Manual `context.update()` required | ✅ Automatic |
| Error logging | ❌ Unhandled | ✅ `[CLERA:FETCH_FAIL]` |
| Body serialization | ❌ Manual `JSON.stringify` | ✅ Automatic |
| Query params | ❌ Manual string building | ✅ `{ query: { page: 1 } }` |

---

## 🛠️ When you still need context.update()

`context.update()` is for data mutations that happen outside both Clera handlers **and** the async helpers: for example inside a third-party callback or a WebSocket message handler:

```js
const socket = new WebSocket("wss://example.com");
socket.onmessage = function(event) {
  const data = JSON.parse(event.data);
  context.stats.count = data.count;
  context.update();  // manual: WebSocket is outside Clera's execution
};
```

---

## Next

[12 Reusable Blocks](./12-reusable-blocks.md)
