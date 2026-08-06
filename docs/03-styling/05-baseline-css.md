# 🎨 Baseline CSS

Clera injects a small stylesheet at boot to reset browser defaults and set up structural layout. It is injected once, before your own CSS loads, and never duplicated.

---

## 🤖 What it contains

The baseline uses `:where()` for all selectors. This gives every rule a specificity of zero, so any rule you write in your own stylesheet overrides it without needing extra specificity or `!important`.

```css
/* Box sizing */
:where(*, *::before, *::after) { box-sizing: border-box; }

/* Page body reset */
:where(body, html) { margin: 0; padding: 0; height: 100%; overflow: hidden; }

/* App root */
:where(app) {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

/* Pages: hidden by default, visible when mounted */
:where(page) { visibility: hidden; }
:where(page[data-app-page]) {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: auto;
  position: relative;
  box-sizing: border-box;
  visibility: visible;
}
:where(page[data-app-page][data-clera-hidden]) { display: none !important; }

/* Splash screen */
:where(splash) {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  inset: 0;
  z-index: 9999;
  background: #fff;
}

/* Tab bar */
:where(tabbar) {
  display: flex;
  flex-shrink: 0;
  width: 100%;
  align-items: center;
  justify-content: space-evenly;
  padding-bottom: max(env(safe-area-inset-bottom), 30px);
  z-index: 100;
}

:where(tab) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Template elements */
:where(use) { display: none; }

/* Common block element reset */
:where(p, h1, h2, h3, h4, h5, h6, ul, ol, li, figure, figcaption, blockquote, dl, dd) {
  margin: 0;
  padding: 0;
}

/* Unknown custom elements default to block */
:where(/* non-standard elements */) { display: block; }
```

---

## Why `:where()` is used

Standard CSS specificity means a rule like `page { padding: 20px; }` in your stylesheet would normally lose to a runtime rule like `page { overflow: auto; }` if both have the same specificity. `:where()` reduces the baseline rules to zero specificity, so your rules always win even when written at the same specificity level.

---

## Why it resets these elements

Browsers apply default margin and padding to common elements. Without resetting them, spacing inside Clera pages is inconsistent across browsers.

| Element | Browser default removed |
|---------|------------------------|
| `body` | `margin: 8px` |
| `p` | `margin-block: 1em` |
| `h1`–`h6` | Various `margin-block` values |
| `ul`, `ol` | `margin-block: 1em; padding-inline-start: 40px` |
| `blockquote` | `margin: 1em 40px` |
| `figure` | `margin: 1em 40px` |
| `dl`, `dd` | Various margin values |

---

## 🎨 Overriding the baseline

Because the baseline uses `:where()`, any rule you write overrides it automatically. No `!important` required.

If you want list bullets back:

```css
ul { list-style: disc; padding-inline-start: 24px; }
```

If you want heading margins:

```css
h1 { margin-bottom: 16px; }
h2 { margin-bottom: 12px; }
```

---

## The style element

The injected style block has the id `cre-baseline`. You can inspect it in browser DevTools under the `<head>` element.

---

## Next

[04 Runtime API](../04-runtime-api/01-clera-global.md)
