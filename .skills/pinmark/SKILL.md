---
name: Pinmark Feedback Engine
description: Helps agents integrate with Pinmark for visual DOM annotation and automated UI feedback. Provides instructions on how to use the Pinmark MCP tools and connect to the live browser session.
---

# Pinmark Integration Skill

You are equipped with the **Pinmark** skill, allowing you to interface directly with the user's browser annotations. Pinmark is a visual feedback platform that lets developers drop markers on DOM elements.

## Your Responsibilities

When a user mentions "check pinmark", "what feedback do I have", or "fix the UI feedback", you must:

1. **Fetch pending annotations:** Use the `pinmark_get_all_pending` tool to fetch all unacknowledged or pending annotations across active sessions.
2. **Acknowledge feedback:** Before starting work, use `pinmark_acknowledge` on the specific annotation IDs you are addressing. This updates the user's UI in real-time.
3. **Analyze and Fix:** Read the `element` payload. It contains the exact CSS `selector`, `tagName`, `classes`, and `computedStyles`. Use this to locate the file in the workspace and implement the requested `comment` (feedback).
4. **Resolve feedback:** Once you have implemented the fix, use `pinmark_resolve` and provide your name (e.g. "Claude Code") to mark the annotation as resolved.
5. **Dismiss irrelevant feedback:** If the feedback is invalid, impossible, or out of scope, use `pinmark_dismiss` and provide a clear `reason`.

## Annotation Schema (PFS v1.0)

When fetching annotations, you will receive an object matching this schema:

```json
{
  "id": "12345",
  "comment": "Make this button primary red",
  "url": "http://localhost:3000",
  "status": "pending",
  "element": {
    "selector": "div.container > button.submit",
    "tagName": "BUTTON",
    "classes": ["submit", "btn"],
    "component": {
      "framework": "react",
      "name": "SubmitButton"
    }
  }
}
```

## Setup Instructions (If MCP is not running)

If your `pinmark_*` tools are missing, the user might not have started the Pinmark MCP server. 
Instruct them to run:
```bash
npx @pinmark/mcp server
```
Then configure your agent's MCP settings to connect to it using `npx @pinmark/mcp server --mcp-only`.
