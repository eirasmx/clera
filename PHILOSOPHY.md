# Clera Design Philosophy

## Build on the web. Do not fight the web.

Clera is a runtime that turns HTML, CSS, and JavaScript into real applications. It does not replace the browser. It gives the browser a job to do.

---

## HTML is the app

In Clera, HTML is not just markup. It defines the structure of your application: pages, lifecycle, actions, and navigation. You can read the app directly from the HTML without context.

```html
<page name="home" oncreate="loadHome">
  <h1>{title}</h1>
  <button action="openSettings">Settings</button>
</page>
```

---

## JavaScript is behavior

JavaScript stays normal JavaScript. No special syntax, no forced patterns, no framework concepts to learn first.

```js
function loadHome(context) {
  context.data({ title: "Welcome" });
}

function openSettings(context) {
  context.navigate("settings");
}
```

Familiar. Predictable. Nothing new to unlearn.

---

## The runtime carries the weight

Clera removes the plumbing developers usually wire by hand: action registration, form value extraction, DOM rebinding after updates, lifecycle management, page transitions. You focus on what your app does, not how to connect the pieces.

---

## Convenience, not restriction

Clera provides helpers. They are optional. Vanilla DOM APIs always work alongside them.

```js
// Clera way
context.render("#list", html);

// Vanilla — equally valid
document.getElementById("list").innerHTML = html;
```

Freedom is the feature.

---

## Progressive power

Start with the minimum. Add depth when the feature needs it.

```js
// Minimal
function addTask() {
  console.log("task added");
}

// With context
function addTask(context) {
  const title = context.values.taskTitle;
  context.append("#taskList", `<li>${title}</li>`);
}
```

Same system. Same function. More power when you reach for it.

---

## Stay close to the platform

HTML stays HTML. CSS stays CSS. JavaScript stays JavaScript. Clera does not introduce a new language or force you into a proprietary mental model. When you know how to build a webpage, you already know most of Clera.

---

## Runtime, not framework

Clera is a runtime. It gives you execution, structure, lifecycle, navigation, and interaction. It does not impose a component model, a state management pattern, or an opinion about how your data flows. You own your architecture.

---

## The test for every feature

Does this reduce friction without breaking the model?

If yes, it belongs in Clera. If no, it does not.

---

## The promise

Write HTML. Write JavaScript. Have an app.

That is Clera.
