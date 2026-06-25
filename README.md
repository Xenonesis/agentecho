<div align="center">

  <img src="packages/extension/assets/logo.png" alt="Pinmark" width="640">

  **Visual feedback annotation tool for developers with Agentation Parity & MCP Server**

  [![Chrome Version](https://img.shields.io/badge/Chrome-Manifest%20V3-green.svg?style=flat-square)](https://developer.chrome.com/docs/extensions/mv3/intro/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg?style=flat-square)](https://www.typescriptlang.org/)

  [Features](#features) &bull; [Installation](#installation) &bull; [Usage](#usage) &bull; [Architecture](#architecture)

  Place visual markers on any webpage element, draw annotations, capture network logs, and sync instantly with your AI agents via Local MCP Server. Perfect for code reviews, bug reporting, and communicating with Claude, Cursor, or ChatGPT.

  <video src="packages/extension/assets/pinmark.mp4" controls autoplay muted loop width="640" style="border-radius: 8px; margin-top: 16px;"></video>

</div>

---

## Features (Agentation Parity)

### 🎨 Visual Annotation & Editing
- **Area Drag Selection:** Draw boxes to select and markup entire UI sections, not just individual elements.
- **Image Editor:** Built-in drawing tools (arrows, circles, freehand) directly over the selected area.
- **Persistent markers** — Markers stay visible and positioned until cleared or the page reloads.

### 📡 State & Log Capture
- **Network Request Interception:** Automatically captures XHR and Fetch requests when you annotate.
- **Console Capture:** Grabs errors and warnings from the browser console to help AI debug instantly.
- **Comprehensive metadata** — Captures tag name, classes, IDs, data attributes, text content, bounding rect, and component props (React/Angular).

### 🤖 Local MCP Server Integration
- **Auto-Sync:** Every annotation and drawing is automatically POSTed to your local MCP Server (`http://127.0.0.1:4747`).
- **Cursor / Claude Integration:** Add the MCP server to Cursor or Claude Desktop, and AI agents can automatically fetch your exact drawings, screenshots, and console errors without copy-pasting!

### ☁️ GitHub Issue Creation
- Create comprehensive GitHub issues containing screenshots, logs, and Markdown directly from the extension.

---

## Installation

This project is structured as an NPM Monorepo using NPM Workspaces.

```bash
# 1. Clone
git clone https://github.com/Xenonesis/Pinmark.git
cd Pinmark

# 2. Install dependencies (Root)
npm install

# 3. Build all packages (@pinmark/core, @pinmark/pinmark, @pinmark/extension)
npm run build

# 4. Load in Chrome
# Go to chrome://extensions → Developer mode → Load unpacked
# Select the folder: packages/extension/dist/

# 5. (Optional) Run the Local MCP Server
npm run start -w @pinmark/mcp
```

---

## Usage

1. **Activate:** Hit `Ctrl+Shift+F` or click the extension icon to activate Pinmark.
2. **Select & Draw:** Click an element or drag a box. Use the Image Editor to draw arrows or circles over the UI.
3. **Write Feedback:** Type your instructions (e.g., "Make this button blue").
4. **Auto-Sync:** Once you save, the feedback is automatically sent to the MCP Server and copied to your clipboard as Markdown.

## Monorepo Architecture

Pinmark is split into independent packages for reusability:
- **`@pinmark/core`** - Shared types and utilities.
- **`@pinmark/pinmark`** - Core UI logic (Overlay, Toolbar, Feedback Modal, Drawing Tools). Framework-agnostic.
- **`@pinmark/extension`** - The Chrome Extension wrapper (Manifest V3, Service Workers, Content Scripts).
- **`@pinmark/mcp`** - The Local MCP and HTTP Server that exposes your feedback to AI Agents.
- **`@pinmark/server`** - Reserved for future cloud-backend implementations.

## License

**Polyform Noncommercial 1.0.0** — source-available, free for developers.
