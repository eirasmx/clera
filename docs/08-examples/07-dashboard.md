# 📊 Dashboard

A multi-page dashboard with a tab bar, responsive sidebar, stat cards, and a simple chart. Demonstrates layout patterns and data rendering.

---

## index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard</title>
  <style>
    * { box-sizing: border-box; }

    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; }

    app { display: flex; flex-direction: column; }

    page { height: 100%; overflow-y: auto; }

    /* Tab bar */
    tabbar {
      display: flex;
      height: 56px;
      border-top: 1px solid #e8e8e8;
      background: #fff;
      flex-shrink: 0;
    }

    tab {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      color: #999;
      gap: 2px;
      cursor: pointer;
      user-select: none;
    }

    tab[active] { color: #007aff; }
    .tab-icon { font-size: 20px; }

    /* Overview page */
    #overview { padding: 20px; }

    .page-title { font-size: 20px; font-weight: 700; margin-bottom: 20px; }

    .stat-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: #f8f8f8;
      border-radius: 12px;
      padding: 16px;
    }

    .stat-label { font-size: 12px; color: #888; margin-bottom: 4px; }
    .stat-value { font-size: 28px; font-weight: 700; }
    .stat-change { font-size: 12px; margin-top: 4px; }
    .stat-change.up { color: #34c759; }
    .stat-change.down { color: #ff3b30; }

    .section-title { font-size: 15px; font-weight: 600; margin-bottom: 12px; }

    .chart-bar-container {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      height: 120px;
      padding: 0 4px;
    }

    .chart-col { display: flex; flex-direction: column; align-items: center; flex: 1; gap: 6px; }

    .bar {
      width: 100%;
      background: #007aff;
      border-radius: 4px 4px 0 0;
      min-height: 4px;
    }

    .bar-label { font-size: 11px; color: #888; }

    /* Activity feed */
    #activity { padding: 20px; }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .activity-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .activity-text { flex: 1; font-size: 14px; }
    .activity-time { font-size: 12px; color: #aaa; }

    /* Settings page */
    #settings { padding: 20px; }

    .settings-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 0;
      border-bottom: 1px solid #f0f0f0;
      font-size: 15px;
    }

    .settings-row label { color: #333; }

    input[type="range"] { width: 120px; }
  </style>
</head>
<body>

<app>
  <tabbar>
    <tab page="overview">
      <span class="tab-icon">📊</span>Overview
    </tab>
    <tab page="activity">
      <span class="tab-icon">⚡</span>Activity
    </tab>
    <tab page="settings">
      <span class="tab-icon"></span>Settings
    </tab>
  </tabbar>

  <page name="overview" id="overview" oncreate="loadOverview">
    <div class="page-title">Overview</div>
    <div class="stat-grid" id="statGrid"></div>
    <div class="section-title">This week</div>
    <div class="chart-bar-container" id="chart"></div>
  </page>

  <page name="activity" id="activity" onshow="loadActivity">
    <div class="page-title">Activity</div>
    <div id="activityFeed"></div>
  </page>

  <page name="settings" id="settings">
    <div class="page-title">Settings</div>
    <div class="settings-row">
      <label>Notifications</label>
      <input type="checkbox" checked>
    </div>
    <div class="settings-row">
      <label>Dark mode</label>
      <input type="checkbox">
    </div>
    <div class="settings-row">
      <label>Text size</label>
      <input type="range" min="12" max="20" value="16">
    </div>
  </page>
</app>

<script src="clera.js"></script>
<script>
  app.start({ initial: "overview", persistPage: true });

  // ── Mock data ──────────────────────────────────────────────────────────────

  const stats = [
    { label: "Revenue",   value: "$12,430", change: "+8%",  dir: "up" },
    { label: "Users",     value: "3,291",   change: "+12%", dir: "up" },
    { label: "Churn",     value: "2.4%",    change: "-0.3%",dir: "down" },
    { label: "Tickets",   value: "47",      change: "+5",   dir: "up" }
  ];

  const weekData = [
    { day: "Mon", value: 60 },
    { day: "Tue", value: 85 },
    { day: "Wed", value: 45 },
    { day: "Thu", value: 90 },
    { day: "Fri", value: 72 },
    { day: "Sat", value: 30 },
    { day: "Sun", value: 55 }
  ];

  const activityItems = [
    { color: "#34c759", text: "New user signed up: alice@example.com",    time: "2m ago" },
    { color: "#007aff", text: "Payment received: $299 Pro plan",           time: "14m ago" },
    { color: "#ff9500", text: "Support ticket opened: Login issue",        time: "1h ago" },
    { color: "#ff3b30", text: "Server error: 3 requests failed",           time: "2h ago" },
    { color: "#34c759", text: "Deployment completed: v0.5.9",              time: "3h ago" },
    { color: "#007aff", text: "New user signed up: bob@example.com",       time: "4h ago" },
    { color: "#5856d6", text: "Feature flag enabled: new dashboard",       time: "5h ago" },
  ];

  // ── Overview ───────────────────────────────────────────────────────────────

  function loadOverview(context) {
    const maxVal = Math.max(...weekData.map(d => d.value));

    context.render("#statGrid", stats.map(stat => `
      <div class="stat-card">
        <div class="stat-label">${stat.label}</div>
        <div class="stat-value">${stat.value}</div>
        <div class="stat-change ${stat.dir}">${stat.change}</div>
      </div>
    `).join(""));

    context.render("#chart", weekData.map(day => `
      <div class="chart-col">
        <div class="bar" style="height:${Math.round((day.value / maxVal) * 100)}px"></div>
        <div class="bar-label">${day.day}</div>
      </div>
    `).join(""));
  }

  // ── Activity ───────────────────────────────────────────────────────────────

  function loadActivity(context) {
    context.render("#activityFeed", activityItems.map(item => `
      <div class="activity-item">
        <div class="activity-dot" style="background:${item.color}"></div>
        <div class="activity-text">${item.text}</div>
        <div class="activity-time">${item.time}</div>
      </div>
    `).join(""), { reserveHeight: true });
  }
</script>

</body>
</html>
```

---

## What this demonstrates

- Tab bar with three pages
- `oncreate` for one-time data load (overview stats and chart)
- `onshow` for refreshing on every visit (activity feed)
- Pure CSS bar chart from data
- `context.render(..., { reserveHeight: true })` on the activity feed
- `persistPage: true` to restore the active tab on reload
- Responsive-ready layout with flex column app structure

---

## Next

[08 Chat UI](./08-chat-ui.md)
