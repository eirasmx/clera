# 📋 Clera Docs: Todo

> ⚠️ Mark items as `[x]` ONLY when the chapter is fully written, reviewed, and accurate against the runtime. Do not mark done speculatively.

---

## ✅ Done

- [x] `README.md`
- [x] `00-introduction/01-what-is-clera.md`
- [x] `00-introduction/02-design-philosophy.md`
- [x] `00-introduction/03-why-clera.md`
- [x] `00-introduction/04-runtime-not-framework.md`
- [x] `01-getting-started/01-installation.md`
- [x] `01-getting-started/02-first-app.md`
- [x] `01-getting-started/03-how-clera-works.md`
- [x] `01-getting-started/04-project-structure.md`
- [x] `01-getting-started/05-running-and-preview.md`
- [x] `02-core-concepts/01-app-tag.md`
- [x] `02-core-concepts/02-page-tag.md`
- [x] `02-core-concepts/03-navigation.md`
- [x] `02-core-concepts/04-actions.md`
- [x] `02-core-concepts/05-lifecycle.md`
- [x] `02-core-concepts/06-pagecontext.md`
- [x] `02-core-concepts/07-forms-and-values.md`
- [x] `02-core-concepts/08-rendering-helpers.md`
- [x] `02-core-concepts/09-persist-page.md`
- [x] `02-core-concepts/10-data-system.md`
- [x] `02-core-concepts/11-async-helpers.md`
- [x] `02-core-concepts/12-reusable-blocks.md`
- [x] `02-core-concepts/13-import.md`
- [x] `02-core-concepts/14-memory.md`
- [x] `02-core-concepts/15-page-listeners.md`
- [x] `03-styling/01-styling-in-clera.md`
- [x] `03-styling/02-custom-tags-and-css.md`
- [x] `03-styling/03-layout-patterns.md`
- [x] `03-styling/04-responsive-behavior.md`
- [x] `03-styling/05-baseline-css.md`
- [x] `04-runtime-api/01-clera-global.md`
- [x] `04-runtime-api/02-start.md`
- [x] `04-runtime-api/03-config.md`
- [x] `04-runtime-api/04-page.md`
- [x] `04-runtime-api/05-navigate.md`
- [x] `04-runtime-api/06-current-page.md`
- [x] `04-runtime-api/07-register-component.md`
- [x] `04-runtime-api/08-hardware.md`
- [x] `04-runtime-api/09-service-worker.md`
- [x] `04-runtime-api/10-php.md`
- [x] `04-runtime-api/11-diagnostics.md`
- [x] `05-routing/01-built-in-routing.md`
- [x] `05-routing/02-persisted-page-routing.md`
- [x] `05-routing/03-router-overview.md`
- [x] `06-native-features/01-bridge-overview.md`
- [x] `06-native-features/02-vibration.md`
- [x] `06-native-features/03-clipboard.md`
- [x] `06-native-features/04-share.md`
- [x] `06-native-features/05-camera.md`
- [x] `06-native-features/06-location.md`
- [x] `06-native-features/07-file-pick.md`
- [x] `06-native-features/08-file-save.md`
- [x] `07-clera-language/01-clera-overview.md`
- [x] `07-clera-language/02-writing-clera-files.md`
- [x] `07-clera-language/03-errors.md`
- [x] `08-examples/01-hello-world.md`
- [x] `08-examples/02-counter.md`
- [x] `08-examples/03-task-list.md`
- [x] `08-examples/04-tabs-app.md`
- [x] `08-examples/05-notes-app.md`
- [x] `08-examples/06-form-handling.md`
- [x] `08-examples/07-dashboard.md`
- [x] `08-examples/08-chat-ui.md`
- [x] `08-examples/09-product-list.md`
- [x] `09-production/01-production-readiness.md`
- [x] `09-production/03-debugging.md`
- [x] `09-production/04-error-handling.md`
- [x] `09-production/05-deployment.md`
- [x] `10-ai/01-clera-ai-overview.md`
- [x] `10-ai/02-clera-build-prompt.md`
- [x] `10-ai/03-clera-rules-for-ai.md`
- [x] `10-ai/04-prompts.md`
- [x] `11-reference/01-html-attribute-reference.md`
- [x] `11-reference/02-pagecontext-reference.md`
- [x] `11-reference/03-lifecycle-reference.md`
- [x] `11-reference/04-config-reference.md`
- [x] `11-reference/05-error-codes.md`
- [x] `11-reference/06-version-history.md`

---

## 🔴 Missing — Undocumented Features (verified against runtime.js)

These features exist in the runtime and have zero documentation. Each needs a new file or a targeted addition to an existing file.

### Inline action arguments

- [x] Add to `02-core-concepts/04-actions.md`: the inline argument syntax on the `action` attribute. Both forms must be shown: colon syntax (`action="delete: {task.id}"`) and function-call syntax (`action="delete(42)"`). Supported arg types: number, string, boolean, null, state binding. Document `context.args` (array) and `context.arg` (first-arg shorthand) on the context object.
- [x] Add to `11-reference/01-html-attribute-reference.md`: `action` attribute entry must include the inline arg syntax and all supported types.
- [x] Add to `11-reference/02-pagecontext-reference.md`: `context.args` and `context.arg` entries are missing entirely.

### Platform-targeted pages

- [x] Add to `02-core-concepts/02-page-tag.md`: the `target=` attribute on `<page>`. Accepted values: `ios`, `android`, `web`, `pwa`, `native` (expands to `ios,android`), `desktop` (expands to `web,pwa`). Comma-separated combinations allowed. Pages that do not match the current platform are removed from the DOM at boot and never registered. Absent `target` means all platforms.
- [x] Add to `11-reference/01-html-attribute-reference.md`: `target` attribute row for `<page>` is missing.

### Tabbar position

- [x] Add to `02-core-concepts/01-app-tag.md`: the `position` attribute on `<tabbar>`. Values: `"top"` or absent (default bottom). Top position applies safe-area inset padding automatically. Bottom position applies safe-area inset padding automatically.
- [x] Add to `11-reference/01-html-attribute-reference.md`: `position` attribute row for `<tabbar>` is missing.

### `app:layoutchange` window event

- [x] Add to `02-core-concepts/01-app-tag.md`: the `app:layoutchange` CustomEvent (added to app-tag.md) fired on `window`. Detail shape: `{ layout: "mobile"|"tablet"|"desktop", width: number }`. Useful for vanilla JS listeners outside Clera-managed handlers. Note that `app.onLayoutChange()` is the preferred Clera-managed form.
- [x] Add to `11-reference/01-html-attribute-reference.md` or a new events reference: the `app:layoutchange` event is not listed anywhere in the reference.

### Plugin system

- [x] Create `04-runtime-api/12-plugins.md`: full plugin API. The `app.use()` method is listed in the global table but the plugin shape and all hooks are undocumented. Must cover: `install(CLERA)`, `onReady(CLERA)`, `onPageMount(name, el, CLERA)`, `onPageShow(name, el, CLERA)`, `onPageHide(name, el, CLERA)`, `onPageDestroy(name, el, CLERA)`, `onRender(containerEl, pageName, CLERA)`. Include a worked example of a minimal plugin.

### `context.query()` full API

- [x] `context.query()` full API already covered in `06-pagecontext.md`. Existing reference entry verified complete. but never formally introduced in core concepts. Must document the full chainable object it returns: `exists`, `element`, `text()`, `text(val)`, `html()`, `html(val)`, `value()`, `value(val)`, `on(event, fn)`.
- [x] Update `11-reference/02-pagecontext-reference.md`: the `context.query()` entry exists but is incomplete. `wrapper.html()` and `wrapper.on()` are missing from the return value table.

### `context.unsafe`

- [x] Add to `02-core-concepts/06-pagecontext.md`: `context.unsafe` expanded with binding engine warning at all. Needs a section explaining when and why to reach for it, and a warning that direct DOM manipulation bypasses the binding engine. Three methods: `context.unsafe.root()`, `context.unsafe.document()`, `context.unsafe.window()`.

### `context.log`

- [x] Add to `02-core-concepts/06-pagecontext.md`: `context.log` expanded with full method table and code format note. Needs a section showing how to emit structured entries into the Clera diagnostics buffer from user code. Two methods: `context.log.warn(code, msg)` and `context.log.error(code, msg, caughtError?)`. Note that entries appear in `app.diagnostics` and in the console formatted as `[CRE:CODE] message`.

---

## 🟡 Incomplete — Existing Files Need Additions

These files exist and are partially correct but are missing specific runtime-verified details.

- [x] `02-core-concepts/02-page-tag.md`: three keep-alive forms documented: `keep-alive` (attribute), `keepalive` (attribute), and `keepAlive="true"` (string). Currently only one form is shown.
- [x] `02-core-concepts/11-async-helpers.md`: all context.fetch() options already fully documented — no change needed
- [x] `06-native-features/04-share.md`: degraded mode already documented — no change needed
- [x] `04-runtime-api/08-hardware.md`: `app.capabilities` section added with full map and usage example

---

## 🗑️ Stale Files to Delete

These files were superseded by splits or renames and should be removed from the zip:

- [x] Delete `04-runtime-api/09-sw-php-diagnostics.md` (already absent from disk): replaced by `09-service-worker.md`, `10-php.md`, `11-diagnostics.md`
- [x] Delete `06-native-features/02-vibration-clipboard-share.md` (already absent from disk): replaced by individual files `02-vibration.md`, `03-clipboard.md`, `04-share.md`
- [x] Delete `06-native-features/03-camera-location.md` (already absent from disk): replaced by `05-camera.md` and `06-location.md`
- [x] Delete `06-native-features/05-file-pick-save.md` (already absent from disk): replaced by `07-file-pick.md` and `08-file-save.md`

---

## 📝 Missing from todo — Exists on Disk But Not Previously Tracked

These files are written and on disk but were never added to the done list. Review each before marking done:

- [x] `09-production/02-performance-guidelines.md`
- [x] `07-clera-language/01-clera-overview.md`
- [x] `07-clera-language/02-writing-clera-files.md`
- [x] `07-clera-language/03-errors.md`
