# 🤖 Component Generation and App Scaffolding Prompts

Ready-to-use prompts for specific generation tasks.

---

## 🤖 Component generation prompt

Use this when you want to generate a reusable HTML + CSS + JS pattern for a specific UI component.

```
Generate a Clera component for: [describe the component]

Rules:
- Output HTML that goes inside a <page> element
- Output CSS that styles the component
- Output plain JavaScript functions that handle its behaviour
- Use action="functionName" for interactions
- Use context.values for form inputs
- Use context.render() or context.append() for DOM updates
- No frameworks, no imports, no classes
- context is the first argument of every action function

The component should be self-contained. Paste the HTML into any <page>,
add the CSS to the stylesheet, add the JS functions globally.
```

**Example usage:**
```
Generate a Clera component for: a search bar that filters a visible list of items as the user types
```

---

## 🤖 Page generation prompt

Use this when you want to generate a complete page with all its actions.

```
Generate a complete Clera page for: [describe the page]

Output:
1. The <page name="..." id="..."> HTML block
2. The CSS for this page
3. The JavaScript functions for all actions and lifecycle hooks

Rules:
- page name and id should be lowercase with hyphens
- Use oncreate="fnName" for initial data loading
- Use onshow="fnName" if the page needs to refresh on every visit
- All JS is plain global functions
- context is the first argument
- Read form values with context.values
- Update DOM with context.render(), append(), or clear()
- No React, no imports, no classes
```

---

## 🤖 Full app scaffolding prompt

Use this when you want to generate a complete multi-page app from a description.

```
Build a complete Clera app for: [describe the app]

Requirements:
- Single HTML file with all pages inside <app>
- Inline CSS in a <style> tag in <head>
- Plain JavaScript in a <script> tag before </body>
- Include <script src="clera.js"></script> before the app JS
- Use tab-bar if the app has 2-4 peer sections
- Use page navigation (page="name") for linear flows
- All actions are plain global functions
- All form handling uses context.values
- All DOM updates use context.render(), append(), or clear()
- Use oncreate for initial data load, onshow for refresh
- Set id and class on every <page> for CSS targeting
- app.start({ initial: "firstPage", dev: true }) at the top of the script

Do not use React, Vue, imports, exports, or any framework pattern.
Keep the JavaScript as simple as possible.
```

---

## 🤖 Debug prompt

Use this when AI-generated code is not working and you want help fixing it.

```
This Clera app is not working correctly. Here is the issue: [describe the problem]

Here is the code: [paste code]

Clera rules to check:
- action attribute value must exactly match the JS function name
- Functions must be declared at global scope with the function keyword
- Form values are read from context.values.fieldName
- DOM updates use context.render(), append(), or clear(). Not innerHTML directly.
- Navigation uses page="name" attribute or context.navigate("name")
- Page CSS uses `#id` or `.class` selectors. The id/class must be on the `<page>` element.

Identify what is wrong and provide the corrected code.
```

---

## Next

[11-reference HTML Attribute Reference](../11-reference/01-html-attribute-reference.md)
