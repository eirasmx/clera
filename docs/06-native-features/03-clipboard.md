# 📋 Clipboard

Copy text to the device clipboard.

```js
await app.hardware.clipboard("Text to copy");
```

---

## 🌐 Browser support

Uses the [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API). Requires a secure context (HTTPS or localhost). The user may be prompted for permission on some browsers.

---

## 💡 Common use

```js
async function copyInviteCode(context) {
  const code = context.query("#inviteCode").text();
  try {
    await app.hardware.clipboard(code);
    context.render("#copyStatus", "Copied!");
  } catch (error) {
    context.render("#copyStatus", "Copy failed");
  }
}
```

Show feedback after copying. Users cannot see the clipboard change, so a visible confirmation ("Copied!") is important.

---

## Next

[04 Share](./04-share.md)
