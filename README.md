# 🚀 Clera

**Build real apps with HTML, CSS, and JavaScript. No framework. No build step.**

Clera is a runtime that turns web code into real app experiences. Write your app in HTML, CSS, and JavaScript. Preview it live in Clera Studio.  Ship it as a Website, PWA or Native app. 

---

## 👀 What it looks like

```html
<app>
  <page name="tasks" oncreate="loadTasks">
    <h1>My Tasks</h1>

    <ul id="taskList"></ul>

    <form action="addTask">
      <input name="taskTitle" placeholder="New task" />
      <button type="submit">Add</button>
    </form>
  </page>
</app>

<script src="app.js"></script>
```

```js
function loadTasks() {
  document.getElementById("taskList").innerHTML = "<li>Buy groceries</li>";
}

function addTask(context) {
  const item = document.createElement("li");
  item.textContent = context.values.taskTitle;
  document.getElementById("taskList").appendChild(item);
}
```

That is a working app. No setup, no imports, no configuration.

---

## ✨ What Clera gives you

- **Clera Runtime** — runs your app inside a controlled, secure environment
- **Clera Studio** — the IDE built for Clera, with a built-in simulator so you can preview your app on a phone screen without leaving your editor
- **Export anywhere** — package as a PWA or native app when you are ready

---

## ⚙️ How it works

You write HTML, CSS, and JavaScript the same way you always have. Clera adds a thin runtime layer on top that handles pages, navigation, lifecycle, and actions. Your code stays normal. The runtime carries the weight.

```
Write HTML / CSS / JS
        ↓
Clera runtime mounts and manages your app
        ↓
Preview instantly in the simulator
        ↓
Export as PWA or native app
```

---

## 📂 Project structure

```
my-app/
├── index.html    ← your app
├── styles.css
└── app.js
```

---

## 🔬 Status

Clera is in active pre-release development. The runtime, compiler, and studio are being built and tested. Early access is available to a small group of testers.

If you are interested in testing Clera before launch, open an issue or start a discussion.

---

## 📜 License

Licensed under the [Elastic License 2.0](./LICENSE).

You can use the runtime, build apps with it, and modify it. You may not offer Clera as a competing hosted service or platform.
