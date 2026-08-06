# ✅ Task List

A task list demonstrating form handling, value collection, rendering, and local state.

---

## index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tasks</title>
  <style>
    #tasks {
      max-width: 480px;
      margin: 0 auto;
      padding: 24px 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
    }

    h1 { font-size: 24px; margin-bottom: 20px; }

    .add-form {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
    }

    input[type="text"] {
      flex: 1;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 16px;
    }

    input[type="text"]:focus {
      outline: none;
      border-color: #007aff;
    }

    button[type="submit"] {
      padding: 10px 18px;
      background: #007aff;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
    }

    #taskList { list-style: none; }

    .task-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .task-item.done span {
      text-decoration: line-through;
      color: #aaa;
    }

    .task-item span { flex: 1; font-size: 16px; }

    .delete-btn {
      background: none;
      border: none;
      color: #ccc;
      font-size: 18px;
      cursor: pointer;
      padding: 4px;
    }

    .delete-btn:hover { color: #ff3b30; }

    .empty-state {
      text-align: center;
      color: #bbb;
      padding: 40px 0;
      font-size: 15px;
    }
  </style>
</head>
<body>

<app>
  <page name="tasks" id="tasks" oncreate="renderTasks">
    <h1>My Tasks</h1>

    <form action="addTask" class="add-form">
      <input type="text" name="title" placeholder="What needs doing?" autocomplete="off">
      <button type="submit">Add</button>
    </form>

    <ul id="taskList"></ul>
  </page>
</app>

<script src="clera.js"></script>
<script>
  const tasks = [];

  // Store the latest context so renderFromGlobal can re-render without a new action.
  let currentPageContext = null;

  function addTask(context) {
    const title = context.values.title.trim();
    if (!title) return;

    tasks.push({ id: Date.now(), title, done: false });
    context.resetForm();
    renderTasks(context);
  }

  function toggleTask(context) {
    const task = tasks.find(t => t.id === context.arg);
    if (task) task.done = !task.done;
    renderFromGlobal();
  }

  function deleteTask(context) {
    const index = tasks.findIndex(t => t.id === context.arg);
    if (index !== -1) tasks.splice(index, 1);
    renderFromGlobal();
  }

  function renderTasks(context) {
    currentPageContext = context;
    renderFromGlobal();
  }

  function renderFromGlobal() {
    if (!currentPageContext) return;

    if (tasks.length === 0) {
      currentPageContext.render("#taskList", `
        <div class="empty-state">No tasks yet. Add one above.</div>
      `);
      return;
    }

    currentPageContext.render("#taskList", tasks.map(task => `
      <li class="task-item ${task.done ? "done" : ""}">
        <input type="checkbox" ${task.done ? "checked" : ""} action="toggleTask: ${task.id}">
        <span>${task.title}</span>
        <button class="delete-btn" action="deleteTask: ${task.id}">✕</button>
      </li>
    `).join(""));
  }
</script>

</body>
</html>
```

---

## What this demonstrates

- `<form action="addTask">` with `context.values`
- `context.resetForm()` after submission
- `oncreate="renderTasks"` lifecycle hook
- `context.render()` for list updates
- `action="toggleTask: ${task.id}"` inline arg syntax so rendered items can call actions without inline event handlers
- `context.arg` to read the first inline argument inside the action handler
- Storing `context` for use from outside an action
- Empty state rendering

---

## Next

[04 Tabs App](./04-tabs-app.md)
