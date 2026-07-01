# 🔢 Counter

A simple counter demonstrating click actions, state, and DOM updates.

---

## index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Counter</title>
  <style>
    #home {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 24px;
    }

    #count {
      font-size: 72px;
      font-weight: 700;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
    }

    .controls {
      display: flex;
      gap: 16px;
    }

    button {
      width: 56px;
      height: 56px;
      font-size: 28px;
      border: none;
      border-radius: 50%;
      background: #007aff;
      color: white;
      cursor: pointer;
    }

    button:active {
      opacity: 0.7;
    }
  </style>
</head>
<body>

<app>
  <page name="home" id="home">
    <p id="count">0</p>
    <div class="controls">
      <button action="decrement">−</button>
      <button action="increment">+</button>
    </div>
    <button action="reset" style="width:auto;border-radius:8px;padding:0 20px;font-size:16px;">Reset</button>
  </page>
</app>

<script src="clera.js"></script>
<script>
  let count = 0;

  function increment(context) {
    count++;
    updateDisplay(context);
  }

  function decrement(context) {
    count--;
    updateDisplay(context);
  }

  function reset(context) {
    count = 0;
    updateDisplay(context);
  }

  function updateDisplay(context) {
    context.query("#count").text(count);
  }
</script>

</body>
</html>
```

---

## What this demonstrates

- `action="functionName"` on buttons
- Global state with a plain JavaScript variable
- `context.query()` to update a DOM element
- Multiple actions on one page

---

## Next

[03 Task List](./03-task-list.md)
