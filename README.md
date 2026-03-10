# Clera

**Build apps with the web stack — without the usual complexity.**

Clera is a modern development environment for building applications using **HTML, CSS, and JavaScript**. It combines an editor, runtime, simulator, and packaging tools into a single workflow so developers can write web apps and deploy them as **PWA or native applications**.

---

## Philosophy

Modern web development often involves heavy tooling, configuration, and fragmented workflows.

Clera simplifies this.

Instead of managing bundlers, frameworks, build pipelines, and separate simulators, Clera provides a **single environment where the web stack becomes an application platform.**

Write your app using familiar technologies:

- HTML
- CSS
- JavaScript

Then preview instantly and export your project as a deployable application.

---

## Core Idea

Clera treats web apps as **first-class applications**.

A project written with standard web technologies can be:

- Run inside the Clera simulator
- Previewed live in the browser
- Exported as a Progressive Web App (PWA)
- Packaged as a native desktop or mobile application

All without complex setup.

---

## Features

### Development Environment
- Built-in code editor
- Integrated project management
- Structured app templates

### Runtime Engine
- Clera runtime for executing web applications
- Deterministic app lifecycle
- Component registration system

### Simulator
- Instant app preview
- Multiple simulator instances
- Fast reload workflow

### Live Server
- Run projects with an internal server
- Access via `http://localhost:PORT`
- Test responsiveness across devices

### Packaging
Export applications as:

- **PWA (Progressive Web App)**
- **Native applications (via wrappers)**

---

## Typical Workflow

1. Create a new Clera project
2. Write your UI using HTML, CSS, and JavaScript
3. Run the simulator
4. Preview via local server
5. Export as PWA or native application

---

## Example Project Structure

```
my-app/
│
├── app.html
├── styles.css
├── script.js
│
└── clera.config.json
```

Clera reads the project structure and loads the application inside the runtime environment.

---

## Why Clera?

Clera focuses on removing **workflow friction**.

Instead of:

- configuring complex build systems
- managing multiple development tools
- setting up deployment pipelines

Developers can focus on building the application itself.

---

## Status

Clera is currently in early development.  
The goal is to provide a streamlined environment for building apps using the web stack.

---

## License

MIT License