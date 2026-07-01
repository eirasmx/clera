# 🤖 Master Build Prompt

Copy this prompt into any AI tool when building a Clera app. Paste it as a system prompt or at the start of the conversation before describing what you want.

---

## 🤖 The prompt

```
You are building a Clera app. Clera is a lightweight HTML-first runtime : not a framework.

MENTAL MODEL
- The app is an HTML file with <app> and <page> elements
- Pages are screens. Navigation happens by name
- JavaScript is plain global functions : no classes, no imports, no exports
- HTML wires to JavaScript via exact name matching on the action attribute
- The runtime (clera.js) is included with a single script tag

STRUCTURE
Every Clera app looks like this:

  <app>
    <page name="home" id="home">
      <!-- page content -->
    </page>
  </app>

  <script src="clera.js"></script>
  <script>
    // plain JS functions here
  </script>

ACTIONS
To wire a button to a function:
  HTML:  <button action="doSomething">Click</button>
  JS:    function doSomething(context) { ... }

The function name must match the action attribute value exactly.
context is optional. Declare it only if you need it.

FORMS
To wire a form to a function:
  HTML:  <form action="submitForm"><input name="title"><button type="submit">Go</button></form>
  JS:    function submitForm(context) { const val = context.values.title; }

context.values is a plain object of field name → value. No FormData needed.
context.form.reset() clears the form.

NAVIGATION
  HTML:  <button page="settings">Settings</button>
  JS:    context.navigate("settings");  or  app.navigate("settings");

LIFECYCLE
  <page name="home" oncreate="init" onshow="refresh">
  function init(context) { /* runs once on first mount */ }
  function refresh(context) { /* runs every time page becomes visible */ }

DOM HELPERS (all scoped to the current page)
  context.render("#id", html)              : replace innerHTML
  context.render("#id", html, { reserveHeight: true })  : prevent layout jump
  context.append("#id", html)              : add to innerHTML
  context.clear("#id")                     : empty element
  context.query("#id").text("new text")    : set text content
  context.query("#id").value()             : get input value
  context.query("#id").value("new")        : set input value
  context.query("#id").element             : raw DOM element

STYLING
  page          { }   : all pages
  #home         { }   : specific page by id
  page.myClass  { }   : specific page by class

  Set id and class on the <page> element:
  <page name="home" id="home" class="light">

STARTUP
  app.start({ initial: "home", dev: true });    : explicit
  app.config({ persistPage: true });             : config without boot
  // or omit start() entirely. Runtime boots automatically.

DATA SYSTEM
    Global data (all pages):
      app.data({ user, theme });
      app.user.name = "Paul";   // direct mutation
      app.update();             // manual patch if outside Clera handler

    Page-local data (current page only):
      context.data({ stats });
      context.stats.count += 1;  // direct mutation. Auto-updates inside Clera handlers.

    {path} bindings in HTML:
      <h1>Hello, {user.name}</h1>
      <p>{stats.count} items</p>
      Dot notation only. No expressions or function calls.

    Data resolution order: page-local → global → "" fallback

    Async helpers (auto-update DOM, no context.update() needed):
      context.fetch("/api/data", function(result) { context.stats = result; });
      const data = await context.fetch("/api/data", { method: "POST", body: { name } });
      context.timeout(function() { context.message.text = "Done!"; }, 1000);

RULES
- Never use React, Vue, or any framework syntax
- Never use import/export
- Never use document.querySelector to get form values : use context.values
- Never use innerHTML directly : use context.render(), append(), or clear()
- Never register actions : just write the function at global scope
- Keep JavaScript as plain functions
- Keep HTML clean and readable
- context is always the first argument : declare it only when needed
- One <app> per file, pages inside it
- Use id and class on <page> elements for CSS targeting
```

---

## 🤖 Tips for using the prompt

**Be specific about what you want.** The more detail you provide about the app's pages, actions, and data, the better the output.

**Ask for one page at a time** for complex apps. This keeps the AI focused and the output manageable.

**Describe the data shape.** If your app renders a list of items, tell the AI what properties each item has.

**Ask for CSS separately** if you want styled output. The prompt focuses on structure and behaviour. Add "also write the CSS" or "make it look like a mobile app" to get styled output.

---

## Next

[03 Rules for AI](./03-clera-rules-for-ai.md)
