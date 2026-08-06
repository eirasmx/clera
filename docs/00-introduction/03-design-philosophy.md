# 🎨 Design Philosophy

> Why complicate simplicity?

That is the question every Clera feature is measured against. When the runtime gains something new, it is not to add capability for its own sake. It is to remove one more thing you would otherwise have to set up, wire together, or learn from a framework before writing a single line of your actual product.

Features in Clera exist to eliminate traditional ceremony, not introduce new kinds of it.

---

## The problem with framework ceremony

Most frameworks ask you to pay an upfront cost before your app can do anything. You configure a bundler, learn a component model, set up a router, wire state management, and write boilerplate that exists purely to satisfy the framework. None of that code ships value to your user. It exists to feed the tool.

Clera inverts this. Every capability it ships is chosen specifically because it removes a piece of that overhead. Navigation ships so you never write a router. The data system ships so you never wire a state library. The action system ships so you never register event handlers manually. Each addition takes something off your plate, not adds something to it.

> The measure of whether a feature belongs in Clera is not only whether it is useful but also whether it makes the total amount of non-product code go down.

---

## HTML is the app

In most frameworks, HTML is a template. The framework compiles it away, replaces it with a virtual representation, and manages the actual DOM itself. You write JSX or a template string and something else turns it into a page.

In Clera, HTML is the app. The `<app>` and `<page>` elements you write are the structure of your application. Clera reads them, extracts the pages, and manages showing and hiding them. What you write is what runs.

```html
<!-- This is not a template. This IS the app. -->
<app>
  <page name="home">
    <h1>Welcome</h1>
  </page>
  <page name="profile">
    <h1>Profile</h1>
  </page>
</app>
```

---

## JavaScript is behaviour

JavaScript in a Clera app is plain functions. No classes, no hooks, no reactive state, no lifecycle decorators. A function named `saveNote` runs when an element with `action="saveNote"` is triggered. That is the entire contract.

```js
// This is a complete, valid Clera action handler.
function saveNote() {
  const text = context.values.noteText;
  localStorage.setItem("note", text);
  context.navigate("home");
}
```

You write a function. You give the HTML element the same name. It works.

---

## CSS is styling

Clera does not touch your CSS. It does not generate class names, inject dynamic styles based on logic, or create a shadow DOM that hides your elements from your stylesheets. It applies a baseline reset so your CSS starts from a clean, consistent slate, and then stays out of the way.

Your page selectors work exactly as you expect:

```css
#home      { background: #f5f5f5; }
page.dashboard { font-size: 14px; }
page           { padding: 20px; }
```

---

## 📋 Three rules Clera always follows

**1. No registration ceremony**

You should never have to tell Clera about a function before using it. Write the function. Use the name in HTML. It works. No `app.register()`, no `defineComponent()`, no export required.

**2. No surprise behaviour**

Clera does not auto-reset forms, auto-scroll pages, or auto-do anything you did not ask for. If navigation happens, you asked for it. If a function runs, an element triggered it. Predictable beats clever.

**3. Safe fallback always**

If something goes wrong (a missing action, a missing element, a bad selector), Clera logs a warning to the console and does nothing. It never throws an error that breaks the rest of your app.

---

## What this means for you

A developer who has never used Clera should be able to read a Clera app and understand it within minutes. Not because they know Clera, but because it is just HTML and JavaScript. The runtime's fingerprint is as small as possible.

That is the goal.

---

## Next

[04 Why Clera](./04-why-clera.md)
