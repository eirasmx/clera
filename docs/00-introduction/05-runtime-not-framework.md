# 🔧 Runtime, Not Framework

The word "runtime" gets used a lot but its meaning matters for how you think about Clera.

---

## What a framework does

A framework owns the application structure. You write code inside the framework's model. The framework calls your code at the right times.

React owns the component tree. Vue owns the reactivity system. Angular owns the dependency injection graph. In each case, the framework is in charge and your code plugs into it. You learn the framework first. Your app is built inside it.

---

## What a runtime does

A runtime reads what you wrote and connects it. You own the structure. The runtime assists.

Clera reads your HTML at boot time, finds your `<page>` elements, finds your JavaScript functions, and wires them together. It does not own your code. It does not replace your HTML. It reads your HTML, extracts the pages, and manages showing and hiding them as the user navigates.

The difference is direction: a framework pulls your code inward. A runtime reads outward.

---

## Why this matters

It changes what you have to learn.

With a framework, the framework's concepts and patterns are the primary thing to understand. The framework is the curriculum.

With Clera, you learn HTML, CSS, and JavaScript. Clera's own concepts are a small layer on top of things you already know.

---

## 🎯 What Clera adds to standard web

The entire surface area of Clera's additions to standard web development:

| Addition | What it does |
|---|---|
| `<app>` | Marks the root of your application |
| `<page name="...">` | Defines a named screen |
| `action="functionName"` | Wires an element or form to a JavaScript function |
| `page="pageName"` | Wires a click to navigation |
| `context` | Object available inside every action function with page helpers |
| `app.*` | Small runtime API for navigation, data, config |

Everything else (DOM manipulation, event handling, data fetching, CSS, animations) is standard web development that works exactly as you already know it.

---

## A practical example

Here is a Clera app and a React app that do the same thing: show a counter with an increment button.

**Clera:**

```html
<page name="home">
  <p id="count">0</p>
  <button action="increment">+1</button>
</page>
```

```js
let count = 0;

function increment() {
  count += 1;
  context.render("#count", count);
}
```

**React:**

```jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </>
  );
}
```

Neither is wrong. React's model scales to very complex apps. Clera's model is more direct for simpler ones. The key difference is that the Clera version requires knowing HTML and JavaScript. The React version requires also knowing React.

---

## The runtime is the foundation, not the whole platform

Everything in this chapter describes `clera.js` on its own: a file that reads your HTML and wires it up. That explains the mechanism, but it is not the full picture.

The runtime is what makes the rest of [The Clera Experience](./02-the-clera-experience.md) possible. Studio can offer live preview because the runtime's boot process is predictable. Packager can produce a web, PWA, iOS, or Android build from the same source because the runtime behaves the same way on every target. The editor can offer accurate completions because the runtime's surface area is small and fixed.

The runtime alone is a simpler way to build a page. The runtime plus Studio, the simulator, debugging, and packaging is the platform.

---

## Next

[01 Getting Started: Installation](../01-getting-started/01-installation.md)
