<div align="center">

  <img src="assets/logo.png" alt="Pinmark" width="640">

  **Visual feedback annotation tool for developers**

  [![Website](https://img.shields.io/website?url=https%3A%2F%2Fxenonesis.github.io%2FPinmark%2F&style=flat-square&label=website)](https://xenonesis.github.io/Pinmark/)
  [![License: Polyform Noncommercial](https://img.shields.io/badge/License-Polyform_Noncommercial_1.0.0-red.svg?style=flat-square)](LICENSE.md)
  [![Chrome Version](https://img.shields.io/badge/Chrome-Manifest%20V3-green.svg?style=flat-square)](https://developer.chrome.com/docs/extensions/mv3/intro/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
  [![GitHub last commit](https://img.shields.io/github/last-commit/Xenonesis/Pinmark?style=flat-square)](https://github.com/Xenonesis/Pinmark/commits/main)
  [![GitHub stars](https://img.shields.io/github/stars/Xenonesis/Pinmark?style=flat-square)](https://github.com/Xenonesis/Pinmark/stargazers)

  [Features](#features) &bull; [Installation](#installation) &bull; [Usage](#usage) &bull; [Development](#development) &bull; [Website](https://xenonesis.github.io/Pinmark/)

  Place visual markers on any webpage element and generate AI-optimized Markdown feedback reports. Perfect for code reviews, bug reporting, and communicating with AI coding assistants.

</div>

---

## Features

### Annotation
- **Click to mark** — Click any DOM element to place a numbered marker with a feedback note
- **Hover preview** — Blue highlight box shows exactly what you're targeting before you click
- **Persistent markers** — Markers stay visible and positioned until cleared or the page reloads
- **Per-marker actions** — Hover a marker to see [**Copy**] [**Edit**] [**Delete**] actions (Copy grabs just that item's Markdown)

### Smart Analysis
- **Stable CSS selectors** — Generates unique, stable selectors via ID, classes, data attributes or nth-of-type path
- **Framework detection** — Detects React (fiber inspection) and Angular (debug properties); component names appear in the report
- **Comprehensive metadata** — Captures tag name, classes, IDs, data attributes, text content, bounding rect, and component props
- **Three detail levels** — `minimal` / `standard` / `comprehensive`

### Export
- **Full report copy** — `C` key or toolbar Copy button copies the entire Markdown report
- **Per-item copy** — Hover any marker and click Copy to grab just that one feedback item
- **AI-optimized format** — Structured Markdown that AI coding agents parse reliably
- **Clear after copy** — Optional setting auto-clears markers once copied

### Developer Experience
- **3-mode theme** — Light, dark, or auto (follows OS) for both popup AND overlay
- **Shadow DOM isolation** — Styles never fight the host page
- **Draggable toolbar** — Repositionable floating toolbar
- **Per-page persistence** — Feedback restored on revisit (keyed by origin + path)
- **Live settings sync** — Popup changes take effect in the overlay immediately
- **SPA-friendly** — Monitors URL changes via rAF + popstate/hashchange

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `C` | Copy full feedback report (only when no text is selected) |
| `H` | Toggle marker visibility |
| `Delete` / `Backspace` | Clear all markers (not in input fields) |
| `Escape` | Deactivate annotation mode |
| `Ctrl` / `⌘` + `Shift` + `A` | Deactivate globally |

---

## Installation

### From Source (Free)

```bash
# 1. Clone
git clone https://github.com/Xenonesis/Pinmark.git
cd Pinmark

# 2. Install dependencies
npm install

# 3. Build
npm run build       # production (dist/)
# or
npm run dev         # HMR via Vite + @crxjs

# 4. Load in Chrome
# chrome://extensions → Developer mode → Load unpacked → select dist/
```

> **Chrome Web Store** — coming soon. Build from source in the meantime.

---

## Usage

1. **Click the extension icon** in your browser toolbar to open Pinmark
2. **Click "Activate"** to enable annotation on the current page
3. **Hover** over any element to see the blue highlight box
4. **Click** an element to place a numbered marker
5. **Enter your feedback** in the modal that appears
6. **Repeat** for as many elements as needed
7. **Copy** — press `C` or click the toolbar Copy button, or hover a marker and click Copy

### Toolbar Controls

| Button | Action |
|--------|--------|
| Pause / Play | Toggle hover highlighting |
| Eye / Eye-off | Show / hide markers |
| Copy | Copy full report as Markdown |
| Trash | Clear all markers |

### Example Output

```markdown
# Pinmark Feedback Report

**URL:** https://example.com/dashboard
**Captured:** 2026-01-21 20:15:00
**Total Items:** 2

---

## Feedback #1
> The button text is hard to read on mobile

- **Element:** `<button>`
- **Selector:** `div.header > button.submit-btn`
- **Classes:** `submit-btn`, `primary`, `lg`
- **ID:** `submit-form`
- **Text:** "Submit Application"
- **Component:** `SubmitButton` (React)

---

## Feedback #2
> This section needs better spacing

- **Element:** `<section>`
- **Selector:** `main > section.hero:nth-of-type(1)`
- **Classes:** `hero`, `gradient-bg`

---
```

---

## Development

### Tech Stack

| Layer | Tech |
|---|---|
| Language | TypeScript 5.6 (strict) |
| Build | Vite 5 + @crxjs/vite-plugin |
| Extension API | Chrome Manifest V3 |
| Overlay isolation | Shadow DOM (open) |
| Storage | `chrome.storage.local` |
| Messaging | `chrome.runtime.onMessage` protocol |

### Project Structure

```
Pinmark/
├── manifest.json              # Chrome extension manifest (source)
├── vite.config.ts             # Vite + @crxjs configuration
├── tsconfig.json              # TypeScript config
├── package.json               # Dependencies & scripts
├── index.html                 # Landing page (GitHub Pages)
├── 404.html                   # Custom 404 page
├── favicon.svg                # SVG favicon
├── assets/                    # Icons, logo, demo gif
├── src/
│   ├── background/            # Service worker (message broker)
│   │   └── index.ts
│   ├── content/               # Injected into every page
│   │   ├── index.ts           # Entry: message handler, keyboard, SPA monitoring
│   │   ├── overlay/           # Visual UI (Shadow DOM components)
│   │   │   ├── Overlay.ts     # Container, event wiring, marker management
│   │   │   ├── HoverBox.ts    # Blue highlight box on hover
│   │   │   ├── MarkerManager.ts  # Marker dots, popups, callbacks
│   │   │   ├── Toolbar.ts     # Floating toolbar (pause, eye, copy, trash)
│   │   │   └── FeedbackModal.ts  # Edit/create feedback text input
│   │   ├── analyzers/         # DOM inspection
│   │   │   ├── ElementAnalyzer.ts    # Top-level analysis wrapper
│   │   │   ├── SelectorGenerator.ts  # Stable CSS selector generation
│   │   │   └── FrameworkDetector.ts  # React/Angular component detection
│   │   └── feedback/          # Markdown generation & storage
│   │       ├── FeedbackManager.ts    # CRUD for feedback items
│   │       └── MarkdownFormatter.ts  # Report formatting (3 detail levels)
│   ├── popup/                 # Extension popup UI
│   │   ├── index.html
│   │   ├── popup.css
│   │   └── popup.ts           # Settings panel, theme provider, activation
│   └── shared/                # Shared across contexts
│       ├── types.ts           # TypeScript interfaces & message types
│       ├── messaging.ts       # chrome.runtime.sendMessage wrappers
│       ├── storage.ts         # chrome.storage.local get/set helpers
│       └── theme-provider.ts  # 3-mode theme class (storage-agnostic)
└── dist/                      # Built output (gitignored, loaded as extension)
```

### Scripts

```bash
npm run dev           # Development mode with HMR
npm run build         # Production build (tsc + vite build)
npm run generate-icons # Regenerate PNG icons from SVG source
```

### Known Limitations

- Cannot inject into cross-origin iframes (browser security)
- Framework detection may fail on production/minified builds
- Selectors may break if DOM structure changes significantly
- `file://` URLs require enabling "Allow access to file URLs" in `chrome://extensions`

---

## Comparison: Pinmark vs Areshkew/agentecho

Pinmark is a maintained continuation of [Areshkew/agentecho](https://github.com/Areshkew/agentecho) — same Chrome Web Store listing (`fdkdjnebmcmlhnbecbfefebpdhihdjjb`), same extension ID, refreshed under a new name and active development.

### Shared Engine

| Feature | Both |
|---|---|
| Visual markers + hover outline | ✓ |
| Markdown feedback export | ✓ |
| Shadow DOM isolation | ✓ |
| Framework detection (React / Angular) | ✓ |
| Keyboard shortcuts | ✓ |
| Per-page feedback persistence | ✓ |
| Chrome MV3 · TypeScript 5.6 | ✓ |

### Pinmark Extensions

| Feature | Pinmark | Areshkew |
|---|---|---|
| Active maintenance & releases | ✓ | static since Jan 2026 |
| 3-mode theme works in popup + overlay | ✓ | stub select, system only |
| Unified `ThemeProvider` | ✓ | hardcoded theme |
| Typed `ExtensionSettings` | ✓ | `any` settings |
| Per-marker Copy button | ✓ | — |
| Live settings sync | ✓ | — |

---

## Author

Built and maintained by **[Xenonesis](https://github.com/Xenonesis)** (Aditya Kumar Tiwari).

- 🌍 Based in India
- 🔐 Cybersecurity · Full Stack · AI/ML
- 🧰 Stack: React, Next.js, Node.js, TypeScript, Python
- 🧠 Working in TensorFlow, PyTorch, Computer Vision, NLP, LLMs
- 🔗 [Portfolio](https://iaddy.netlify.app) · [LinkedIn](https://linkedin.com/in/aditya-kumar-tiwari) · [X / Twitter](https://twitter.com/XenonesisHacks) · [Email](mailto:contact@xenonesis.dev)

> *break things → understand them → make them unbreakable*

---

## License

**Polyform Noncommercial 1.0.0** — source-available, free for developers.

| You can | You can't |
|---|---|
| Read, build, and modify the source for personal use | Resell on Chrome Web Store or other marketplaces |
| Use it internally at your company | Bundle in a commercial product |
| Fork and modify it for your own needs | Offer as a hosted service |
| Contribute improvements via PR | Strip the license notice from forks |

[Full license text](LICENSE.md) · [Plain English breakdown](https://xenonesis.github.io/Pinmark/#license)
