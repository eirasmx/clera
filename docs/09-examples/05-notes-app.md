# 📝 Notes App

A two-page notes app demonstrating multi-page navigation, params passing, localStorage persistence, and `reserveHeight`.

---

## index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notes</title>
  <style>
    page {
      padding: 20px 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
      height: 100%;
      overflow-y: auto;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    h1 { font-size: 22px; }

    .new-btn {
      padding: 8px 16px;
      background: #007aff;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      cursor: pointer;
    }

    .note-card {
      padding: 14px;
      border: 1px solid #eee;
      border-radius: 10px;
      margin-bottom: 10px;
      cursor: pointer;
    }

    .note-card:active { background: #f5f5f5; }

    .note-title { font-weight: 600; font-size: 16px; margin-bottom: 4px; }
    .note-preview { font-size: 14px; color: #888; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .empty { text-align: center; color: #bbb; padding: 60px 0; font-size: 15px; }

    .back-btn {
      background: none;
      border: none;
      color: #007aff;
      font-size: 16px;
      cursor: pointer;
      padding: 0;
      margin-bottom: 16px;
    }

    textarea {
      width: 100%;
      height: calc(100vh - 180px);
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 12px;
      font-size: 16px;
      resize: none;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
    }

    textarea:focus { outline: none; border-color: #007aff; }

    .editor-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    input[type="text"] {
      flex: 1;
      font-size: 18px;
      font-weight: 600;
      border: none;
      outline: none;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
    }

    .delete-btn { background: none; border: none; color: #ff3b30; font-size: 15px; cursor: pointer; }
  </style>
</head>
<body>

<app>
  <page name="list" id="list" onshow="showList">
    <div class="header">
      <h1>Notes</h1>
      <button class="new-btn" action="newNote">+ New</button>
    </div>
    <div id="notesList"></div>
  </page>

  <page name="editor" id="editor" onshow="showEditor">
    <button class="back-btn" page="list">← Notes</button>
    <div class="editor-header">
      <input type="text" id="noteTitle" placeholder="Title">
      <button class="delete-btn" action="deleteNote">Delete</button>
    </div>
    <textarea id="noteBody" placeholder="Start writing..."></textarea>
  </page>
</app>

<script src="clera.js"></script>
<script>
  app.start({ initial: "list", persistPage: true });

  // ── State ──────────────────────────────────────────────────────────────────

  function loadNotes() {
    try { return JSON.parse(localStorage.getItem("CLERA_NOTES") || "[]"); }
    catch (_) { return []; }
  }

  function saveNotes(notes) {
    try { localStorage.setItem("CLERA_NOTES", JSON.stringify(notes)); }
    catch (_) {}
  }

  let notes     = loadNotes();
  let currentId = null;

  // ── List page ──────────────────────────────────────────────────────────────

  function showList(context) {
    if (notes.length === 0) {
      context.render("#notesList", `<div class="empty">No notes yet. Tap + New to start.</div>`);
      return;
    }

    context.render("#notesList", notes.map(note => `
      <div class="note-card" action="openNote: '${note.id}'">
        <div class="note-title">${note.title || "Untitled"}</div>
        <div class="note-preview">${note.body || "No content"}</div>
      </div>
    `).join(""), { reserveHeight: true });
  }

  function newNote(context) {
    const note = { id: Date.now().toString(), title: "", body: "" };
    notes.unshift(note);
    saveNotes(notes);
    currentId = note.id;
    context.navigate("editor");
  }

  function openNote(context) {
    currentId = context.arg;
    context.navigate("editor");
  }

  // ── Editor page ────────────────────────────────────────────────────────────

  function showEditor(context) {
    const note = notes.find(n => n.id === currentId);
    if (!note) { context.navigate("list"); return; }

    context.query("#noteTitle").value(note.title);
    context.query("#noteBody").value(note.body);

    context.query("#noteTitle").on("input", () => saveCurrentNote(context));
    context.query("#noteBody").on("input",  () => saveCurrentNote(context));
  }

  function saveCurrentNote(context) {
    const note = notes.find(n => n.id === currentId);
    if (!note) return;
    note.title = context.query("#noteTitle").value();
    note.body  = context.query("#noteBody").value();
    saveNotes(notes);
  }

  function deleteNote(context) {
    notes = notes.filter(n => n.id !== currentId);
    saveNotes(notes);
    currentId = null;
    context.navigate("list");
  }
</script>

</body>
</html>
```

---

## What this demonstrates

- Two-page navigation with shared state via `currentId`
- `onshow` used to populate both pages on every visit
- `action="openNote: '${note.id}'"` inline arg syntax so rendered cards trigger actions without inline event handlers
- `context.arg` to read the first inline argument inside an action handler
- `context.query().value()` for reading and writing input values
- `context.query().on()` for attaching event listeners
- `context.render(..., { reserveHeight: true })` on the notes list
- `localStorage` for persistence
- `persistPage: true` to restore the last open page on reload
- Auto-save pattern using input event listeners

---

## Next

[06 Form Handling](./06-form-handling.md)
