# 💡 Why Clera?

## The problem with modern frontend

Before writing a single line of product code in most modern frameworks, you typically need to:

- Install Node.js
- Initialise a project with a package manager
- Configure a bundler
- Learn a component model
- Learn how state management works in that framework
- Learn a routing library
- Learn JSX or a template syntax specific to that framework

That is a lot of ground to cover before anything appears on screen.

For large teams building complex products, this overhead is worth it. The tooling exists because the problems are real. But for many apps (internal tools, mobile WebView apps, prototypes, personal projects, anything that does not need a full component architecture) it is far more than the problem requires.

---

## 🎯 Who Clera is for

Clera is for developers who look at modern frameworks and think the complexity is not proportionate to what they are trying to build.

### 🌐 Developers who like the web platform but dislike framework complexity

These are developers who already know HTML, CSS, and JavaScript and want to stay there. They are not looking for JSX, a virtual DOM, or a 50-package build chain. They want to write a button and have it work.

```html
<button action="increment">Count: {count}</button>
```

Not this:

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

### 📱 Mobile app developers who prefer web technologies

Developers who know HTML, CSS, and JavaScript and want to ship mobile apps without learning React Native, Flutter, SwiftUI, or Jetpack Compose. With Clera they stay in a familiar environment and still get state management, routing, hardware APIs, and native packaging through Clera Studio and Clera Packager.

### ⚡ Developers who want simplicity over ecosystems

Developers building internal tools, dashboards, prototypes, or WebView-backed apps where a full framework is more infrastructure than the problem requires. Speed of iteration matters more than architectural flexibility.

---

## ✅ What Clera gives you

**Zero build step.** Include one script tag and start writing. Save the file. Refresh the browser. See the change.

**Low mental overhead.** HTML for structure. CSS for styling. JavaScript for behaviour. The three things you already know are the three things you use.

**Real mobile apps.** Your Clera app runs inside iOS and Android WebViews without modification. Use Clera Studio or Clera Packager to build and package for native distribution.

**Progressive complexity.** A simple app stays simple. As you need more, the runtime API is there. You do not have to use it until you need it.

---

## ❌ When Clera is not the right choice

Clera is not for every project and is not trying to be.

- Your team has an existing React codebase, deep framework ecosystem dependencies, or a large shared component library built around a specific framework's model. The overhead Clera removes is overhead those teams have already absorbed.
- You need server-side rendering, static site generation, or compile-time type guarantees across a large template system. A framework like React, Vue, or SvelteKit will serve you better.
- You enjoy hooks, JSX, and component-driven architecture as a way of working. Clera's philosophy is almost the opposite of that. It is not a better framework. It is a different kind of tool entirely.

Knowing when a tool does not fit is as important as knowing when it does.

---

## Next

[04 Runtime, Not Framework](./04-runtime-not-framework.md)
