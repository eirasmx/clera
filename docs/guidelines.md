# 📘 Clera Documentation Guidelines

This file defines how Clera documentation is written. Read it fully before writing or editing any doc.

---

## Table of Contents

1. [Purpose](#purpose)
2. [Who We Are Writing For](#who-we-are-writing-for)
3. [API Naming Convention](#api-naming-convention)
4. [Language Rules](#language-rules)
5. [Structure Rules](#structure-rules)
6. [Examples](#examples)
7. [Accuracy Against the Runtime](#accuracy-against-the-runtime)
8. [Chapter Checklist](#chapter-checklist)

---

## Purpose

These docs exist for one reason: a developer picks up Clera and gets productive without confusion.

Every sentence must earn its place. If a sentence does not teach, clarify, or demonstrate something, it does not belong.

---

## Who We Are Writing For

Write as if the reader is a developer who knows HTML, CSS, and basic JavaScript but has never used Clera. They understand what a function is and what a button does. They do not know Clera-specific terms until the doc introduces them.

This means:

- Introduce every concept before using it
- Never assume the reader has read a different chapter first
- If a term needs context, explain it in one sentence before moving on
- Prefer plain words over technical shorthand

**Example of what not to do:**

> "Use `context.data()` to attach reactive state. The binding engine will patch the DOM."

A beginner does not know what "reactive state" or "the binding engine" means yet.

**Example of what to do:**

> "Use `context.data()` to attach data to a page. Clera watches the data and automatically updates any matching `{placeholder}` in the page HTML whenever the value changes."

Same information. No assumed knowledge.

---

## API Naming Convention

The Clera runtime is exposed on two global names: `app` and `CLERA`. Both point to the same object.

```js
window.app   // the canonical short form
window.CLERA // an alias that works identically
```

**All documentation uses `app.*` as the standard form.** `CLERA.*` is acceptable when quoting runtime error messages or referencing internal behaviour, because the runtime itself uses `CLERA` in those contexts.

In practice this means:

```js
// Correct in docs
app.start({ initial: "home" });
app.navigate("settings");
app.data({ user: result.user });
app.memory.session = result.session;

// Avoid in docs (use only when quoting runtime output)
CLERA.start({ initial: "home" });
CLERA.navigate("settings");
```

If the reader sees `CLERA.navigate` in a console warning and then sees `app.navigate` in the docs, they should immediately understand those are the same thing. A note the first time `CLERA` appears in a chapter is enough:

> The runtime refers to itself as `CLERA` in console messages. In your code, use `app.*`. Both names point to the same object.

---

## File Naming Convention

Documentation examples use these standard file names. Using consistent names across all chapters means a reader building from the docs always knows what file to look at.

| File | Purpose |
|---|---|
| `index.html` | The app HTML, all pages defined here |
| `clera.js` | The Clera runtime |
| `style.css` | All styles |
| `script.js` | All JavaScript (actions, helpers, page logic) |

`script.js` is the standard name for the main JavaScript file. Use it in all single-file examples. For multi-file examples (where logic is split by page), use descriptive names like `home.js`, `profile.js`, and so on.

Do not use `app.js` in examples. It reads as framework-specific and conflicts with the `app` global that Clera exposes on `window`.

```
// Correct folder structure in examples
my-app/
  index.html
  clera.js
  style.css
  script.js

// Wrong
my-app/
  index.html
  clera.js
  styles.css    (use style.css)
  app.js        (use script.js)
```

---

## Language Rules

### No em dashes

Em dashes (`—`) are banned everywhere. No exceptions.

This includes the substitution pattern where a hyphen is used as a stand-in for an em dash:

```
// Banned: em dash
Clera reads your HTML — then boots the app.

// Also banned: hyphen used as em dash substitute
Clera reads your HTML - then boots the app.

// Correct: rewrite the sentence
Clera reads your HTML and boots the app.
Clera reads your HTML. Then it boots the app.
```

If you feel the urge to reach for an em dash, rewrite the sentence. Split it into two. Use a comma. Use a colon. Use parentheses. Em dashes are a crutch for unclear sentence structure. The fix is always to write a clearer sentence.

This rule applies to every file: chapter docs, the README, todo.md, this file. No exceptions.

### No unnecessary hyphens

Hyphens are only correct in two cases:

1. A genuinely hyphenated compound word where the hyphen is part of the word itself (`keep-alive`, `well-known`, `two-factor`, `built-in`)
2. A case where removing the hyphen creates a different meaning or real ambiguity

Do not use hyphens to join adjectives when the meaning is clear without them. Do not use hyphens as punctuation to connect clauses.

```
// Unnecessary hyphen
a single-file runtime        -> a single file runtime
a full-page layout           -> a full page layout

// Correct: hyphen is part of the word
the keep-alive attribute
a built-in router
a two-factor check
```

If you are unsure, try reading the phrase without the hyphen. If it reads fine, remove it.

### Plain sentences

Write short sentences. One idea per sentence. If a sentence needs more than one comma to stay readable, split it.

Avoid filler words that add length without adding meaning:

```
// Filler
"In order to navigate to a page, you need to call app.navigate()."

// Clean
"To navigate to a page, call app.navigate()."
```

Avoid softening hedges that reduce confidence in the docs:

```
// Weak
"You might want to consider using context.fetch() here."

// Confident
"Use context.fetch() here."
```

### Emojis

Emojis are allowed and encouraged at the start of headings and in callout notes. They help a reader scan a page quickly.

Use them with purpose. One emoji per heading is enough. Do not scatter them mid-sentence or use them as decoration in body text.

```
// Good
## 🧭 Navigation

// Good
> ⚠️ Page names must be unique within the app.

// Too many
## 🧭 Navigation 🎉🚀

// Mid-sentence: avoid
"Call app.navigate() 🚀 to move between pages."
```

---

## Structure Rules

### One concept per section

Each `##` heading covers one idea. If a section is trying to explain two things, split it into two sections.

### Lead with the what, then the why, then the how

Every section introduces the concept in plain terms before showing code. Code examples should confirm understanding, not create it.

```
// Wrong order: code before explanation
\`\`\`js
app.page("home", { onCreate(context) { ... } });
\`\`\`
Use this to register lifecycle hooks.

// Right order: explain first
Use CLERA.page() to attach lifecycle hooks and actions to a specific page.
Hooks let you run code when a page is created, shown, hidden, or destroyed.

\`\`\`js
app.page("home", {
  onCreate(context) {
    // runs once, the first time this page loads
  }
});
\`\`\`
```

### Section length

A section should be as long as it needs to be to cover the concept clearly with at least one example. If a section runs past roughly 40 lines of prose (not counting code), check whether it is covering more than one concept.

### Navigation links

End every chapter file with a "Next" or "Up" link. Use plain text, no em dashes.

```
// Correct
[03 Navigation](./03-navigation.md)
[Back to Core Concepts](../02-core-concepts/)

// Wrong: em dash in link text
[03 — Navigation](./03-navigation.md)
```

---

## app.map() Explanation Depth

Any section documenting `app.map()` must be written as if the reader has never seen a string templating system before.

The following are not obvious to a beginner and must be explained explicitly every time `app.map()` appears in a chapter:

- `app.map()` is a string find-and-replace. It does not loop, does not touch the DOM, and does not render anything. State this plainly.
- One call produces one string. The developer is responsible for calling it once per item and joining the results.
- The three placeholder syntaxes (`${}`, `{key}`, `{path}`) must be explained as three separate systems that run at three separate times. Do not assume the reader can tell them apart.
- Show a full concrete loop example, not just a single `app.map()` call in isolation. A beginner who only sees the single-call example will not know how to use it for a list.

**Wrong: assumes the reader fills in the gaps**

> "`app.map()` maps one object into one `<use>` string. The developer owns iteration."

**Right: tells the reader exactly what to do**

> "`app.map()` takes a data object and a string with `{key}` placeholders and returns a new string with those placeholders replaced. It does one replacement per call. To build a list, call it once for each item and join the results."

Then show the full loop.

---

## Examples

Examples are not optional. If a concept can be shown in code, show it. A reader who does not fully understand a prose explanation will often understand a code example immediately.

### Every example must be complete enough to understand on its own

A reader should not need to scroll up or read another chapter to understand what an example is showing.

```js
// Too minimal: what is context? where does this go?
context.render("#list", html);

// Complete enough:
function loadItems(context) {
  const html = items.map(item => `<li>${item.name}</li>`).join("");
  context.render("#list", html);
}
```

### Show the wrong way when it matters

When there is a common mistake that causes a specific problem, show it clearly, explain why it fails, and then show the correct version.

```js
// Wrong: this does not update the DOM
function increment(context) {
  context.count += 1;
}

// Right: use context.data() to attach data before mutating it
function init(context) {
  context.data({ count: 0 });
}

function increment(context) {
  context.count += 1;
}
```

### Use realistic names

Example code should look like real product code, not placeholder soup. This applies to id values and variable names too. Abbreviated or coded ids like `"nb"`, `"ph"`, `"usr"`, or `"p1"` are not readable to a beginner. Use the full, human-readable form.

```js
// Placeholder soup: teaches nothing about real use
function myFunc(ctx) {
  ctx.render("#thing", stuff);
}

// Realistic: teaches the pattern through a real scenario
function loadTaskList(context) {
  const html = tasks.map(task => `<li>${task.title}</li>`).join("");
  context.render("#taskList", html);
}
```

---

## Accuracy Against the Runtime

Documentation is a contract with the developer. A doc that describes behaviour the runtime does not have is worse than no doc.

Before writing any section that describes runtime behaviour, check the runtime source at `cre-v1/__cre__/runtime.js`. If the old docs conflict with the runtime, the runtime wins.

Specific things to verify before writing:

- **Tag names.** The protected core tags are `app`, `page`, `splash`, `tabbar`, and `tab`. Not `tab-bar`. Not `App`. Exact lowercase match.
- **API method names.** Check the CLERA object definition (around line 2074 in runtime.js) for exact method names and signatures.
- **config keys.** Check what `_boot()` actually reads from `config`. Do not document config keys that do not exist.
- **Error code strings.** When documenting what a warning looks like in the console, copy the exact code from the `_logDiagnostic()` call in the runtime.
- **Default values.** When documenting a default, verify it in the runtime. Do not invent defaults.

If something is unclear in the runtime, note it explicitly in the doc with a callout rather than guessing:

```
> 🔍 The exact behaviour of this option in edge cases is still being verified against the runtime.
```

---

## Code Block Language Tags

Every fenced code block must declare a language tag. Never use a bare ` ``` ` opening fence.

`.clera` files are HTML syntax. Always tag them as `html`:

\`\`\`
// Wrong
\`\`\`
<app>
  <page name="home"></page>
</app>
\`\`\`

// Right
\`\`\`html
<app>
  <page name="home"></page>
</app>
\`\`\`
\`\`\`

This applies to every code block in every chapter: `html` for markup, `js` for JavaScript, `css` for stylesheets. Language tags enable syntax highlighting in the docs viewer. A block without one renders as plain text.

---

## The `defer` Attribute

Do not use the `defer` attribute on `<script src="clera.js">` in any example or documentation.

Clera's runtime manages its own boot timing internally. It uses a `DOMContentLoaded` guard and a call queue to handle pre-boot API calls safely. The `defer` attribute is not needed, and including it in docs trains developers to add something they do not need.

All script tags in examples use no `defer`:

```html
<script src="clera.js"></script>
<script src="script.js"></script>
```

This rule applies to every HTML snippet in every chapter.

---

## iOS and Android WebView Templates

Do not document the `templates/ios/` and `templates/android/` directories or give instructions for setting up the native WebView shells manually.

Packaging a Clera app for iOS or Android is handled by Clera Studio and Clera Packager. These are the distribution tools for native builds. Telling developers to copy files into Xcode or Android Studio projects is incorrect documentation of the intended workflow.

When a chapter needs to mention that Clera apps run on iOS and Android, the correct framing is:

> Clera apps run inside iOS and Android WebViews. Use Clera Studio or Clera Packager to build and package your app for native distribution.

Do not reference `templates/ios/` or `templates/android/` anywhere in the docs. Do not describe native shell setup steps.

---

## Bundling and Packaging

Do not describe bundling, packaging, or native build processes as things the developer does manually or with third-party tools.

All bundling and packaging is done through Clera Studio or Clera Packager. These are the products. Referencing any other bundler (webpack, Vite, Parcel, esbuild) or describing a manual packaging workflow misrepresents how Clera apps are distributed.

When docs need to address how a Clera app gets from development to production:

- Web deployment: describe static file hosting (no build step needed)
- Native packaging: refer to Clera Studio or Clera Packager by name

Do not describe or imply any other path.

---

## ⚠️ Runtime Accuracy and Ambiguity

These are non-negotiable before writing or publishing any chapter.

**Read the runtime before documenting behaviour.** Before writing any section that describes how something works, check `raw/clera.js` and `__cre__/runtime.js`. If what the docs say and what the runtime does disagree, the runtime wins and the docs must be corrected. Do not document behaviour from memory or from an earlier version of the docs.

**When multiple ways of doing something exist in the runtime, ask which is the documented standard.** If the runtime supports two or more patterns for the same thing (two API methods, two calling conventions, two configuration styles), do not pick one and document it silently. Ask which one should be taught as the standard before writing anything. Document only the chosen standard. The other variants may be mentioned briefly as alternatives if they are commonly encountered, but the primary example must use only the agreed standard.

**When docs are ambiguous, ask before writing.** If a chapter covers something where the correct behaviour, the right phrasing, or the intended scope is unclear, stop and ask a specific question rather than making an assumption. Point to exactly what is unclear. One precise question unblocks more than writing something that needs to be corrected later.

---

## Packaging and Delivery

When editing documentation files, always:

1. Make all changes inside the original zip archive's folder structure
2. Preserve the original package name exactly (`clera-docs`, not `clera-docs-updated` or any variant)
3. Repackage as a zip and present the zip as the deliverable, not individual files

The zip presented must be a drop-in replacement for the original. Folder structure and archive name must be identical to what was received.

---

## Chapter Checklist

Before marking a chapter done in `todo.md`, verify every item below:

- [ ] No em dashes anywhere in the file
- [ ] No hyphens used as em dash substitutes
- [ ] No unnecessary hyphens in compound adjectives
- [ ] All API examples use `app.*` not `CLERA.*` (except where quoting runtime output)
- [ ] Every concept is introduced before it appears in code
- [ ] Every code example is realistic and complete enough to understand alone
- [ ] All tag names, method names, and config keys are verified against the runtime
- [ ] Default values are verified against the runtime, not assumed
- [ ] Section ends with a navigation link using plain text (no em dash in link text)
- [ ] No `defer` attribute on any `<script>` tag in any HTML example
- [ ] Action function examples are consistent within the chapter (implicit ambient or explicit parameter, not mixed)
- [ ] No references to `templates/ios/` or `templates/android/` or manual WebView shell setup
- [ ] Bundling and native packaging refer only to Clera Studio or Clera Packager
- [ ] The chapter was read top to bottom as if seeing it for the first time
