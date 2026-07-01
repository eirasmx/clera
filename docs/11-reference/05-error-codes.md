# ⚠️ Error Codes

All stable error codes emitted by the Clera runtime. Use these to filter console output or handle specific cases programmatically via `app.diagnostics`.

---

## ⚠️ Boot errors

| Code | Level | Description |
|------|-------|-------------|
| `BOOT_NO_APP` | error | No `<app>` element found in the document |
| `PAGE_NONE` | warn | No `<page name="...">` elements found inside `<app>` |
| `PAGE_DUP` | warn | Duplicate `<page>` name. First wins, duplicate removed. |
| `SPLASH_DUP` | warn | Multiple `<splash>` elements. First wins. |

---

## 🚀 Startup errors

| Code | Level | Description |
|------|-------|-------------|
| `DOUBLE_START` | warn | `app.start()` called more than once |
| `CONFIG_AFTER_START` | warn | `app.config()` called after `start()`. Config is already locked. |

---

## ⚠️ Action errors

| Code | Level | Description |
|------|-------|-------------|
| `ACTION_NOT_FOUND` | warn | Action name in HTML has no matching function or registered handler |
| `ACTION_THROW` | error | Action function threw an error |
| `FORM_DOUBLE_SUBMIT` | warn | Form submitted while a previous submission is still in progress |
| `FORM_ACTION_THROW` | error | Form action function threw an error |

---

## 🔄 Lifecycle errors

| Code | Level | Description |
|------|-------|-------------|
| `LIFECYCLE_THROW` | error | JS lifecycle hook (via `app.page()`) threw an error |
| `LIFECYCLE_ACTION_THROW` | error | Attribute-declared lifecycle action threw an error |

---

## 🧭 Navigation errors

| Code | Level | Description |
|------|-------|-------------|
| `NAV_NO_PAGE` | warn | `app.navigate()` called without a page name |
| `PAGE_NOT_FOUND` | warn | Navigation target or `page="..."` attribute points to an unregistered page |

---

## ⚠️ DOM errors

| Code | Level | Description |
|------|-------|-------------|
| `DOM_MISSING` | warn | `query()`, `render()`, `append()`, or `clear()` selector matched no element |
| `DOM_NOT_INPUT` | warn | `query().value()` called on an element that has no `.value` property |

---

## ⚙️ Page config errors

| Code | Level | Description |
|------|-------|-------------|
| `PAGE_CFG_NO_NAME` | warn | `app.page()` called without a page name |
| `PAGE_CFG_NOT_FOUND` | warn | `app.page("name")` references a page not found in HTML |

---

## ⚠️ Cache errors

| Code | Level | Description |
|------|-------|-------------|
| `PAGE_EVICT` | info | A page was evicted from the LRU cache |
| `CACHE_EVICT_BLOCKED` | warn | All mounted pages are keepAlive or current. Cannot evict any. |

---

## ⚠️ Plugin errors

| Code | Level | Description |
|------|-------|-------------|
| `PLUGIN_INVALID` | warn | Plugin missing `install(CLERA)` method |
| `PLUGIN_DUP` | warn | Plugin with this id already installed |
| `PLUGIN_THROW` | error | Plugin `install()` threw an error |
| `PLUGIN_READY_THROW` | error | Plugin `onReady()` threw an error |

---

## ⚙️ Component errors

| Code | Level | Description |
|------|-------|-------------|
| `LISTEN_TARGET_NOT_FOUND` | warn | `context.listen()` selector matched no elements at call time. Rule stays registered. |
| `LISTEN_CALLBACK_THROW` | error | Callback passed to `context.listen()` threw an error. |
| `COMP_INVALID` | warn | `registerComponent()` called with empty tag name |
| `COMP_PROTECTED` | warn | Attempted to override a protected core tag |
| `COMP_INVALID_SYNTAX` | warn | A `selfClosing: true` component was found with child nodes in the DOM. Only emitted in dev mode. |

---

## ⚙️ Global execution errors

| Code | Level | Description |
|------|-------|-------------|
| `TIMEOUT_CALLBACK_THROW` | error | Callback passed to `app.timeout()` threw an error. |
| `INTERVAL_CALLBACK_THROW` | error | Callback passed to `app.interval()` threw an error. |
| `LISTEN_CALLBACK_THROW` | error | Callback passed to `app.listen()` threw an error. |
| `LISTEN_INVALID_TARGET` | warn | Target passed to `app.listen()` has no `addEventListener`. |
| `RUN_CALLBACK_THROW` | error | Callback passed to `app.run()` threw an error. |

---

## ⚠️ Exposure errors

| Code | Level | Description |
|------|-------|-------------|
| `EXPOSE_NOT_SAFE` | warn | Key not in the safe exposure registry |
| `EXPOSE_CONFLICT` | warn | Global with this name already exists |
| `DEPRECATED_NAMESPACE` | warn | `PWA.x` or `pwa.x` used. Use `app.x` instead. |

---

## 🌉 Bridge errors

| Code | Level | Description |
|------|-------|-------------|
| (Promise rejection) | none | Hardware capability errors reject the Promise with an `Error`. Check `error.message`. |

---

## 🌐 HTTP errors (app.php)

| Code | Level | Description |
|------|-------|-------------|
| `PHP_NO_URL` | warn | `app.php()` called without a URL |
| `PHP_FETCH_FAIL` | error | Network request failed or timed out |
| `PHP_CALLBACK_THROW` | error | `onSuccess` or `onError` callback threw |

---

## ⚠️ Service worker errors

| Code | Level | Description |
|------|-------|-------------|
| `SW_UNSUPPORTED` | warn | Service workers not supported in this environment |
| `SW_REGISTER_FAIL` | error | Service worker registration failed |



---

## 🧩 Reusable block errors

| Code | Level | Description |
|------|-------|-------|-------------|
| `TEMPLATE_ID_REQUIRED` | warn || A `<template>` or `[template]` element is missing an `id` attribute. |
| `TEMPLATE_DUPLICATE_ID` | warn || Two template sources share the same id. First wins. |
| `TEMPLATE_INNER_ID_DUPLICATE` | warn || Template content contains `id` attributes that will duplicate across cloned instances. Use `class` instead. Mandatory in dev mode. |
| `USE_TEMPLATE_REQUIRED` | warn || A `<use>` element is missing its `template` attribute. |
| `USE_TEMPLATE_NOT_FOUND` | warn || `<use template="id">` references an id with no matching registered template. |
| `USE_NAME_DUPLICATE` | warn || Two `<use>` elements share the same `name` on the same page. Instance names must be unique. |
| `USE_NAME_RESERVED` | warn || A `<use name="...">` instance name matches a Clera built-in context property. Choose a different name. |

---

## 🗄️ Data system errors

| Code | Level | Description |
|------|-------|-------------|
| `BINDING_UNRESOLVED` | warn | A `{path}` binding in HTML could not be resolved in page or global data. Only emitted in dev mode. |
| `DATA_KEY_RESERVED` | warn | A data key passed to `context.data()` or `app.data()` matches a Clera built-in property name and was skipped. Choose a different key name. |
| `FETCH_UNSUPPORTED` | error | `context.fetch()` was called in an environment where the native `fetch` API is not available (e.g. an older WebView). |
| `FETCH_FAIL` | error | `context.fetch()` network request failed or timed out. |
| `FETCH_CALLBACK_THROW` | error | A callback passed to `context.fetch()` threw an error. |
| `TIMEOUT_CALLBACK_THROW` | error | A callback passed to `context.timeout()` threw an error. |

---

## ⚠️ Queue errors

| Code | Level | Description |
|------|-------|-------------|
| `QUEUE_CALL_FAIL` | error | A queued API call failed when replayed after boot |

---

## Next

[06 Version History](./06-version-history.md)
