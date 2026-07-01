# 📤 Share

Invoke the native share sheet to let the user share a link, text, or title via any installed app.

```js
await app.hardware.share({
  title: "Check this out",
  text:  "I found something great",
  url:   "https://example.com/article"
});
```

All three fields are optional. Pass whichever are relevant to what you are sharing.

---

## 🌐 Browser support

Uses the [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API). Requires a secure context and a user gesture: the call must originate from a user interaction such as a button tap. Supported in Safari, Chrome on Android, and most mobile browsers.

### Share fallback

If the Web Share API is not available, Clera falls back to copying the URL (or text) to the clipboard. The resolved value will include `{ degraded: true }` to indicate that the share sheet was not shown.

```js
const result = await app.hardware.share({ url: "https://example.com" });
if (result?.degraded) {
  context.render("#status", "Link copied to clipboard");
}
```

The `hardware.share` capability flag is `false` when the share sheet is not available, which lets you adjust your UI before the call:

```js
if (app.capabilities["hardware.share"]) {
  showShareButton();
} else {
  showCopyButton();
}
```

---

## 💡 Common use

```js
async function shareArticle(context) {
  try {
    await app.hardware.share({
      title: context.params.title,
      url:   context.params.url
    });
  } catch (error) {
    // user cancelled the share sheet, no action needed
  }
}
```

A cancelled share sheet rejects the Promise. Catching the error and doing nothing is the correct response.

---

## Next

[05 Camera](./05-camera.md)
