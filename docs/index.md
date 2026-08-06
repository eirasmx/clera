# 📖 Clera Documentation

Clera is a JavaScript runtime for building HTML-first apps on web, iOS, and Android.

---

## 🧭 Where to start

| I want to... | Go here |
|---|---|
| Understand what Clera is | [00: Introduction](./00-introduction/01-what-is-clera.md) |
| Build something right now | [01: Getting Started](./01-getting-started/01-installation.md) |
| Look up a specific API | [04: Runtime API](./04-runtime-api/01-clera-global.md) |
| See complete app examples | [09: Examples](./09-examples/01-hello-world.md) |
| Use AI to build with Clera | [10: AI](./10-ai/01-clera-ai-overview.md) |

---

## 📚 Contents

| Section | What it covers |
|---|---|
| [00: Introduction](./00-introduction/) | What Clera is, why it exists, and how it thinks |
| [01: Getting Started](./01-getting-started/) | Installation, first app, project structure |
| [02: Core Concepts](./02-core-concepts/) | Pages, actions, lifecycle, context, data system, inline args, platform targeting |
| [03: Styling](./03-styling/) | CSS with Clera, built-in tags, layout, baseline reset |
| [04: Runtime API](./04-runtime-api/) | Full `app.*` API: global, start, config, navigate, hardware, extensions, diagnostics |
| [05: Routing](./05-routing/) | Built-in routing, persisted page routing, custom router |
| [06: Native Features](./06-native-features/) | Hardware bridge: vibration, clipboard, share, camera, location, files |
| [07: Clera Language](./07-clera-language/) | The `.clera` source format, transpiler rules, and error codes |
| [08: Production](./08-production/) | Performance, debugging, error handling, deployment |
| [09: Examples](./09-examples/) | Complete working apps you can copy and learn from |
| [10: AI](./10-ai/) | Prompts and rules for AI-assisted Clera development |
| [11: Reference](./11-reference/) | HTML attributes, context API, lifecycle, config keys, error codes, version history |
```{toctree}
:hidden:
:caption: Introduction

00-introduction/01-what-is-clera
00-introduction/02-the-clera-experience
00-introduction/03-design-philosophy
00-introduction/04-why-clera
00-introduction/05-runtime-not-framework
```

```{toctree}
:hidden:
:caption: Getting Started

01-getting-started/01-installation
01-getting-started/02-first-app
01-getting-started/03-how-clera-works
01-getting-started/04-project-structure
01-getting-started/05-running-and-preview
```

```{toctree}
:hidden:
:caption: Core Concepts

02-core-concepts/01-app-tag
02-core-concepts/02-page-tag
02-core-concepts/03-navigation
02-core-concepts/04-actions
02-core-concepts/05-lifecycle
02-core-concepts/06-pagecontext
02-core-concepts/07-forms-and-values
02-core-concepts/08-rendering-helpers
02-core-concepts/09-persist-page
02-core-concepts/10-data-system
02-core-concepts/11-async-helpers
02-core-concepts/12-reusable-blocks
02-core-concepts/13-import
02-core-concepts/14-memory
02-core-concepts/15-page-listeners
02-core-concepts/16-nav
02-core-concepts/17-sidebar
02-core-concepts/18-tabbar
02-core-concepts/19-gestures
```

```{toctree}
:hidden:
:caption: Styling

03-styling/01-styling-in-clera
03-styling/02-custom-tags-and-css
03-styling/03-layout-patterns
03-styling/04-responsive-behavior
03-styling/05-baseline-css
```

```{toctree}
:hidden:
:caption: Runtime API

04-runtime-api/01-clera-global
04-runtime-api/02-start
04-runtime-api/03-config
04-runtime-api/04-accessibility
04-runtime-api/05-page
04-runtime-api/06-navigate
04-runtime-api/07-current-page
04-runtime-api/08-hardware
04-runtime-api/09-service-worker
04-runtime-api/10-php
04-runtime-api/11-diagnostics
04-runtime-api/12-plugins
04-runtime-api/13-components
```

```{toctree}
:hidden:
:caption: Routing

05-routing/01-built-in-routing
05-routing/02-persisted-page-routing
05-routing/03-router-overview
```

```{toctree}
:hidden:
:caption: Native Features

06-native-features/01-bridge-overview
06-native-features/02-vibration
06-native-features/03-clipboard
06-native-features/04-share
06-native-features/05-camera
06-native-features/06-location
06-native-features/07-file-pick
06-native-features/08-file-save
```

```{toctree}
:hidden:
:caption: Clera Language

07-clera-language/01-clera-overview
07-clera-language/02-writing-clera-files
07-clera-language/03-errors
```

```{toctree}
:hidden:
:caption: Production

08-production/01-production-readiness
08-production/02-performance-guidelines
08-production/03-debugging
08-production/04-error-handling
08-production/05-deployment
```

```{toctree}
:hidden:
:caption: Examples

09-examples/01-hello-world
09-examples/02-counter
09-examples/03-task-list
09-examples/04-tabs-app
09-examples/05-notes-app
09-examples/06-form-handling
09-examples/07-dashboard
09-examples/08-chat-ui
09-examples/09-product-list
```

```{toctree}
:hidden:
:caption: AI

10-ai/01-clera-ai-overview
10-ai/02-clera-build-prompt
10-ai/03-clera-rules-for-ai
10-ai/04-prompts
```

```{toctree}
:hidden:
:caption: Reference

11-reference/01-html-attribute-reference
11-reference/02-pagecontext-reference
11-reference/03-lifecycle-reference
11-reference/04-config-reference
11-reference/05-error-codes
11-reference/06-version-history
```