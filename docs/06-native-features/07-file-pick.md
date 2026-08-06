# 📁 File Pick

Let the user select one or more files from their device.

```js
const result = await app.hardware.files.pick({
  accept:   "image/*",
  multiple: false
});

console.log(result.count);          // number of files selected
console.log(result.files[0].uri);   // object URL or native URI
console.log(result.files[0].name);  // file name
console.log(result.files[0].size);  // bytes
console.log(result.files[0].mimeType);
```

---

## ⚙️ Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `accept` | string | `"*/*"` | MIME type or file extension filter passed to the file picker. |
| `multiple` | boolean | `false` | Allow the user to select more than one file. |

### Common accept values

```
"image/*"          any image
"video/*"          any video
"application/pdf"  PDFs only
".csv,.xlsx"       spreadsheet files
"*/*"              any file type
```

---

## 🌐 Browser behaviour

Opens an `<input type="file">` with the provided `accept` filter. The file picker UI is provided by the browser or operating system. If the user closes the picker without selecting a file, the Promise rejects with `"No files selected."`.

`file.uri` in the browser is a Blob URL valid for the lifetime of the page.

---

## 💡 Common uses

### Single file selection

```js
async function attachDocument(context) {
  try {
    const result = await app.hardware.files.pick({ accept: "application/pdf" });
    const file   = result.files[0];
    context.render("#attachment", `
      <div class="file-chip">${file.name} (${Math.round(file.size / 1024)} KB)</div>
    `);
  } catch (error) {
    // user cancelled
  }
}
```

### Multiple file selection

```js
async function attachImages(context) {
  try {
    const result = await app.hardware.files.pick({ multiple: true, accept: "image/*" });
    result.files.forEach((file) => {
      console.log(file.name, file.uri);
    });
  } catch (error) {
    // user cancelled
  }
}
```

---

## Next

[08 File Save](./08-file-save.md)
