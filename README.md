# Clera

**Build apps with the web stack — without the usual complexity.**

Clera is a development environment that lets you build applications using **HTML, CSS, and JavaScript**, preview them instantly, and export them as **PWA or native apps**.

Instead of managing complex tooling, Clera provides a **single workflow** for building and deploying web-based applications.

---

## Why Clera?

Modern web development often requires configuring multiple tools:

- Bundlers
- Frameworks
- Dev servers
- Build pipelines
- Packaging tools

Clera removes this friction by combining everything into **one environment**.

Write your application using the web stack and let Clera handle the rest.

---

## Features

### Integrated Development Environment
- Built-in editor
- Project management
- Structured templates

### Clera Runtime
- Executes applications inside a controlled runtime
- Deterministic application lifecycle
- Component registration system

### Simulator
- Instant application preview
- Multiple simulator instances
- Fast reload workflow

### Live Server
Run projects locally and preview in any browser.

Example:

```
http://localhost:PORT
```

Perfect for testing responsive layouts and mobile behavior.

### Packaging

Export your project as:

- **Progressive Web App (PWA)**
- **Native desktop or mobile app**

---

## Example Workflow

Create a project → write HTML → run simulator → export app.

1. Create a new project
2. Write UI with HTML, CSS, and JavaScript
3. Start the simulator
4. Preview in the browser
5. Export as PWA or native app

---

## Example Project

```
my-app/
│
├── app.html
├── styles.css
├── script.js
│
└── clera.config.json
```

Clera loads the project through the runtime and executes the application inside the simulator.

---

## Philosophy

Clera treats **web applications as real applications**.

Instead of adapting the web stack to complex build systems, Clera provides an environment where the web stack becomes the **application platform itself**.

---

## Status

Clera is currently under active development.

---

## License

MIT License