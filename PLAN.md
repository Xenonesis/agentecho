# Plan: Agentation vs Pinmark Feature Comparison

## Context

The user wants a detailed feature-by-feature comparison between **Agentation** (https://www.agentation.com/features) and **Pinmark** (our codebase), identifying:
1. Features Agentation has that Pinmark is **missing**
2. Features Pinmark already has that **match or exceed** Agentation
3. Features Pinmark has that Agentation **lacks** (our advantages)

---

## Feature-by-Feature Comparison

### 1. 🎯 Text Selection Annotation

| Aspect | Agentation | Pinmark |
|--------|-----------|---------|
| Select text to annotate | ✅ | ✅ |
| Quoted text in output | ✅ | ✅ (selectionText field + "**Selected:**" in markdown) |
| Floating "Add Annotation" button on selection | ✅ | ✅ (`showSelectionButton()` in Overlay.ts) |

**Status: ✅ PARITY — Pinmark already matches Agentation**

---

### 2. 🛠️ Toolbar Controls

| Control | Agentation | Pinmark |
|---------|-----------|---------|
| Pause animations | ✅ | ✅ (P key + toolbar button + CSS injection to freeze) |
| Toggle marker visibility | ✅ | ✅ (H key + eye button) |
| Copy structured markdown | ✅ | ✅ |
| Clear all annotations | ✅ | ✅ |
| Send to webhook | ✅ | ✅ (configurable webhook URL) |
| Layout Mode | ✅ | ✅ (L key + layout button) |
| Settings | ✅ | ✅ (opens popup) |
| Draggable toolbar | ✅ | ✅ (`setupDragListeners()` in Toolbar.ts) |
| **Download JSON** | ❌ | ✅ (Pinmark exclusive) |
| **Create GitHub Issue** | ❌ | ✅ (Pinmark exclusive) |
| **Exit button** | ❌ | ✅ (Pinmark exclusive) |

**Status: ✅ PINMARK EXCEEDS — Has all Agentation controls + JSON download, GitHub Issues, Exit button**

---

### 3. 📌 Marker Types

| Marker Type | Agentation | Pinmark |
|-------------|-----------|---------|
| Single element selection | ✅ | ✅ |
| Multi-select (area, green) | ✅ | ✅ (green markers for multi/area) |
| Area drag selection | ✅ | ✅ (`AreaSelectionBox` with dashed blue border) |
| Text selection annotation | ✅ | ✅ |
| Edit/Delete/Copy per marker | ✅ | ✅ (popup on hover with edit, copy, delete buttons) |

**Status: ✅ PARITY**

---

### 4. 🔍 Smart Identification (for code search / grep)

| Aspect | Agentation | Pinmark |
|--------|-----------|---------|
| Elements named by text content | ✅ | ✅ (`getSmartName()` in HoverBox + MarkdownFormatter) |
| Buttons/links named by text | ✅ | ✅ |
| CSS selector generation | ✅ | ✅ (`SelectorGenerator.ts` — id, class, data-attr, path selectors) |
| Data attributes captured | ✅ | ✅ (`extractDataAttributes()` in ElementAnalyzer) |
| Tag name + classes in output | ✅ | ✅ |

**Status: ✅ PARITY — Both generate grep-friendly selectors**

---

### 5. 🎨 Computed Styles

| Aspect | Agentation | Pinmark |
|--------|-----------|---------|
| View computed CSS in popup | ✅ | ✅ (collapsible "Computed Styles" section in FeedbackModal) |
| Relevant properties (colors, fonts, spacing) | ✅ | ✅ (filters out none/normal/0px/transparent values) |
| In markdown output | ✅ | ✅ (forensic level: `#### Computed Styles` with JSON) |

**Status: ✅ PARITY**

---

### 6. ⚛️ React Component Detection

| Aspect | Agentation | Pinmark |
|--------|-----------|---------|
| Auto-detect React hierarchy | ✅ | ✅ (`FrameworkDetector.ts`) |
| Hover shows component tree | ✅ | ✅ (shown in HoverBox label + FeedbackModal) |
| Toggle on/off in settings | ✅ | ✅ (popup toggle) |
| **Angular detection** | ❌ | ✅ |
| **Vue detection** | ❌ | ✅ |
| **Svelte detection** | ❌ | ✅ |
| Source file + line number | ✅ | ✅ (from fiber `_debugSource` / Vue `__file`) |
| Output format adapts (Compact/Standard/Detailed/Forensic) | ✅ | ✅ (hierarchy shown in standard+, props in comprehensive+) |

**Status: ✅ PINMARK EXCEEDS — Detects 4 frameworks (React, Angular, Vue, Svelte) vs Agentation's React-only**

---

### 7. 📐 Layout Mode

| Aspect | Agentation | Pinmark |
|--------|-----------|---------|
| Press L to toggle | ✅ | ✅ |
| Component palette (drag to place) | ✅ (65+ types) | ✅ (30 types — fewer) |
| Rearrange existing sections | ✅ | ❌ **MISSING** |
| Wireframe mode (fade page, sketch layout) | ✅ | ✅ (wireframe toggle with opacity overlay) |
| Purpose field for context | ✅ | ❌ **MISSING** |
| Agent sync via MCP (placement/rearrange) | ✅ | ✅ (annotations saved with markerType/areaRect) |
| Opacity slider | ✅ | ❌ **MISSING** (binary toggle only) |

**Status: ⚠️ GAPS — Pinmark is missing: rearrange existing sections, purpose field, opacity slider. Also fewer component types (30 vs 65+).**

---

### 8. ⌨️ Keyboard Shortcuts

| Shortcut | Agentation | Pinmark |
|----------|-----------|---------|
| `Cmd+Shift+F` / `Ctrl+Shift+F` | Toggle feedback mode | Toggle feedback mode |
| `Esc` | Close toolbar / cancel | Close toolbar / deactivate |
| `L` | Layout mode | Layout mode |
| `P` | Pause/resume | Pause/resume |
| `H` | Hide/show markers | Hide/show markers |
| `C` | Copy feedback | Copy feedback |
| `X` | Clear all | ❌ **MISSING** (uses trash button instead) |
| `F` | ❌ | Freeze animations (CSS injection) |
| `Delete`/`Backspace` | ❌ | Delete last annotation |

**Status: ✅ MOSTLY PARITY — Pinmark missing `X` for clear, but has `F` for freeze + `Delete` for undo**

---

### 9. 🤖 Agent Sync (MCP Integration)

| Aspect | Agentation | Pinmark |
|--------|-----------|---------|
| MCP server integration | ✅ | ✅ (`@pinmark/mcp` package) |
| Annotations as structured data | ✅ | ✅ (full schema with zod validation) |
| Two-way communication | ✅ (agents can acknowledge, ask questions, resolve, dismiss) | ✅ (MCP tools: acknowledge, resolve, dismiss) |
| **Agent can ask questions** | ✅ | ❌ **MISSING** (no question/clarification flow) |
| **Agent can resolve with summary** | ✅ | ✅ (`pinmark_resolve` with agentName) |
| **Threading / replies** | ✅ | ✅ (`ThreadReplySchema` in core schema) |
| SSE real-time updates | ✅ | ✅ (`sse.ts` — broadcasts annotation updates) |
| HTTP API for extension sync | ✅ | ✅ (HTTP routes in `http-routes.ts`) |
| **Cross-page persistence** | ✅ (MCP server) | ✅ (MCP server stores sessions) |
| **Annotation Format Schema** | ✅ | ✅ (`@pinmark/core` schema.ts) |

**Status: ⚠️ MINOR GAP — Pinmark missing explicit "agent asks question" tool, but schema supports replies**

---

### 10. ⚙️ Settings

| Setting | Agentation | Pinmark |
|---------|-----------|---------|
| Output detail levels | ✅ (Compact, Standard, Detailed, Forensic) | ✅ (minimal/compact, standard, detailed, comprehensive, forensic) |
| Marker color | ✅ | ✅ (color picker + preset swatches) |
| Clear on copy/send | ✅ | ✅ (`clearAfterCopy`) |
| Block page interactions | ✅ | ✅ (`blockInteractions`) |
| Hide until restart | ✅ | ❌ **MISSING** |
| React components toggle | ✅ | ✅ (popup toggle) |
| **Theme (light/dark/auto)** | ❌ | ✅ (Pinmark exclusive) |
| **Webhook URL** | ✅ | ✅ |
| **GitHub integration** | ❌ | ✅ (token + repo config) |

**Status: ✅ MOSTLY PARITY — Pinmark missing "hide until restart" but adds theme + GitHub integration**

---

### 11. 📸 Screenshots & Image Editing

| Aspect | Agentation | Pinmark |
|--------|-----------|---------|
| Screenshots | ❌ (text-only output, explicitly listed as limitation) | ✅ (html2canvas capture per element) |
| Draw on screenshots | ❌ | ✅ (freehand drawing in FeedbackModal canvas) |
| Screenshot in markdown output | ❌ | ✅ (collapsible `<details>` in comprehensive+ levels) |

**Status: ✅ PINMARK EXCEEDS — Major advantage, Agentation explicitly lacks screenshots**

---

### 12. 🔴 State & Log Capture (Pinmark Exclusive)

| Feature | Agentation | Pinmark |
|---------|-----------|---------|
| Console log capture | ❌ | ✅ (intercepts console.log/warn/error) |
| Network request capture | ❌ | ✅ (intercepts XHR/Fetch) |
| Session recording (rrweb) | ❌ | ✅ (full DOM mutation recording) |
| Browser state (localStorage, sessionStorage, cookies) | ❌ | ✅ |
| Animations/transitions detection | ❌ | ✅ (CSS animation + transition analysis) |
| Accessibility info (aria, roles, tabindex) | ❌ | ✅ |

**Status: ✅ PINMARK EXCEEDS — All unique Pinmark features, Agentation has none of these**

---

## Summary: What's Missing in Pinmark

### Critical Gaps (should implement)
1. **Layout Mode — Rearrange existing sections** — Agentation allows grabbing and repositioning existing page elements, not just placing new ones
2. **Layout Mode — Component palette expansion** — Only 30 component types vs Agentation's 65+. Should add more (avatar, card grid, timeline, stepper, carousel, accordion, notification, progress bar, skeleton, etc.)
3. **Layout Mode — Purpose field** — When placing components, Agentation lets you add a text description of intent
4. **Layout Mode — Opacity slider for wireframe** — Agentation has a slider vs our binary toggle
5. **Keyboard shortcut `X` to clear all** — Minor but expected by Agentation users
6. **"Hide until restart" setting** — Persist marker visibility state

### Minor Gaps (nice to have)
7. **Agent "ask question" MCP tool** — Allow agents to request clarification on an annotation
8. **Annotation kind field** — Agentation uses `kind: "placement"` or `kind: "rearrange"` to distinguish layout annotations from feedback; Pinmark schema has the field but it's not actively used

### Already Implemented (parity or better)
- ✅ Text selection annotation with floating button
- ✅ All toolbar controls (pause, visibility, copy, clear, webhook, layout, settings)
- ✅ All marker types (single, multi, area)
- ✅ Smart element identification for grep
- ✅ Computed styles in popup + output
- ✅ React component detection (plus Angular, Vue, Svelte)
- ✅ MCP integration with two-way sync
- ✅ Full keyboard shortcuts (most match, some extras)
- ✅ Multiple output detail levels
- ✅ Draggable toolbar

### Pinmark Advantages Over Agentation
- 📸 Screenshots with drawing tools (Agentation is text-only)
- 🌐 Multi-framework detection (React + Angular + Vue + Svelte)
- 🔴 Console log capture
- 📡 Network request capture
- 🎬 Session recording (rrweb)
- 💾 Browser state capture (localStorage, sessionStorage, cookies)
- ♿ Accessibility info extraction
- 🎞️ Animation/transition detection
- 📥 JSON download
- 🐙 GitHub Issue creation
- 🎨 Light/dark/auto theme support
- ❄️ Freeze animations with F key (CSS injection)

---

## Recommended Implementation Steps

### Priority 1: Close Critical Gaps
- [x] Expand Layout Mode component palette to 65+ types
- [x] Add "rearrange existing sections" capability in Layout Mode
- [x] Add purpose/intent text field for layout placements
- [x] Add opacity slider for wireframe mode (replaces binary toggle)
- [x] Add `X` keyboard shortcut for clear all
- [x] Add "Hide until restart" setting

### Priority 2: Minor Enhancements
- [x] Add `pinmark_ask_question` MCP tool for agent clarification requests
- [x] Actively use `kind` field in annotations (set "placement"/"rearrange" for layout mode items)

### Priority 3: Verification
- [x] Build and test all changes
- [ ] Manual comparison against Agentation features page

## Files to Modify

| File | Changes |
|------|---------|
| `packages/pinmark/src/vanilla/Overlay.ts` | Layout mode enhancements (rearrange, purpose field, opacity slider, expanded palette) |
| `packages/pinmark/src/vanilla/Toolbar.ts` | No changes needed (all controls exist) |
| `packages/pinmark/src/core/types.ts` | Add `hideUntilRestart` setting |
| `packages/extension/src/popup/popup.ts` | Add hide-until-restart toggle |
| `packages/extension/src/popup/index.html` | Add hide-until-restart UI element |
| `packages/mcp/src/mcp-tools.ts` | Add `pinmark_ask_question` tool |
