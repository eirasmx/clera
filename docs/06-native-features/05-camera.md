# 📷 Camera

Open the camera or photo library and return the captured file.

```js
const photo = await app.hardware.camera({ mode: "photo" });

console.log(photo.uri);      // object URL (browser) or native URI (iOS/Android)
console.log(photo.name);     // file name
console.log(photo.size);     // file size in bytes
console.log(photo.mimeType); // "image/jpeg", "image/png", etc.
```

---

## ⚙️ Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `mode` | string | `"photo"` | `"photo"` opens the camera for images. `"video"` opens it for video. |

---

## 🌐 Browser behaviour

Opens a file input with `accept="image/*"` (or `video/*` for video mode) and `capture="environment"`. On mobile browsers this opens the camera directly. On desktop it opens a file picker instead.

`photo.uri` in the browser is a Blob URL. It is valid for the lifetime of the page.

---

## 💡 Common uses

### Show a preview

```js
async function takeProfilePhoto(context) {
  try {
    const photo = await app.hardware.camera({ mode: "photo" });
    context.query("#profilePhoto").element.src = photo.uri;
  } catch (error) {
    // user cancelled
  }
}
```

### Upload the captured file

```js
async function captureAndUpload(context) {
  const photo = await app.hardware.camera();

  const response = await fetch(photo.uri);
  const blob     = await response.blob();
  const form     = new FormData();
  form.append("photo", blob, photo.name);

  await fetch("/api/upload", { method: "POST", body: form });
}
```

`photo.uri` is a Blob URL in the browser, so `fetch(photo.uri)` retrieves the raw bytes as a blob that you can append to a `FormData`.

---

## Next

[06 Location](./06-location.md)
