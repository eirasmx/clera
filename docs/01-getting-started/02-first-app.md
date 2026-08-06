# 🚀 Your First App

This chapter builds a small two-page app from scratch. By the end you will have seen every core Clera concept in action: pages, navigation, actions, forms, and rendering.

---

## What we are building

A task list app with two pages:

- A home page where you can add tasks and see the list
- An about page you can navigate to and back from

---

## The file structure

```
my-app/
  index.html
  clera.js
  style.css
  script.js
```

---

## Step 1: The HTML

Create `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tasks</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

<app>

  <page name="home">
    <h1>Tasks</h1>

    <form action="addTask">
      <input name="taskTitle" placeholder="New task">
      <button type="submit">Add</button>
    </form>

    <ul id="taskList"></ul>

    <button page="about">About</button>
  </page>

  <page name="about">
    <h1>About</h1>
    <p>This app was built with Clera.</p>
    <button page="home">Back</button>
  </page>

</app>

<script src="clera.js"></script>
<script src="script.js"></script>
</body>
</html>
```

A few things to notice:

- `<app>` wraps the entire application. Clera finds this element when it boots.
- `<page name="home">` defines a page called "home". Pages are extracted at boot and shown on demand.
- `<form action="addTask">` wires the form submission to a JavaScript function named `addTask`. No registration needed.
- `<button page="about">` navigates to the "about" page when clicked. No JavaScript needed for basic navigation.

---

## Step 2: The JavaScript

Create `script.js`:

```js
const tasks = [];

function addTask() {
  const title = context.values.taskTitle.trim();
  if (!title) return;

  tasks.push(title);
  context.resetForm();
  renderTasks();
}

function renderTasks() {
  const html = tasks.map(task => `<li>${task}</li>`).join("");
  context.render("#taskList", html);
}
```

Walking through this:

- `context` is available inside every action function automatically. You can also declare it as an explicit parameter if you prefer: `function addTask(context) {}`. Both styles work identically.
- `context.values.taskTitle` gives you the value of the form field named `taskTitle`. No `querySelector` or `FormData` needed.
- `context.resetForm()` clears the form inputs after submission.
- `context.render("#taskList", html)` replaces the contents of the element with id `taskList` with new HTML.

---

## Step 3: The CSS

Create `style.css`:

```css
#home,
#about {
  padding: 24px;
}

form {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #2563eb;
  color: white;
  cursor: pointer;
  font-size: 1rem;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
}

li {
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}
```

---

## Step 4: Run it

Start a local server in the `my-app` folder:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080` in your browser.

You should see the home page with the form. Type a task and click Add. Navigate to the about page and back.

---

## What you just saw

| HTML | What it did |
|---|---|
| `<app>` | Told Clera where the application is |
| `<page name="home">` | Defined a page named "home" |
| `<form action="addTask">` | Wired the form to a function |
| `<button page="about">` | Wired a click to navigation |

| JavaScript | What it did |
|---|---|
| `context.values.taskTitle` | Read the form field value |
| `context.resetForm()` | Cleared the form |
| `context.render("#taskList", html)` | Updated the DOM |

You did not import anything. You did not register anything. You wrote functions with the right names, used the right HTML attributes, and Clera connected them.

---

## 🌍 You built more than a web page

The task list you just built is not tied to the browser. The same project, unchanged, can be previewed live in Clera Studio, installed as a PWA, or packaged as a native iOS or Android app. You did not write anything platform specific to make that true. That is what the runtime plus the rest of the Clera platform gets you.

---

## Next

[03 How Clera Works](./03-how-clera-works.md)
