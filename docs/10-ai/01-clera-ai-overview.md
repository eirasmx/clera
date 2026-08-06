# 🤖 Clera and AI

AI assistants can build Clera apps extremely well, but only if they understand Clera's model correctly. Without guidance, most AI tools default to React or Vue patterns that do not work in Clera.

This section provides:
- A mental model overview for AI users
- A master build prompt you can copy into any AI tool
- Rules that keep AI-generated code idiomatic
- Component and scaffolding prompts for common tasks

---

## 🤖 Why AI and Clera work well together

Clera's model is simple enough that a well-prompted AI can generate correct, working apps on the first try:

- HTML structure is explicit: `<app>`, `<page>`, `<form action="...">`
- JavaScript is plain global functions with no classes, hooks, or imports
- HTML wires to JavaScript by name matching on the `action` attribute, with nothing to configure
- `context` is passed automatically to every action function, with no dependency injection needed

A correctly prompted AI understands these rules and produces clean Clera code. An incorrectly prompted AI produces React components inside Clera pages, which does not work.

---

## 🤖 How to use these docs with AI

The most effective approach:

1. Copy the master prompt from [02 Build Prompt](./02-clera-build-prompt.md) into your AI tool's system prompt or at the start of your conversation
2. Describe what you want to build
3. The AI generates correct Clera HTML and JavaScript

For component generation or app scaffolding, use the specific prompts in [Component generation prompt](./04-prompts.md#component-generation-prompt) and [Full app scaffolding prompt](./04-prompts.md#full-app-scaffolding-prompt).

---

## Next

[02 Master Build Prompt](./02-clera-build-prompt.md)
