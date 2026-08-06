# 🌉 Bridge Overview

Clera apps run inside a browser or WebView. The bridge is what connects your JavaScript to native device capabilities: camera, location, clipboard, and more.

You write one API call. Clera routes it to the right place depending on where the app is running.

---

## 🔧 How it works

When you call a hardware method like `app.hardware.camera()`, the runtime:

1. Checks the current environment
2. Sends a request to the active bridge adapter (native or browser)
3. The adapter resolves or rejects the returned Promise

All hardware methods return Promises. Always use `try/catch` or `.catch()` to handle the case where the user denies permission, cancels, or is on an unsupported device.

---

## 🌍 Bridge environments

Clera detects the environment automatically at boot:

| Environment | How it is detected |
|-------------|-------------------|
| `browser` | Standard web browser (default) |
| `pwa` | Browser in standalone display mode |
| `native-ios` | `window.webkit.messageHandlers.cleraBridge` is present |
| `native-android` | `window.CleraAndroidBridge.postMessage` is a function |
| `simulator` | `window.__CLERA_SIMULATOR__` is `true` |
| `preview` | `window.__CLERA_PREVIEW__` is `true` |

Read the active environment at any time:

```js
app.bridge.env; // "browser" | "pwa" | "native-ios" | "native-android" | "simulator" | "preview"
```

`simulator` and `preview` use the same browser implementations as `browser` and `pwa`. They are development environments only.

---

## 🌐 Browser fallbacks

Every hardware capability has a browser fallback using standard Web APIs. This means you can develop and test all hardware features in a desktop browser before deploying to a device.

| Capability | Browser implementation |
|------------|----------------------|
| `vibrate` | Web Vibration API |
| `clipboard` | Clipboard API |
| `share` | Web Share API (falls back to clipboard if unavailable) |
| `camera` | `<input type="file" capture>` |
| `location` | Geolocation API |
| `files.pick` | `<input type="file">` |
| `files.save` | Anchor element download |

---

## 🤖 Checking capabilities

Before using a capability, you can check whether it is available in the current environment:

```js
app.capabilities;
// {
//   "hardware.vibrate":    true,
//   "hardware.clipboard":  true,
//   "hardware.share":      true,
//   "hardware.camera":     true,
//   "hardware.location":   true,
//   "hardware.files.pick": true,
//   "hardware.files.save": true
// }
```

`hardware.camera`, `hardware.files.pick`, and `hardware.files.save` are always `true` because file input and anchor download are universally available. The others depend on the current environment and browser support.

---

## ⚠️ Error handling

All capabilities return Promises. Always handle rejections:

```js
try {
  const photo = await app.hardware.camera();
  showPhoto(photo.uri);
} catch (error) {
  showError("Camera not available: " + error.message);
}
```

The user may deny permission, cancel the picker, or be on a device that does not support the feature. An unhandled rejection will surface as an uncaught Promise error.

---

## 📱 Native packaging

Clera apps run inside iOS and Android WebViews. Use Clera Studio or Clera Packager to build and package your app for native distribution.

If you are writing your app in `.clera` files, Clera Studio handles transpilation automatically as part of the build process. You do not need to run the transpiler separately before packaging.

---

## Next

[02 Vibration](./02-vibration.md)
