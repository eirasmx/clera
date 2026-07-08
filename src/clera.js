(function () {
 // Inject baseline CSS at IIFE evaluation time. The moment the browser
 // parses this <script> tag. Any dev <style> or <link> that appears later
 // in <head> will be appended after this baseline, winning the cascade on
 // equal specificity. No !important needed on dev overrides.
  injectMinimalBaselineCssOnce();
  "use strict";


  const CLERA_VERSION = "0.6.12";

  const PROTECTED_CORE_TAGS = new Set(["app", "page", "splash", "nav", "tabbar", "tab", "sidebar", "import", "use"]);

  const ACTIVE_PAGE_STORAGE_KEY = "CLERA_ACTIVE_PAGE";

  const DEFAULT_LAYOUT_BREAKPOINTS = {
    mobileMaxWidth: 599,
    tabletMaxWidth: 1023
  };

  const SAFE_EXPOSURE_REGISTRY = [
    { key: "php",               modes: ["app", "all"] },
    { key: "start",             modes: ["app", "all"] },
    { key: "config",            modes: ["app", "all"] },
    { key: "page",              modes: ["app", "all"] },
    { key: "navigate",          modes: ["app", "all"] },
    { key: "currentPage",       modes: ["app", "all"] },
    { key: "layout",            modes: ["app", "all"] },
    { key: "platform",          modes: ["app", "all"] },
    { key: "onLayoutChange",    modes: ["app", "all"] },
    { key: "expand",            modes: ["app", "all"] },
    { key: "collapse",          modes: ["app", "all"] },
    { key: "toggle",            modes: ["app", "all"] },
    { key: "hardware",          modes: ["app", "all"] },
    { key: "sw",                modes: ["app", "all"] },
    { key: "actions",           modes: ["app", "all"] },
    { key: "data",              modes: ["app", "all"] },
    { key: "update",            modes: ["app", "all"] },
    { key: "map",               modes: ["app", "all"] },
    { key: "memory",            modes: ["app", "all"] },
    { key: "timeout",           modes: ["app", "all"] },
    { key: "interval",          modes: ["app", "all"] },
    { key: "listen",            modes: ["app", "all"] },
    { key: "run",               modes: ["app", "all"] },
    { key: "registerComponent", modes: ["all"] },
    { key: "use",               modes: ["all"] }
  ];

  const domBindingState = {
    boundContainers:         new WeakSet(),
    boundNavElements:        new WeakSet(),
    parsedComponentElements: new WeakSet(),
    inlineEventRegistry:     new WeakMap(),
  };

  const BINDING_PATTERN = /\{([a-zA-Z_][a-zA-Z0-9_.]*)\}/g;

 // Tags that can execute code or load external resources. Removed entirely on sanitize.
  const BLOCKED_TAGS = new Set([
    "script", "iframe", "object", "embed", "link", "meta",
    "base", "svg", "math",
  ]);

  // Always execution vectors regardless of value — blocked on any element.
  const BLOCKED_ATTR_PATTERNS = [ /^on\w+/i ];

  // Only URL-capable attributes have their values inspected.
  // Non-URL attributes (class, placeholder, aria-*, custom) are never value-checked.
  // ping is included because it silently fires HTTP requests on anchor click and
  // can exfiltrate data to attacker-controlled URLs without user awareness.
  const URL_ATTRS = new Set([
    "href", "src", "action", "formaction", "xlink:href", "poster", "data", "srcdoc", "ping",
  ]);

 // Value patterns blocked on URL_ATTRS only.
  const BLOCKED_VALUE_PATTERNS = [ /^javascript:/i, /^vbscript:/i, /^data:/i ];

 /**
 * Normalize a URL attribute value before security checks.
 * Strips control characters, HTML entities, and whitespace used
 * to bypass simple string matching.
 * Only called on URL-capable attributes.
 */
  function normalizeURL(val) {
    return val
      .replace(/[\u0000-\u001F\u007F\u00AD\u200B-\u200D\uFEFF]/g, "")
      .replace(/&[a-zA-Z]+;|&#x?[0-9a-fA-F]+;/g, "")
      .replace(/\s+/g, "")
      .toLowerCase()
      .trim();
  }

 /**
 * Strip known-dangerous tags and attributes from an HTML string.
 * Uses DOMParser to parse into a real DOM tree - avoids regex-based
 * parsing which is trivially bypassable.
 *
 * Called at every runtime innerHTML write point. Never called on
 * developer-authored page template HTML.
 */
  function sanitizeHTML(html) {
    if (!html || typeof html !== "string") return "";
    const doc = new DOMParser().parseFromString(html, "text/html");
    sanitizeNode(doc.body);
    return doc.body.innerHTML;
  }

  function sanitizeNode(node) {
    for (const child of [...node.childNodes]) {
      if (child.nodeType !== Node.ELEMENT_NODE) continue;
      const tag = child.tagName.toLowerCase();
      if (BLOCKED_TAGS.has(tag)) {
        if (engineState.logger) {
          engineState.logger.error(
            "XSS_TAG_BLOCKED",
            `Sanitizer removed blocked tag <${tag}> from runtime HTML string.`
          );
        }
        child.remove();
        continue;
      }
      for (const attr of [...child.attributes]) {
        const name       = attr.name.toLowerCase();
        const blockedName = BLOCKED_ATTR_PATTERNS.some(p => p.test(name));
        const blockedVal  = URL_ATTRS.has(name) &&
          BLOCKED_VALUE_PATTERNS.some(p => p.test(normalizeURL(attr.value)));
        if (blockedName || blockedVal) {
          if (engineState.logger) {
            engineState.logger.error(
              "XSS_ATTR_BLOCKED",
              `Sanitizer removed attribute "${attr.name}" on <${tag}>` +
              (blockedVal ? `. unsafe value: "${attr.value.trim().slice(0, 40)}"` : "") + "."
            );
          }
          child.removeAttribute(attr.name);
        }
      }
      sanitizeNode(child);
    }
  }

 /* ============================================================================
 Engine state (single runtime instance)
 ----------------------------------------------------------------------------
 WHAT: Central runtime state container. All mutable runtime state lives here.
 WHY: Single-instance, no globals leaking into the page.
 ============================================================================ */
 // Implicit context slot. Set by the runtime before each action/lifecycle handler call,
 // Context stack: each action/lifecycle call pushes its context on entry and pops on exit.
  // A stack rather than a single slot means concurrent async actions and nested calls
  // each see their own context without clobbering each other.
  const _contextStack = [];
  function _pushContext(ctx) { _contextStack.push(ctx); }
  function _popContext()     { _contextStack.pop(); }
  function _currentContext() { return _contextStack.length > 0 ? _contextStack[_contextStack.length - 1] : null; }

  const engineState = {
    isStarted: false,
    isBooted:  false,

    publicApi: null,

    appRootElement:   null,
    mountZoneElement: null,
    splashElement:    null,

    pageRegistry:    new Map(),
    currentPageName: null,
    navigationStack: [],

    components:         Object.create(null),
    installedPluginIds: new Set(),
    installedPlugins:   [],

    globalActions: Object.create(null),

 /**
 * Global data store - attached via CLERA.data(sourceObject).
 * Keys are merged in by reference. Exposed directly on CLERA.* for
 * easy read/write access (e.g. CLERA.user.name = "John").
 * @type {object}
 */
    globalData: Object.create(null),

 /**
 * Global non-binding storage - exposed as CLERA.memory.
 * Plain object. No reactivity. No binding. No patch cycle.
 * Use for raw datasets, cached results, and shared state that
 * does not need to drive the UI directly.
 *
 * Flow: CLERA.memory -> CLERA.data / context.data -> UI
 *
 * @type {object}
 */
    memory: Object.create(null),

 /**
 * Reusable block registry - populated at boot by scanTemplatesWithin().
 * Keyed by id. Values are either:
 * - a DocumentFragment (from <template id="...">)
 * - an Element reference (from [template][id])
 * @type {object}
 */
    templates:       Object.create(null),

/**
 * Per-template node map built at scan time. Keyed by template id.
 * Each value is a plain object mapping nodeId (string) to { tagName, childIds }.
 * Used during use-element expansion for target resolution and batch eviction.
 * Never queried against the live DOM — only against this pre-built map.
 * @type {object}
 */
    templateNodeMap:  Object.create(null),

/**
 * Per-template slot alias map built at scan time. Keyed by template id.
 * Each value is a plain object mapping slot name (string) to nid (string).
 * Built from slot= attributes on Container template descendants.
 * Consulted first during target= resolution in processUseElementsWithin.
 * @type {object}
 */
    templateSlotMap:  Object.create(null),

/**
 * Per-template classification built at scan time. Keyed by template id.
 * Values are "void" or "container". Consulted in processUseElementsWithin
 * to detect the void-template-with-override-children mismatch.
 * @type {object}
 */
    templateClasses:   Object.create(null),

    config: Object.create(null),
    logger: null,

    maxCachedPages: 0,
    lruOrder:       [],

    layoutHelper: null,
    router:       null,
    callQueue:    [],

 /**
 * Accumulated configuration from CLERA.config() calls.
 * Shallow-merged into engineState.config at internalStart() time.
 * All keys accepted by CLERA.start() are valid here.
 * @type {object}
 */
    pendingConfig: Object.create(null),

 /**
 * True once the DOMContentLoaded listener for auto-start has been
 * registered. Prevents duplicate listener registration if the IIFE
 * somehow executes more than once in the same page lifetime.
 * @type {boolean}
 */
    autoStartScheduled: false,

    // Resolved immediately at IIFE evaluation time so app.platform() returns
    // the correct value even before boot. detectBridgeEnvironment() reads only
    // synchronous window properties — no network, no WASM dependency.
    platform: (() => {
      const env   = detectBridgeEnvironment();
      const isPWA = env === "browser" &&
                    typeof navigator !== "undefined" &&
                    (navigator.standalone === true ||
                     !!(window.matchMedia && window.matchMedia("(display-mode: standalone)").matches));
      return env === "native-ios"    ? "ios"
           : env === "native-android" ? "android"
           : isPWA                    ? "pwa"
           :                           "web";
    })()
  };


  const LOG_BUFFER_MAX_SIZE = 100;
  const diagnosticsLogBuffer = [];

 /**
 * Build a lean diagnostics log entry.
 * Line/file mapping is handled by the kernel's deterministic diagnostics
 * function (kernelDiagnose) - clera.js only owns code/message/errorType.
 * @param {string} level "info" | "warn" | "error"
 * @param {string} code Stable error/info code
 * @param {string} messageText Human-readable description
 * @param {Error|null} [err]
 * @returns {{ level, code, message, errorType, source, time }}
 */
  function buildDiagnosticsEntry(level, code, messageText, err) {
    return {
      level,
      code,
      message:   messageText,
      errorType: (err instanceof Error) ? err.constructor.name : (err ? "Error" : null),
      source:    "clera",
      time:      Date.now()
    };
  }

 /**
 * Push a log entry into the circular buffer and forward to the IDE hook.
 * @param {object} diagnosticsEntry
 */
  function emitDiagnosticsEntry(diagnosticsEntry) {
    if (diagnosticsLogBuffer.length >= LOG_BUFFER_MAX_SIZE) {
      diagnosticsLogBuffer.shift();
    }
    diagnosticsLogBuffer.push(diagnosticsEntry);

    if (typeof window.__CLERA_IDE_LOG__ === "function") {
      try {
        window.__CLERA_IDE_LOG__(diagnosticsEntry);
      } catch (_ignoredIdeHookError) {}
    }
  }


 /**
 * Create a logger gated by dev mode.
 * Line/file mapping is NOT done here - that belongs to the kernel's
 * kernelDiagnose() which runs only in the IDE path.
 * @param {boolean} dev
 * @returns {{ warn, error, info }}
 */
  function createLogger(dev) {
    function fmt(code, msg) { return "[CLERA:" + code + "] " + msg; }

    return {
      warn(errorCode, messageText) {
        if (dev) console.warn(fmt(errorCode, messageText));
        emitDiagnosticsEntry(buildDiagnosticsEntry("warn", errorCode, messageText, null));
      },
      error(errorCode, messageText, err) {
        console.error(fmt(errorCode, messageText), err || "");
        emitDiagnosticsEntry(buildDiagnosticsEntry("error", errorCode, messageText, err || null));
      },
      info(errorCode, messageText) {
        if (dev) console.log(fmt(errorCode, messageText));
        emitDiagnosticsEntry(buildDiagnosticsEntry("info", errorCode, messageText, null));
      }
    };
  }


 /**
 * Attach the CLERA.diagnostics object to the public API.
 * @param {object} cleraPublicApi
 */
  function attachDiagnosticsModule(cleraPublicApi) {
    cleraPublicApi.diagnostics = {
      logs()  { return diagnosticsLogBuffer.slice(); },
      clear() { diagnosticsLogBuffer.length = 0; },
      attach(ideLogHook) {
        if (typeof ideLogHook !== "function") return;
        const snapshot = diagnosticsLogBuffer.slice();
        snapshot.forEach((entry) => {
          try { ideLogHook(entry); } catch (_) {}
        });
        window.__CLERA_IDE_LOG__ = ideLogHook;
      },
      detach() { window.__CLERA_IDE_LOG__ = undefined; }
    };
  }


  function isPlainObject(anyValue) {
    return anyValue !== null && typeof anyValue === "object" && !Array.isArray(anyValue);
  }

  function normalizeToString(anyValue) {
    return (anyValue || "").toString().trim();
  }

  function normalizeUseElements(html) {
    // Self-closing <use /> is converted to open/close form for consistent DOM parsing.
    // Open/close <use></use> is stamped with data-cre-oc so the expansion pass can
    // distinguish intentional override-children intent from self-closing usage.
    // This distinction matters for void templates: open/close + void template = mismatch.
    // The stamp pass runs first and matches ALL open/close forms including those with
    // children already in source (e.g. <use template="x"><p>child</p></use>).
    const withStamp = html.replace(
      /<use(\s[^>]*)?>[\s\S]*?<\/use>/gi,
      (match) => {
        if (/data-cre-oc/.test(match)) return match;
        return match.replace(/^(<use(\s[^>]*)?>)/, (openTag) =>
          openTag.replace(/>$/, " data-cre-oc>")
        );
      }
    );
    return withStamp.replace(/<use(\s[^>]*)?\s*\/>/gi, "<use$1></use>");
  }

  function isProtectedCoreTag(tagName) {
    return PROTECTED_CORE_TAGS.has(normalizeToString(tagName).toLowerCase());
  }

  function injectMinimalBaselineCssOnce() {
    if (document.getElementById("clera-engine-baseline-style")) return;
    const styleElement = document.createElement("style");
    styleElement.id = "clera-engine-baseline-style";
 /*   All baseline rules use :where() so specificity = 0.
 Any dev rule even a bare tag selector always wins.
 Position in <head> no longer matters at all.   */
    styleElement.textContent = `
 /*   Clera structural layout   */
      :where(app, page) { display: block; }
      :where(use) { display: none; }
      :where(splash) { display: flex; align-items: center; justify-content: center; position: absolute; inset: 0; z-index: 9999; background: #fff; }
      :where(app) { height: 100vh; width: 100%; overflow: hidden; display: flex; flex-direction: column; }
      :where(page) { visibility: hidden; }
      :where(page[data-app-page]) { flex: 1; min-width: 0; min-height: 0; overflow: auto; box-sizing: border-box; visibility: visible; }
      :where(page[data-app-page][data-clera-hidden]) { display: none !important; }
      :where([data-clera-hidden]:not(page[data-app-page])) { display: none !important; }
      :where(nav[position]) { display: flex; flex-shrink: 0; z-index: 100; --item-direction: column; }
      :where(nav[position="left"]), :where(nav[position="right"]) { flex-direction: column; position: fixed; top: 0; bottom: 0; overflow: hidden; transition: width 0.2s ease; --item-direction: row; }
      :where(nav[position="left"]) { left: 0; }
      :where(nav[position="right"]) { right: 0; }
      :where(nav[position="bottom"]), :where(nav[position="top"]) { flex-direction: row; width: 100%; align-items: center; justify-content: space-evenly; }
      :where(nav[position="bottom"]) { padding-bottom: max(env(safe-area-inset-bottom), 30px); }
      :where(nav[position] tab) { display: flex; flex-direction: var(--item-direction, column); align-items: center; justify-content: center; }
      :where(tabbar) { display: flex; flex-shrink: 0; flex-direction: row; width: 100%; align-items: center; justify-content: space-evenly; z-index: 100; }
      :where(tabbar[position="top"]) { order: -1; }
      :where(tabbar[position="bottom"]), :where(tabbar:not([position])) { order: 1; padding-bottom: max(env(safe-area-inset-bottom), 30px); }
      :where(tabbar tab) { display: flex; flex-direction: column; align-items: center; justify-content: center; }
      :where(sidebar) { display: flex; flex-shrink: 0; flex-direction: column; position: fixed; top: 0; bottom: 0; overflow: hidden; z-index: 100; transition: width 0.2s ease; }
      :where(sidebar[position="left"]), :where(sidebar:not([position])) { left: 0; }
      :where(sidebar[position="right"]) { right: 0; }
      :where(sidebar tab) { display: flex; flex-direction: row; align-items: center; justify-content: center; }

 /*   Unknown / custom elements default to block   */
 /* Browsers render unknown tags as display:inline by default, which breaks */
 /* box model (width, height, margin, padding silently ignored). This rule */
 /* makes every non-standard tag behave like a div. :where() keeps */
 /* specificity at 0 so any developer CSS always wins. */
      :where(:not(
        html,head,body,base,link,meta,script,style,title,noscript,template,slot,
        div,span,p,a,abbr,address,article,aside,b,bdi,bdo,blockquote,br,
        button,canvas,caption,cite,code,col,colgroup,data,datalist,dd,del,
        details,dfn,dialog,dl,dt,em,embed,fieldset,figure,figcaption,footer,
        form,h1,h2,h3,h4,h5,h6,header,hgroup,hr,i,iframe,img,input,ins,
        kbd,label,legend,li,main,map,mark,menu,meter,nav,object,ol,optgroup,
        option,output,picture,pre,progress,q,rp,rt,ruby,s,samp,search,section,
        select,small,source,strong,sub,summary,sup,table,tbody,td,textarea,
        tfoot,th,thead,time,tr,track,u,ul,var,video,wbr,
        app,page,nav,tabbar,tab,sidebar,splash,use
      )) { display: block; }

 /*   Browser default reset   */
      :where(body) { margin: 0; padding: 0; }
      :where(h1, h2, h3, h4, h5, h6,
      p, ul, ol, dl, menu,
      blockquote, figure, pre, hr, dd) { margin: 0; padding: 0; }
      :where(ul, ol, menu) { list-style: none; }
      :where(dd) { margin-inline-start: 0; }
    `;
    document.head.appendChild(styleElement);
    Object.defineProperty(styleElement, "textContent", { get() { return styleElement.innerHTML; }, set() {}, configurable: false });
    styleElement.setAttribute = () => {};
    styleElement.removeAttribute = () => {};
  }

 /* ============================================================================
 Accessibility system
 ----------------------------------------------------------------------------
 Platform comfort layer reduces unnecessary zoom, touch awkwardness, and
 app-feel breakage without requiring any configuration from beginners.

 Config key: accessibility (on CLERA.start() or CLERA.config())

 Supported forms:
 "auto" default. Comfort layer activates in app/standalone/native-shell contexts.
 "on" accessibility kept on. Comfort layer never applies, standard browser
 interactions (text selection, long-press callout) stay intact.
 "off" accessibility turned off. Comfort layer always applies.
 true equivalent to "on"
 false equivalent to "off"
 { mode, ios, android } advanced object form

 "on"/"off" describe the accessibility state, not the comfort layer's state --
 "on" means accessibility stays on, "off" means it is turned off in favour of
 the app-feel comfort layer. true and false read the same way.

 Internal normalized shape:
 { mode: "auto"|"on"|"off", ios: boolean, android: boolean }

 Initial scope: iOS focus-zoom mitigation and touch comfort.
 Android hooks exist in the API shape but contain no-op logic until
 specific Android problems are identified and validated.
 ============================================================================ */

 /**
 * Normalize any accessibility config input into the internal shape.
 * @param {*} rawAccessibility
 * @returns {{ mode: string, ios: boolean, android: boolean }}
 */
  function normalizeAccessibilityConfig(rawAccessibility) {
 // Default when unset
    if (rawAccessibility === undefined || rawAccessibility === null) {
      return { mode: "auto", ios: true, android: true };
    }
 // Boolean shortcuts. true keeps accessibility on, false turns it off --
 // read the same way as the "on"/"off" string modes below.
    if (rawAccessibility === true)  return { mode: "on",  ios: true, android: true };
    if (rawAccessibility === false) return { mode: "off", ios: true, android: true };
 // String modes
    if (typeof rawAccessibility === "string") {
      const mode = normalizeToString(rawAccessibility).toLowerCase();
      if (mode === "off") return { mode: "off", ios: true, android: true };
      if (mode === "on")  return { mode: "on",  ios: true, android: true };
 // "auto" and anything unrecognized -> auto
      return { mode: "auto", ios: true, android: true };
    }
 // Object form. Merge with defaults
    if (isPlainObject(rawAccessibility)) {
      const mode = normalizeToString(rawAccessibility.mode).toLowerCase() || "auto";
      const resolvedMode = (mode === "on" || mode === "off") ? mode : "auto";
      return {
        mode:    resolvedMode,
        ios:     rawAccessibility.ios     !== false,
        android: rawAccessibility.android !== false
      };
    }
 // Fallback
    return { mode: "auto", ios: true, android: true };
  }

 /**
 * Determine whether accessibility comfort features should activate.
 * In "on" mode: never activates -- accessibility stays on, standard
 * browser interactions remain intact.
 * In "off" mode: always activates -- comfort layer fully applied.
 * In "auto" mode: activates for PWA, standalone, and native-shell contexts.
 */
  function shouldApplyAccessibility(accessibilityConfig) {
    const mode = accessibilityConfig.mode;
    if (mode === "on")  return false;
    if (mode === "off") return true;
 // "auto" - detect PWA / standalone / native-shell context
    try {
 // Standalone display mode (PWA installed)
      if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) return true;
 // iOS standalone homescreen
      if (window.navigator && window.navigator.standalone === true) return true;
 // Native shell - Clera bridge present (iOS WKWebView or Android WebView)
      if (window.__CLERA_SIMULATOR_BRIDGE__ || window.__CLERA_PREVIEW_BRIDGE__ ||
          (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.cleraBridge) ||
          window.CleraAndroidBridge) return true;
    } catch (_) {}
    return false;
  }

 /**
 * Apply accessibility comfort CSS for the resolved platform config.
 * Injects a dedicated <style> element - safe to call at boot.
 *
 * @param {{ mode: string, ios: boolean, android: boolean }} accessibilityConfig
 */
  function applyAccessibilityComfort(accessibilityConfig) {
    if (document.getElementById("clera-engine-accessibility-style")) return;
    if (!shouldApplyAccessibility(accessibilityConfig)) return;

    const rules = [];

 //   iOS comfort rules
 // Applied regardless of platform. These rules only have visible effect
 // on environments that have the relevant quirks (primarily iOS Safari).
    if (accessibilityConfig.ios !== false) {
      rules.push(
 // Prevent iOS Safari from zooming in on focus when font-size < 16px.
 // Setting font-size: 16px on inputs ensures the browser considers the
 // control large enough not to need assistance zoom. This is the safest
 // approach. No viewport meta manipulation, no JS event interception.
 // Developers who want smaller text can use transform: scale() instead.
        "input, textarea, select { font-size: max(16px, 1em); }",

 // App-like interfaces do not show tap feedback rings. Website-like tap
 // highlights break the native feel on iOS and Android touch targets.
 // Developers can re-enable per element with -webkit-tap-highlight-color.
        "* { -webkit-tap-highlight-color: transparent; }",

 // Prevent user selection of UI text (labels, buttons, nav items) in app
 // contexts where text selection feels unintended. Inputs and textareas
 // are excluded. Their content must remain selectable.
        "body { -webkit-user-select: none; user-select: none; }",
        "input, textarea { -webkit-user-select: text; user-select: text; }",

 // Prevent long-press callout (copy/open link menu) on non-interactive
 // elements in app contexts where it feels intrusive.
        "body { -webkit-touch-callout: none; }",
        "a, input, textarea { -webkit-touch-callout: default; }"
      );
    }

 //   Android comfort rules
 // Placeholder. No Android-specific rules in v1.
 // if (accessibilityConfig.android !== false) { ... }

    if (!rules.length) return;

    const styleElement = document.createElement("style");
    styleElement.id = "clera-engine-accessibility-style";
    styleElement.textContent = rules.join("\n      ");
    document.head.appendChild(styleElement);
  }


 /**
 * Resolve a bare word selector to a valid CSS selector.
 * Bare words that match known HTML or CRE tag names pass through unchanged.
 * Custom elements (containing a hyphen) pass through unchanged.
 * Anything else that contains no CSS syntax is treated as an id and prefixed with #.
 * Selectors already containing CSS syntax characters pass through unchanged.
 */
  function normalizeSelector(input) {
    if (/[\s>~+\[\]:.#*=()|,]/.test(input)) return input;
    if (/^[a-z][a-z0-9]*-[a-z0-9-]+$/i.test(input)) return input;
    const knownTags = new Set([
      "html","head","body","base","link","meta","script","style","title","noscript",
      "template","slot","div","span","p","a","abbr","address","article","aside","b",
      "bdi","bdo","blockquote","br","button","canvas","caption","cite","code","col",
      "colgroup","data","datalist","dd","del","details","dfn","dialog","dl","dt","em",
      "embed","fieldset","figure","figcaption","footer","form","h1","h2","h3","h4",
      "h5","h6","header","hgroup","hr","i","iframe","img","input","ins","kbd","label",
      "legend","li","main","map","mark","menu","meter","nav","object","ol","optgroup",
      "option","output","picture","pre","progress","q","rp","rt","ruby","s","samp",
      "search","section","select","small","source","strong","sub","summary","sup",
      "table","tbody","td","textarea","tfoot","th","thead","time","tr","track","u",
      "ul","var","video","wbr",
      "app","page","tabbar","tab","sidebar","splash","use","import"
    ]);
    return knownTags.has(input.toLowerCase()) ? input : "#" + input;
  }

 /**
 * Wrap a queried element in a safe accessor object.
 * @param {Element|null} targetElement
 * @param {string} owningPageName
 * @param {string} cssSelector
 * @returns {object}
 */
  function createSafeElementWrapper(targetElement, owningPageName, cssSelector) {
    const logger = engineState.logger;
    const wrapper = {
      exists: !!targetElement,
      element: targetElement || null,  // raw element reference - use .exists check first
      text(newValue) {
        if (!targetElement) { logger.warn("DOM_MISSING", `query("${cssSelector}") missing in "${owningPageName}".`); return ""; }
        if (newValue !== undefined) targetElement.textContent = String(newValue);
        return targetElement.textContent;
      },
      html(newValue) {
        if (!targetElement) { logger.warn("DOM_MISSING", `query("${cssSelector}") missing in "${owningPageName}".`); return ""; }
        if (newValue !== undefined) targetElement.innerHTML = sanitizeHTML(String(newValue));
        return targetElement.innerHTML;
      },
      value(newValue) {
        if (!targetElement) { logger.warn("DOM_MISSING", `query("${cssSelector}") missing in "${owningPageName}".`); return ""; }
        if (!("value" in targetElement)) { logger.warn("DOM_NOT_INPUT", `query("${cssSelector}") in "${owningPageName}" has no .value.`); return ""; }
        if (newValue !== undefined) targetElement.value = newValue;
        return targetElement.value;
      },
      on(eventName, handler) {
        if (!targetElement) { logger.warn("DOM_MISSING", `query("${cssSelector}") missing in "${owningPageName}".`); return this; }
        targetElement.addEventListener(eventName, handler);
        return this;
      },
      show() {
        if (!targetElement) { logger.warn("DOM_MISSING", `query("${cssSelector}") missing in "${owningPageName}".`); return this; }
        targetElement.removeAttribute("data-clera-hidden");
        return this;
      },
      hide() {
        if (!targetElement) { logger.warn("DOM_MISSING", `query("${cssSelector}") missing in "${owningPageName}".`); return this; }
        targetElement.setAttribute("data-clera-hidden", "");
        return this;
      },
      toggle(forceVisible) {
        if (!targetElement) { logger.warn("DOM_MISSING", `query("${cssSelector}") missing in "${owningPageName}".`); return this; }
        const shouldShow = forceVisible !== undefined ? forceVisible : targetElement.hasAttribute("data-clera-hidden");
        if (shouldShow) {
          targetElement.removeAttribute("data-clera-hidden");
        } else {
          targetElement.setAttribute("data-clera-hidden", "");
        }
        return this;
      }
    };
    return new Proxy(wrapper, {
      get(target, prop) {
        if (prop in target) return target[prop];
        if (targetElement) {
          const nativeValue = targetElement[prop];
          return typeof nativeValue === "function" ? nativeValue.bind(targetElement) : nativeValue;
        }
        return undefined;
      },
      set(target, prop, value) {
        if (prop in target) { target[prop] = value; return true; }
        if (targetElement) { targetElement[prop] = value; return true; }
        return false;
      }
    });
  }


  function queueCall(publicMethodName, callerArguments) {
    engineState.callQueue.push({
      methodName: publicMethodName,
      args: Array.prototype.slice.call(callerArguments)
    });
  }

  function flushQueuedCalls(cleraPublicApi) {
    const pendingCalls = engineState.callQueue.slice();
    engineState.callQueue.length = 0;
    pendingCalls.forEach((entry) => {
      const method = cleraPublicApi[entry.methodName];
      if (typeof method !== "function") return;
      try {
        method.apply(cleraPublicApi, entry.args);
      } catch (err) {
        if (engineState.logger) {
          engineState.logger.error("QUEUE_CALL_FAIL", `Queued call "${entry.methodName}" failed.`, err);
        }
      }
    });
  }


  function runActionNonBlocking({ handler, pageContext, resolvedArgs, actionName, pageName }) {
    const logger = engineState.logger;

 // Detect explicit context parameter:
 // If fn.length === resolvedArgs.length + 1 the developer declared context
 // as the last param (backward compat). Otherwise args pass positionally
 // and context is ambient via window.context (backed by the context stack).
    const wantsExplicit = handler.length === resolvedArgs.length + 1;
    const callArgs      = wantsExplicit ? [...resolvedArgs, pageContext] : resolvedArgs;

 // Capture for async safety. Each call closes over its own snapshot
    const capturedContext = pageContext;

    try {
      _pushContext(pageContext);
      const handlerReturnValue = handler(...callArgs);

      if (handlerReturnValue && typeof handlerReturnValue.then === "function") {
        handlerReturnValue
          .then(() => {
            _popContext();
            const pageRecord = engineState.pageRegistry.get(pageName);
            if (pageRecord) patchBindings(pageRecord);
          })
          .catch((err) => {
            _popContext();
            logger.error("ACTION_THROW", `Action "${actionName}" failed (page "${pageName}").`, err);
          });
      } else {
        _popContext();
        const pageRecord = engineState.pageRegistry.get(pageName);
        if (pageRecord) patchBindings(pageRecord);
      }
      return true;
    } catch (err) {
      _popContext();
      logger.error("ACTION_THROW", `Action "${actionName}" threw (page "${pageName}").`, err);
      return false;
    }
  }


  function calculateLayoutFromWidth(width) {
    if (width <= DEFAULT_LAYOUT_BREAKPOINTS.mobileMaxWidth) return "mobile";
    if (width <= DEFAULT_LAYOUT_BREAKPOINTS.tabletMaxWidth) return "tablet";
    return "desktop";
  }

  function setupLayout(appRootElement, runtimeConfig) {
    let lastLayout = null;
    let rafId      = null;

    function getViewportWidth() {
      const forced = runtimeConfig && runtimeConfig.forceLayoutWidth;
      return typeof forced === "number" ? forced : window.innerWidth;
    }

    function applyLayout() {
      rafId = null;
      const width  = getViewportWidth();
      const layout = calculateLayoutFromWidth(width);
      if (layout === lastLayout) return;
      lastLayout = layout;
      appRootElement.setAttribute("layout", layout);
      appRootElement.setAttribute("media", layout === "mobile" ? "mobile" : layout === "tablet" ? "mobile tablet" : "mobile tablet desktop");
      applyNavPositions(appRootElement, layout);
      window.dispatchEvent(new CustomEvent("app:layoutchange", { detail: { layout, width } }));
    }

    applyLayout();
    window.addEventListener("resize", () => {
      if (rafId) return;
      rafId = requestAnimationFrame(applyLayout);
    });

    return {
      getLayout()  { return lastLayout; },
      recompute()  { applyLayout(); }
    };
  }


  function createPageRecord(pageName, templateHtml, pageOptions) {
    return {
      name:         pageName,
      pageId:       pageOptions && pageOptions.pageId    ? pageOptions.pageId    : null,
      pageClass:    pageOptions && pageOptions.pageClass  ? pageOptions.pageClass  : null,
      templateHtml,
      rootElement:  null,
      mounted:      false,
      createdOnce:  false,
      params:       Object.create(null),
      pageData:     Object.create(null),   // page-local data - attached via context.data()
      instances:    Object.create(null),   // named <use> instance scopes - keyed by name
      listeners:    [],                    // context.listen() registry - cleared on destroy
      keepAlive:    !!(pageOptions && pageOptions.keepAlive),
      lifecycle:        { onCreate: null, onShow: null, onHide: null, onDestroy: null },
      lifecycleActions: { onCreate: null, onShow: null, onHide: null, onDestroy: null },
      actions:      Object.create(null)
    };
  }

  function extractPagesFromAppRoot(appRootElement) {
    const logger = engineState.logger;

 // Resolve current platform once for target="..." filtering.
 // Maps raw's detectBridgeEnvironment() strings to the four concrete tokens.
    const env = detectBridgeEnvironment();
    const isPWA = (env === "browser") &&
                  typeof navigator !== "undefined" &&
                  (navigator.standalone === true ||
                   !!(window.matchMedia && window.matchMedia("(display-mode: standalone)").matches));
    const platform = env === "native-ios"     ? "ios"
                   : env === "native-android"  ? "android"
                   : isPWA                     ? "pwa"
                   :                            "web";

 // Meta-token expansion. Mirrors packager._expand_target() exactly.
    const TARGET_META = { native: ["ios","android"], desktop: ["web","pwa"] };
    function expandTarget(raw) {
      const expandedTargetSet = new Set();
      raw.split(",").forEach((t) => {
        t = t.trim().toLowerCase();
        if (!t) return;
        if (TARGET_META[t]) TARGET_META[t].forEach((v) => expandedTargetSet.add(v));
        else expandedTargetSet.add(t);
      });
      return expandedTargetSet;
    }

    Array.from(appRootElement.querySelectorAll("page[name]")).forEach((pageTemplateElement) => {
      const pageName = normalizeToString(pageTemplateElement.getAttribute("name"));
      if (!pageName) return;
      if (engineState.pageRegistry.has(pageName)) {
        logger.warn("PAGE_DUP", `Duplicate <page name="${pageName}">. First wins; removing duplicate.`);
        pageTemplateElement.remove();
        return;
      }

 // target="..." - filter page to specific platforms.
 // Absent = all platforms. Comma-separated, meta-tokens expanded.
      const targetAttr = pageTemplateElement.getAttribute("target");
      if (targetAttr) {
        const allowed = expandTarget(targetAttr);
        if (!allowed.has(platform)) {
          pageTemplateElement.remove();
          return;
        }
      }

      const keepAlive = pageTemplateElement.hasAttribute("keep-alive") || pageTemplateElement.hasAttribute("keepalive") ||
        normalizeToString(pageTemplateElement.getAttribute("keepAlive")).toLowerCase() === "true";
      const pageId    = normalizeToString(pageTemplateElement.getAttribute("id"))    || null;
      const pageClass = normalizeToString(pageTemplateElement.getAttribute("class")) || null;
      const pageRecord = createPageRecord(pageName, pageTemplateElement.innerHTML, { keepAlive, pageId, pageClass });
      pageRecord.lifecycleActions.onCreate  = normalizeToString(pageTemplateElement.getAttribute("oncreate"))  || null;
      pageRecord.lifecycleActions.onShow    = normalizeToString(pageTemplateElement.getAttribute("onshow"))    || null;
      pageRecord.lifecycleActions.onHide    = normalizeToString(pageTemplateElement.getAttribute("onhide"))    || null;
      pageRecord.lifecycleActions.onDestroy = normalizeToString(pageTemplateElement.getAttribute("ondestroy")) || null;
      engineState.pageRegistry.set(pageName, pageRecord);
      pageTemplateElement.remove();
    });
    if (engineState.pageRegistry.size === 0) {
      logger.warn("PAGE_NONE", 'No <page name="..."> found inside <app>.');
    }
    return true;
  }

  function ensureMountZone(appRootElement) {
 // Raw parity with CRE: pages mount directly inside <app> (app > page).
 // The old <main data-app-view> wrapper is removed. Any existing one is
 // kept for backwards compat but new pages are appended to <app> itself.
    const legacy = appRootElement.querySelector("main[data-app-view]");
    if (legacy) legacy.removeAttribute("data-app-view");
    engineState.mountZoneElement = appRootElement;
  }

  function findAndKeepFirstSplash(appRootElement) {
    const logger   = engineState.logger;
    const splashes = Array.from(appRootElement.querySelectorAll("splash"));
    if (!splashes.length) return;
    engineState.splashElement = splashes[0];
    if (splashes.length > 1) {
      for (let i = 1; i < splashes.length; i++) splashes[i].remove();
      logger.warn("SPLASH_DUP", "Multiple <splash> found. Using the first.");
    }
  }

  function hideSplashIfAny() {
    if (engineState.splashElement) engineState.splashElement.style.display = "none";
  }
  function showSplashIfAny() {
    if (engineState.splashElement) engineState.splashElement.style.display = "block";
  }

 /* ============================================================================
 Data system global + page-local data, binding engine, auto-update
 ----------------------------------------------------------------------------
 Three layers work together:

 1. resolveDataPath() dot-notation path lookup across page + global data
 2. scanBindings() finds {path} tokens in DOM at mount/inject time
 3. patchBindings() resolves all stored bindings and writes to DOM

 Auto-update is triggered after every Clera-controlled execution cycle
 (action, form action, lifecycle hook, context.fetch, context.timeout).
 Manual update is available via context.update() / CLERA.update().
 ============================================================================ */

 /**
 * Resolve a dot-notation data path against page-local data first,
 * then global data. Returns empty string if unresolved.
 *
 * Resolution order:
 * 1. pageRecord.pageData (page-local - wins over global)
 * 2. engineState.globalData
 * 3. "" fallback
 *
 * @param {string} path e.g. "user.name" or "stats.count"
 * @param {object} pageRecord
 * @returns {string}
 */
 /**
 * Resolve a dot-notation data path.
 *
 * Resolution order:
 * 1. instance-local data (pageRecord.instances[instanceName], when provided)
 * 2. page-local data (pageRecord.pageData)
 * 3. global data (engineState.globalData)
 * 4. "" fallback
 *
 * @param {string} path e.g. "user.name" or "stats.count"
 * @param {object} pageRecord
 * @param {string|null} [instanceName] Named instance scope, or null for shared mode
 * @returns {string}
 */
  function resolveDataPath(path, pageRecord, instanceName) {
    const parts = path.trim().split(".").filter(Boolean);
    if (!parts.length) return "";

    const sources = [];
    if (instanceName && pageRecord && pageRecord.instances && pageRecord.instances[instanceName]) {
      sources.push(pageRecord.instances[instanceName]);
    }
    if (pageRecord && pageRecord.pageData) sources.push(pageRecord.pageData);
    sources.push(engineState.globalData);

    for (const source of sources) {
      if (!source) continue;
      let current = source;
      let resolved = true;
      for (const part of parts) {
        if (current === null || current === undefined || typeof current !== "object") {
          resolved = false;
          break;
        }
        current = current[part];
      }
      if (resolved && current !== undefined && current !== null) {
        return current;
      }
    }

 // Dev warning for unresolved bindings
    if (engineState.logger && engineState.config && engineState.config.dev) {
      engineState.logger.warn("BINDING_UNRESOLVED", `Binding path "${path}" could not be resolved.`);
    }
    return "";
  }

 /**
 * Scan a DOM element for {path} binding tokens.
 * Stores binding records on the pageRecord for later patching.
 *
 * @param {Element} rootElement Container to scan
 * @param {object} pageRecord
 * @param {boolean} [isFullPageScan] True when scanning the entire page root.
 * Resets bindingNodes to prevent duplicate
 * accumulation on LRU remount or hot-reload.
 * False (default) when scanning an injected
 * fragment - appends to existing records.
 * @param {string|null} [instanceName] Named instance scope for this scan.
 * Null/undefined = shared mode.
 * All records produced carry this name.
 */
  function scanBindings(rootElement, pageRecord, isFullPageScan, instanceName) {
    if (!rootElement || !pageRecord) return;

    const resolvedInstanceName = instanceName || null;

    if (isFullPageScan) {
      pageRecord.bindingNodes = [];
    } else if (!pageRecord.bindingNodes) {
      pageRecord.bindingNodes = [];
    }

    const walker = document.createTreeWalker(
      rootElement,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      {
        acceptNode(node) {
          if (node.nodeType === Node.ELEMENT_NODE &&
              node.hasAttribute && node.hasAttribute("data-clera-template-source")) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      },
      false
    );

    let node = walker.nextNode();
    while (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        _scanTextNode(node, pageRecord, resolvedInstanceName);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        _scanElementAttrs(node, pageRecord, resolvedInstanceName);
      }
      node = walker.nextNode();
    }
  }

 /**
 * Patch all stored bindings for a page - resolve current data values and
 * write them into the DOM.
 *
 * Called automatically after every Clera-controlled execution cycle.
 * Also called manually via context.update() / CLERA.update().
 *
 * @param {object} pageRecord
 */
  function patchBindings(pageRecord) {
    if (!pageRecord || !pageRecord.bindingNodes || !pageRecord.bindingNodes.length) return;

    pageRecord.bindingNodes.forEach((record) => {
      const resolved = record.template.replace(BINDING_PATTERN, (_, path) => {
 // Pass instanceName so instance-scoped bindings resolve from the right scope
        return resolveDataPath(path, pageRecord, record.instanceName || null);
      });

      try {
        _writeBinding(record, resolved);
      } catch (_) {
 // Node may have been removed from DOM. Silently skip
      }
    });
  }

 /**
 * Expose all keys of a source object directly onto a target object by reference.
 * Skips any key that already exists as a built-in property on the target
 * prevents data keys like "navigate", "pageName", "render" from clobbering
 * real context methods if a developer accidentally uses a reserved name.
 *
 * @param {object} sourceData The data object whose keys to expose
 * @param {object} targetObject The object to expose them on (context or CLERA)
 * @param {Set} [reservedKeys] Keys that must never be overwritten
 */
  function exposeDataKeys(sourceData, targetObject, reservedKeys) {
    Object.keys(sourceData).forEach((key) => {
 // Never overwrite reserved built-in keys
      if (reservedKeys && reservedKeys.has(key)) {
        if (engineState.logger) {
          engineState.logger.warn(
            "DATA_KEY_RESERVED",
            `Data key "${key}" is reserved by Clera and cannot be used as a data property. Choose a different key name.`
          );
        }
        return;
      }
      Object.defineProperty(targetObject, key, {
        get()        { return sourceData[key]; },
        set(value)   { sourceData[key] = value; },
        configurable: true,
        enumerable:   true
      });
    });
  }

 // Reserved context property names. Data keys with these names are rejected
  const RESERVED_CONTEXT_KEYS = new Set([
    "pageName", "params", "args", "arg", "event", "element", "navigate", "back",
    "data", "update", "fetch", "timeout", "listen", "query", "queryAll", "render", "append",
    "clear", "unsafe", "log", "values", "form", "formData", "submitter",
    "resetForm", "setSubmitting"
  ]);

 // Reserved CLERA property names. Global data keys with these names are rejected
  const RESERVED_CLERA_KEYS = new Set([
    "version", "start", "config", "page", "navigate", "currentPage",
    "layout", "onLayoutChange", "expand", "collapse", "toggle", "hardware", "bridge", "sw", "actions",
    "data", "update", "map", "memory", "timeout", "interval", "listen", "run",
    "php", "diagnostics", "capabilities", "registerComponent", "use"
  ]);

  function resolveAction(actionName, pageRecord) {
    const name = normalizeToString(actionName);
    if (!name) return null;

 // Tier 1 - page-local actions registered via CLERA.page()
    if (pageRecord && pageRecord.actions && typeof pageRecord.actions[name] === "function") {
      return pageRecord.actions[name];
    }

 // Tier 2 - explicitly registered global actions via CLERA.actions setter
    if (typeof engineState.globalActions[name] === "function") {
      return engineState.globalActions[name];
    }

 // Tier 3 - zero-mental-load auto-discovery: plain global JS function.
 // Developers can author `function addTask() {}` at page scope and the
 // runtime resolves it by exact name match. No registration required.
    if (typeof window[name] === "function") {
      return window[name];
    }

    return null;
  }

  function createPageContext(pageRecord, triggeringEvent, parsedArgs, actionElement) {
    const logger = engineState.logger;

 // Literals carry native JS types. Bindings resolve to whatever the data path holds.
 // This runs at click time so bindings reflect live page data at the moment of click.
    const resolvedArgs = Array.isArray(parsedArgs)
      ? Object.freeze(
          parsedArgs.map(token =>
            token.type === "binding"
              ? resolveDataPath(token.value, pageRecord, null)
              : token.value
          )
        )
      : Object.freeze([]);

    const context = {
      pageName: pageRecord.name,
      params:   pageRecord.params || Object.create(null),
      args:     resolvedArgs,
      get arg() { return resolvedArgs.length > 0 ? resolvedArgs[0] : null; },
      event:    triggeringEvent || null,
      element:  actionElement ?? (triggeringEvent && triggeringEvent.currentTarget ? triggeringEvent.currentTarget : null),
      navigate(targetPage, params, opts) {
        return engineState.publicApi.navigate(targetPage, params, opts);
      },
      back() {
        if (engineState.router && typeof engineState.router.back === "function") {
          engineState.router.back();
          return;
        }
        window.history.back();
      },

 /**
 * Attach page-local data. Merges into this page's data scope by reference.
 * Bound keys are exposed directly on context.* for natural read/write access.
 * Page data overrides global data of the same key on this page only.
 *
 * context.data({ stats, filters });
 * context.stats.count += 1; // works immediately
 */
      data(sourceObject) {
        if (!isPlainObject(sourceObject)) return;
        Object.assign(pageRecord.pageData, sourceObject);
 // Expose each key directly on context. Reserved keys are rejected with a warning
        exposeDataKeys(sourceObject, context, RESERVED_CONTEXT_KEYS);
      },

 /**
 * Manually trigger a DOM binding patch for this page.
 * Use this when data is mutated outside Clera-controlled execution
 * (e.g. after a raw setTimeout or raw fetch callback).
 *
 * setTimeout(() => {
 * context.stats.count += 1;
 * context.update();
 * }, 1000);
 */
      update() {
        patchBindings(pageRecord);
      },

 /**
 * Clera-aware fetch - performs a network request and stays inside Clera's
 * execution context so DOM bindings update automatically after the callback.
 *
 * Supports callback and async/await:
 *
 * // Callback style - auto update after callback
 * context.fetch("/api/data", function(result) {
 * context.stats.count = result.count;
 * });
 *
 * // Async/await - auto update after await returns
 * const result = await context.fetch("/api/data");
 * context.stats.count = result.count;
 *
 * Options:
 * method "GET" | "POST" | "PUT" | "DELETE" | "PATCH" (default: "GET")
 * headers { [key]: string }
 * body any - objects auto JSON-stringified, Content-Type set automatically
 * query { [key]: any } - appended to URL as ?key=value
 * json boolean - parse response as JSON (default: true)
 * timeout number - abort after N milliseconds
 * credentials "include" | "same-origin" | "omit"
 */
      fetch(url, optionsOrCallback, callback) {
 // Signature: fetch(url, callback?) or fetch(url, options, callback?)
        let fetchOptions  = {};
        let fetchCallback = null;

        if (typeof optionsOrCallback === "function") {
          fetchCallback = optionsOrCallback;
        } else if (isPlainObject(optionsOrCallback)) {
          fetchOptions  = optionsOrCallback;
          if (typeof callback === "function") fetchCallback = callback;
        }

        let resolvedUrl = String(url || "");
        if (isPlainObject(fetchOptions.query)) {
          const queryString = Object.keys(fetchOptions.query)
            .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(fetchOptions.query[key])}`)
            .join("&");
          if (queryString) {
            resolvedUrl += (resolvedUrl.includes("?") ? "&" : "?") + queryString;
          }
        }

        const method  = String(fetchOptions.method || "GET").toUpperCase();
        const headers = Object.assign({}, fetchOptions.headers || {});
        const fetchInit = { method, credentials: fetchOptions.credentials || "same-origin" };

        if (fetchOptions.body !== undefined) {
          if (isPlainObject(fetchOptions.body) || Array.isArray(fetchOptions.body)) {
            fetchInit.body = JSON.stringify(fetchOptions.body);
            if (!headers["Content-Type"] && !headers["content-type"]) {
              headers["Content-Type"] = "application/json";
            }
          } else {
            fetchInit.body = fetchOptions.body;
          }
        }

        if (Object.keys(headers).length) fetchInit.headers = headers;

 // Optional timeout via AbortController
        let abortController = null;
        let abortTimerId    = null;
        const timeoutMs = Number(fetchOptions.timeout) || 0;
        if (timeoutMs > 0 && typeof AbortController === "function") {
          abortController  = new AbortController();
          fetchInit.signal = abortController.signal;
          abortTimerId     = setTimeout(() => abortController.abort(), timeoutMs);
        }

        const shouldParseJson = fetchOptions.json !== false; // default true

        if (typeof window.fetch !== "function") {
          const fetchUnsupportedError = new Error("fetch() is not available in this environment.");
          logger.error("FETCH_UNSUPPORTED", `context.fetch() failed (page "${pageRecord.name}"): fetch API not available.`);
          return Promise.reject(fetchUnsupportedError);
        }

        const fetchPromise = window.fetch(resolvedUrl, fetchInit)
          .then((response) => {
            if (abortTimerId !== null) clearTimeout(abortTimerId);
            return shouldParseJson ? response.json() : response;
          })
          .then((result) => {
 // Execute callback inside Clera-controlled execution
            if (typeof fetchCallback === "function") {
              try { fetchCallback(result); }
              catch (err) { logger.error("FETCH_CALLBACK_THROW", `context.fetch() callback threw (page "${pageRecord.name}").`, err); }
            }
 // Auto-patch bindings after fetch resolves
            patchBindings(pageRecord);
            return result;
          })
          .catch((err) => {
            if (abortTimerId !== null) clearTimeout(abortTimerId);
            const timedOut = abortController && err && err.name === "AbortError";
            logger.error("FETCH_FAIL", `context.fetch("${resolvedUrl}") failed (page "${pageRecord.name}"): ${timedOut ? "Request timed out." : err.message}`, err);
            throw err;
          });

        return fetchPromise;
      },

 /**
 * Clera-aware setTimeout - schedules a callback inside Clera's execution
 * context so DOM bindings update automatically after the callback runs.
 *
 * context.timeout(function() {
 * context.message.text = "Done!";
 * }, 1000);
 *
 * Returns the timer ID so it can be cancelled with clearTimeout() if needed.
 */
      timeout(callback, delay) {
        return setTimeout(() => {
          try {
            if (typeof callback === "function") callback();
          } catch (err) {
            logger.error("TIMEOUT_CALLBACK_THROW", `context.timeout() callback threw (page "${pageRecord.name}").`, err);
          }
 // Auto-patch bindings after timeout callback completes
          patchBindings(pageRecord);
        }, Number(delay) || 0);
      },

      query(cssSelector) {
        const root = pageRecord.rootElement;
        const resolvedSelector = normalizeSelector(cssSelector);
        const queriedElement = root ? root.querySelector(resolvedSelector) : null;
        return createSafeElementWrapper(queriedElement, pageRecord.name, resolvedSelector);
      },

      queryAll(cssSelector) {
        const root = pageRecord.rootElement;
        const resolvedSelector = normalizeSelector(cssSelector);
        const matchedElements = root ? Array.from(root.querySelectorAll(resolvedSelector)) : [];
        const logger = engineState.logger;
        return {
          count:    matchedElements.length,
          elements: matchedElements,
          each(fn) {
            matchedElements.forEach((el, index) => fn(el, index));
            return this;
          },
          text(val) {
            if (val !== undefined) {
              matchedElements.forEach((el) => { el.textContent = val; });
              return this;
            }
            return matchedElements.map((el) => el.textContent);
          },
          html(val) {
            if (val !== undefined) {
              matchedElements.forEach((el) => { el.innerHTML = sanitizeHTML(String(val)); });
              return this;
            }
            return matchedElements.map((el) => el.innerHTML);
          },
          on(eventName, handler) {
            matchedElements.forEach((el) => el.addEventListener(eventName, handler));
            return this;
          },
          show() {
            matchedElements.forEach((el) => el.removeAttribute("data-clera-hidden"));
            return this;
          },
          hide() {
            matchedElements.forEach((el) => el.setAttribute("data-clera-hidden", ""));
            return this;
          },
          toggle(forceVisible) {
            matchedElements.forEach((el) => {
              const shouldShow = forceVisible !== undefined ? forceVisible : el.hasAttribute("data-clera-hidden");
              if (shouldShow) {
                el.removeAttribute("data-clera-hidden");
              } else {
                el.setAttribute("data-clera-hidden", "");
              }
            });
            return this;
          },
        };
      },

 /**
 * Replace the inner HTML of the element matching cssSelector.
 * Processes {path} bindings in the injected HTML automatically.
 *
 * context.render("#taskList", "<li>Buy milk</li>");
 *
 * Pass { reserveHeight: true } to prevent layout jump during the swap.
 *
 * context.render("#feedList", html, { reserveHeight: true });
 *
 * Scoped to the current page - cannot reach outside it.
 * Warns and no-ops if the selector matches nothing.
 */
      render(cssSelector, htmlString, renderOptions) {
        const root          = pageRecord.rootElement;
        const targetElement = root ? root.querySelector(cssSelector) : null;
        if (!targetElement) {
          logger.warn("DOM_MISSING", `render("${cssSelector}") found no element in page "${pageRecord.name}".`);
          return;
        }
        const shouldReserveHeight = renderOptions && renderOptions.reserveHeight === true;
        if (shouldReserveHeight) {
          const currentHeight = targetElement.offsetHeight;
          if (currentHeight > 0) targetElement.style.minHeight = currentHeight + "px";
        }
        targetElement.innerHTML = normalizeUseElements(sanitizeHTML(htmlString === undefined ? "" : String(htmlString)));
        if (shouldReserveHeight) {
          targetElement.style.minHeight = "";
        }
 // Templates in shared mode must be resolved before bindings run or
 // placeholders referencing them will resolve to nothing.
        processUseElementsWithin(targetElement, pageRecord);
        scanBindings(targetElement, pageRecord);
        patchBindings(pageRecord);
 // Rebind active listener rules to newly injected elements
        refreshPageListeners(pageRecord, targetElement);
        runPluginRenderHook(targetElement, pageRecord.name);
      },

 /**
 * Append HTML to the element matching cssSelector without clearing content.
 * Processes {path} bindings in the newly appended fragment.
 *
 * context.append("#taskList", "<li>New task</li>");
 *
 * Scoped to the current page - cannot reach outside it.
 * Warns and no-ops if the selector matches nothing.
 */
      append(cssSelector, htmlString) {
        const root           = pageRecord.rootElement;
        const targetElement  = root ? root.querySelector(cssSelector) : null;
        if (!targetElement) {
          logger.warn("DOM_MISSING", `append("${cssSelector}") found no element in page "${pageRecord.name}".`);
          return;
        }
        const fragment = document.createElement("div");
        fragment.innerHTML = normalizeUseElements(sanitizeHTML(htmlString === undefined ? "" : String(htmlString)));
 // Shared-mode templates must be resolved before the fragment is
 // scanned for bindings or template slots will appear unresolved.
        processUseElementsWithin(fragment, pageRecord);
        scanBindings(fragment, pageRecord, false);
        while (fragment.firstChild) {
          targetElement.appendChild(fragment.firstChild);
        }
        patchBindings(pageRecord);
 // Rebind active listener rules to newly appended elements
        refreshPageListeners(pageRecord, targetElement);
        runPluginRenderHook(targetElement, pageRecord.name);
      },

 /**
 * Clear the inner HTML of the element matching cssSelector.
 *
 * context.clear("#taskList");
 *
 * Equivalent to context.render(selector, "").
 * Scoped to the current page - cannot reach outside it.
 * Warns and no-ops if the selector matches nothing.
 */
      clear(cssSelector) {
        const root           = pageRecord.rootElement;
        const targetElement  = root ? root.querySelector(cssSelector) : null;
        if (!targetElement) {
          logger.warn("DOM_MISSING", `clear("${cssSelector}") found no element in page "${pageRecord.name}".`);
          return;
        }
        targetElement.innerHTML = "";
 // Refresh listener rules. Cleared subtree may have had bound elements.
 // Active rules that matched elements inside the cleared container now
 // have no live targets; refreshPageListeners re-evaluates the full page.
        refreshPageListeners(pageRecord);
      },

 /**
 * Attach a persistent event listener rule to elements matching cssSelector
 * inside this page. Runs callback inside Clera's execution cycle and patches
 * bindings after each event.
 *
 * The rule persists across Clera-owned renders - new elements added by
 * context.render() or context.append() that match the selector are
 * automatically bound without re-calling context.listen().
 *
 * Duplicate detection uses real callback reference identity (===), not
 * string serialization. Two different function objects are different rules.
 *
 * const off = context.listen(".item", "click", (event) => {
 * context.selected = event.target.textContent;
 * });
 *
 * off(); // remove rule and all element attachments
 *
 * Warns LISTEN_TARGET_NOT_FOUND in dev mode if no elements match at call time.
 * Rule stays registered - will bind to future matching elements.
 */
      listen(cssSelector, eventName, callback, options) {
        if (typeof callback !== "function") return function () {};

        const root = pageRecord.rootElement;
        if (!root) return function () {};

 // Initialise rule registry if needed
        if (!pageRecord.listeners) pageRecord.listeners = [];

 // Duplicate check. Real callback reference identity, not String(callback)
        const existingRule = pageRecord.listeners.find((r) =>
          r.selector === cssSelector &&
          r.eventName === eventName &&
          r.callback === callback &&
          r.active === true
        );
        if (existingRule) {
          return function off() {
            if (!existingRule.active) return;
            existingRule.active = false;
            if (pageRecord.rootElement) {
              Array.from(pageRecord.rootElement.querySelectorAll(existingRule.selector)).forEach((element) =>
                element.removeEventListener(existingRule.eventName, existingRule.wrappedHandler, existingRule.options)
              );
            }
          };
        }

        const wrappedHandler = function (nativeEvent) {
          try { callback(nativeEvent); }
          catch (err) { logger.error("LISTEN_CALLBACK_THROW", `context.listen() callback threw (page "${pageRecord.name}").`, err); }
          patchBindings(pageRecord);
        };

        const rule = {
          selector:       cssSelector,
          eventName,
          callback,       // stored by reference - never stringified
          wrappedHandler,
          options,
          active:         true
        };
        pageRecord.listeners.push(rule);

 // Attach to current matching elements
        const matched = Array.from(root.querySelectorAll(cssSelector));
        if (matched.length === 0 && engineState.config && engineState.config.dev) {
          logger.warn("LISTEN_TARGET_NOT_FOUND",
            `context.listen("${cssSelector}") found no elements in page "${pageRecord.name}". ` +
            `Rule is registered and will bind to matching elements added by future renders.`);
        }
        matched.forEach((element) => element.addEventListener(eventName, wrappedHandler, options));

        return function off() {
          if (!rule.active) return;
          rule.active = false;
          Array.from(root.querySelectorAll(cssSelector)).forEach((element) =>
            element.removeEventListener(eventName, wrappedHandler, options)
          );
        };
      },

      unsafe: {
        root()     { return pageRecord.rootElement; },
        document() { return document; },
        window()   { return window; }
      },
      log: {
        warn(code, messageText)       { logger.warn(code, messageText); },
        error(code, messageText, err) { logger.error(code, messageText, err); }
      }
    };

 // Expose existing page-local data keys directly on context
    if (pageRecord.pageData) exposeDataKeys(pageRecord.pageData, context, RESERVED_CONTEXT_KEYS);

 // Expose global data keys on context (page data takes priority. Set after)
    exposeDataKeys(engineState.globalData, context, RESERVED_CONTEXT_KEYS);

 // Re-expose page data to ensure page keys override global keys of same name
    if (pageRecord.pageData) exposeDataKeys(pageRecord.pageData, context, RESERVED_CONTEXT_KEYS);

 // Expose named instance scopes. Context.featured, context.sale etc.
 // Each instance scope object is exposed directly so developers can write:
 // context.featured.name = "Notebook Pro"
 // Instance keys override page and global data of the same name.
    if (pageRecord.instances) {
      Object.keys(pageRecord.instances).forEach((instanceName) => {
        if (RESERVED_CONTEXT_KEYS.has(instanceName)) {
          if (engineState.logger) {
            engineState.logger.warn(
              "USE_NAME_RESERVED",
              `Instance name "${instanceName}" is reserved by Clera and cannot be used. Choose a different name.`
            );
          }
          return;
        }
        Object.defineProperty(context, instanceName, {
          get()      { return pageRecord.instances[instanceName]; },
          set(value) { pageRecord.instances[instanceName] = value; },
          configurable: true,
          enumerable:   true
        });
      });
    }

    return context;
  }


  function looksLikeUrl(value) {
    return /[\/:#?]/.test(value) || value.startsWith(".") || value.startsWith("http");
  }

  const INLINE_EVENT_MAP = {
    // Pointer and mouse
    onclick:          "click",
    ondblclick:       "dblclick",
    onauxclick:       "auxclick",
    oncontextmenu:    "contextmenu",
    onmousedown:      "mousedown",
    onmouseup:        "mouseup",
    onmousemove:      "mousemove",
    onmouseover:      "mouseover",
    onmouseout:       "mouseout",
    onmouseenter:     "mouseenter",
    onmouseleave:     "mouseleave",
    // Pointer events (unified touch + mouse + pen)
    onpointerdown:    "pointerdown",
    onpointerup:      "pointerup",
    onpointermove:    "pointermove",
    onpointercancel:  "pointercancel",
    onpointerenter:   "pointerenter",
    onpointerleave:   "pointerleave",
    onpointerover:    "pointerover",
    onpointerout:     "pointerout",
    // Touch
    ontouchstart:     "touchstart",
    ontouchmove:      "touchmove",
    ontouchend:       "touchend",
    ontouchcancel:    "touchcancel",
    // Keyboard
    onkeydown:        "keydown",
    onkeyup:          "keyup",
    onkeypress:       "keypress",
    // Focus
    onfocus:          "focus",
    onblur:           "blur",
    // Input and form (onsubmit excluded: handled by the dedicated submit listener)
    oninput:          "input",
    onchange:         "change",
    onselect:         "select",
    oninvalid:        "invalid",
    // Scroll and wheel
    onscroll:         "scroll",
    onwheel:          "wheel",
    // Drag and drop
    ondragstart:      "dragstart",
    ondrag:           "drag",
    ondragenter:      "dragenter",
    ondragleave:      "dragleave",
    ondragover:       "dragover",
    ondragend:        "dragend",
    ondrop:           "drop",
    // Clipboard
    oncopy:           "copy",
    oncut:            "cut",
    onpaste:          "paste",
    // Animation and transition
    onanimationstart: "animationstart",
    onanimationend:   "animationend",
    onanimationiteration: "animationiteration",
    ontransitionstart: "transitionstart",
    ontransitionend:  "transitionend",
    // Media and resource
    onload:           "load",
    onerror:          "error",
    onabort:          "abort",
  };

  const INLINE_EVENT_ATTRS    = Object.keys(INLINE_EVENT_MAP);
  const INLINE_EVENT_SELECTOR = INLINE_EVENT_ATTRS.map(a => `[${a}]`).join(",");

  function resolveInlineEventAction(targetElement, attrName, pageRecord) {
    // Registry hit: attribute was already neutralized at bind time.
    const registry = domBindingState.inlineEventRegistry.get(targetElement);
    if (registry?.has(attrName)) return registry.get(attrName);

    // Live attribute fallback for elements added after initial bind.
    const raw = targetElement.getAttribute?.(attrName);
    if (!raw || raw.trim() === "") return null;
    const { actionName, parsedArgs } = parseActionAttribute(normalizeToString(raw.trim()));
    if (!actionName || looksLikeUrl(actionName)) return null;
    const handler = resolveAction(actionName, pageRecord);
    if (!handler) return null;
    return { actionName, parsedArgs, handler };
  }

  function neutralizeInlineEvents(pageRoot, pageRecord) {
    const elements = pageRoot.querySelectorAll(INLINE_EVENT_SELECTOR);
    for (const element of elements) {
      for (const attrName of INLINE_EVENT_ATTRS) {
        const raw = element.getAttribute(attrName);
        if (!raw || raw.trim() === "") continue;
        const { actionName, parsedArgs } = parseActionAttribute(normalizeToString(raw.trim()));
        if (!actionName || looksLikeUrl(actionName)) continue;
        const handler = resolveAction(actionName, pageRecord);
        if (!handler) continue;
        if (!domBindingState.inlineEventRegistry.has(element)) domBindingState.inlineEventRegistry.set(element, new Map());
        domBindingState.inlineEventRegistry.get(element).set(attrName, { actionName, parsedArgs, handler });
        element.setAttribute(attrName, "");
        element[attrName] = null;
      }
    }
  }

  function collectFormValues(formElement) {
    const formDataObject = new FormData(formElement);
    const fieldValueMap  = Object.create(null);
    for (const [fieldName, fieldValue] of formDataObject.entries()) {
      if (fieldValueMap[fieldName] !== undefined) {
        if (!Array.isArray(fieldValueMap[fieldName])) fieldValueMap[fieldName] = [fieldValueMap[fieldName]];
        fieldValueMap[fieldName].push(fieldValue);
      } else {
        fieldValueMap[fieldName] = fieldValue;
      }
    }
    return { formData: formDataObject, values: fieldValueMap };
  }

  /**
   * Parse an action attribute value into { actionName, parsedArgs }.
   * Accepts paren syntax only: fnName(arg1,{path}) or fnName().
   * fnName with no parens is treated as a zero-arg call.
   *
   * @param {string} raw  Raw action attribute value (already trimmed)
   * @returns {{ actionName: string, parsedArgs: Array }}
   */
  function parseActionAttribute(raw) {
    const BINDING_RE = /^\{([a-zA-Z_][a-zA-Z0-9_.]*)\}$/;
    const parenOpen = raw.indexOf("(");
    if (parenOpen === -1 || raw[raw.length - 1] !== ")") {
      return { actionName: raw, parsedArgs: [] };
    }
    const actionName   = raw.slice(0, parenOpen).trim();
    const rawArgString = raw.slice(parenOpen + 1, raw.length - 1).trim();
    if (!rawArgString) return { actionName, parsedArgs: [] };
    const parsedArgs = rawArgString
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => {
        const bindingMatch = BINDING_RE.exec(s);
        if (bindingMatch) return { type: "binding", value: bindingMatch[1] };
        if (s === "true")  return { type: "literal", value: true };
        if (s === "false") return { type: "literal", value: false };
        if (s === "null")  return { type: "literal", value: null };
        const asNumber = Number(s);
        if (s !== "" && !Number.isNaN(asNumber)) return { type: "literal", value: asNumber };
        if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) {
          return { type: "literal", value: s.slice(1, -1) };
        }
        return { type: "literal", value: s };
      });
    return { actionName, parsedArgs };
  }

  function _isUnsafeUrlValue(attrName, value) {
    if (!URL_ATTRS.has(attrName.toLowerCase())) return false;
    return BLOCKED_VALUE_PATTERNS.some(p => p.test(normalizeURL(value)));
  }

  function _writeBinding(record, resolved) {
    if (record.attr === null) {
      if (record.node.nodeValue !== resolved) {
        record.node.nodeValue = resolved;
      }
      return;
    }
    if (record.node.getAttribute(record.attr) === resolved) return;
    if (_isUnsafeUrlValue(record.attr, resolved)) {
      engineState.logger.error(
        "XSS_ATTR_BLOCKED",
        `Binding blocked unsafe value on attribute "${record.attr}": "${resolved.trim().slice(0, 40)}"`
      );
      return;
    }
    record.node.setAttribute(record.attr, resolved);
  }

  function _extractBindingPaths(template) {
    const paths = [];
    let match;
    BINDING_PATTERN.lastIndex = 0;
    while ((match = BINDING_PATTERN.exec(template)) !== null) {
      paths.push(match[1]);
    }
    BINDING_PATTERN.lastIndex = 0;
    return paths;
  }

  function _scanTextNode(node, pageRecord, instanceName) {
    const template = node.nodeValue || "";
    BINDING_PATTERN.lastIndex = 0;
    if (!BINDING_PATTERN.test(template)) return;
    pageRecord.bindingNodes.push({
      node, attr: null, template,
      paths: _extractBindingPaths(template),
      instanceName,
    });
  }

  function _scanElementAttrs(node, pageRecord, instanceName) {
    Array.from(node.attributes || []).forEach((attrNode) => {
      if (attrNode.name.startsWith("on")) return;
      if (attrNode.name === "action") return;
      const template = attrNode.value || "";
      BINDING_PATTERN.lastIndex = 0;
      if (!BINDING_PATTERN.test(template)) return;
      pageRecord.bindingNodes.push({
        node, attr: attrNode.name, template,
        paths: _extractBindingPaths(template),
        instanceName,
      });
    });
  }

  function bindActionsWithin(pageRecord) {
    const logger   = engineState.logger;
    const pageRoot = pageRecord.rootElement;
    if (!pageRoot) return;

    // One delegated click listener and one delegated submit listener per page root.
    // Replaces three querySelectorAll scans and one listener per matching element.
    // WeakSet guard prevents duplicate listeners on re-mount, hot-reload, and LRU
    // eviction + remount.
    if (domBindingState.boundContainers.has(pageRoot)) return;
    domBindingState.boundContainers.add(pageRoot);

    neutralizeInlineEvents(pageRoot, pageRecord);

    pageRoot.addEventListener("click", (clickEvent) => {
      let targetNode = clickEvent.target;
      while (targetNode && targetNode !== pageRoot) {
        const tagName = targetNode.tagName?.toLowerCase();

        // button[type=submit] inside a form defers to the submit handler.
        if (
          tagName === "button" &&
          (normalizeToString(targetNode.getAttribute("type")) || "submit").toLowerCase() === "submit" &&
          targetNode.closest("form")
        ) {
          targetNode = targetNode.parentElement;
          continue;
        }

        // action= on non-form elements
        if (tagName !== "form" && targetNode.hasAttribute?.("action")) {
          const rawAction = normalizeToString(targetNode.getAttribute("action"));
          if (rawAction) {
            const { actionName, parsedArgs } = parseActionAttribute(rawAction);
            if (actionName) {
              const resolvedHandler = resolveAction(actionName, pageRecord);
              if (!resolvedHandler) {
                logger.warn("ACTION_NOT_FOUND", `Action "${actionName}" not found (page "${pageRecord.name}"). Expected a global function named ${actionName}(), a registered action via CLERA.actions, or a page-local action via CLERA.page().`);
              } else {
                const pageContext = createPageContext(pageRecord, clickEvent, parsedArgs, targetNode);
                runActionNonBlocking({ handler: resolvedHandler, pageContext, resolvedArgs: pageContext.args, actionName, pageName: pageRecord.name });
              }
            }
          }
          return;
        }

        // Intercept onclick= so developers writing vanilla HTML get full Clera context.
        const inlineClick = resolveInlineEventAction(targetNode, "onclick", pageRecord);
        if (inlineClick) {
          clickEvent.preventDefault();
          const pageContext = createPageContext(pageRecord, clickEvent, inlineClick.parsedArgs, targetNode);
          runActionNonBlocking({ handler: inlineClick.handler, pageContext, resolvedArgs: pageContext.args, actionName: inlineClick.actionName, pageName: pageRecord.name });
          return;
        }

        // page= navigation
        if (targetNode.hasAttribute?.("page")) {
          const targetPageName = normalizeToString(
            targetNode.getAttribute("page")
          );
          if (!targetPageName) { targetNode = targetNode.parentElement; continue; }
          if (!engineState.pageRegistry.has(targetPageName)) {
            const navLogger = engineState.logger || createLogger(false);
            navLogger.warn(
              "PAGE_NOT_FOUND",
              `Navigation target "${targetPageName}" is not registered. ` +
              `Check the page attribute value and ensure <page name="${targetPageName}"> ` +
              `exists inside <app>.`
            );
            return;
          }
          clickEvent.preventDefault();
          engineState.publicApi.navigate(targetPageName);
          return;
        }

        targetNode = targetNode.parentElement;
      }
    });

    pageRoot.addEventListener("submit", async (submitEvent) => {
      let form = submitEvent.target;
      while (form && form !== pageRoot) {
        if (form.tagName?.toLowerCase() === "form" && form.hasAttribute("action")) break;
        form = form.parentElement;
      }
      if (!form || form === pageRoot) return;

      const submitterElement    = submitEvent.submitter || null;
      const resolvedActionValue =
        (submitterElement && normalizeToString(submitterElement.getAttribute("formaction"))) ||
        (submitterElement && normalizeToString(submitterElement.getAttribute("action")))     ||
        normalizeToString(form.getAttribute("action"));

      if (!resolvedActionValue || looksLikeUrl(resolvedActionValue)) return;

      const resolvedFormHandler = resolveAction(resolvedActionValue, pageRecord);
      if (!resolvedFormHandler) {
        submitEvent.preventDefault();
        logger.warn("ACTION_NOT_FOUND", `Action "${resolvedActionValue}" not found (page "${pageRecord.name}"). Expected a global function named ${resolvedActionValue}(), a registered action via CLERA.actions, or a page-local action via CLERA.page().`);
        return;
      }

      submitEvent.preventDefault();

      if (form.getAttribute("data-submitting") === "1") {
        logger.warn("FORM_DOUBLE_SUBMIT", `Blocked duplicate submit (page "${pageRecord.name}").`);
        return;
      }

      form.setAttribute("data-submitting", "1");
      const { formData: collectedFormData, values: collectedFieldValues } = collectFormValues(form);
      const formEnhancedContext = {
        ...createPageContext(pageRecord, submitEvent),
        form, submitter: submitterElement, formData: collectedFormData, values: collectedFieldValues,
        element: submitterElement || null,
        resetForm()               { form.reset(); },
        setSubmitting(isSubmitting) {
          if (isSubmitting) form.setAttribute("data-submitting", "1");
          else form.removeAttribute("data-submitting");
        }
      };

      try {
        _pushContext(formEnhancedContext);
        const returnValue = resolvedFormHandler(formEnhancedContext);
        if (returnValue && typeof returnValue.then === "function") await returnValue;
        _popContext();
      } catch (err) {
        _popContext();
        logger.error("FORM_ACTION_THROW", `Form action "${resolvedActionValue}" threw (page "${pageRecord.name}").`, err);
      } finally {
        form.removeAttribute("data-submitting");
        patchBindings(pageRecord);
      }
    });

    // Delegated listeners for every non-click inline event in INLINE_EVENT_MAP.
    for (const [attrName, eventName] of Object.entries(INLINE_EVENT_MAP)) {
      if (eventName === "click") continue;
      pageRoot.addEventListener(eventName, (e) => {
        let targetElement = e.target;
        while (targetElement && targetElement !== pageRoot) {
          const resolved = resolveInlineEventAction(targetElement, attrName, pageRecord);
          if (resolved) {
            e.preventDefault();
            const pageContext = createPageContext(pageRecord, e, resolved.parsedArgs, targetElement);
            runActionNonBlocking({ handler: resolved.handler, pageContext, resolvedArgs: pageContext.args, actionName: resolved.actionName, pageName: pageRecord.name });
            return;
          }
          targetElement = targetElement.parentElement;
        }
      });
    }
  }


  function runLifecycleHook(pageRecord, hookName, triggeringEvent) {
    const logger  = engineState.logger;
    const lifecycleContext = createPageContext(pageRecord, triggeringEvent);
    const jsHook  = pageRecord.lifecycle && pageRecord.lifecycle[hookName];
    if (typeof jsHook === "function") {
      try {
        _pushContext(lifecycleContext);
        jsHook(lifecycleContext);
        _popContext();
      } catch (err) {
        _popContext();
        logger.error("LIFECYCLE_THROW", `${hookName} threw (page "${pageRecord.name}").`, err);
      }
    }
    const rawAttrAction = pageRecord.lifecycleActions && pageRecord.lifecycleActions[hookName];
    if (rawAttrAction) {
      const { actionName: attrActionName, parsedArgs } = parseActionAttribute(rawAttrAction);
      const handler = resolveAction(attrActionName, pageRecord);
      if (!handler) { logger.warn("ACTION_NOT_FOUND", `Action "${attrActionName}" not found (page "${pageRecord.name}", lifecycle "${hookName}"). Expected a global function named ${attrActionName}(), a registered action via CLERA.actions, or a page-local action via CLERA.page().`); return; }
      const lifecycleContextWithArgs = createPageContext(pageRecord, triggeringEvent, parsedArgs);
      try {
        _pushContext(lifecycleContextWithArgs);
        handler(lifecycleContextWithArgs);
        _popContext();
      } catch (err) {
        _popContext();
        logger.error("LIFECYCLE_ACTION_THROW", `Lifecycle action "${attrActionName}" threw (page "${pageRecord.name}").`, err);
      }
    }
 // Patch bindings after every lifecycle hook. Covers onCreate, onShow, onHide, onDestroy
    patchBindings(pageRecord);
  }


  function touchLruPosition(pageName) {
    const lruIndex = engineState.lruOrder.indexOf(pageName);
    if (lruIndex >= 0) engineState.lruOrder.splice(lruIndex, 1);
    engineState.lruOrder.push(pageName);
  }

 /* ============================================================================
 Plugin system page lifecycle hooks + render hook + component destroy
 ----------------------------------------------------------------------------
 WHAT: Three internal runner functions that fire plugin hooks at the correct
 points in the page and render lifecycle. Each runner iterates
 engineState.installedPlugins and calls the named hook if present,
 swallowing errors per-plugin so one bad plugin never breaks others.

 Plugin contract:

 const MyPlugin = {
 id: "my-plugin",

 install(CLERA) {}, // boot-time setup, API extension
 onReady(CLERA) {}, // after first page is live

 //   Page lifecycle
 onPageMount(pageName, pageRootElement, CLERA) {}, // DOM built, bindings scanned, onCreate fired
 onPageShow(pageName, pageRootElement, CLERA) {}, // page visible, onShow fired
 onPageHide(pageName, pageRootElement, CLERA) {}, // before page hidden, before onHide
 onPageDestroy(pageName, pageRootElement, CLERA) {}, // before DOM removal, before onDestroy

 //   Render hook
 onRender(containerElement, pageName, CLERA) {}, // after context.render() / context.append()
 };

 Component destroy:

 CLERA.registerComponent("modal", {
 selfClosing: false,
 parser(element, CLERA, { selfClosing }) {}, // mount
 destroy(element, CLERA) {}, // cleanup on page eviction
 });

 Hooks fired from:
 onPageMount end of mountPageIfNeeded(), after DOM built + bindings + onCreate
 onPageShow end of showPage(), after page visible + onShow
 onPageHide start of hideCurrentPageIfAny(), before onHide + hide
 onPageDestroy start of destroyPage(), before component destroy + onDestroy + DOM removal
 onRender end of context.render() and context.append()

 Argument order for page hooks: (pageName, pageRootElement, CLERA)
 pageRootElement live <page> DOM element (always live at the point each hook fires)
 CLERA full public API so plugins can call navigate, data, etc.

 Argument order for onRender: (containerElement, pageName, CLERA)
 containerElement the element whose innerHTML was just updated

 Error isolation: each plugin is wrapped in its own try/catch. One bad plugin
 never breaks the hook chain for other plugins or the runtime itself.
 ============================================================================ */

 /**
 * Fire a named page lifecycle hook on all installed plugins.
 * @param {string} hookName "onPageMount"|"onPageShow"|"onPageHide"|"onPageDestroy"
 * @param {string} pageName
 * @param {Element|null} pageRootElement Live <page> element
 */
  function runPluginPageHook(hookName, pageName, pageRootElement) {
    const logger = engineState.logger;
    engineState.installedPlugins.forEach(({ id: pluginIdentifier, plugin: pluginObject }) => {
      if (typeof pluginObject[hookName] !== "function") return;
      try {
        pluginObject[hookName](pageName, pageRootElement);
      } catch (err) {
        if (logger) logger.error(
          "PLUGIN_HOOK_THROW",
          `Plugin "${pluginIdentifier}" threw in ${hookName}() for page "${pageName}".`,
          err
        );
      }
    });
  }

 /**
 * Fire the onRender hook on all installed plugins after a DOM update.
 * @param {Element} containerElement The element just updated (render/append target)
 * @param {string} pageName
 */
  function runPluginRenderHook(containerElement, pageName) {
    const logger = engineState.logger;
    engineState.installedPlugins.forEach(({ id: pluginIdentifier, plugin: pluginObject }) => {
      if (typeof pluginObject.onRender !== "function") return;
      try {
        pluginObject.onRender(containerElement, pageName);
      } catch (err) {
        if (logger) logger.error(
          "PLUGIN_RENDER_THROW",
          `Plugin "${pluginIdentifier}" threw in onRender() for page "${pageName}".`,
          err
        );
      }
    });
  }

 /**
 * Call destroy() on all registered components found inside a page root.
 * Called in destroyPage() before the DOM element is removed.
 * Only fires for components that declare a destroy function
 * v1 components (parser-only) are completely unaffected.
 * @param {Element} pageRootElement The live <page> element being destroyed
 */
  function runComponentDestroyHooks(pageRootElement) {
    const logger = engineState.logger;
    Object.keys(engineState.components).forEach((tagName) => {
      const componentConfig = engineState.components[tagName];
      if (typeof componentConfig.destroy !== "function") return;
      pageRootElement.querySelectorAll(tagName).forEach((componentElement) => {
        try {
          componentConfig.destroy(componentElement, engineState.publicApi);
        } catch (err) {
          if (logger) logger.error(
            "COMP_DESTROY_THROW",
            `Component <${tagName}> destroy() threw during page teardown.`,
            err
          );
        }
      });
    });
  }

  function destroyPage(pageRecord) {
    runPluginPageHook("onPageDestroy", pageRecord.name, pageRecord.rootElement);
    if (pageRecord.rootElement) {
      runComponentDestroyHooks(pageRecord.rootElement);
    }

    runLifecycleHook(pageRecord, "onDestroy");
 // removeEventListener on detached nodes is safe. Browser guarantees no throw.
    if (pageRecord.listeners && pageRecord.listeners.length) {
      pageRecord.listeners.forEach((rule) => {
        if (!rule.active) return;
        if (pageRecord.rootElement) {
          Array.from(pageRecord.rootElement.querySelectorAll(rule.selector)).forEach((element) =>
            element.removeEventListener(rule.eventName, rule.wrappedHandler, rule.options)
          );
        }
        rule.active = false;
      });
      pageRecord.listeners = [];
    }
    if (pageRecord.rootElement && pageRecord.rootElement.parentNode) {
      pageRecord.rootElement.parentNode.removeChild(pageRecord.rootElement);
    }
    pageRecord.rootElement  = null;
    pageRecord.mounted      = false;
    pageRecord.bindingNodes = [];
    engineState.logger.info("PAGE_EVICT", `Evicted page "${pageRecord.name}" from cache.`);
  }

  function evictPagesIfNeeded() {
    const limit = engineState.maxCachedPages;
    if (!limit || limit <= 0) return;
    const logger  = engineState.logger;
    const mountedPageNames = Array.from(engineState.pageRegistry.keys()).filter((candidatePageName) => {
      const candidatePageRecord = engineState.pageRegistry.get(candidatePageName);
      return candidatePageRecord && candidatePageRecord.mounted;
    });
    if (mountedPageNames.length <= limit) return;
    while (mountedPageNames.length > limit) {
      const oldestPageName = engineState.lruOrder[0];
      if (!oldestPageName) break;
      const oldestPageRecord = engineState.pageRegistry.get(oldestPageName);
      const isCurrentlyVisible = oldestPageName === engineState.currentPageName;
      const isMarkedKeepAlive  = oldestPageRecord && oldestPageRecord.keepAlive;
      if (isCurrentlyVisible || isMarkedKeepAlive) {
        engineState.lruOrder.shift();
        engineState.lruOrder.push(oldestPageName);
        const allMountedPagesAreProtected = mountedPageNames.every((mountedPageName) => {
          const mountedRecord = engineState.pageRegistry.get(mountedPageName);
          return mountedPageName === engineState.currentPageName || (mountedRecord && mountedRecord.keepAlive);
        });
        if (allMountedPagesAreProtected) { logger.warn("CACHE_EVICT_BLOCKED", "All mounted pages are keepAlive or current; cannot evict."); break; }
        continue;
      }
      engineState.lruOrder.shift();
      destroyPage(oldestPageRecord);
      const evictedIndex = mountedPageNames.indexOf(oldestPageName);
      if (evictedIndex >= 0) mountedPageNames.splice(evictedIndex, 1);
    }
  }

  function parseComponentsWithin(containerElement) {
    const logger = engineState.logger;
    Object.keys(engineState.components).forEach((tagName) => {
      const config = engineState.components[tagName];
      containerElement.querySelectorAll(tagName).forEach((componentElement) => {
        if (domBindingState.parsedComponentElements.has(componentElement)) return;
        domBindingState.parsedComponentElements.add(componentElement);

 // Enforce shape rules in dev mode.
 // Note: browsers normalise <tag /> and <tag></tag> into identical DOM nodes
 // for custom elements. The runtime cannot distinguish the two forms from source.
 // What it CAN enforce: a selfClosing component must have no child nodes.
        if (engineState.config && engineState.config.dev) {
          const hasChildren = componentElement.childNodes.length > 0;
          if (config.selfClosing && hasChildren) {
            logger.warn(
              "COMP_INVALID_SYNTAX",
              `<${tagName}> is a self-closing component and must not contain children. ` +
              `Use <${tagName} /> or <${tagName}></${tagName}> with no inner content.`
            );
          }
        }

        if (config && config.style && isPlainObject(config.style)) Object.assign(componentElement.style, config.style);

 // Pass selfClosing flag to parser so plugin authors can act on component shape
        if (config && typeof config.parser === "function") {
          config.parser(componentElement, engineState.publicApi, { selfClosing: !!config.selfClosing });
        }
      });
    });
  }

 /**
 * Refresh all active listener rules for a page after a Clera-owned DOM update.
 * Walks active rules and attaches wrappedHandler to any newly found elements
 * that are not already bound. Does not create duplicate attachments.
 *
 * Called after context.render(), context.append(), and at page mount.
 *
 * @param {object} pageRecord
 * @param {Element} [scopeRoot] If provided, only scans within this sub-tree.
 * If omitted, scans the full page root.
 */
  function refreshPageListeners(pageRecord, scopeRoot) {
    if (!pageRecord || !pageRecord.listeners || !pageRecord.listeners.length) return;
    const root = pageRecord.rootElement;
    if (!root) return;

    const scanRoot = scopeRoot || root;

    pageRecord.listeners.forEach((rule) => {
      if (!rule.active) return;

 // querySelectorAll does not include the root element itself if it matches.
 // element itself are not silently skipped.
      const matched = Array.from(scanRoot.querySelectorAll(rule.selector));
      if (typeof scanRoot.matches === "function" && scanRoot.matches(rule.selector)) {
        matched.unshift(scanRoot);
      }

      matched.forEach((element) => {
 // remove-then-add guarantees no duplicates without per-element tracking.
 // removeEventListener with an unregistered handler is a safe browser no-op.
        element.removeEventListener(rule.eventName, rule.wrappedHandler, rule.options);
        element.addEventListener(rule.eventName, rule.wrappedHandler, rule.options);
      });
    });
  }

  function mountPageIfNeeded(pageRecord) {
    if (pageRecord.mounted && pageRecord.rootElement) { touchLruPosition(pageRecord.name); return; }
    const container = document.createElement("page");
    container.setAttribute("data-app-page", pageRecord.name);
    container.id        = pageRecord.pageId || pageRecord.name;
    if (pageRecord.pageClass) container.className = pageRecord.pageClass;
    container.setAttribute("data-clera-hidden", "");
    container.innerHTML     = normalizeUseElements(pageRecord.templateHtml);
    engineState.mountZoneElement.appendChild(container);
    pageRecord.rootElement = container;
    pageRecord.mounted     = true;
    parseComponentsWithin(container);
    bindActionsWithin(pageRecord);
    scanTemplatesWithin(container);
 // Replace use[template] elements with cloned content. Shared mode only
    processUseElementsWithin(container, pageRecord);
 // [template] source elements are marked data-clera-template-source and skipped.
    scanBindings(container, pageRecord, true);
    patchBindings(pageRecord);
 // Rebind any listener rules already registered for this page record at show-time or remount.
 // onCreate has not yet fired at this point. Rules here come from a previous show cycle
 // or from rules registered on the page record before the first mount completes.
    refreshPageListeners(pageRecord);
    // Set current page before onCreate so CLERA.currentPage() is never null
    // while a page is actively mounting. The show path sets it again but the value is the same.
    if (!engineState.currentPageName) engineState.currentPageName = pageRecord.name;
    if (!pageRecord.createdOnce) { pageRecord.createdOnce = true; runLifecycleHook(pageRecord, "onCreate"); }
    touchLruPosition(pageRecord.name);
    evictPagesIfNeeded();
    runPluginPageHook("onPageMount", pageRecord.name, pageRecord.rootElement);
  }

  function updateNavActiveState(activePageName) {
    if (!engineState.appRootElement) return;
    const selector = "nav[position] tab[page], tabbar tab[page], sidebar tab[page]";
    engineState.appRootElement.querySelectorAll(selector).forEach((navItem) => {
      if (normalizeToString(navItem.getAttribute("page")) === activePageName) {
        navItem.setAttribute("active", "");
      } else {
        navItem.removeAttribute("active");
      }
    });
  }

  function showPage(pageRecord) {
 // Fix #15 - keepAlive pages are hidden with visibility:hidden + pointer-events:none
 // so their scroll position is preserved across navigations. Non-keepAlive pages
 // continue to use display:none (they are destroyed/remounted, so scroll is moot).
    engineState.pageRegistry.forEach((rec) => {
      if (!rec || !rec.rootElement) return;
      if (rec.keepAlive) {
        rec.rootElement.style.visibility    = "hidden";
        rec.rootElement.style.pointerEvents = "none";
        rec.rootElement.style.display       = "block"; // keep in flow so scroll survives
        rec.rootElement.removeAttribute("data-clera-hidden");
      } else {
        rec.rootElement.setAttribute("data-clera-hidden", "");
        rec.rootElement.style.visibility    = "";
        rec.rootElement.style.pointerEvents = "";
      }
    });

 // @@SIMULATOR_ONLY_START@@
 // Sample the incoming page's background color BEFORE display:block.
 // getComputedStyle works on hidden elements. Background-color is live
 // regardless of display state. The direct parent call is synchronous so
 // the shell status bar and page content flip in the same JS task with
 // zero frame boundary between them. Stripped for production builds.
    if (typeof window.__CLERA_SIM_PAGE_COLOR__ === "function") {
      window.__CLERA_SIM_PAGE_COLOR__(pageRecord.rootElement);
    }
 // @@SIMULATOR_ONLY_END@@

    if (pageRecord.rootElement) {
      pageRecord.rootElement.removeAttribute("data-clera-hidden");
      pageRecord.rootElement.style.visibility    = "";
      pageRecord.rootElement.style.pointerEvents = "";
    }
    engineState.currentPageName = pageRecord.name;
    updateNavActiveState(pageRecord.name);
    hideSplashIfAny();
    runLifecycleHook(pageRecord, "onShow");
    runPluginPageHook("onPageShow", pageRecord.name, pageRecord.rootElement);
  }

  function hideCurrentPageIfAny() {
    const name = engineState.currentPageName;
    if (!name) return;
    const record = engineState.pageRegistry.get(name);
    if (!record || !record.rootElement) return;
    runPluginPageHook("onPageHide", name, record.rootElement);
    runLifecycleHook(record, "onHide");
    record.rootElement.setAttribute("data-clera-hidden", "");
  }

  function resolveNavPosition(navEl, currentLayout) {
    const resolved = navEl.getAttribute(currentLayout) ?? navEl.getAttribute("default") ?? null;
    return resolved ? resolved.toLowerCase() : null;
  }

  function applyNavPositions(appRootElement, currentLayout) {
    const navEls = Array.from(appRootElement.querySelectorAll(":scope > nav"));
    const positionClaims = new Map();

    navEls.forEach((navEl) => {
      const position = resolveNavPosition(navEl, currentLayout);
 // Vanilla nav (no breakpoint attrs and no default) - runtime leaves it entirely alone.
      if (position === null) return;

      if (position === "none") {
        navEl.style.display = "none";
        navEl.removeAttribute("position");
        return;
      }

      if (positionClaims.has(position)) {
        engineState.logger.warn("NAV_POSITION_CONFLICT", `Two <nav> elements resolve to position "${position}" at layout "${currentLayout}". The conflicting nav will not be repositioned.`);
        return;
      }
      positionClaims.set(position, navEl);

      navEl.style.display = "";
      navEl.setAttribute("position", position);

 // Left/right navs sit beside the page area in a row. Top/bottom navs stack above
 // or below in a column. order places them correctly regardless of DOM order.
      if (position === "top" || position === "left") { navEl.style.order = "-1"; }
      else                                           { navEl.style.order = "1"; }
    });
  }

  function bindNavLikeElement(containerEl, childSelector) {
    containerEl.addEventListener("click", (clickEvent) => {
      let targetNode = clickEvent.target;
      while (targetNode && targetNode !== containerEl) {
        const tag = targetNode.tagName?.toLowerCase();
        if (tag === "tab" && targetNode.hasAttribute("page")) {
          const pageName = normalizeToString(targetNode.getAttribute("page"));
          if (pageName) engineState.publicApi.navigate(pageName, Object.create(null));
          return;
        }
        if (targetNode.hasAttribute?.("action")) {
          const rawAction = normalizeToString(targetNode.getAttribute("action"));
          if (rawAction) {
            const { actionName, parsedArgs } = parseActionAttribute(rawAction);
            if (actionName) {
              const activePageRecord = engineState.currentPageName
                ? engineState.pageRegistry.get(engineState.currentPageName) ?? null
                : null;
              const resolvedHandler = resolveAction(actionName, activePageRecord);
              if (!resolvedHandler) {
                engineState.logger.warn("ACTION_NOT_FOUND", `Action "${actionName}" not found. Expected a global function named ${actionName}(), or a registered action via CLERA.actions.`);
              } else {
                const pageContext = createPageContext(activePageRecord, clickEvent, parsedArgs, targetNode);
                runActionNonBlocking({ handler: resolvedHandler, pageContext, resolvedArgs: pageContext.args, actionName, pageName: activePageRecord?.name ?? null });
              }
            }
          }
          return;
        }
        targetNode = targetNode.parentElement;
      }
    });
  }

  function initTabBarsIfPresent(appRootElement) {
    Array.from(appRootElement.querySelectorAll(":scope > tabbar")).forEach((tabbarEl) => {
      if (domBindingState.boundNavElements.has(tabbarEl)) return;
      domBindingState.boundNavElements.add(tabbarEl);
      const position = normalizeToString(tabbarEl.getAttribute("position")).toLowerCase();
      if (position === "top") {
        tabbarEl.style.order = "-1";
        tabbarEl.style.paddingBottom = "0";
      } else {
        tabbarEl.style.order = "1";
      }
      bindNavLikeElement(tabbarEl);
    });
  }

  function initSidebarsIfPresent(appRootElement) {
    Array.from(appRootElement.querySelectorAll(":scope > sidebar")).forEach((sidebarEl) => {
      if (domBindingState.boundNavElements.has(sidebarEl)) return;
      domBindingState.boundNavElements.add(sidebarEl);
      const position = normalizeToString(sidebarEl.getAttribute("position")).toLowerCase();
      if (position === "right") {
        sidebarEl.style.right = "0";
        sidebarEl.style.left  = "";
      } else {
        sidebarEl.style.left  = "0";
        sidebarEl.style.right = "";
      }
      bindNavLikeElement(sidebarEl);
    });
  }

  function bindNavsIfPresent(appRootElement) {
    const currentLayout = appRootElement.getAttribute("layout") || "mobile";
    applyNavPositions(appRootElement, currentLayout);

    Array.from(appRootElement.querySelectorAll(":scope > nav")).forEach((navEl) => {
      if (domBindingState.boundNavElements.has(navEl)) return;
 // Vanilla nav gets no Clera click binding.
      const position = resolveNavPosition(navEl, currentLayout);
      if (position === null) return;

      domBindingState.boundNavElements.add(navEl);

      navEl.addEventListener("click", (clickEvent) => {
        let targetNode = clickEvent.target;
        while (targetNode && targetNode !== navEl) {
 // <tab page="..."> navigates to the named page.
          if (targetNode.tagName?.toLowerCase() === "tab" && targetNode.hasAttribute("page")) {
            const pageName = normalizeToString(targetNode.getAttribute("page"));
            if (!pageName) return;
            engineState.publicApi.navigate(pageName, Object.create(null));
            return;
          }

 // action= values resolve against the active page.
          if (targetNode.hasAttribute?.("action")) {
            const rawAction = normalizeToString(targetNode.getAttribute("action"));
            if (rawAction) {
              const { actionName, parsedArgs } = parseActionAttribute(rawAction);
              if (actionName) {
                const activePageRecord = engineState.currentPageName
                  ? engineState.pageRegistry.get(engineState.currentPageName) ?? null
                  : null;
                const resolvedHandler = resolveAction(actionName, activePageRecord);
                if (!resolvedHandler) {
                  engineState.logger.warn("ACTION_NOT_FOUND", `Action "${actionName}" not found (nav). Expected a global function named ${actionName}(), or a registered action via CLERA.actions.`);
                } else {
                  const pageContext = createPageContext(activePageRecord, clickEvent, parsedArgs, targetNode);
                  runActionNonBlocking({ handler: resolvedHandler, pageContext, resolvedArgs: pageContext.args, actionName, pageName: activePageRecord?.name ?? null });
                }
              }
            }
            return;
          }

          targetNode = targetNode.parentElement;
        }
      });
    });

 // App-level delegated listener for action= on elements inside <app> but outside
 // any <page> or runtime-owned <nav>. These elements are never in scope for
 // bindActionsWithin because that function binds only to page root containers.
 // Vanilla <nav> elements (no position) are included here since the runtime
 // does not own them.
    if (domBindingState.boundContainers.has(appRootElement)) return;
    domBindingState.boundContainers.add(appRootElement);

    appRootElement.addEventListener("click", (clickEvent) => {
 // Only handle elements that are not inside any <page> or runtime-owned <nav>.
 // Runtime-owned navs are identified by position. Vanilla navs have no
 // position and their clicks fall through to this handler normally.
      if (clickEvent.target.closest?.("page")) return;
      if (clickEvent.target.closest?.("nav[position]")) return;
      if (clickEvent.target.closest?.("tabbar")) return;
      if (clickEvent.target.closest?.("sidebar")) return;

      let targetNode = clickEvent.target;
      while (targetNode && targetNode !== appRootElement) {
        if (targetNode.hasAttribute?.("action")) {
          const rawAction = normalizeToString(targetNode.getAttribute("action"));
          if (rawAction) {
            const { actionName, parsedArgs } = parseActionAttribute(rawAction);
            if (actionName) {
              const activePageRecord = engineState.currentPageName
                ? engineState.pageRegistry.get(engineState.currentPageName) ?? null
                : null;
              const resolvedHandler = resolveAction(actionName, activePageRecord);
              if (!resolvedHandler) {
                engineState.logger.warn("ACTION_NOT_FOUND", `Action "${actionName}" not found (app-level). Expected a global function named ${actionName}(), or a registered action via CLERA.actions.`);
              } else {
                const pageContext = createPageContext(activePageRecord, clickEvent, parsedArgs, targetNode);
                runActionNonBlocking({ handler: resolvedHandler, pageContext, resolvedArgs: pageContext.args, actionName, pageName: activePageRecord?.name ?? null });
              }
            }
          }
          return;
        }
        targetNode = targetNode.parentElement;
      }
    });
  }

 /* ============================================================================
 Reusable block system
 ----------------------------------------------------------------------------
 Four pieces:

 scanTemplatesWithin(root) discovers <template id> and [template][id]
 elements, registers them, enforces rules
 processUseElementsWithin(root) replaces use[template] elements with
 cloned content; handles both shared mode
 and named instance scope
 CLERA.map(data, string) pure string helper: maps one object into
 one <use> string via {key} interpolation

 Shared mode (<use template="id" /> with no name):
 Bindings resolve against page and global data.

 Named instance scope (<use template="id" name="x" />):
 Each named instance gets its own scope in pageRecord.instances[name],
 exposed directly on context as context.x. Binding records are tagged
 with instanceName so patchBindings resolves from the correct scope.

 DOM safety rules enforced here:
 - <template id> inner ids warn TEMPLATE_INNER_ID_DUPLICATE (dev mode)
 - [template][id] clones strip both [template] and [id] attributes
 - use[template] selector avoids SVG <use href="..."> collision
 - [template] sources are excluded from the page binding scan
 ============================================================================ */

 /**
 * Scan a container element for reusable block sources.
 * Registers both <template id="..."> and [template][id] elements.
 *
 * <template id="card"> -> stored as DocumentFragment (not rendered)
 * <div template id="card"> -> stored as Element reference (still visible in DOM)
 *
 * [template] elements are NOT removed from the DOM here - they remain visible
 * but are excluded from the binding scan (they are sources, not targets).
 *
 * @param {Element} containerElement
 */
  const VOID_ELEMENT_TAGS = new Set([
    "img", "input", "hr", "br", "meta", "link",
  ]);

 /**
  * Assign sequential data-id values depth-first to every descendant
  * element of a Container template root. Simultaneously builds the
  * engineState.templateNodeMap entry for this template.
  * Called once at scan time. Per-instance tree walks do not occur.
  *
  * @param {string}                   templateId
  * @param {Element|DocumentFragment} templateRoot
  */
  function stampTemplateNodeIds(templateId, templateRoot) {
    const nodeMap = Object.create(null);
    let counter = 0;

    function descend(parentEl) {
      for (const childEl of Array.from(parentEl.children)) {
        const nid = String(counter++);
        childEl.setAttribute("data-id", nid);
        nodeMap[nid] = { tagName: childEl.tagName.toLowerCase(), childIds: [] };
        descend(childEl);
        nodeMap[nid].childIds = Array.from(childEl.children)
          .map((c) => c.getAttribute("data-id"))
          .filter(Boolean);
      }
    }

    descend(templateRoot);
    engineState.templateNodeMap[templateId] = nodeMap;

    const slotMap = Object.create(null);
    for (const nid of Object.keys(nodeMap)) {
      const slotName = templateRoot.querySelector
        ? templateRoot.querySelector(`[data-id="${nid}"]`)?.getAttribute("slot") ?? null
        : null;
      if (slotName) slotMap[slotName] = nid;
    }
    engineState.templateSlotMap[templateId] = slotMap;
  }

 /**
  * Evict a node and all its stamped descendants from an instance cache.
  * Walks engineState.templateNodeMap — never the live DOM.
  * O(n) on the subtree of the replaced node only.
  *
  * @param {Map}    instanceCache
  * @param {string} templateId
  * @param {string} nodeId
  */
  function evictTemplateNodeAndDescendants(instanceCache, templateId, nodeId) {
    instanceCache.delete(String(nodeId));
    instanceCache.delete(`${nodeId}:text`);

    const entry = engineState.templateNodeMap[templateId]?.[nodeId];
    if (!entry) return;
    for (const childId of entry.childIds) {
      evictTemplateNodeAndDescendants(instanceCache, templateId, childId);
    }
  }

 /**
  * Classify a registered template as Void or Container.
  * Void: no child nodes, or intrinsically void HTML element.
  * Container: one or more child nodes.
  *
  * @param {string}                   templateId
  * @param {Element|DocumentFragment} content
  * @param {boolean}                  isLiveElement
  * @returns {"void"|"container"}
  */
  function classifyTemplate(templateId, content, isLiveElement) {
    if (!isLiveElement) return "void";
    if (VOID_ELEMENT_TAGS.has(content.tagName.toLowerCase())) return "void";
    return content.children.length > 0 ? "container" : "void";
  }

 /**
  * Scan a container element for reusable block sources.
  * Registers both <template id> and [template][id] elements.
  * Classifies each as Void or Container, stamps Container descendants
  * with data-id, and builds engineState.templateNodeMap entries.
  *
  * @param {Element} containerElement
  */
  function scanTemplatesWithin(containerElement) {
    const logger = engineState.logger;
    const dev  = engineState.config && engineState.config.dev;

    function registerTemplate(templateId, content, isLiveElement) {
      if (!templateId) {
        if (dev) logger.warn("TEMPLATE_ID_REQUIRED", "A [template] element is missing an id attribute.");
        return;
      }
      if (engineState.templates[templateId]) {
        if (dev) logger.warn("DUPLICATE_TEMPLATE_ID", `Duplicate template id "${templateId}". First registration wins.`);
        return;
      }

      if (dev) {
        const hasInnerIds = isLiveElement
          ? content.querySelector("[id]") !== null
          : content.querySelector("[id]") !== null;
        if (hasInnerIds) {
          logger.warn(
            "TEMPLATE_INNER_ID",
            `Template "${templateId}" contains child elements with id attributes. ` +
            `Multiple expansions produce duplicate ids in the DOM. ` +
            `Use data-id for targeting template internals, not id.`
          );
        }
      }

      engineState.templates[templateId] = content;
      const classification = classifyTemplate(templateId, content, isLiveElement);
      engineState.templateClasses[templateId] = classification;

      if (classification === "container") {
        stampTemplateNodeIds(templateId, content);
      } else {
        engineState.templateNodeMap[templateId] = Object.create(null);
        engineState.templateSlotMap[templateId] = Object.create(null);
      }
    }

 // 1. Native <template id="..."> elements — stored as DocumentFragment
    Array.from(containerElement.querySelectorAll("template[id]")).forEach((templateEl) => {
      const templateId = normalizeToString(templateEl.getAttribute("id"));
      const fragment   = templateEl.content.cloneNode(true);
      registerTemplate(templateId, fragment, false);
    });

 // 2. Live [template][id] elements — stored as Element reference, remain in DOM
    Array.from(containerElement.querySelectorAll("[template][id]")).forEach((liveEl) => {
      if (liveEl.tagName.toLowerCase() === "template") return;
      const templateId = normalizeToString(liveEl.getAttribute("id"));
      liveEl.setAttribute("data-clera-template-source", templateId);
      registerTemplate(templateId, liveEl, true);
    });
  }

 /**
  * Process all use[template] elements within a container.
  * Enforces shape rules, applies structural overrides (symmetric and
  * asymmetric), performs cache eviction on asymmetric replacement,
  * then inserts the resolved clone and scans bindings.
  *
  * @param {Element} containerElement
  * @param {object}  pageRecord
  */
  function processUseElementsWithin(containerElement, pageRecord) {
    const logger = engineState.logger;
    const dev  = engineState.config && engineState.config.dev;

    const seenInstanceNames = new Set(
      pageRecord ? Object.keys(pageRecord.instances || {}) : []
    );

 // Repair pass: <use template="..." /> is written self-closing, but HTML5
 // treats <use> as a normal element, so the browser parses everything that
 // follows as children of <use> instead of as siblings. Any child without a
 // target= attribute was never meant to be an override and is hoisted back
 // out to its rightful place after the <use> element.
    Array.from(containerElement.querySelectorAll("use[template]")).forEach((useEl) => {
      const parent = useEl.parentNode;
      if (!parent) return;
      let insertionAnchor = useEl.nextSibling;
      Array.from(useEl.childNodes).forEach((childNode) => {
        const isOverrideChild = childNode.nodeType === Node.ELEMENT_NODE && childNode.hasAttribute("target");
        if (isOverrideChild) return;
        parent.insertBefore(childNode, insertionAnchor);
      });
    });

    Array.from(containerElement.querySelectorAll("use[template]")).forEach((useEl) => {
      const templateId   = normalizeToString(useEl.getAttribute("template"));
      const instanceName = normalizeToString(useEl.getAttribute("name")) || null;

      if (!templateId) {
        if (dev) logger.warn("USE_TEMPLATE_REQUIRED", "<use> element is missing a template attribute.");
        useEl.remove();
        return;
      }

      const templateSource = engineState.templates[templateId];
      if (!templateSource) {
        if (dev) logger.warn("UNKNOWN_TEMPLATE", `<use template="${templateId}">: no template registered with id "${templateId}".`);
        useEl.remove();
        return;
      }

 // Void template + override children is a structural mismatch: void elements
      // cannot carry data-target children, so no override can ever apply.
      // Native <template> DocumentFragments are excluded: they always classify as void
      // but can carry any content and do support override children.
      const templateIsVoidLiveElement = engineState.templateClasses[templateId] === "void"
        && !(templateSource instanceof DocumentFragment);
      const useIsOpenCloseForm = useEl.hasAttribute("data-cre-oc");
      if (templateIsVoidLiveElement && (useEl.children.length > 0 || useIsOpenCloseForm)) {
        if (dev) logger.warn("USE_VOID_TEMPLATE_OVERRIDE",
          `<use template="${templateId}"> has override children but template "${templateId}" is a void/data-less element. Override children cannot apply to void templates. Skipping expansion.`);
        useEl.remove();
        return;
      }

 // Named instance scope
      if (instanceName) {
        if (seenInstanceNames.has(instanceName)) {
          if (dev) logger.warn("USE_NAME_DUPLICATE", `Duplicate <use> instance name "${instanceName}" on page "${pageRecord?.name ?? "?"}". Reusing existing scope.`);
        } else {
          seenInstanceNames.add(instanceName);
        }
        if (pageRecord && !pageRecord.instances[instanceName]) {
          pageRecord.instances[instanceName] = Object.create(null);
        }
      }

 // Clone the template
      let clone;
      if (templateSource instanceof DocumentFragment) {
        clone = templateSource.cloneNode(true);
      } else {
        clone = templateSource.cloneNode(true);
        clone.removeAttribute("template");
        clone.removeAttribute("id");
        clone.removeAttribute("data-clera-template-source");
      }

 // Instance cache for eviction during asymmetric replacement
      const instanceCache = new Map();

 // Apply overrides from <use> body children
      const nodeMap          = engineState.templateNodeMap[templateId];
      const overrideChildren = Array.from(useEl.children);
      let expansionInvalid   = false;

      for (const overrideEl of overrideChildren) {
        const targetNid = normalizeToString(overrideEl.getAttribute("target"));
        if (!targetNid) {
          if (dev) logger.warn("USE_TARGET_REQUIRED", `Direct child of <use template="${templateId}"> is missing a target= attribute.`);
          expansionInvalid = true;
          break;
        }

        const slotMap    = engineState.templateSlotMap[templateId];
        const resolvedNid = (slotMap && slotMap[targetNid]) ?? targetNid;

        const targetNode = clone.querySelector
          ? clone.querySelector(`[data-id="${resolvedNid}"]`)
          : null;

        if (!targetNode) {
          if (dev) logger.warn("UNKNOWN_TARGET", `<use template="${templateId}">: target="${targetNid}" not found in clone.`);
          expansionInvalid = true;
          break;
        }

        const templateEntryTag = nodeMap[resolvedNid]?.tagName;
        const overrideTag      = overrideEl.tagName.toLowerCase();
        const isSymmetric      = overrideTag === templateEntryTag;

        if (isSymmetric) {
 // Retain template node. Replace text content only. Preserve attributes and data-id.
          targetNode.textContent = overrideEl.textContent;
        } else {
 // Asymmetric: clean-slate replacement. No attributes inherited.
          evictTemplateNodeAndDescendants(instanceCache, templateId, resolvedNid);
          const parent = targetNode.parentNode;
          if (parent) {
            parent.insertBefore(overrideEl.cloneNode(true), targetNode);
            targetNode.remove();
          }
        }
      }

      if (expansionInvalid) {
        useEl.remove();
        return;
      }

 // Insert resolved clone and scan bindings
      if (clone instanceof DocumentFragment) {
        const parent = useEl.parentNode;
        if (parent) {
          const insertedNodes = Array.from(clone.childNodes);
          parent.insertBefore(clone, useEl);
          useEl.remove();
          if (pageRecord) {
            insertedNodes.forEach((insertedNode) => {
              if (insertedNode.nodeType === Node.ELEMENT_NODE) {
                scanBindings(insertedNode, pageRecord, false, instanceName);
              }
            });
          }
        }
      } else {
        useEl.replaceWith(clone);
        if (pageRecord) scanBindings(clone, pageRecord, false, instanceName);
      }
    });
  }

  function registerComponent(tagName, componentConfig) {
    const logger     = engineState.logger;
    const normalized = normalizeToString(tagName).toLowerCase();
    if (!normalized) { logger.warn("COMP_INVALID", "registerComponent called with empty tagName."); return false; }
    if (isProtectedCoreTag(normalized)) { logger.warn("COMP_PROTECTED", `Cannot override protected core tag <${normalized}>.`); return false; }

    const resolvedConfig = isPlainObject(componentConfig) ? componentConfig : Object.create(null);

 // Normalise selfClosing. Default is false (container component).
 // selfClosing:true declares an atomic component that must not contain children.
    resolvedConfig.selfClosing = resolvedConfig.selfClosing === true;

    engineState.components[normalized] = resolvedConfig;
    return true;
  }

  function installPlugins(pluginList) {
    const logger = engineState.logger;
    if (!Array.isArray(pluginList)) return;
    pluginList.forEach((plugin) => {
      if (!plugin || typeof plugin !== "object") { logger.warn("PLUGIN_INVALID", "app.use() requires a plugin object. Skipping."); return; }
      const pluginIdentifier = normalizeToString(plugin.id || plugin.name) || `plugin_${engineState.installedPlugins.length + 1}`;
      if (engineState.installedPluginIds.has(pluginIdentifier)) { logger.warn("PLUGIN_DUP", `Plugin "${pluginIdentifier}" already installed.`); return; }
      engineState.installedPluginIds.add(pluginIdentifier);
      engineState.installedPlugins.push({ id: pluginIdentifier, plugin });
      if (typeof plugin.install === "function") {
        try { plugin.install(); }
        catch (pluginInstallError) { logger.error("PLUGIN_THROW", `Plugin "${pluginIdentifier}" threw during install().`, pluginInstallError); }
      }
    });
  }

  function runPluginsOnReady() {
    const logger = engineState.logger;
    engineState.installedPlugins.forEach(({ id: pluginIdentifier, plugin: pluginObject }) => {
      if (typeof pluginObject.onReady === "function") {
        try { pluginObject.onReady(); }
        catch (pluginReadyError) { logger.error("PLUGIN_READY_THROW", `Plugin "${pluginIdentifier}" threw during onReady().`, pluginReadyError); }
      }
    });
  }


  function detectBridgeEnvironment() {
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.cleraBridge) return "native-ios";
    if (window.CleraAndroidBridge && typeof window.CleraAndroidBridge.postMessage === "function") return "native-android";
    if (window.__CLERA_SIMULATOR__ === true) return "simulator";
    if (window.__CLERA_PREVIEW__   === true) return "preview";
    if (typeof window !== "undefined" && typeof navigator !== "undefined") return "browser";
    return "unknown";
  }

  function createBridgeAdapterModule() {
    const detectedEnv = detectBridgeEnvironment();

    function sendToNativeIos(msg)     { window.webkit.messageHandlers.cleraBridge.postMessage(msg); }
    function sendToNativeAndroid(msg) { window.CleraAndroidBridge.postMessage(JSON.stringify(msg)); }
    function sendToSimulator(msg) {
      if (window.__CLERA_SIMULATOR_BRIDGE__ && typeof window.__CLERA_SIMULATOR_BRIDGE__.receive === "function") {
        window.__CLERA_SIMULATOR_BRIDGE__.receive(msg);
      } else if (engineState.publicApi && engineState.publicApi.bridge) {
        engineState.publicApi.bridge.reject(msg.id, "Simulator bridge not connected.");
      }
    }
    function sendToPreview(msg) {
      if (window.__CLERA_PREVIEW_BRIDGE__ && typeof window.__CLERA_PREVIEW_BRIDGE__.receive === "function") {
        window.__CLERA_PREVIEW_BRIDGE__.receive(msg);
      } else if (engineState.publicApi && engineState.publicApi.bridge) {
        engineState.publicApi.bridge.reject(msg.id, "Preview bridge not connected.");
      }
    }
    function sendToBrowser(msg) {
      const name    = msg.name;
      const payload = msg.payload || {};
      const id      = msg.id;
      const bridge  = engineState.publicApi && engineState.publicApi.bridge;
      if (!bridge) return;

      if (name === "hardware.vibrate") {
        if (!("vibrate" in navigator)) { bridge.reject(id, "Vibration API not supported."); return; }
        navigator.vibrate(Number(payload.duration) || 0) ? bridge.resolve(id, { done: true }) : bridge.reject(id, "Vibration denied.");
        return;
      }
      if (name === "hardware.clipboard") {
        if (!navigator.clipboard || !navigator.clipboard.writeText) { bridge.reject(id, "Clipboard API not supported."); return; }
        navigator.clipboard.writeText(String(payload.text || "")).then(() => bridge.resolve(id, { done: true })).catch((err) => bridge.reject(id, String(err)));
        return;
      }
      if (name === "hardware.share") {
        if (!navigator.share) { bridge.reject(id, "Web Share API not supported."); return; }
        navigator.share({ title: payload.title || "", text: payload.text || "", url: payload.url || "" })
          .then(() => bridge.resolve(id, { done: true })).catch((err) => bridge.reject(id, String(err)));
        return;
      }
      if (name === "hardware.camera") {
        const input    = document.createElement("input");
        input.type     = "file";
        input.accept   = payload.mode === "video" ? "video/*" : "image/*";
 input.capture = "environment";
 input.style.display = "none";
 document.body.appendChild(input);
 input.addEventListener("change", () => {
 const file = input.files && input.files[0];
 document.body.removeChild(input);
 if (!file) { bridge.reject(id, "No file selected."); return; }
 bridge.resolve(id, { uri: URL.createObjectURL(file), name: file.name, size: file.size, mimeType: file.type });
 });
 input.addEventListener("cancel", () => { document.body.removeChild(input); bridge.reject(id, "Camera cancelled."); });
 input.click();
 return;
 }
 if (name === "hardware.files.pick") {
 const input = document.createElement("input");
 input.type = "file";
 input.accept = payload.accept || "*/*";
        input.multiple  = !!payload.multiple;
        input.style.display = "none";
        document.body.appendChild(input);
        input.addEventListener("change", () => {
          const files = Array.from(input.files || []);
          document.body.removeChild(input);
          if (!files.length) { bridge.reject(id, "No files selected."); return; }
          bridge.resolve(id, { files: files.map((pickedFile) => ({ uri: URL.createObjectURL(pickedFile), name: pickedFile.name, size: pickedFile.size, mimeType: pickedFile.type })), count: files.length });
        });
        input.addEventListener("cancel", () => { document.body.removeChild(input); bridge.reject(id, "File picker cancelled."); });
        input.click();
        return;
      }
      if (name === "hardware.files.save") {
        try {
          const blob           = new Blob([payload.content || ""], { type: payload.mimeType || "text/plain" });
          const downloadAnchor = document.createElement("a");
          downloadAnchor.href           = URL.createObjectURL(blob);
          downloadAnchor.download       = payload.name || "download";
          downloadAnchor.style.display  = "none";
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          document.body.removeChild(downloadAnchor);
          bridge.resolve(id, { done: true, name: payload.name });
        } catch (err) { bridge.reject(id, String(err)); }
        return;
      }
      if (name === "hardware.location") {
        if (!navigator.geolocation) { bridge.reject(id, "Geolocation not supported."); return; }
        navigator.geolocation.getCurrentPosition(
          (geolocationPosition) => bridge.resolve(id, { latitude: geolocationPosition.coords.latitude, longitude: geolocationPosition.coords.longitude, accuracy: geolocationPosition.coords.accuracy, altitude: geolocationPosition.coords.altitude || null, timestamp: geolocationPosition.timestamp }),
          (err) => bridge.reject(id, err.message || "Location failed."),
          { enableHighAccuracy: !!payload.highAccuracy, timeout: payload.timeout || 10000, maximumAge: payload.maximumAge || 0 }
        );
        return;
      }
      bridge.reject(id, `Unknown bridge capability: "${name}".`);
    }

    let resolvedAdapter = null;

    function dispatch(msg) {
      if (resolvedAdapter && typeof resolvedAdapter.send === "function") {
        resolvedAdapter.send(msg);
      } else if (engineState.publicApi && engineState.publicApi.bridge) {
        engineState.publicApi.bridge.reject(msg.id, `No adapter for environment: "${detectedEnv}".`);
      }
    }

    const namedRegistry = Object.freeze({
      "browser":        Object.freeze({ name: "browser",        send: sendToBrowser }),
      "native-ios":     Object.freeze({ name: "native-ios",     send: sendToNativeIos }),
      "native-android": Object.freeze({ name: "native-android", send: sendToNativeAndroid }),
      "simulator":      Object.freeze({ name: "simulator",      send: sendToSimulator }),
      "preview":        Object.freeze({ name: "preview",        send: sendToPreview })
    });

    const activeAdapter = namedRegistry[detectedEnv] || Object.freeze({
      name: "unknown",
      send(msg) {
        if (engineState.publicApi && engineState.publicApi.bridge) {
          engineState.publicApi.bridge.reject(msg.id, `No adapter for environment: "${detectedEnv}".`);
        }
      }
    });

    resolvedAdapter = activeAdapter;

    return { environmentName: detectedEnv, adapterRegistry: namedRegistry, activeAdapter, send: dispatch };
  }

  function attachBridgeModule(cleraPublicApi) {
    const adapter = createBridgeAdapterModule();
    let   counter = 0;
    const pending = Object.create(null);

    const capabilityRegistry = Object.freeze({
      "hardware.vibrate":    true,
      "hardware.clipboard":  true,
      "hardware.share":      true,
      "hardware.camera":     true,
      "hardware.files.pick": true,
      "hardware.files.save": true,
      "hardware.location":   true
    });

    cleraPublicApi.bridge = {
      get env()      { return adapter.environmentName; },
      get adapters() { return adapter.adapterRegistry; },
      get adapter()  { return adapter.activeAdapter; },
      call(capabilityName, requestPayload) {
        const name = normalizeToString(capabilityName);
        if (!capabilityRegistry[name]) {
          return Promise.reject(new Error(`Unknown bridge capability: "${name}". Registered: ${Object.keys(capabilityRegistry).join(", ")}.`));
        }
        const id = `req_${++counter}`;
        const promise = new Promise((resolve, reject) => { pending[id] = { resolve, reject }; });
        const msg = { id, name, payload: isPlainObject(requestPayload) ? requestPayload : {} };
        try { adapter.send(msg); } catch (err) { this.reject(id, String(err)); }
        return promise;
      },
      send(msg)         { adapter.send(msg); },
      resolve(id, result)         { if (!pending[id]) return; pending[id].resolve(result); delete pending[id]; },
      reject(id, errorDesc)       { if (!pending[id]) return; pending[id].reject(new Error(errorDesc)); delete pending[id]; }
    };

    cleraPublicApi.capabilities = capabilityRegistry;
  }


  function createHardwareModule() {
    const bridge = () => engineState.publicApi.bridge;
    return {
      vibrate(ms)     { return bridge().call("hardware.vibrate",    { duration: Number(ms) || 0 }); },
      clipboard(text) { return bridge().call("hardware.clipboard",   { text: String(text || "") }); },
      share(opts)     {
        const resolvedShareOptions = isPlainObject(opts) ? opts : {};
        return bridge().call("hardware.share", { title: String(resolvedShareOptions.title || ""), text: String(resolvedShareOptions.text || ""), url: String(resolvedShareOptions.url || "") });
      },
      camera(cameraOptions)    {
        const resolvedCameraOptions = isPlainObject(cameraOptions) ? cameraOptions : {};
        return bridge().call("hardware.camera", { mode: normalizeToString(resolvedCameraOptions.mode) || "photo" });
      },
      location(locationOptions)  {
        const resolvedLocationOptions = isPlainObject(locationOptions) ? locationOptions : {};
        return bridge().call("hardware.location", { highAccuracy: !!resolvedLocationOptions.highAccuracy, timeout: resolvedLocationOptions.timeout || 10000, maximumAge: resolvedLocationOptions.maximumAge || 0 });
      },
      files: {
        pick(pickOptions) {
          const resolvedPickOptions = isPlainObject(pickOptions) ? pickOptions : {};
          return bridge().call("hardware.files.pick", { accept: normalizeToString(resolvedPickOptions.accept) || "*/*", multiple: !!resolvedPickOptions.multiple });
 },
 save(saveOptions) {
 const resolvedSaveOptions = isPlainObject(saveOptions) ? saveOptions : {};
 return bridge().call("hardware.files.save", { name: normalizeToString(resolvedSaveOptions.name) || "download", content: resolvedSaveOptions.content || "", mimeType: normalizeToString(resolvedSaveOptions.mimeType) || "text/plain" });
 }
 }
 };
 }

 /* ============================================================================
 PHP (HTTP fetch) module CLERA.php()
 ----------------------------------------------------------------------------
 WHAT: Lightweight fetch wrapper for POST requests to PHP (or any HTTP)
 endpoints. Supports two usage styles:

 Promise style:
 const result = await CLERA.php("save-user.php", data);

 Callback style:
 CLERA.php("save-user.php", data, {
 onSuccess(result) { context.navigate("success"); },
 onError(result)   { context.navigate("error"); }
 });

 WHY: Removes fetch/JSON boilerplate from every action handler.
 The callback form fits Clera action handlers naturally.

 Transport success is determined solely by HTTP response status (2xx).
 The runtime never inspects payload content to evaluate success.
 Payload interpretation belongs entirely to developer callback code.

 HOW:
 1. Always performs an async POST request.
 2. Always returns a Promise even in callback mode.
 3. Parses the response as JSON.
 4. Calls onSuccess when HTTP status is 2xx. Calls onError otherwise.
 5. Global config via CLERA.start({ php: { ... } }) or CLERA.config({ php: { ... } }).

 Config keys (all optional):
 baseUrl {string}          Prepended to relative URLs. Default: ""
 timeout {number}          Abort timeout in ms. Default: 0 (none)
 csrf    {object}          { header, token }
   header {string}         Header name. Default: "X-CSRF-Token"
   token  {string|function} Token value or factory.

 Result shape (always):
 { ok, status, data }
 ok     {boolean} true when HTTP 2xx. transport only, never payload-derived.
 status {number}  HTTP status code. 0 on network failure.
 data   {any}     Full parsed response body, unmodified. null on parse failure.

 Callbacks receive result as the only parameter. Context is available
 globally via the context object inside callback scope.
 ============================================================================ */

  function attachPhpModule(cleraPublicApi) {
 /**
 * Resolve CSRF token - supports static string or factory function.
 * @param {string|function|undefined} tokenSource
 * @returns {string}
 */
    function resolveCsrfToken(tokenSource) {
      if (typeof tokenSource === "function") {
        try { return String(tokenSource() || ""); } catch (ignoredTokenFactoryError) { return ""; }
      }
      return String(tokenSource || "");
    }

 /**
 * Build request headers for a php() call.
 * @param {object} phpConfig Resolved php config block from engineState.config
 * @returns {object} Plain header map
 */
    function buildRequestHeaders(phpConfig) {
      const headers = { "Content-Type": "application/json" };
      const csrfConfig = isPlainObject(phpConfig.csrf) ? phpConfig.csrf : null;
      if (csrfConfig) {
        const headerName = normalizeToString(csrfConfig.header) || "X-CSRF-Token";
        if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(headerName)) {
          engineState.logger.error("PHP_BAD_HEADER", `CLERA.php() blocked invalid CSRF header name: "${headerName.slice(0, 40)}".`);
        } else {
          const tokenValue = resolveCsrfToken(csrfConfig.token);
          if (tokenValue) headers[headerName] = tokenValue;
        }
      }
      return headers;
    }

 /**
 * Resolve the full request URL, applying baseUrl when the given requestUrl
 * is relative and baseUrl is configured.
 * @param {string} requestUrl
 * @param {object} phpConfig
 * @returns {string}
 */
    function resolveRequestUrl(requestUrl, phpConfig) {
      const baseUrl = normalizeToString(phpConfig.baseUrl);
      const joined = (!baseUrl || requestUrl.startsWith("http") || requestUrl.startsWith("//"))
        ? requestUrl
        : baseUrl.replace(/\/$/, "") + "/" + requestUrl.replace(/^\//, "");
      // Only http: and https: are permitted. Any other scheme (javascript:, file:, etc.)
      // is blocked here so the runtime fails loudly rather than surfacing a silent
      // network error with no indication of the cause.
      const lower = joined.toLowerCase();
      if (joined && !lower.startsWith("https://") && !lower.startsWith("http://") && !joined.startsWith("/")) {
        return "";
      }
      return joined;
    }

 /**
 * CLERA.php(endpointUrl, requestData, requestOptions?) - send a POST request and return a Promise.
 *
 * @param {string} endpointUrl   Target endpoint. Relative paths use config.php.baseUrl.
 * @param {any}    [requestData] Request body. Serialised as JSON.
 * @param {object} [requestOptions] Optional config:
 *   onSuccess(result) Called when HTTP status is 2xx.
 *   onError(result)   Called on network failure, timeout, non-2xx, or parse failure.
 * @returns {Promise<{ok, status, data}>}
 */
    cleraPublicApi.php = function phpRequest(endpointUrl, requestData, requestOptions) {
      const logger    = engineState.logger || createLogger(true);
      const phpConfig = isPlainObject(engineState.config && engineState.config.php)
        ? engineState.config.php
        : Object.create(null);

      const resolvedUrl            = resolveRequestUrl(normalizeToString(endpointUrl), phpConfig);
      const resolvedRequestOptions = isPlainObject(requestOptions) ? requestOptions : Object.create(null);


      if (!resolvedUrl) {
        logger.warn("PHP_NO_URL", "CLERA.php() called without a URL or a disallowed URL scheme.");
        const noUrlErrorResult = { ok: false, status: 0, data: null };
        if (typeof resolvedRequestOptions.onError === "function") {
          try { resolvedRequestOptions.onError(noUrlErrorResult); } catch (ignoredCallbackError) {}
        }
        return Promise.resolve(noUrlErrorResult);
      }

      const fetchHeaders = buildRequestHeaders(phpConfig);
      const fetchInit    = {
        method:  "POST",
        headers: fetchHeaders,
        body:    requestData !== undefined ? JSON.stringify(requestData) : undefined
      };

 // Optional timeout via AbortController
      const timeoutMs       = Number(phpConfig.timeout) || 0;
      let   abortController = null;
      let   abortTimerId    = null;
      if (timeoutMs > 0 && typeof AbortController === "function") {
        abortController  = new AbortController();
        fetchInit.signal = abortController.signal;
        abortTimerId     = setTimeout(function () { abortController.abort(); }, timeoutMs);
      }

      const requestPromise = fetch(resolvedUrl, fetchInit)
        .then(function (fetchResponse) {
          if (abortTimerId !== null) clearTimeout(abortTimerId);
          const httpStatus = fetchResponse.status;
          return fetchResponse.json()
            .then(function (parsedResponseBody) {
              // Transport success is HTTP status only. payload content is never read
              // to determine ok. the developer's callback interprets result.data.
              // When the response body is a plain object with a "data" key, unwrap it
              // so result.data is the payload rather than the envelope.
              const requestSucceeded  = fetchResponse.ok;
              const unwrappedPayload  = isPlainObject(parsedResponseBody) && Object.prototype.hasOwnProperty.call(parsedResponseBody, "data")
                ? parsedResponseBody.data
                : parsedResponseBody;
              const resolvedResult   = { ok: requestSucceeded, status: httpStatus, data: unwrappedPayload };
              if (requestSucceeded) {
                if (typeof resolvedRequestOptions.onSuccess === "function") {
                  try { resolvedRequestOptions.onSuccess(resolvedResult); } catch (successCallbackError) {
                    logger.error("PHP_CALLBACK_THROW", "CLERA.php() onSuccess threw.", successCallbackError);
                  }
                }
              } else {
                if (typeof resolvedRequestOptions.onError === "function") {
                  try { resolvedRequestOptions.onError(resolvedResult); } catch (errorCallbackError) {
                    logger.error("PHP_CALLBACK_THROW", "CLERA.php() onError threw.", errorCallbackError);
                  }
                }
              }
              return resolvedResult;
            })
            .catch(function (ignoredJsonParseError) {
 // JSON parse failure. Treat as error
              const jsonParseFailResult = { ok: false, status: httpStatus, data: null };
              if (typeof resolvedRequestOptions.onError === "function") {
                try { resolvedRequestOptions.onError(jsonParseFailResult); } catch (ignoredCallbackError) {}
              }
              return jsonParseFailResult;
            });
        })
        .catch(function (fetchError) {
          if (abortTimerId !== null) clearTimeout(abortTimerId);
          const requestTimedOut  = abortController && fetchError && fetchError.name === "AbortError";
          const errorMessage     = requestTimedOut ? "Request timed out." : (fetchError && fetchError.message ? fetchError.message : "Network error.");
          logger.error("PHP_FETCH_FAIL", "CLERA.php() fetch failed: " + errorMessage, fetchError);
          const networkErrorResult = { ok: false, status: 0, data: null };
          if (typeof resolvedRequestOptions.onError === "function") {
            try { resolvedRequestOptions.onError(networkErrorResult); } catch (ignoredCallbackError) {}
          }
          return networkErrorResult;
        });

      return requestPromise;
    };
  }


  function attachServiceWorkerModule(cleraPublicApi) {
    const SW_KEY = "APP_SW_CONFIG_V1";
    const state  = { registration: null, config: { mode: "network-first", cache: { pages: true, assets: true } } };

    function normalizeMode(rawModeValue) {
      const normalizedModeValue = normalizeToString(rawModeValue).toLowerCase();
      if (normalizedModeValue === "offline-first" || normalizedModeValue === "cache-first") return normalizedModeValue;
      return "network-first";
    }
    function normalizeCache(rawCacheConfig) {
      const resolvedCacheConfig = isPlainObject(rawCacheConfig) ? rawCacheConfig : Object.create(null);
      return { pages: resolvedCacheConfig.pages !== undefined ? !!resolvedCacheConfig.pages : true, assets: resolvedCacheConfig.assets !== undefined ? !!resolvedCacheConfig.assets : true };
    }
    function saveServiceWorkerConfig(configToSave) { try { localStorage.setItem(SW_KEY, JSON.stringify(configToSave)); } catch (_) {} }
    function loadConfig() {
      try {
        const storedConfigJson = localStorage.getItem(SW_KEY);
        if (!storedConfigJson) return null;
        const parsed = JSON.parse(storedConfigJson);
        return isPlainObject(parsed) ? parsed : null;
      } catch (_) { return null; }
    }
    async function sendConfigToServiceWorker(configToSend) {
      if (!("serviceWorker" in navigator)) return false;
      if (navigator.serviceWorker.controller) { navigator.serviceWorker.controller.postMessage({ type: "APP_SW_CONFIG", payload: configToSend }); return true; }
      const activeRegistration = state.registration || (await navigator.serviceWorker.getRegistration());
      if (!activeRegistration) return false;
      const targetServiceWorker = activeRegistration.active || activeRegistration.waiting || activeRegistration.installing;
      if (!targetServiceWorker) return false;
      targetServiceWorker.postMessage({ type: "APP_SW_CONFIG", payload: configToSend });
      return true;
    }

    cleraPublicApi.sw = {
      setup(setupOptions) {
        const resolvedSetupOptions = isPlainObject(setupOptions) ? setupOptions : Object.create(null);
        state.config = { mode: normalizeMode(resolvedSetupOptions.mode), cache: normalizeCache(resolvedSetupOptions.cache) };
        saveServiceWorkerConfig(state.config);
        this.flush();
        return { ok: true, queued: true, config: { ...state.config } };
      },
      async flush() { return await sendConfigToServiceWorker(state.config); },
      getConfig() { return { mode: state.config.mode, cache: { ...state.config.cache } }; },
      async register(opts) {
        const logger = engineState.logger || createLogger(true);
        const resolvedSwOptions = isPlainObject(opts) ? opts : Object.create(null);
        const serviceWorkerScriptUrl = normalizeToString(resolvedSwOptions.url) || "/sw.js";
        if (!("serviceWorker" in navigator)) { logger.warn("SW_UNSUPPORTED", "Service workers not supported."); return { ok: false, error: "unsupported" }; }
        try {
          const serviceWorkerRegistration = await navigator.serviceWorker.register(serviceWorkerScriptUrl);
          state.registration = serviceWorkerRegistration;
          const persistedSwConfig = loadConfig();
          if (persistedSwConfig) state.config = { mode: normalizeMode(persistedSwConfig.mode), cache: normalizeCache(persistedSwConfig.cache) };
          await this.flush();
          const shouldAutoReload   = resolvedSwOptions.autoReloadOnFirstControl !== false;
          const shouldReloadBehindSplash = resolvedSwOptions.reloadBehindSplash !== false;
          if (shouldAutoReload && !navigator.serviceWorker.controller) {
            const reloadFlagKey = "APP_SW_RELOADED_ONCE";
            if (sessionStorage.getItem(reloadFlagKey) !== "1") {
              const reloadPageOnceControlled = () => { sessionStorage.setItem(reloadFlagKey, "1"); if (shouldReloadBehindSplash) showSplashIfAny(); setTimeout(() => window.location.reload(), 80); };
              navigator.serviceWorker.addEventListener("controllerchange", reloadPageOnceControlled, { once: true });
              if (serviceWorkerRegistration.waiting) { try { serviceWorkerRegistration.waiting.postMessage({ type: "SKIP_WAITING" }); } catch (_) {} }
            }
          }
          return { ok: true, registration: serviceWorkerRegistration };
        } catch (err) {
          logger.error("SW_REGISTER_FAIL", "Service worker registration failed.", err);
          return { ok: false, error: String(err && err.message ? err.message : err) };
        }
      }
    };
  }


  function exposeGlobals(exposeConfig) {
    const logger = engineState.logger || createLogger(true);
    const api    = engineState.publicApi;

    function exposeSingleHelper(helperName) {
      if (!SAFE_EXPOSURE_REGISTRY.some((registryEntry) => registryEntry.key === helperName)) { logger.warn("EXPOSE_NOT_SAFE", `"${helperName}" not in safe registry.`); return; }
      if (window[helperName] !== undefined) { logger.warn("EXPOSE_CONFLICT", `Global "${helperName}" already exists.`); return; }
      window[helperName] = api[helperName];
    }

    if (exposeConfig === "app" || exposeConfig === "clera") {
 // "clera" is a deprecated alias for "app" - both expose the standard helper set
      SAFE_EXPOSURE_REGISTRY.filter((registryEntry) => registryEntry.modes.includes("app")).forEach((registryEntry) => exposeSingleHelper(registryEntry.key));
      return;
    }
    if (exposeConfig === "all") {
      SAFE_EXPOSURE_REGISTRY.filter((registryEntry) => registryEntry.modes.includes("all")).forEach((registryEntry) => exposeSingleHelper(registryEntry.key));
      return;
    }
    if (isPlainObject(exposeConfig)) {
      Object.keys(exposeConfig).forEach((helperName) => { if (exposeConfig[helperName] === true) exposeSingleHelper(helperName); });
    }
  }

 /* ============================================================================
 INTERNAL BOOT FUNCTION
 ----------------------------------------------------------------------------
 WHAT: The single, authoritative implementation of the Clera boot sequence.
 WHY: Both CLERA.start() and auto-start must produce identical results.
 Having one function here is the only way to guarantee that. If boot
 logic were duplicated, the two paths would inevitably drift.
 HOW: Reads engineState.pendingConfig as the resolved config object.
 Executes the 15-step boot sequence in the documented order.
 Called by internalStart() which sets isStarted before calling here.

 This function must NEVER be called directly from outside this section.
 Always call internalStart() which applies the guard and sets isStarted.
 ============================================================================ */

 /**
 * Resolution order: config.initial wins, then persisted page, then "home",
 * then first registered. Zero-config apps always land somewhere sensible.
 * @returns {string|null}
 */
  function resolveInitialPageName() {
    const config    = engineState.pendingConfig;
    const registry  = engineState.pageRegistry;

    const explicit = normalizeToString(config.initial);
    if (explicit && registry.has(explicit)) return explicit;

    // Restores the page the user was on before reload. Falls through silently
    // if the saved page no longer exists in the registry.
    if (config.persistPage === true) {
      try {
        const savedPageName = localStorage.getItem(ACTIVE_PAGE_STORAGE_KEY);
        if (savedPageName && registry.has(savedPageName)) return savedPageName;
      } catch (_) {}
    }

    if (registry.has("home")) return "home";

    const firstKey = registry.keys().next().value;
    if (firstKey) return firstKey;

    return null;
  }

  function buildScriptElement(sourceEl, baseFileUrl) {
    const scriptEl  = document.createElement("script");
    const scriptSrc = normalizeToString(sourceEl.getAttribute("src"));
    if (scriptSrc) {
      scriptEl.src = new URL(scriptSrc, baseFileUrl).href;
    } else {
      scriptEl.textContent = sourceEl.textContent;
    }
    if (sourceEl.hasAttribute("type"))  scriptEl.type  = sourceEl.getAttribute("type");
    if (sourceEl.hasAttribute("defer")) scriptEl.defer = true;
    if (sourceEl.hasAttribute("async")) scriptEl.async = true;
    return scriptEl;
  }

  function buildHeadElement(sourceEl, baseFileUrl) {
    if (sourceEl.tagName.toLowerCase() === "script") {
      return buildScriptElement(sourceEl, baseFileUrl);
    }
    return sourceEl.cloneNode(true);
  }

  function applyScopeFilter(nodes, scopeAttr) {
    if (!scopeAttr) return nodes;
    const allowedTags = new Set(
      scopeAttr.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean)
    );
    return nodes.filter((node) => node.nodeType === Node.ELEMENT_NODE && allowedTags.has(node.tagName.toLowerCase()));
  }

  function extractImportedNodes(importedDoc, baseFileUrl) {
    const headNodes = [];
    const bodyNodes = [];

 // All head children are candidates for hoisting to document.head.
 // <script> elements are reconstructed with resolved absolute src URLs.
 // All other head elements are cloned as-is.
    for (const headChild of Array.from(importedDoc.head.children)) {
      headNodes.push(buildHeadElement(headChild, baseFileUrl));
    }

    const bodyRoot    = importedDoc.body;
    const appWrapper  = bodyRoot.children.length === 1 && bodyRoot.firstElementChild.tagName.toLowerCase() === "app"
                        ? bodyRoot.firstElementChild
                        : null;
    const contentRoot = appWrapper ?? bodyRoot;

 // <style> found in body is hoisted to document.head — inline styles have no timing
 // dependency and belong in head. <script> found in body expands in place to preserve
 // the developer's intended execution timing relative to the DOM.
    for (const child of Array.from(contentRoot.children)) {
      const tagName = child.tagName.toLowerCase();
      if (tagName === "style") {
        headNodes.push(child.cloneNode(true));
      } else {
        bodyNodes.push(tagName === "script" ? buildScriptElement(child, baseFileUrl) : child);
      }
    }

    return { headNodes, bodyNodes, contentRoot };
  }

  async function resolveImports(scopeElement, visitedPaths) {
    const logger = engineState.logger;

    if (!visitedPaths) visitedPaths = new Set();

 // IMPORT_WRONG_SCOPE: <import> is only valid as a direct child of the content root.
 // Any <import> nested inside a <page>, <template>, or other non-root element is invalid.
    const isContentRoot = scopeElement === engineState.appRootElement || scopeElement.tagName?.toLowerCase() === "body";
    if (!isContentRoot) {
      for (const child of Array.from(scopeElement.querySelectorAll("import"))) {
        if (child.parentElement !== scopeElement) {
          logger.warn("IMPORT_WRONG_SCOPE", `<import src="${normalizeToString(child.getAttribute("src"))}"> found inside <${child.parentElement?.tagName?.toLowerCase()}>. <import> is only valid as a direct child of <app> or the document body.`);
          child.remove();
        }
      }
    }

    for (const importEl of Array.from(scopeElement.children)) {
      if (importEl.tagName.toLowerCase() !== "import") continue;

      const src = normalizeToString(importEl.getAttribute("src"));
      if (!src) {
        logger.warn("IMPORT_MISSING_SRC", "<import> element has no src attribute and will be ignored.");
        importEl.remove();
        continue;
      }

      const resolvedFileUrl = new URL(src, document.baseURI).href;

      if (visitedPaths.has(resolvedFileUrl)) {
        logger.error("CIRCULAR_IMPORT", `Circular import detected: "${src}" has already been visited in this import chain.`);
        importEl.remove();
        continue;
      }
      visitedPaths.add(resolvedFileUrl);

      let importedHtml;
      try {
        const response = await fetch(resolvedFileUrl);
        if (!response.ok) {
          logger.error("IMPORT_FETCH_FAILED", `Failed to fetch import "${src}": HTTP ${response.status}.`);
          importEl.remove();
          continue;
        }
        importedHtml = await response.text();
      } catch (err) {
        logger.error("IMPORT_FETCH_FAILED", `Failed to fetch import "${src}": ${err.message}.`);
        importEl.remove();
        continue;
      }

      const parser      = new DOMParser();
      const importedDoc = parser.parseFromString(importedHtml, "text/html");

      const { headNodes, bodyNodes, contentRoot } = extractImportedNodes(importedDoc, resolvedFileUrl);

      await resolveImports(contentRoot, visitedPaths);

      const scopeAttr    = normalizeToString(importEl.getAttribute("scope")) || null;
      const filteredHead = applyScopeFilter(headNodes, scopeAttr);
      const filteredBody = applyScopeFilter(bodyNodes, scopeAttr);

      for (const node of filteredHead) {
        document.head.appendChild(node);
      }
      for (const node of filteredBody) {
        importEl.before(node);
      }

      importEl.remove();
    }
  }

  async function runBootSequence() {
    if (engineState.isBooted) return;

    const config = engineState.pendingConfig;
    const logger = engineState.logger;

    applyAccessibilityComfort(normalizeAccessibilityConfig(config.accessibility));

    const rootSelector   = normalizeToString(config.root);
    const appRootElement = (rootSelector && document.querySelector(rootSelector)) || document.querySelector("app");
    if (!appRootElement) {
      logger.error("BOOT_NO_APP", "Missing <app> root. Add <app>...</app> to your HTML.");
      return;
    }
    engineState.appRootElement = appRootElement;

    findAndKeepFirstSplash(appRootElement);
    showSplashIfAny();

    await resolveImports(document.head);
    await resolveImports(appRootElement);

    if (!extractPagesFromAppRoot(appRootElement)) return;

    // Scans at app root level so reusable blocks are available to all pages.
    scanTemplatesWithin(appRootElement);

    installPlugins(config.plugins);
    parseComponentsWithin(appRootElement);
    ensureMountZone(appRootElement);

 // setupLayout must run before bindNavsIfPresent so the layout attribute is set
 // on <app> before nav positions are resolved for the first time.
    engineState.layoutHelper = setupLayout(appRootElement, config);
    initTabBarsIfPresent(appRootElement);
    initSidebarsIfPresent(appRootElement);
    bindNavsIfPresent(appRootElement);

    // Bridge must attach before hardware — hardware delegates all capability calls to bridge.
    attachBridgeModule(engineState.publicApi);
    engineState.publicApi.hardware = createHardwareModule();
    attachPhpModule(engineState.publicApi);
    attachServiceWorkerModule(engineState.publicApi);

    if (config.expose !== undefined && config.expose !== null) {
      exposeGlobals(config.expose);
    }

    if (config.serviceWorker && config.serviceWorker.enabled) {
      engineState.publicApi.sw.setup({
        mode:  config.serviceWorker.mode  || "network-first",
        cache: config.serviceWorker.cache || { pages: true, assets: true }
      });
      engineState.publicApi.sw.register({
        url:                      config.serviceWorker.url                      || "/sw.js",
        autoReloadOnFirstControl: config.serviceWorker.autoReloadOnFirstControl !== false,
        reloadBehindSplash:       config.serviceWorker.reloadBehindSplash       !== false
      });
    }

    // Must flip before flushQueuedCalls so replayed page() / use() calls
    // see isBooted = true and do not re-queue themselves.
    engineState.isBooted = true;

    // CLERA.page() registrations must replay before navigate() so lifecycle
    // hooks are attached before the first page mounts and fires onCreate.
    flushQueuedCalls(engineState.publicApi);

    if (config.routerEnabled && window.AppRouter && typeof window.AppRouter.createRouter === "function") {
      engineState.router = window.AppRouter.createRouter({
        mode: normalizeToString(config.routerMode) || "hash",
        onNavigate(route) {
          engineState.publicApi.navigate(route.page, route.query, { fromRouter: true });
        }
      });
      engineState.router.start();
    } else {
      const initialPageName = resolveInitialPageName();
      if (initialPageName) {
        engineState.publicApi.navigate(initialPageName);
      } else {
        logger.warn("PAGE_NONE", "No pages registered. Add at least one <page name=\"...\"> inside <app>.");
      }
    }

    // Runs after flushQueuedCalls so use() calls queued pre-boot are installed first.
    runPluginsOnReady();
  }

 /**
 * The single gate into the boot sequence. Called by both CLERA.start()
 * and attemptAutoStart() - never directly.
 *
 * On first call:
 * 1. Sets isStarted immediately, locking config and blocking auto-start.
 * 2. Merges any call-time config into pendingConfig.
 * 3. Finalises engineState.config (same object reference as pendingConfig).
 * 4. Creates the logger (dev mode is now known).
 * 5. Attaches the diagnostics module so early boot logs are captured.
 * 6. Runs runBootSequence() - synchronously if DOM is ready, otherwise
 * deferred to DOMContentLoaded.
 *
 * On subsequent calls: emits [CLERA:DOUBLE_START] and returns immediately.
 * The runtime always boots exactly once.
 *
 * @param {object} [callTimeConfig] Config from CLERA.start(config) - merged
 * into pendingConfig before boot.
 */
  function internalStart(callTimeConfig) {
 // Guard: only one boot per page lifetime.
    if (engineState.isStarted) {
 // Logger may already exist if start() was called before (isBooted=true by now).
 // Fall back to a dev-mode logger if somehow it isn't set yet.
      const logger = engineState.logger || createLogger(true);
      logger.warn(
        "DOUBLE_START",
        "CLERA.start() called more than once. The runtime boots exactly once. ignoring."
      );
      return;
    }
    engineState.isStarted = true;

 // Call-time config takes precedence so developers can override defaults
 // set by plugins or earlier CLERA.configure() calls without re-ordering.
    if (isPlainObject(callTimeConfig)) {
      Object.assign(engineState.pendingConfig, callTimeConfig);
    }

 // Finalise the live config reference used throughout the runtime.
    engineState.config = engineState.pendingConfig;

    engineState.logger         = createLogger(!!engineState.config.dev);
    engineState.maxCachedPages = Number(engineState.config.maxCachedPages || 0) || 0;

 // Attach diagnostics before the boot sequence so early boot logs are captured.
    attachDiagnosticsModule(engineState.publicApi);

 // Expose config on the public API so plugins and tests can read it.
    engineState.publicApi.config = engineState.config;

 // Defer to DOMContentLoaded when the document is still parsing.
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", runBootSequence, { once: true });
    } else {
      runBootSequence();
    }
  }

 /**
 * Auto-start handler - fires on DOMContentLoaded when no explicit
 * CLERA.start() call was made (Mode 1: auto-start).
 *
 * Bails silently when:
 * - isStarted is true: start() was already called, nothing to do.
 * - pendingConfig.autoStart === false: developer disabled auto-start
 * intentionally, expecting to call start() themselves later.
 */
  function attemptAutoStart() {
 // Bail if start() was called explicitly. It already handled boot.
    if (engineState.isStarted) return;

 // Bail if the developer set autoStart: false in config() to delay boot.
    if (engineState.pendingConfig.autoStart === false) return;

 // No explicit start, no delay flag. Boot with accumulated config.
    internalStart();
  }


  const CLERA = {
    version: CLERA_VERSION,

 /**
 * Declare configuration for the runtime without triggering boot.
 *
 * Clera supports three startup modes - config() is used in two of them:
 *
 * Mode 1 - Auto-start (beginner default):
 * CLERA.config({ initial: "home", dev: true });
 * // No start() call needed. Runtime boots automatically on DOMContentLoaded.
 *
 * Mode 3 - Staged configuration (config declared before explicit boot):
 * CLERA.config({ dev: true });
 * CLERA.start({ initial: "home" });
 * // config() and start() contribute to the same merged config object.
 *
 * Mode 2 - Explicit start (no config() needed - pass config directly):
 * CLERA.start({ initial: "home", dev: true });
 *
 * Rules:
 * - config() accumulates into a pending config object via shallow merge.
 * - config() never triggers boot - that is start()'s job.
 * - Must be called before start(). Once start() is called, configuration
 * is locked and further calls warn ([CLERA:CONFIG_AFTER_START]) and
 * return false.
 * - autoStart: false disables auto-start, allowing start() to be called
 * later (e.g. after an async permission check).
 *
 * @param {object} incomingConfig Config object - same keys as start().
 * @returns {boolean} True if accepted, false if ignored.
 */
    config(incomingConfig) {
 // Once start() has been called, config is finalised. Reject further changes.
 // Guard uses isStarted (not isBooted) because internalStart() locks in the
 // config object reference immediately, before runBootSequence() runs.
 // Checking only isBooted would leave a window where config() silently mutates
 // the already-resolved config while the DOM is still loading.
      if (engineState.isStarted) {
        const logger = engineState.logger || createLogger(true);
        logger.warn(
          "CONFIG_AFTER_START",
          "CLERA.config() called after start(). Configuration is already finalised. ignoring."
        );
        return false;
      }

      if (!isPlainObject(incomingConfig)) return false;

 // Shallow merge. Nested objects (like serviceWorker: {}) overwrite entirely.
      Object.assign(engineState.pendingConfig, incomingConfig);
      return true;
    },

 /**
 * Boot the runtime, optionally providing configuration.
 *
 * Clera supports three startup modes - start() is used in two of them:
 *
 * Mode 1 - Auto-start (no start() call required):
 * // Omit start() entirely. Runtime boots automatically on DOMContentLoaded
 * // using any config accumulated via CLERA.config().
 *
 * Mode 2 - Explicit start (config + boot in one call):
 * CLERA.start({ initial: "home", dev: true });
 * // Boots immediately (or on DOMContentLoaded if DOM is still parsing).
 * // Calling start() suppresses auto-start automatically - no need to
 * // set autoStart: false to prevent double-boot.
 *
 * Mode 3 - Staged configuration (config declared separately, then boot):
 * CLERA.config({ dev: true });
 * CLERA.start({ initial: "home" });
 * // Both calls contribute to the same merged config object.
 * // Useful when config must be split across modules or timing boundaries.
 *
 * Rules:
 * - start() triggers boot exactly once per page lifetime.
 * - A second call to start() is ignored and emits [CLERA:DOUBLE_START].
 * - start() locks configuration - CLERA.config() is rejected after this point.
 * - If the DOM is still parsing, boot is deferred to DOMContentLoaded.
 *
 * @param {object} [startConfig] Optional config merged with any prior config() calls.
 */
    start(startConfig) {
      internalStart(isPlainObject(startConfig) ? startConfig : undefined);
    },

 /**
 * Attach actions and lifecycle hooks to a registered page.
 * @param {string} pageName
 * @param {object} pageConfig { actions?, onCreate?, onShow?, onHide?, onDestroy? }
 * @returns {boolean}
 */
    page(pageName, pageConfig) {
      if (!engineState.isBooted) { queueCall("page", arguments); return true; }
      const logger = engineState.logger || createLogger(true);
      const name   = normalizeToString(pageName);
      if (!name) { logger.warn("PAGE_CFG_NO_NAME", "CLERA.page() called without pageName."); return false; }
      const targetPageRecord = engineState.pageRegistry.get(name);
      if (!targetPageRecord) { logger.warn("PAGE_CFG_NOT_FOUND", `CLERA.page("${name}"). page not registered in HTML.`); return false; }
      const resolvedPageConfig = isPlainObject(pageConfig) ? pageConfig : Object.create(null);
      if (isPlainObject(resolvedPageConfig.actions)) {
        Object.keys(resolvedPageConfig.actions).forEach((actionName) => { if (typeof resolvedPageConfig.actions[actionName] === "function") targetPageRecord.actions[actionName] = resolvedPageConfig.actions[actionName]; });
      }
      if (typeof resolvedPageConfig.onCreate  === "function") targetPageRecord.lifecycle.onCreate  = resolvedPageConfig.onCreate;
      if (typeof resolvedPageConfig.onShow    === "function") targetPageRecord.lifecycle.onShow    = resolvedPageConfig.onShow;
      if (typeof resolvedPageConfig.onHide    === "function") targetPageRecord.lifecycle.onHide    = resolvedPageConfig.onHide;
      if (typeof resolvedPageConfig.onDestroy === "function") targetPageRecord.lifecycle.onDestroy = resolvedPageConfig.onDestroy;
      return true;
    },

    registerComponent(tagName, componentConfig) { return registerComponent(tagName, componentConfig); },

    use(pluginObject) {
      if (!engineState.isBooted) { queueCall("use", arguments); return; }
      installPlugins([pluginObject]);
    },

    onLayoutChange(handler) { window.addEventListener("app:layoutchange", handler); },

    expand(navSelector) {
      const navEl = engineState.appRootElement?.querySelector(navSelector);
      if (navEl) { navEl.removeAttribute("collapsed"); const _l = engineState.appRootElement.getAttribute("layout") || "mobile"; applyNavPositions(engineState.appRootElement, _l); }
    },

    collapse(navSelector) {
      const navEl = engineState.appRootElement?.querySelector(navSelector);
      if (navEl) { navEl.setAttribute("collapsed", ""); const _l = engineState.appRootElement.getAttribute("layout") || "mobile"; applyNavPositions(engineState.appRootElement, _l); }
    },

    toggle(navSelector) {
      const navEl = engineState.appRootElement?.querySelector(navSelector);
      if (!navEl) return;
      if (navEl.hasAttribute("collapsed")) {
        navEl.removeAttribute("collapsed");
      } else {
        navEl.setAttribute("collapsed", "");
      }
      const _l = engineState.appRootElement.getAttribute("layout") || "mobile";
      applyNavPositions(engineState.appRootElement, _l);
    },

    layout() {
      return engineState.appRootElement
        ? engineState.appRootElement.getAttribute("layout") || "mobile"
        : "mobile";
    },

    platform() {
      return engineState.platform;
    },

    navigate(targetPageName, navigationParams, navigationOptions) {
      if (!engineState.isBooted) { queueCall("navigate", arguments); return true; }
      const logger = engineState.logger || createLogger(true);
      const name   = normalizeToString(targetPageName);
      if (!name) { logger.warn("NAV_NO_PAGE", "CLERA.navigate() called without pageName."); return false; }

      const fromRouter = navigationOptions && navigationOptions.fromRouter;
      if (!fromRouter && engineState.router && typeof engineState.router.navigate === "function") {
        engineState.router.navigate(name, isPlainObject(navigationParams) ? navigationParams : Object.create(null));
      }

      const record = engineState.pageRegistry.get(name);
      if (!record) { logger.warn("NAV_NOT_FOUND", `Page "${name}" not registered.`); return false; }

      hideCurrentPageIfAny();
      record.params = isPlainObject(navigationParams) ? navigationParams : Object.create(null);
      mountPageIfNeeded(record);
      showPage(record);
      engineState.navigationStack.push({ pageName: name, params: record.params });

 // Persist the active page so reload restores it (requires persistPage: true in config).
      if (engineState.config.persistPage === true) {
        try { localStorage.setItem(ACTIVE_PAGE_STORAGE_KEY, name); } catch (_) {}
      }

      return true;
    }
  };

  Object.defineProperty(CLERA, "actions", {
    get()  { return engineState.globalActions; },
    set(incomingActionMap) {
      if (!isPlainObject(incomingActionMap)) return;
      Object.keys(incomingActionMap).forEach((actionName) => { if (typeof incomingActionMap[actionName] === "function") engineState.globalActions[actionName] = incomingActionMap[actionName]; });
    },
    configurable: true,
    enumerable:   true
  });

 //   Namespace wiring
 // app. Primary developer-facing runtime API. Recommended for all standard
 // application development (app.navigate(), app.data(), app.page(), ...).
 // CLERA. Silent alias for app. Retained for internal and legacy compatibility.
 // clera. Silent alias for app. Represents the platform/ecosystem namespace;
 // reserved for advanced runtime, debugging, and tooling usage.
  window.app   = CLERA;
  window.CLERA = CLERA;
  window.clera = CLERA;

 // Implicit action context. Available as a bare name inside any Clera action
 // handler or lifecycle hook. Set before each call, cleared after.
 // enumerable:false. Invisible to for..in / Object.keys
 // configurable:true. Test environments can mock or override
  Object.defineProperty(window, "context", {
    get() {
      const ctx = _currentContext();
      if (ctx === null) {
        engineState.logger.error(
          "CONTEXT_OUTSIDE_HANDLER",
          "context accessed outside an active handler. " +
          "context is only available inside action handlers and lifecycle hooks."
        );
      }
      return ctx;
    },
    configurable: true,
    enumerable:   false,
  });

 // Legacy proxy - PWA.* / pwa.* were the old namespace before Clera 1.x.
 // Forward all accesses to the live runtime with a deprecation warning so
 // existing apps don't hard-crash, but developers are prompted to migrate.
  const legacyProxy = new Proxy(CLERA, {
    get(target, prop, receiver) {
      if (engineState.logger) {
        engineState.logger.warn("DEPRECATED_NAMESPACE", `"PWA.${String(prop)}" is deprecated. Use "app.${String(prop)}" instead.`);
      }
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) { return Reflect.set(target, prop, value, receiver); }
  });

  window.PWA = legacyProxy;
  window.pwa = legacyProxy;

  engineState.publicApi = CLERA;


 /** Return the name of the currently visible page, or null. */
  CLERA.currentPage = function () { return engineState.currentPageName || null; };

 /**
 * Attach global data available across the entire app.
 * Merges into the global data scope by reference - does not replace.
 * Bound keys are exposed directly on CLERA.* for natural read/write access.
 *
 * const user = { name: "Michael" };
 * CLERA.data({ user });
 *
 * // Read anywhere:
 * CLERA.user.name // "Michael"
 *
 * // Mutate inside Clera-controlled execution - DOM updates automatically:
 * function rename(context) { CLERA.user.name = "Paul"; }
 *
 * // Mutate outside Clera-controlled execution - call CLERA.update() manually:
 * CLERA.user.name = "Paul";
 * CLERA.update();
 */
  CLERA.data = function (sourceObject) {
    if (!isPlainObject(sourceObject)) return;
    Object.assign(engineState.globalData, sourceObject);
 // Expose each key directly on CLERA. Reserved keys are rejected with a warning
    exposeDataKeys(sourceObject, CLERA, RESERVED_CLERA_KEYS);
  };

 /**
 * Manually trigger a DOM binding patch for the currently visible page.
 * Use when global data is mutated outside Clera-controlled execution.
 *
 * CLERA.user.name = "Paul";
 * CLERA.update();
 */
  CLERA.update = function () {
    const pageName = engineState.currentPageName;
    if (!pageName) return;
    const pageRecord = engineState.pageRegistry.get(pageName);
    if (pageRecord) patchBindings(pageRecord);
  };

 /**
 * Map one object into one <use> string by resolving {key} placeholders.
 *
 * This is a pure string helper - it does NOT loop, does NOT touch the DOM,
 * and does NOT render anything. The developer owns the loop.
 *
 * for (const product of products) {
 * html += CLERA.map(product, `<use template="card" />`);
 * }
 * context.render("#list", html);
 *
 * {key} placeholders are resolved from the data object.
 * ${} template literals are handled by JavaScript before CLERA.map() runs.
 * These are two separate stages - they do not conflict.
 *
 * @param {object} dataObject Source object for {key} resolution
 * @param {string} useString Template string containing {key} placeholders
 * @returns {string} Resolved string with all {key} replaced
 */
  CLERA.sanitize = sanitizeHTML;

  CLERA.map = function (dataObject, useString) {
    if (!isPlainObject(dataObject) || typeof useString !== "string") return useString || "";
    return useString.replace(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g, (_, key) => {
      const value = dataObject[key];
      return value !== undefined && value !== null ? String(value) : "";
    });
  };

 /**
 * CLERA.memory - global non-binding storage.
 *
 * Plain object. Assign and mutate freely. Clera never watches it,
 * never patches it, and never includes it in the binding engine.
 *
 * Use it to hold raw datasets, cached API results, and any state
 * that does not need to drive the UI directly.
 *
 * Flow: CLERA.memory -> CLERA.data / context.data -> UI
 *
 * CLERA.memory.products = result.products;
 *
 * context.data({
 * visibleProducts: CLERA.memory.products.slice(0, 40)
 * });
 *
 * NOTE: {memory.x} bindings in HTML are not supported - memory is not
 * in the binding engine's resolution chain. They will resolve to "".
 */
  CLERA.memory = engineState.memory;

 /* ============================================================================
 Global execution helpers
 ----------------------------------------------------------------------------
 CLERA.timeout, CLERA.interval, CLERA.listen, CLERA.run

 Each helper wraps an external execution source (timer, interval, DOM event,
 or arbitrary callback) and re-enters Clera's controlled execution cycle patching the current visible page's bindings after the callback completes.

 Shared internal helper runs a callback inside Clera-controlled execution
 and patches bindings on the current visible page afterwards.

 Error handling: logs the error and continues. Patch still fires.
 ============================================================================ */

  function runControlledGlobalCallback(callback, errorCode) {
    const logger = engineState.logger;
    let result;
    try {
      result = callback();
    } catch (err) {
      if (logger) logger.error(errorCode || "GLOBAL_CALLBACK_THROW", "CLERA global helper callback threw.", err);
    }
 // Fix #17 - if callback returns a Promise, patch bindings after it settles
 // so that async actions (fetch, await, etc.) trigger a re-render on completion.
    const doPatch = () => {
      const pageName = engineState.currentPageName;
      if (pageName) {
        const pageRecord = engineState.pageRegistry.get(pageName);
        if (pageRecord) patchBindings(pageRecord);
      }
    };
    if (result instanceof Promise) {
      result.then(doPatch, (err) => {
        if (logger) logger.error(errorCode || "GLOBAL_CALLBACK_THROW", "CLERA async global helper rejected.", err);
      });
    } else {
      doPatch();
    }
  }

 /**
 * CLERA.timeout(callback, delay) - Clera-aware global setTimeout.
 *
 * Executes callback inside Clera's controlled execution cycle and patches
 * bindings on the current visible page after the callback completes.
 * Use outside page context - use context.timeout() inside action handlers.
 *
 * CLERA.timeout(() => {
 * CLERA.data({ status: "Ready" });
 * }, 1000);
 *
 * @param {function} callback
 * @param {number} delay Milliseconds before callback fires
 * @returns {number} Native timer ID - cancel with clearTimeout()
 */
  CLERA.timeout = function (callback, delay) {
    return setTimeout(() => {
      runControlledGlobalCallback(callback, "TIMEOUT_CALLBACK_THROW");
    }, Number(delay) || 0);
  };

 /**
 * CLERA.interval(callback, delay) - Clera-aware global setInterval.
 *
 * Executes callback inside Clera's controlled execution cycle and patches
 * bindings on the current visible page after each tick.
 *
 * const id = CLERA.interval(() => {
 * CLERA.data({ time: Date.now() });
 * }, 1000);
 *
 * clearInterval(id); // cancel when done
 *
 * @param {function} callback
 * @param {number} delay Milliseconds between ticks
 * @returns {number} Native interval ID - cancel with clearInterval()
 */
  CLERA.interval = function (callback, delay) {
    return setInterval(() => {
      runControlledGlobalCallback(callback, "INTERVAL_CALLBACK_THROW");
    }, Number(delay) || 0);
  };

 /**
 * CLERA.listen(target, event, callback, options?) - Clera-aware addEventListener.
 *
 * Attaches an event listener that executes inside Clera's controlled execution
 * cycle and patches bindings on the current visible page after each event.
 * Returns an unsubscribe function for clean teardown.
 *
 * const off = CLERA.listen(window, "resize", () => {
 * CLERA.data({ width: window.innerWidth });
 * });
 *
 * off(); // remove the listener
 *
 * @param {EventTarget} target Any object with addEventListener
 * @param {string} eventName Event type (e.g. "resize", "message")
 * @param {function} callback Handler - receives the native Event as first argument
 * @param {object} [options] Passed directly to addEventListener
 * @returns {function} Unsubscribe function - call to remove listener
 */
  CLERA.listen = function (target, eventName, callback, options) {
    if (!target || typeof target.addEventListener !== "function") {
      if (engineState.logger) engineState.logger.warn("LISTEN_INVALID_TARGET", "CLERA.listen(). target must have addEventListener.");
      return function () {};
    }
    const handler = function (nativeEvent) {
      runControlledGlobalCallback(
        () => { callback(nativeEvent); },
        "LISTEN_CALLBACK_THROW"
      );
    };
    target.addEventListener(eventName, handler, options);
    return function () {
      target.removeEventListener(eventName, handler, options);
    };
  };

 /**
 * CLERA.run(callback) - re-enter Clera's execution cycle from external code.
 *
 * Executes callback immediately inside Clera's controlled execution cycle
 * and patches bindings on the current visible page after it completes.
 * Use to integrate third-party APIs, WebSocket handlers, or any external
 * callback source that cannot use context.* APIs.
 *
 * // WebSocket
 * socket.onmessage = (event) => {
 * CLERA.run(() => {
 * messages.push(JSON.parse(event.data));
 * });
 * };
 *
 * // Third-party SDK
 * stripeSDK.onPaymentComplete((result) => {
 * CLERA.run(() => {
 * CLERA.data({ paymentStatus: result.status });
 * });
 * });
 *
 * @param {function} callback Executed synchronously inside Clera's cycle
 */
  CLERA.run = function (callback) {
    runControlledGlobalCallback(callback, "RUN_CALLBACK_THROW");
  };

 /**
 * Hot-patch a page template (dev/IDE only - not stable public API).
 * @param {string} targetPageName
 * @param {string} replacementHtml
 * @returns {boolean}
 */
  CLERA.__patchPage = function (targetPageName, replacementHtml) {
    const record = engineState.pageRegistry.get(targetPageName);
    if (!record) return false;
    const sanitizedHtml = normalizeUseElements(sanitizeHTML(replacementHtml));
    record.templateHtml = sanitizedHtml;
    if (record.rootElement) {
      record.rootElement.innerHTML = sanitizedHtml;
      parseComponentsWithin(record.rootElement);
      bindActionsWithin(record);
 // Full page rescan. Resets bindingNodes to prevent stale node accumulation
      scanBindings(record.rootElement, record, true);
      patchBindings(record);
    }
    return true;
  };

 /* ============================================================================
 Auto-start registration (Mode 1)
 ----------------------------------------------------------------------------
 Registers the DOMContentLoaded listener that makes CLERA.start() optional.
 attemptAutoStart() bails if start() was already called or if the developer
 set autoStart: false to control boot timing manually.

 Timing:
 - DOM still loading -> register a one-time DOMContentLoaded listener.
 - DOM already ready -> schedule a microtask so same-tick config() and
 page() calls land before auto-start fires.

 autoStartScheduled prevents duplicate registration if the IIFE ever runs
 more than once in the same page lifetime.
 ============================================================================ */
  if (!engineState.autoStartScheduled) {
    engineState.autoStartScheduled = true;

    if (document.readyState === "loading") {
 // DOM still parsing. Fire after it finishes.
      document.addEventListener("DOMContentLoaded", attemptAutoStart, { once: true });
    } else {
 // DOM already ready. Microtask lets same-tick config/page calls land first.
      Promise.resolve().then(attemptAutoStart);
    }
  }

})();
