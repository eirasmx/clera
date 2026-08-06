# ♿ Accessibility

Clera includes a platform comfort layer that activates automatically when your app is running as a PWA or inside a native shell. It applies a small set of CSS rules that prevent common mobile awkwardness: iOS focus zoom, tap highlight rings, accidental text selection, and long-press callouts.

---

## 🔧 How to configure it

Pass `accessibility` to `app.start()`. The default is `"auto"` and works correctly for most apps without any configuration.

```js
app.start({
  initial: "home",
  accessibility: "auto"  // default, no need to set this explicitly
});
```

---

## 📋 Accepted values

| Value | Behavior |
|-------|----------|
| `"auto"` | Activates only in PWA and native shell contexts. Does nothing in a regular browser tab. This is the default. |
| `true` or `"on"` | Accessibility stays on. The comfort layer never applies, regardless of context. |
| `false` or `"off"` | Accessibility is turned off. The comfort layer always applies, regardless of context. |
| `{ mode, ios, android }` | Per-platform control. See below. |

```js
// Accessibility stays on, comfort layer never applies
app.start({ accessibility: true });

// Accessibility turned off, comfort layer always applies
app.start({ accessibility: false });

// Default: auto
app.start({ accessibility: "auto" });
```

---

## ⚙️ Object form

The object form gives you control over individual platforms.

```js
app.start({
  accessibility: {
    mode: "auto",   // "auto" | "on" | "off"
    ios: true,      // whether iOS rules apply when mode activates
    android: true   // reserved, no rules yet
  }
});
```

`mode` follows the same logic as the string form. `"on"` keeps accessibility on and the comfort layer never applies. `"off"` turns accessibility off and the comfort layer always applies. `ios` and `android` let you opt out of rules for a specific platform when the comfort layer does activate. Both default to `true` if omitted.

```js
// Auto mode, but skip iOS rules specifically
app.start({
  accessibility: { mode: "auto", ios: false }
});
```

---

## 🔍 When does "auto" activate?

In `"auto"` mode, the comfort layer activates when any of the following are true at boot:

- The `(display-mode: standalone)` media query matches. This means the app is installed as a PWA and running outside the browser UI.
- `navigator.standalone` is `true`. This is the iOS homescreen app flag.
- A Clera native bridge is detected. This covers iOS WKWebView shells, Android WebView shells, the Clera simulator, and the Clera preview tool.

It does not activate in a regular browser tab. If you are testing in Chrome or Safari, the rules will not fire unless you install the app or set `accessibility: true` explicitly.

---

## 📐 What it applies (iOS)

When active, Clera injects these CSS rules:

```css
/* Prevents iOS Safari from zooming in when an input is focused.
   Inputs smaller than 16px trigger automatic zoom. Setting font-size
   to at least 16px disables that behavior. */
input, textarea, select {
  font-size: max(16px, 1em);
}

/* Removes the blue tap highlight that appears on touch in mobile browsers.
   App-like interfaces do not show this. */
* {
  -webkit-tap-highlight-color: transparent;
}

/* Prevents accidental text selection on UI labels, buttons, and nav items.
   Inputs and textareas remain selectable. */
body {
  -webkit-user-select: none;
  user-select: none;
}

input, textarea {
  -webkit-user-select: text;
  user-select: text;
}

/* Prevents the long-press callout menu on non-interactive elements.
   Links, inputs, and textareas keep their default behavior. */
body {
  -webkit-touch-callout: none;
}

a, input, textarea {
  -webkit-touch-callout: default;
}
```

These rules are only visible on platforms that have the relevant quirks. On desktop browsers they have no effect.

> ⚠️ The `font-size: max(16px, 1em)` rule on inputs may affect your visual design if you are using smaller font sizes. If you want to keep smaller input text, set `ios: false` and handle the zoom prevention yourself using `touch-action` or a viewport meta tag approach.

---

## Android

The `android` field is accepted in the object form but has no rules attached to it yet. It is included in the API shape so the interface does not need to change when Android-specific rules are added in a future version.

---

## Next

[05 page()](./05-page.md)
