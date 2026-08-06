# 🚀 Deployment

Clera handles packaging automatically. You do not configure build tools, copy files into shell projects, or manage platform SDKs directly. You build in Clera Studio and export the target you need.

---

## 📦 How Clera packages your app

When you export from Clera Studio, it:

1. Transpiles your `.clera` source into a runtime-ready HTML document
2. Compiles bindings, templates, and page structure into `ir.bin` (the CRE binary format)
3. Bundles `ir.bin`, your assets, and the native shell into the selected output format

The output format depends on your chosen target:

| Target | Output |
|--------|--------|
| Web | Static HTML folder ready to deploy |
| PWA | Static folder with service worker and manifest |
| iOS | Signed `.ipa` |
| Android | `.apk` or `.aab` |

The `ir.bin` compilation is what gives Clera apps their performance. The CRE engine loads it at startup for IR-driven rendering, WASM state management, and O(1) binding lookups. Skipping this step (for example by loading a raw HTML file in a WebView) bypasses the CRE engine entirely and loses all of those optimisations.

---

## 🚀 Exporting from Clera Studio

In Clera Studio, open your project and select **Export**. Choose a target platform. Clera builds and packages everything automatically.

For iOS and Android, the output is a ready-to-submit `.ipa` or `.apk`/`.aab`. No Xcode or Android Studio steps are required unless you need custom native code.

---

## 🖥️ Working across machines

Clera Studio runs on Windows, macOS, and Linux. iOS submission requires macOS because App Store signing and Xcode are macOS-only. If you develop on Windows or Linux and need to submit an iOS build, you have two options:

**Option 1: Copy the project folder to macOS**

Copy your entire Clera project folder to a Mac, open it in Clera Studio on macOS, and export the iOS target there.

**Option 2: Export a `.arc` and import on macOS**

From Clera Studio on any platform, use **Export as .arc**. This produces a single portable file containing your full project. Transfer it to a Mac, open Clera Studio, and use **Import .arc** to restore the project and export the iOS target.

The `.arc` is the recommended way to hand off a project between machines or collaborators. It is self-contained and platform-independent.

---

## 🚀 Web deployment

The web export is a folder of static files. Deploy it anywhere that serves static files.

### ✅ Static hosts

- **Netlify:** drag and drop the folder or connect a Git repo
- **Vercel:** `vercel deploy` from the project folder
- **GitHub Pages:** push to a `gh-pages` branch
- **Cloudflare Pages:** connect a Git repo
- **Any web server:** copy files to the server's document root

No build step required. No server-side runtime needed.

### 🧭 Single-page app routing

If you use hash-based routing (`#pageName`), no server configuration is needed.

If you use history-mode routing (`/pageName`), configure the server to serve `index.html` for all routes:

**Nginx:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Apache `.htaccess`:**
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [L]
```

---

## 🔧 Updating a deployed app

**Web:** Update the files on your host. Users get the new version on next load.

**PWA / native with service worker:** The service worker manages caching. Configure `autoReloadOnFirstControl: true` (the default) to have the app reload once a new service worker takes control.

**Native app update:** Re-export from Clera Studio and submit the new build through the app store review process. For minor content changes, you can host app files on a server and load them remotely. This allows over-the-air updates without a store submission (check platform guidelines for restrictions).

---

## Next

[09 Examples: Hello World](../09-examples/01-hello-world.md)
