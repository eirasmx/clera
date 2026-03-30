# ✨ Clera Design Philosophy

## 🌍 Build on the web. Do not fight the web.

Clera is designed as a runtime that helps developers turn **HTML, CSS, and JavaScript into real apps** — with less friction.

It does **not replace the browser** ❌  
It **enhances the browser** ✅

---

## 🧠 Core Idea

Clera should let developers:

- ✍️ write HTML  
- ⚙️ write JavaScript  
- 🚀 have an app  

With **minimal mental overhead**.

The runtime carries complexity — not the developer.

---

## 🧩 HTML Is the App

In Clera, HTML is not just markup.

It defines:

- 🏠 app structure  
- 📄 pages  
- 🔁 lifecycle  
- 🎯 actions  
- 🔗 navigation  

👉 You can *read the app directly from the HTML*.

---

## ⚙️ JavaScript Is Behavior

JavaScript stays **normal JavaScript**.

No weird syntax. No forced patterns.

    function addTask(pageContext) {
      console.log(pageContext.values.taskTitle);
    }

👉 Familiar. Predictable. Simple.

---

## 🛠️ Convenience, Not Restriction

Clera provides helpers like:

- pageContext.render(...)
- pageContext.append(...)
- pageContext.clear(...)

These are **optional**.

### Clera way

    pageContext.render("#taskList", html);

### Vanilla still works

    document.getElementById("taskList").innerHTML = html;

👉 Freedom is the feature 💎

---

## ⚡ The Runtime Carries the Weight

Clera removes the need to think about:

- ❌ action registration  
- ❌ form value extraction  
- ❌ rebinding dynamic DOM  
- ❌ lifecycle plumbing  

👉 You focus on **building**, not wiring.

---

## 🧘 Minimal Mental Load

Clera optimizes for:

- fewer concepts 🟢  
- fewer APIs 🟢  
- fewer steps 🟢  
- fewer surprises 🟢  

👉 It should feel obvious.

---

## 🚀 Progressive Power

Start simple:

    function addTask() {
      console.log("Added");
    }

Go deeper when needed:

    function addTask(pageContext) {
      console.log(pageContext.values.taskTitle);
    }

👉 Same system. More power when needed.

---

## 🌐 Stay Close to the Platform

Clera respects the web:

- HTML stays HTML 🧩  
- JS stays JS ⚙️  
- CSS stays CSS 🎨  

👉 No lock-in. No fighting the platform.

---

## 🧱 Runtime, Not Framework

Clera is a **runtime**, not a heavy framework.

It gives you:

- execution ⚙️  
- structure 🧩  
- lifecycle 🔁  
- navigation 🔗  
- interaction 🎯  

👉 Without forcing a complex mental model.

---

## 🎯 Zero-Ceremony by Default

### HTML

    <page name="tasks" oncreate="loadTasks">
      <form action="addTask">
        <input name="taskTitle">
        <button type="submit">Add</button>
      </form>
    </page>

### JavaScript

    function loadTasks() {}

    function addTask(pageContext) {
      console.log(pageContext.values.taskTitle);
    }

👉 That’s enough. No setup required.

---

## 🔓 Escape Hatches Always Exist

Need raw power?

    document.querySelector("#taskList").innerHTML = html;

👉 Clera never blocks you.

---

## 🧩 Small Helpers, Not Big Systems

Clera grows by adding:

- small helpers ✨  
- practical utilities 🧰  
- low-friction improvements ⚡  

Not:

- ❌ huge frameworks  
- ❌ complex reactivity  
- ❌ heavy abstractions  

---

## ⚖️ Simplicity Is a Choice

Every feature must answer:

Does this reduce friction without breaking the model?

If yes → keep it ✅  
If no → drop it ❌

---

## 🏆 Final Principle

Clera exists to make building apps feel **lighter**.

Not by removing power…  
But by removing friction.

---

## 🚀 The Promise

✍️ Write HTML  
⚙️ Write JavaScript  
📱 Have an app  

That’s Clera.