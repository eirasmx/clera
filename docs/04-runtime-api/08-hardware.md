# 📱 app.hardware

Native device capabilities accessed through a unified Promise-based API. Works in browser (using Web APIs), iOS (via WKWebView bridge), and Android (via WebView bridge).

---

## All capabilities return Promises

```js
app.hardware.vibrate(200)
  .then(() => console.log("done"))
  .catch((error) => console.error(error.message));

// or with async/await:
async function buzz() {
  await app.hardware.vibrate(200);
}
```

---

## Capabilities

### `hardware.vibrate(ms)`

Vibrate the device for the given number of milliseconds.

```js
await app.hardware.vibrate(100);
```

Browser: uses the Web Vibration API. Not supported on iOS Safari.

---

### `hardware.clipboard(text)`

Copy text to the device clipboard.

```js
await app.hardware.clipboard("Hello from Clera!");
```

---

### `hardware.share(options)`

Invoke the native share sheet.

```js
await app.hardware.share({
  title: "Check this out",
  text:  "Something worth sharing",
  url:   "https://example.com"
});
```

Browser: uses the Web Share API. Requires a secure context (HTTPS or localhost).

---

### `hardware.camera(options?)`

Open the camera and return a captured image or video.

```js
const result = await app.hardware.camera({ mode: "photo" }); // or "video"
console.log(result.uri);      // object URL or native URI
console.log(result.name);     // file name
console.log(result.mimeType); // "image/jpeg" etc.
```

Browser: uses a file input with `capture="environment"`.

---

### `hardware.location(options?)`

Get the device's current GPS location.

```js
const position = await app.hardware.location({ highAccuracy: true });
console.log(position.latitude);
console.log(position.longitude);
console.log(position.accuracy); // metres
```

Options: `highAccuracy` (boolean), `timeout` (ms, default 10000), `maximumAge` (ms, default 0).

---

### `hardware.files.pick(options?)`

Open the file picker and return selected files.

```js
const result = await app.hardware.files.pick({
  accept:   "image/*",
  multiple: true
});

result.files.forEach((file) => {
  console.log(file.name, file.size, file.uri);
});
```

---

### `hardware.files.save(options)`

Save a file to the device.

```js
await app.hardware.files.save({
  name:     "report.txt",
  content:  "Hello world",
  mimeType: "text/plain"
});
```

Browser: triggers a download via an anchor element.

---

## ⚠️ Error handling

All capabilities reject with an `Error` if the operation fails or is cancelled:

```js
try {
  const position = await app.hardware.location();
} catch (error) {
  console.error("Location failed:", error.message);
}
```

---

## 🔍 app.capabilities

A static map reflecting actual capability availability in the current environment. Read once at boot. The values do not change at runtime.

```js
app.capabilities["hardware.vibrate"]     // boolean
app.capabilities["hardware.clipboard"]   // boolean
app.capabilities["hardware.share"]       // boolean
app.capabilities["hardware.camera"]      // always true
app.capabilities["hardware.location"]    // boolean
app.capabilities["hardware.files.pick"]  // always true
app.capabilities["hardware.files.save"]  // always true
```

| Key | Native | Browser/PWA |
|-----|--------|-------------|
| `hardware.vibrate` | `true` | `true` if `navigator.vibrate` exists (not iOS Safari) |
| `hardware.clipboard` | `true` | `true` if `navigator.clipboard` or `execCommand` available |
| `hardware.share` | `true` | `true` only if Web Share API is available. `false` means clipboard fallback. |
| `hardware.camera` | `true` | always `true` (file input fallback) |
| `hardware.location` | `true` | `true` if `navigator.geolocation` exists |
| `hardware.files.pick` | `true` | always `true` (file input) |
| `hardware.files.save` | `true` | always `true` (anchor download) |

Use `app.capabilities` to gate UI before calling a capability, rather than calling and catching:

```js
if (!app.capabilities["hardware.share"]) {
  // hide the share button, only clipboard fallback available
}
```

---

## Next

[09 service-worker()](./09-service-worker.md)
