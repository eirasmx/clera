# 🎨 Styling in Clera

Clera does not touch your CSS. Write styles exactly as you would in any HTML project. Clera stays out of the way.

---

## 🔧 How to include styles

Link a stylesheet in the normal way:

```html
<head>
  <link rel="stylesheet" href="style.css">
</head>
```

In a `.clera` file, place the link before `<app>`:

```html
<link rel="stylesheet" href="style.css">

<app>
  ...
</app>
```

Inline `<style>` blocks work too:

```html
<style>
  page { padding: 20px; }
</style>
```

---

## 🎯 What Clera resets

At boot, Clera injects a small baseline stylesheet before your own CSS loads. It covers two things:

**Structural setup.** Clera gives `<app>`, `<page>`, `<tabbar>`, `<tab>`, and `<splash>` the layout properties they need to render correctly. These are not defaults you need to set yourself.

**Browser default reset.** Margins and padding are removed from `body`, `html`, and common block elements (`h1`–`h6`, `p`, `ul`, `ol`, `dl`, `blockquote`, `figure`, `pre`, `dd`). This gives you a consistent starting point across browsers.

Your stylesheet loads after the baseline. Any rule you write at equal or greater specificity overrides it.

---

## 🎨 Styling pages

Mounted pages are live `<page>` elements in the DOM. Target them with CSS directly:

```css
/* All pages */
page {
  padding: 20px;
  font-family: "DM Sans", system-ui, sans-serif;
}

/* Specific page by id */
#home {
  background: #f0f4ff;
}

/* Specific page by class */
page.dashboard {
  display: grid;
  grid-template-columns: 240px 1fr;
}
```

For this to work, set `id` and `class` on your `<page>` elements in HTML:

```html
<page name="home" id="home" class="light-theme">
  ...
</page>
```

---

## No generated class names

Clera never generates class names, injects component-scoped styles, or modifies your selectors. What you write in CSS is what runs.

---

## Next

[02 Custom Tags and CSS](./02-custom-tags-and-css.md)
