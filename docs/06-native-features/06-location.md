# 📍 Location

Get the device's current GPS position.

```js
const position = await app.hardware.location();

console.log(position.latitude);  // e.g. 51.5074
console.log(position.longitude); // e.g. -0.1278
console.log(position.accuracy);  // metres of uncertainty
console.log(position.altitude);  // metres above sea level, or null
console.log(position.timestamp); // Unix timestamp in ms
```

---

## ⚙️ Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `highAccuracy` | boolean | `false` | Request GPS-level accuracy. Slower and uses more battery than network-based location. |
| `timeout` | number | `10000` | Max milliseconds to wait before rejecting. |
| `maximumAge` | number | `0` | Max age in ms of a cached position to accept. `0` always requests a fresh reading. |

---

## 🌐 Browser behaviour

Uses the [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API). The browser will prompt the user for permission before returning a position. Requires a secure context (HTTPS or localhost).

If the user denies permission or the device does not support geolocation, the Promise rejects with an error message.

---

## 💡 Common use

```js
async function findNearby(context) {
  try {
    const position = await app.hardware.location({ highAccuracy: true });
    const { latitude, longitude } = position;
    await loadNearbyResults(latitude, longitude, context);
  } catch (error) {
    context.render("#locationStatus", "Location unavailable. Please enable location access.");
  }
}
```

Show a clear message when location fails. The user may have denied permission or have no signal. Tell them what to do rather than showing a generic error.

---

## Next

[07 File Pick](./07-file-pick.md)
