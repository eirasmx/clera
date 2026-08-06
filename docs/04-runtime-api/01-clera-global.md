# 🌐 CLERA Global

The `CLERA` object is the public API of the Clera runtime. It is available globally as `window.app`, `window.CLERA`, and `window.clera`. All three names point to the same object.

---

## 🤖 Available methods and properties

| Name | Type | Description |
|------|------|-------------|
| `app.version` | string | Current runtime version |
| `app.start(config?)` | method | Boot the runtime |
| `app.config(config)` | method | Declare config without booting |
| `app.page(name, config)` | method | Attach lifecycle and actions to a page |
| `app.navigate(name, params?)` | method | Navigate to a page |
| `app.currentPage()` | method | Get the current page name |
| `app.layout()` | method | Get the current layout (`mobile`/`tablet`/`desktop`) |
| `app.platform()` | method | Get the current platform (`ios`/`android`/`web`/`pwa`) |
| `app.onLayoutChange(handler)` | method | Listen for layout changes |
| `app.actions` | getter/setter | Register global action functions |
| `app.registerComponent(tag, config)` | method | Register a custom HTML tag. Auto-initialised with inline styles and a parser function when found in any mounted page |
| `app.use(plugin)` | method | Install a plugin |
| `app.php(url, data?, options?)` | method | POST request helper |
| `app.hardware` | object | Native hardware capabilities |
| `app.bridge` | object | Low-level native bridge |
| `app.capabilities` | object | Bridge capability flags |
| `app.sw` | object | Service worker helper |
| `app.diagnostics` | object | Runtime log buffer and IDE hook |
| `app.data(sourceObject)` | method | Attach global app data |
| `app.update()` | method | Manually patch DOM bindings |
| `app.map(data, string)` | method | Map one object into one `<use>` string via `{key}` interpolation |
| `app.memory` | object | Global non-binding storage. Plain object, no reactivity |
| `app.navigationStack` | array | Read-only live reference to navigation history |
| `app.timeout(callback, delay)` | method | Clera-aware `setTimeout`. Patches bindings after callback fires |
| `app.interval(callback, delay)` | method | Clera-aware `setInterval`. Patches bindings after each tick |
| `app.listen(target, event, callback, options?)` | method | Clera-aware `addEventListener` on any target. Patches bindings after each event |
| `app.run(callback)` | method | Re-enter Clera's execution cycle from any external source |
| `app.gesture(element, gesture, handler)` | method | Register a gesture recognizer on an element. `"swipe"` is the only supported gesture. |

---

## 🗄️ app.data(sourceObject)

Attaches global data available across the entire app. Merges by reference and never replaces. Keys are exposed directly on `app.*` for natural read/write access.

```js
const user  = { name: "Michael" };
const theme = { mode: "dark" };

app.data({ user, theme });

// Direct access anywhere:
app.user.name   // "Michael"
app.theme.mode  // "dark"

// Mutate inside a Clera handler. DOM updates automatically:
function rename(context) {
  app.user.name = "Paul";
}

// Mutate outside Clera. Manual update required:
app.user.name = "Paul";
app.update();
```

> ⚠️ Keys matching Clera built-in names are rejected with `[CLERA:DATA_KEY_RESERVED]`. See [data system docs](../02-core-concepts/10-data-system.md) for the full reserved key list.

---

## 🛠️ app.update()

Manually triggers a DOM binding patch for the currently visible page. Use when global data mutates outside Clera-controlled execution.

```js
// Raw async. Needs manual update.
fetch("/api/user").then(res => res.json()).then(data => {
  app.user.name = data.name;
  app.update();
});
```

Targets the currently visible page only, the same as calling `context.update()` from inside that page's action.

---

## 🗺️ app.map(dataObject, string)

Pure string helper for generating `<use>` strings from data objects. Maps `{key}` placeholders using the provided object. Does not loop, does not touch the DOM. Developer owns iteration.

```js
const html = app.map(product, `<use template="card" name="{id}" />`);
// → '<use template="card" name="a1" />'

// Typical usage with a loop:
let html = "";
for (const item of items) {
  html += app.map(item, `<use template="card" name="{id}" />`);
}
context.render("#list", html);
```

`${}` JavaScript interpolation runs before `app.map()`. Two separate stages, no conflict.

---

## 🗄️ app.memory

Global non-binding storage. Plain JavaScript object. Assign and mutate freely. Clera never watches it, never runs it through the binding engine, and never patches the DOM because of it.

```js
// Store a large dataset. Clera ignores it completely.
app.memory.products = result.products;

// Read, mutate, delete. Plain JS.
app.memory.products.push(newItem);
delete app.memory.products;
Object.keys(app.memory);

// Move into data when the UI needs it
context.data({
  visibleProducts: app.memory.products.slice(0, 40)
});
```

Survives navigation. Data stored here is accessible from any page without re-fetching.

> ⚠️ `{memory.x}` bindings in HTML are not supported. `app.memory` is not in the binding engine's resolution chain. Use `context.data()` or `app.data()` to make data bindable.

See [Memory](../02-core-concepts/14-memory.md) for full usage and patterns.

---

## ⏱️ app.timeout(callback, delay)

Clera-aware `setTimeout`. Executes the callback after `delay` ms and patches the current visible page's bindings automatically.

```js
app.timeout(() => {
  app.data({ status: "Ready" });
}, 1000);
// DOM updates automatically after the callback
```

Returns a timer ID. Cancel with `clearTimeout(id)`.

> Use `context.timeout()` inside action and lifecycle handlers. Use `app.timeout()` for startup scripts or code outside page context.

---

## 🔁 app.interval(callback, delay)

Clera-aware `setInterval`. Patches bindings after each tick.

```js
const id = app.interval(() => {
  app.data({ time: Date.now() });
}, 1000);

// Cancel when done
clearInterval(id);
```

---

## 👂 app.listen(target, event, callback, options?)

Clera-aware `addEventListener` on any target (window, document, or any DOM element). Patches bindings after each event. Returns an `off()` unsubscribe function.

```js
const off = app.listen(window, "resize", () => {
  app.data({ width: window.innerWidth });
});

off(); // removes listener
```

Warns `[CLERA:LISTEN_INVALID_TARGET]` if `target` lacks `addEventListener`.

> For page-scoped listeners on elements inside a page, use `context.listen()` instead. It auto-rebinds after renders and cleans up on LRU eviction.

---

## ▶️ app.run(callback)

Re-enters Clera's controlled execution cycle from any external source. Use for WebSockets, third-party SDK callbacks, or any async code that cannot use `context.*` APIs.

```js
socket.onmessage = (event) => {
  app.run(() => {
    messages.push(JSON.parse(event.data));
    // bindings auto-patch after this block
  });
};
```

| Context API | Global equivalent |
|------------|------------------|
| `context.timeout()` | `app.timeout()` |
| (none) | `app.interval()` |
| (none) | `app.listen()` |
| (none) | `app.run()` |

Use `context.*` inside action/lifecycle handlers. Use `app.*` for startup scripts, global integrations, and code outside page context.

---

## 🔓 Global exposure

With `expose: "app"` in the config, Clera copies its key methods directly onto `window`:

```js
app.start({ expose: "app" });

// Now available globally:
navigate("home");
page("home", { ... });
data({ user });
update();
```

Available with `expose: "app"`: `php`, `start`, `config`, `page`, `navigate`, `currentPage`, `layout`, `platform`, `onLayoutChange`, `hardware`, `sw`, `actions`, `data`, `update`, `map`, `memory`, `timeout`, `interval`, `listen`, `run`.

Use `expose: "all"` to also expose `registerComponent` and `use`.

> The string `"clera"` is an alias for `"app"` and exposes the same set of methods.

---

## Next

[02 start()](./02-start.md)
