# 💾 File Save

Trigger a file download or save to the device's storage.

```js
await app.hardware.files.save({
  name:     "report.csv",
  content:  csvString,
  mimeType: "text/csv"
});
```

---

## ⚙️ Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `name` | string | `"download"` | File name including extension. |
| `content` | string | `""` | File content as a string. |
| `mimeType` | string | `"text/plain"` | MIME type of the file. |

---

## 🌐 Browser behaviour

Creates a Blob from `content`, generates an object URL, and triggers a download by clicking a hidden anchor element. The browser handles the save location: either a save dialog or an automatic download to the Downloads folder depending on browser settings.

---

## 💡 Common uses

### Export a CSV

```js
async function exportUserData(context) {
  const csv = buildCsvFromData(context.params.rows);
  await app.hardware.files.save({
    name:     "export.csv",
    content:  csv,
    mimeType: "text/csv"
  });
}
```

### Save a JSON backup

```js
async function backupSettings(context) {
  await app.hardware.files.save({
    name:     "settings-backup.json",
    content:  JSON.stringify(app.memory.settings, null, 2),
    mimeType: "application/json"
  });
}
```

### Generate and save a plain text file

```js
async function exportNotes(context) {
  const text = app.memory.notes.map(note => note.body).join("\n\n---\n\n");
  await app.hardware.files.save({
    name:     "notes.txt",
    content:  text,
    mimeType: "text/plain"
  });
}
```

---

## Next

[07-clera-language Overview](../07-clera-language/01-clera-overview.md)
