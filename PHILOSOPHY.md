# Clera Design Philosophy

## Build on the web. Do not fight the web.

Clera is designed as a runtime that helps developers turn HTML, CSS, and JavaScript into real app experiences with less friction.

Its purpose is not to replace the browser platform.

Its purpose is to make the browser platform feel more app-native, more structured, and easier to use.

---

## Core Idea

Clera should let developers:

- write HTML
- write JavaScript
- have an app

with as little mental overhead as possible.

The runtime should absorb structural complexity, not push it onto the developer.

---

## HTML Is the App

In Clera, HTML is not just markup.

It defines:

- the application root
- pages
- lifecycle hooks
- actions
- navigation targets
- UI structure

This means the app is readable directly from the HTML.

A developer should be able to open a Clera file and understand the shape of the app immediately.

---

## JavaScript Is Behavior

JavaScript in Clera should remain normal JavaScript.

Developers should be able to write plain functions and have the runtime connect them naturally to the app.

Clera should not require a special component syntax, a special state language, or unnecessary wrapper APIs just to make common logic work.

The goal is to keep behavior simple and familiar.

---

## Convenience, Not Restriction

Clera may provide helpers such as:

- `pageContext.render(...)`
- `pageContext.append(...)`
- `pageContext.clear(...)`

These exist to reduce friction.

They are conveniences.

They are not restrictions.

A developer must still be free to use vanilla browser APIs whenever they want.

Examples:

### Clera helper

    pageContext.render("#taskList", htmlString);

### Vanilla DOM

    document.getElementById("taskList").innerHTML = htmlString;

Both are valid.

This freedom is intentional.

Clera should never punish developers for using the platform directly.

---

## The Runtime Should Carry the Weight

A Clera app should not require the developer to constantly think about:

- manual action registration
- form value extraction
- rebinding dynamic DOM actions
- page lifecycle plumbing
- navigation wiring

These are runtime concerns.

Clera should take care of them automatically wherever possible.

The developer should focus on building the app, not connecting the machinery.

---

## Minimal Mental Load

Clera should optimize for the lowest reasonable mental load.

This means:

- fewer concepts
- fewer required APIs
- fewer mapping steps
- fewer naming layers
- fewer wrapper patterns

The best Clera code should feel obvious.

A beginner should be able to write a page, write a function, and get something working quickly.

---

## Progressive Power

Clera should be simple first, but not weak.

A beginner should be able to write:

    function addTask() {
      console.log("Task added");
    }

A more advanced developer should be able to write:

    function addTask(pageContext) {
      console.log(pageContext.values.taskTitle);
      pageContext.render("#taskList", htmlString);
    }

The same system should support both.

Power should be available when needed, without being forced on everyone.

---

## Stay Close to the Platform

Clera should remain close to the browser and web standards.

That means:

- HTML stays HTML-shaped
- JavaScript stays JavaScript
- CSS stays CSS
- browser APIs remain accessible
- developers can drop to vanilla behavior at any time

Clera should smooth the web, not bury it.

---

## Runtime, Not Framework

Clera should behave like a runtime first.

That means it provides:

- execution
- structure
- lifecycle
- navigation
- interaction resolution
- app-like behavior

It does not need to become a heavy framework with a large mental model.

Its strength is that it can make app development easier while still feeling native to the web platform.

---

## Zero-Ceremony by Default

The ideal beginner Clera experience is:

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

That should be enough.

No required registration.
No required configuration.
No required framework ceremony.

---

## Escape Hatches Must Always Exist

No abstraction is perfect.

For that reason, Clera must always allow developers to step outside its helpers and use raw browser APIs when needed.

This keeps the system honest.

It also prevents Clera from becoming a trap.

A developer should never feel blocked because they are "doing it the non-Clera way."

If the browser can do it, the developer should still be able to do it.

---

## Add Small Helpers, Not Heavy Systems

When Clera grows, it should prefer:

- tiny high-value helpers
- low-friction improvements
- runtime-supported conveniences

over:

- large framework subsystems
- complex reactivity models
- heavy syntax layers
- unnecessary abstraction stacks

Growth should feel like sharpening the runtime, not inflating it.

---

## Simplicity Is a Product Decision

Clera should not become more complex just because complexity is common elsewhere.

If something can be made simpler without losing important power, it should be.

Every new feature should be judged by the question:

> Does this reduce developer friction without breaking the Clera mental model?

If the answer is yes, it belongs.
If the answer is no, it probably does not.

---

## Final Principle

Clera exists to make app development feel lighter.

Not by taking away power.

But by removing friction while preserving freedom.

Write HTML.
Write JavaScript.
Have an app.

That is the Clera promise.