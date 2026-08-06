# ⚠️ Clera Language Errors

> 🛠️ If you are using Clera Studio, errors are shown inline as you edit. No manual transpiler setup is needed. The information below describes what each error means and how to fix it.

When a `.clera` file contains a structural problem, the transpiler reports an error with a stable code and a plain-English message. Every error follows the same shape:

```js
{ ok: false, error: "Human-readable message", code: "STABLE_CODE" }
```

Error codes will not change between versions.

---

## Error codes

### `EMPTY_SOURCE`

The file is empty or contains only whitespace.

```
Source is empty. Provide a non-empty .clera file.
```

**Fix:** Make sure the file has content before saving or exporting.

---

### `MISSING_APP`

No `<app>` element was found in the file.

```
Missing root <app> element. Add <app>...</app> to your .clera file.
```

**Fix:** Every `.clera` file must contain exactly one `<app>` block.

---

### `MULTIPLE_APP`

More than one `<app>` element was found.

```
Multiple root <app> elements are not allowed in .clera files.
```

**Fix:** Remove all but one `<app>` block.

---

### `UNCLOSED_APP`

An `<app>` opening tag was found with no matching `</app>`.

```
Root <app> element is not closed. Add </app> to your .clera file.
```

**Fix:** Add the closing `</app>` tag.

---

### `MULTIPLE_INNER_HEAD`

More than one `<head>` block was found inside `<app>`.

```
Multiple <head> sections inside <app> are not allowed.
```

**Fix:** Merge all head content into a single `<head>` block inside `<app>`.

---

### `UNCLOSED_INNER_HEAD`

A `<head>` block inside `<app>` has no closing `</head>`.

```
Inner <head> inside <app> is not closed. Add </head>.
```

**Fix:** Add the closing `</head>` tag.

---

### `INVALID_TOP_LEVEL_TAG`

A tag other than `title`, `meta`, `link`, `style`, or `script` appears before `<app>`.

```
Unsupported top-level tag <div> before <app>.
Only title, meta, link, script, and style are allowed outside <app> in .clera files.
```

**Fix:** Move the tag inside a `<page>`, or convert it to a supported head tag.

---

### `INVALID_POST_APP_TAG`

A tag other than `<script>` appears after `</app>`.

```
Unsupported top-level tag <div> after </app>.
Only <script> is allowed after </app> in .clera files.
```

**Fix:** Only `<script>` tags belong after `</app>`. Move other content inside a `<page>`.

---

## Next

[08 Production Readiness](../08-production/01-production-readiness.md)
