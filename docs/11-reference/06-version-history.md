# 📅 Version History

---

## 📦 v0.6.10
- `context.listen()`: four remaining edge-case fixes
- `context.clear()` now calls `refreshPageListeners()` after clearing. Listener rules re-evaluate the full page with no dangling attachments.
- `off()` for a duplicate-detected rule now correctly removes event listeners from all matching elements (previously a no-op `forEach`)
- Stale mount comment on `refreshPageListeners` call inside `mountPageIfNeeded` corrected to reflect actual execution order
- `refreshPageListeners` now handles selector match on the scope root element itself via `scopeRoot.matches()` check + `unshift`

## 📦 v0.6.9
- `context.listen()`: three correctness fixes
- Duplicate detection now uses real callback reference identity (`===`). `String(callback)` key removed entirely; `callback` stored directly on rule record.
- `refreshPageListeners(pageRecord, scopeRoot?)` added. Called after every Clera-owned DOM update (`render`, `append`, `mountPageIfNeeded`) so newly injected elements are automatically bound without re-calling `context.listen()`.
- Removed unnecessary `try/catch` wrappers around `removeEventListener` in `destroyPage` and `off()`. Browser guarantees safe no-op on detached nodes.

## 📦 v0.6.8
- `context.listen(selector, eventName, callback, options?)` returning `off()` added
- Page-scoped event listener that runs inside Clera's execution cycle, patches bindings automatically, prevents duplicates, and auto-cleans on LRU eviction
- Duplicate protection via callback reference identity; returns `off()` for existing rule if already active
- `"listen"` added to `RESERVED_CONTEXT_KEYS`
- Error codes added: `LISTEN_TARGET_NOT_FOUND` (dev mode), `LISTEN_CALLBACK_THROW`
- `pageRecord.listeners`: new array field on every page record

## 📦 v0.6.7
- Accessibility system: platform comfort layer
- `accessibility` config key on `app.start()` / `app.config()`. Default: `"auto"`.
- `"auto"` activates only in PWA/native shell contexts (standalone media query, `navigator.standalone`, or native bridge detected). Zero config for beginners.
- iOS rules: focus-zoom prevention, tap highlight removal, accidental text-selection suppression, long-press callout prevention
- Android: API shape reserved, no rules in v1
- Injected as `<style id="clera-engine-accessibility-style">`. Guard prevents double-injection.

## 📦 v0.6.6
- Global execution helpers: four new APIs that bring external async sources into Clera's controlled execution cycle
- `app.timeout(callback, delay)` returning timerId. Clera-aware `setTimeout`. Patches current page bindings after callback.
- `app.interval(callback, delay)` returning intervalId. Clera-aware `setInterval`. Patches after each tick. Cancel with `clearInterval(id)`.
- `app.listen(target, event, callback, options?)` returning `off()`. Clera-aware `addEventListener` on any target. Warns `[CLERA:LISTEN_INVALID_TARGET]` if target has no `addEventListener`.
- `app.run(callback)`: re-enters Clera's execution cycle from WebSockets, third-party SDK callbacks, or any code outside page context
- All four added to `SAFE_EXPOSURE_REGISTRY` and `RESERVED_CLERA_KEYS`
- Error codes added: `TIMEOUT_CALLBACK_THROW`, `INTERVAL_CALLBACK_THROW`, `LISTEN_CALLBACK_THROW`, `LISTEN_INVALID_TARGET`, `RUN_CALLBACK_THROW`

## 📦 v0.6.5
- `app.memory`: global non-binding storage layer
- Plain `Object.create(null)`. No reactivity, no binding, no patch cycle.
- Assign, mutate, and delete freely with standard JavaScript
- Survives navigation. Shared across all pages.
- Added to `RESERVED_CLERA_KEYS`. Cannot be clobbered by `app.data()`.
- Added to `SAFE_EXPOSURE_REGISTRY`. Available via `expose: "clera"`.
- `{memory.x}` bindings in HTML are not supported. Resolves to `""` via normal `BINDING_UNRESOLVED` path.

## 📦 v0.6.4
- Reusable Block System: Phase B: Named instance scope
- `<use template="..." name="instance" />` creates an isolated data scope per instance
- `context.instanceName`: instance scopes exposed directly on context for natural read/write
- `pageRecord.instances`: new per-page store for instance scope objects
- `instanceName` field added to binding records. Each record now knows its scope.
- `resolveDataPath()` extended with third parameter. Resolution order: instance then page then global then `""` fallback.
- `[CLERA:USE_NAME_DUPLICATE]`: duplicate instance name on same page (dev mode)
- `[CLERA:USE_NAME_RESERVED]`: instance name matches a Clera built-in context property (dev mode)

## 📦 v0.6.3
- Reusable Block System: Phase A: shared mode
- `<template id="...">`: native HTML template element as definition-only reusable source
- `[template][id]`: live DOM element as reusable source (renders and registers)
- `<use template="id" />`: instantiates a template source via clone; uses `querySelectorAll("use[template]")` to avoid SVG collision
- `[template]` sources marked `data-clera-template-source` and excluded from binding scan
- Clones strip `template`, `id`, and `data-clera-template-source` attributes. Prevents duplicate ids.
- `app.map(dataObject, string)`: pure string helper; `{key}` interpolation from object; developer owns iteration
- `processUseElementsWithin()` runs at mount, and inside `context.render()` and `context.append()`
- Inner id warnings in templates are mandatory in dev mode (`[CLERA:TEMPLATE_INNER_ID_DUPLICATE]`)
- Inline changelogs removed from `clera.js`. Migrated to `CHANGELOG.md`.
- Error codes added: `TEMPLATE_ID_REQUIRED`, `TEMPLATE_DUPLICATE_ID`, `TEMPLATE_INNER_ID_DUPLICATE`, `USE_TEMPLATE_REQUIRED`, `USE_TEMPLATE_NOT_FOUND`

## 📦 v0.6.2
- Plugin component shape enforcement via `selfClosing` config option
- `selfClosing: false` (default): container component, may contain children
- `selfClosing: true`: self-closing/atomic component, must not contain children
- Dev mode warns `[CLERA:COMP_INVALID_SYNTAX]` if a `selfClosing: true` component has child nodes
- `selfClosing` flag passed as third argument to `parser(element, CLERA, { selfClosing })`
- Browser limitation noted: source-level `<tag />` vs `<tag></tag>` detection requires the transpiler

## 📦 v0.6.1
- Bug fixes: 7 issues found and resolved by static audit of the data system
- `caughtFormError` variable rename completed (missed in v0.5.10)
- `scanBindings()` no longer accumulates duplicate binding records on LRU remount. `isFullPageScan` parameter added.
- `exposeDataKeys()` now guards against clobbering built-in `context` and `CLERA` properties. `RESERVED_CONTEXT_KEYS` and `RESERVED_CLERA_KEYS` added, warns `[CLERA:DATA_KEY_RESERVED]`.
- `resolveDataPath()` filters empty segments from malformed paths like `user..name`
- `context.fetch()` now guards against missing `window.fetch`. Warns `[CLERA:FETCH_UNSUPPORTED]` and rejects cleanly.
- `__patchPage()` (hot-reload) now resets `bindingNodes` before rescanning
- `destroyPage()` now clears `bindingNodes` on LRU eviction to prevent stale DOM node references

## 📦 v0.6.0
- Data system introduced. Global data via `app.data()`, page-local data via `context.data()`.
- `{path}` binding syntax in HTML. Dot-notation paths auto-resolved in text nodes and attributes.
- Bindings scanned at mount time and after `render()` / `append()` calls
- Data resolution order: page-local then global then `""` fallback
- `context.update()` and `app.update()`: manual DOM patch trigger for external mutations
- `context.fetch(url, options?, callback?)`: Clera-aware fetch with auto-update, query params, body auto-serialization, timeout support
- `context.timeout(callback, delay)`: Clera-aware `setTimeout` with auto-update
- DOM bindings auto-patch after every action, form action, lifecycle hook, `context.fetch()`, and `context.timeout()` call
- `app.data` and `app.update` added to `SAFE_EXPOSURE_REGISTRY`

## 📦 v0.5.10
- Internal variable renames reverted to idiomatic JS: `bridgeMessage → msg`, `caughtError → err`
- Public API and exposed names unchanged

## 📦 v0.5.9
- `context.render()` gains `{ reserveHeight: true }` option. Prevents layout jump during content swap by pinning the container's current height while innerHTML is replaced.

## 📦 v0.5.8
- Page persistence via `persistPage: true` in config. Saves the active page to `localStorage` on every navigation and restores it on boot.
- Initial page resolution updated with new priority tier: explicit config then persisted page then "home" then first page

## 📦 v0.5.7
- `class` attribute on `<page>` elements is now copied to the mounted element, enabling `page.myClass` CSS selectors
- Completes the page styling story alongside `id` (added in v0.5.6)

## 📦 v0.5.6
- Mounted pages are now `<page>` elements instead of `<div>` elements. CSS targeting `page { }` now works naturally.
- `id` attribute on `<page>` elements is copied to the mounted element, enabling `#id` CSS selectors

## 📦 v0.5.5
- Baseline CSS now resets browser default margins and padding on `body`, `h1`–`h6`, `p`, `ul`, `ol`, `dl`, `menu`, `blockquote`, `figure`, `pre`, `hr`, `dd`
- `ul`, `ol`, `menu` have `list-style: none` applied by default

## 📦 v0.5.4
- `context.render(selector, html)`: replace element innerHTML, scoped to current page
- `context.append(selector, html)`: add to element innerHTML
- `context.clear(selector)`: empty an element

## 📦 v0.5.3
- All abbreviated variable and parameter names expanded to descriptive names throughout the runtime and documentation
- `el` property on query wrapper renamed to `element`

## 📦 v0.5.2
- `app.config()` guard fixed. Now checks `isStarted` instead of `isBooted`, closing a window where config could silently mutate the locked config object.
- `app.start()` called more than once now emits `[CLERA:DOUBLE_START]` instead of silently no-oping
- Diagnostic code renamed: `CONFIG_AFTER_BOOT` to `CONFIG_AFTER_START`

## 📦 v0.5.1
- Form submissions automatically collect values into `context.values`. No manual `FormData` or DOM querying needed.
- `context.form`, `context.formData`, `context.submitter`, `context.resetForm()`, `context.setSubmitting()` added to form action context
- Bug fix: syntax error in `extractPagesFromAppRoot()` (missing closing parenthesis)

## 📦 v0.5.0
- Zero-mental-load action resolution. Plain global functions are auto-discovered by name via `window[actionName]`.
- ❌ No registration required: write `function addTask() {}`, use `action="addTask"` in HTML
- Resolution order: page-local then global registered then global function
- Improved error message for `ACTION_NOT_FOUND`. Names the expected function.

## 📦 v0.4.1
- `app.php()` added. Lightweight POST helper with Promise and callback styles.
- Auto-start added. `app.start()` is now optional.
- `app.config()` added. Declare config without triggering boot.
- Initial page resolution: `config.initial` then "home" then first page
- Single boot path. Both explicit start and auto-start use `internalStart()`.

## 📦 v0.4.0
- Bridge subsystem added
- Hardware module. All seven capabilities return Promises.
- New capabilities: share, camera, files.pick, files.save, location

## 📦 v0.3.x
- Bridge subsystem introduced
- Hardware capabilities refactored to Promise-based API

## 📦 v0.2.x
- Boot order fix. Queue flushed before initial navigation.
- `app.actions` setter upgraded. Merges instead of replacing.
- Namespace renamed: `PWA` to `CLERA` (legacy `PWA` alias retained)
- Exposure mode upgraded

## 📦 v0.1.x
- Initial release
