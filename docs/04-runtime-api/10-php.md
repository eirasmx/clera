# 🌐 app.php(url, data?, options?): HTTP POST Helper

A lightweight fetch wrapper for POST requests to any HTTP endpoint. Despite the name, it works with any backend.

### Promise style

```js
const result = await app.php("save-task.php", { title: "Buy milk" });

if (result.ok) {
  console.log(result.data); // parsed JSON body
} else {
  console.error("Request failed, status:", result.status);
}
```

### Callback style

```js
app.php("save-task.php", { title: "Buy milk" }, {
  onSuccess(result) { context.navigate("done"); },
  onError(result)   { context.render("#error", "Save failed."); }
});
```

`onSuccess` fires when the HTTP status is 2xx. `onError` fires on network failure, timeout, non-2xx response, or JSON parse failure. Both receive the result object as their only argument.

### Result shape

```js
{
  ok:     true | false, // true when HTTP 2xx
  status: 200,          // HTTP status code. 0 on network failure.
  data:   { ... }       // parsed JSON body. null on parse failure.
}
```

### ⚙️ Configuration

```js
app.start({
  php: {
    baseUrl: "https://api.example.com",
    timeout: 5000,
    csrf: {
      header: "X-CSRF-Token",
      token:  () => document.cookie.match(/csrf=([^;]+)/)?.[1]
    }
  }
});
```

---

## Next

[11 diagnostics()](./11-diagnostics.md)
