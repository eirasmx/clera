# 📑 Tabs App

A three-tab app demonstrating `<tabbar>`, tab active states, and per-page lifecycle hooks.

---

## index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tabs</title>
  <style>
    * { box-sizing: border-box; }

    app {
      display: flex;
      flex-direction: column;
    }

    page {
      padding: 24px 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
      height: 100%;
      overflow-y: auto;
    }

    h1 { font-size: 22px; margin-bottom: 8px; }
    p  { color: #666; font-size: 15px; }

    tabbar {
      display: flex;
      height: 56px;
      border-top: 1px solid #e8e8e8;
      background: #fff;
    }

    tab {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 11px;
      color: #999;
      gap: 3px;
      user-select: none;
    }

    tab[active] {
      color: #007aff;
    }

    .tab-icon { font-size: 22px; line-height: 1; }
  </style>
</head>
<body>

<app>
  <tabbar>
    <tab page="home">
      <span class="tab-icon">🏠</span>
      Home
    </tab>
    <tab page="explore">
      <span class="tab-icon"></span>
      Explore
    </tab>
    <tab page="profile">
      <span class="tab-icon">👤</span>
      Profile
    </tab>
  </tabbar>

  <page name="home" id="home" onshow="onHomeShow">
    <h1>Home</h1>
    <p>Welcome back.</p>
    <p id="homeVisitCount"></p>
  </page>

  <page name="explore" id="explore">
    <h1>Explore</h1>
    <p>Discover something new.</p>
  </page>

  <page name="profile" id="profile">
    <h1>Profile</h1>
    <p>Your account and settings.</p>
  </page>
</app>

<script src="clera.js"></script>
<script>
  app.start({ initial: "home" });

  let homeVisits = 0;

  function onHomeShow(context) {
    homeVisits++;
    context.query("#homeVisitCount").text(
      `You have visited this tab ${homeVisits} time${homeVisits === 1 ? "" : "s"}.`
    );
  }
</script>

</body>
</html>
```

---

## What this demonstrates

- `<tabbar>` and `<tab page="...">` for bottom navigation
- `tab[active]` CSS for active tab styling
- `onshow` lifecycle hook firing on every tab visit
- `context.query()` for updating text content
- `app.start({ initial: "home" })` to set the landing tab

---

## Next

[05 Notes App](./05-notes-app.md)
