# 📳 Vibration

Vibrate the device for a given number of milliseconds.

```js
await app.hardware.vibrate(200); // default
await app.hardware.vibrate(80);  // short tap
await app.hardware.vibrate(500); // longer buzz
```

The default duration is `200` ms if no argument is passed.

---

## 🌐 Browser support

Uses the [Web Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API). Supported in Chrome and Android browsers. Not supported in Safari or iOS browsers.

On unsupported browsers the Promise resolves silently without vibrating. The `hardware.vibrate` capability flag reflects actual support:

```js
if (app.capabilities["hardware.vibrate"]) {
  await app.hardware.vibrate(80);
}
```

---

## 💡 Common uses

Vibration works best as a subtle confirmation. Use it sparingly: too much vibration feels like a malfunction.

```js
// Short tap on confirm
async function confirmDelete(context) {
  removeItem(context.params.id);
  app.hardware.vibrate(80).catch(() => {}); // ignore if unsupported
  context.render("#list", buildList());
}

// Error feedback
async function showValidationError(context) {
  context.render("#error", "Please fill in all fields.");
  app.hardware.vibrate(300).catch(() => {});
}
```

Calling `.catch(() => {})` silences the rejection on unsupported devices so the rest of your function continues normally.

---

## Next

[03 Clipboard](./03-clipboard.md)
