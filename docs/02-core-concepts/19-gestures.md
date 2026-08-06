# 👆 Gestures

A gesture is a movement pattern built from raw pointer input, like a swipe left to dismiss a card. Clera recognizes gestures itself instead of relying on a single native browser event, since no native event maps directly to "the user swiped left."

`swipe` is the only gesture Clera recognizes right now. `drag`, `pinch`, `rotate`, `tap`, and `doubletap` are reserved for future versions.

---

## 📝 Declaring a swipe

Add the `onswipe` attribute to any element:

```html
<div onswipe="archive">Swipe me</div>
```

This works exactly like the `action` attribute. Clera looks for a function named `archive`, the same three ways it resolves any action: a page-local action, a registered global action, then a plain global function.

```js
function archive(context) {
  const swipe = context.event;
  if (swipe.phase === "end" && swipe.direction === "left") {
    removeCard();
  }
}
```

---

## ⚙️ Registering a swipe in code

Elements created at runtime, for example inside `context.render()`, are not on the page when Clera scans for `onswipe` attributes at mount. For those, register the gesture directly with `app.gesture()`:

```js
function renderTaskCard(context, task) {
  const card = document.createElement("div");
  card.textContent = task.title;
  app.gesture(card, "swipe", "dismissTask");
  document.querySelector("#taskList").appendChild(card);
}
```

`app.gesture()` also accepts a callback function in place of an action name:

```js
app.gesture(card, "swipe", () => {
  const swipe = context.event;
  console.log(swipe.direction);
});
```

Call `app.gesture()` from inside an action that is already running on the page the element belongs to. It resolves action names against whichever page is current at the moment it runs, so calling it before any page has mounted has nowhere to resolve against.

---

## 📦 The swipe event

Both forms deliver the same event shape as `context.event`, exactly like a click action delivers a click event.

A swipe fires once for phase `start` (the first touch or press), any number of times for phase `move` (while the pointer is down and moving), and exactly once more for either `end` (pointer released) or `cancel` (the interaction was interrupted, for example by a native `pointercancel`).

```js
{
  type: "swipe",
  phase: "move",
  direction: "right",    // "left" | "right" | "up" | "down" | null
  edge: "left",           // "left" | "right" | "top" | "bottom" | null
  start:    { x: 24,  y: 380 },
  current:  { x: 146, y: 380 },
  delta:    { x: 122, y: 0 },
  distance: 122,
  velocity: 0.82,         // pixels per millisecond
  duration: 145,          // milliseconds since phase "start"
  progress: 0.61,         // distance divided by 200px, clamped to a max of 1
  target: HTMLElement
}
```

| Field | Description |
|-------|-------------|
| `direction` | `null` until the pointer has moved at least 4px, so a nearly straight touch does not flicker between axes on the first pixel. Once resolved, it is whichever axis, horizontal or vertical, has moved further, and is recomputed on every `move`. |
| `edge` | Resolved once, at phase `start`, from the element's own bounding box: whichever of its four edges the pointer started within 24px of, or `null` if it started more than 24px from all four. It describes where the gesture began, not where the pointer currently is. |
| `delta` | `current` minus `start` on each axis. Positive `delta.x` means the pointer has moved right from where the gesture began. Positive `delta.y` means it has moved down. |
| `progress` | `distance` divided by a fixed 200px reference, clamped between 0 and 1. The reference distance does not depend on the element's size, so `progress` behaves the same way for a swipe to dismiss or reveal UI regardless of how big the target element is. |

A swipe tracks one pointer at a time. If a second finger touches down mid-gesture, Clera ignores it until the first one lifts or cancels.

---

## 🧹 Cleanup

Clera detaches its internal `pointermove`, `pointerup`, and `pointercancel` listeners as soon as a gesture ends or cancels, so nothing stays attached between gestures.

Declarative `onswipe` recognizers are torn down when their page is destroyed or evicted, the same rule that applies to `context.listen()`.

`app.gesture()` recognizers attach directly to the element passed in. Once that element has no other references and is removed from the DOM, it is garbage collected together with its recognizer. No separate teardown call is needed.

---

## ⚠️ When something goes wrong

| Code | Cause |
|------|-------|
| `GESTURE_INVALID_ELEMENT` | `app.gesture()` was called with something other than an `HTMLElement` as the target. |
| `GESTURE_UNSUPPORTED` | The gesture name passed to `app.gesture()` is not `"swipe"`. |
| `GESTURE_NO_ACTIVE_PAGE` | `app.gesture()` was called before any page has mounted, so there is no current page to resolve the action name against. |

---

## Next

[01 Styling in Clera](../03-styling/01-styling-in-clera.md)
