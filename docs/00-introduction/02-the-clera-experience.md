# 🧭 The Clera Experience

Writing the runtime is one part of Clera. The other part is everything around it: an editor that understands your app, a preview that updates as you type, a debugger that points at the real problem, and a packaging step that produces a build for every platform.

This chapter is a tour of that workflow. Each piece is covered in full detail later in the docs. Here you get the shape of the whole thing.

---

## 🖥️ Studio

Clera Studio is the desktop IDE built around the Clera runtime. It opens a project folder, understands `<app>` and `<page>` structure, and gives you editor support (completions, diagnostics, syntax highlighting) tuned to Clera instead of generic HTML.

You do not need Studio to build a Clera app. A text editor and a local server are enough, and that path is covered in [Getting Started](../01-getting-started/01-installation.md). Studio exists for the parts a plain text editor cannot do: live preview, an attached debugger, and one click packaging.

---

## 👀 Preview

Studio runs your project through a local server and renders it live as you edit. Save a file and the preview updates. There is no separate build step between writing code and seeing the result.

This is the same idea as running `python3 -m http.server` and refreshing a browser tab, just wired directly into the editor so the loop is faster.

---

## 🔍 Debug

Errors from your running app surface back in the editor, not just in a browser console. A runtime error reports the file, line, and message so you can jump straight to the problem.

```js
app.start({ dev: true });
```

Turning on `dev` mode, shown above, gives you the most detail: missing action handlers, duplicate page names, and navigation to unknown pages all get reported instead of failing silently. The full list of what dev mode catches is in [Debugging](../08-production/03-debugging.md).

---

## 🏗️ Build

When your app is ready to ship, Clera Packager compiles it into a deployable bundle for one or more targets: web, PWA, iOS, or Android. You do not write build scripts or configure a bundler. You pick a target and Packager produces the output.

Native targets (iOS, Android) additionally invoke the platform's own toolchain, `xcodebuild` or `gradle`, to produce a signed `.ipa` or `.apk`.

---

## 🚀 Ship

Web and PWA output is a set of static files ready for any static host. Native output is a signed `.ipa` or `.apk` ready for a store submission or direct install. Either way, the artifact comes out of Packager, not a separate deployment tool.

---

## The point of all this

Runtime, editor, preview, debugger, and packager are one workflow, not five separate tools you have to wire together yourself. That is what separates Clera from a library you drop into an existing setup.

---

## Next

[03 Design Philosophy](./03-design-philosophy.md)
