import type { PinmarkSettings as ExtensionSettings } from '../core/types';
import type { PinmarkAnnotation as FeedbackItem } from '@pinmark/core';

export class MarkdownFormatter {
  format(url: string, feedback: FeedbackItem[], settings?: ExtensionSettings): string {
    const detail = settings?.outputDetail || 'standard';

    // Use the earliest captured timestamp so the report shows when
    // feedback was actually gathered, not the current system time.
    const ts = feedback.length > 0
      ? feedback.reduce((earliest, item) => item.timestamp < earliest ? item.timestamp : earliest, feedback[0].timestamp)
      : Date.now();

    let markdown = `# Pinmark Feedback Report\n`;
    markdown += `**URL:** ${url}\n`;
    markdown += `**Captured:** ${new Date(ts).toISOString().replace('T', ' ').substring(0, 19)}\n`;
    markdown += `**Total Items:** ${feedback.length}\n`;
    markdown += `\n---\n\n`;

    for (const item of feedback) {
      markdown += this.formatFeedback(item, detail);
      markdown += `\n---\n\n`;
    }

    return markdown;
  }

  /** Format a single feedback item (no report wrapper) for per-marker copy. */
  formatItem(item: FeedbackItem, settings?: ExtensionSettings): string {
    const detail = settings?.outputDetail || 'standard';
    let md = this.formatFeedback(item, detail);
    md = md.replace(/\n---\n\n$/, '');
    return md.trim() + '\n';
  }

  private formatFeedback(item: FeedbackItem, detail: 'minimal' | 'standard' | 'comprehensive'): string {
    let markdown = `## Feedback #${item.index}\n`;
    markdown += `> ${item.comment}\n\n`;

    if (item.category) {
      markdown += `**Category:** ${item.category}\n\n`;
    }

    markdown += `- **Element:** \`<${item.element.tagName}>\`\n`;
    markdown += `- **Selector:** \`${item.element.selector}\`\n`;

    if (detail === 'minimal') {
      return markdown;
    }

    if (item.element.classes.length > 0) {
      markdown += `- **Classes:** \`${item.element.classes.join('`, `')}\`\n`;
    }

    if (item.element.id) {
      markdown += `- **ID:** \`${item.element.id}\`\n`;
    }

    if (item.element.textContent) {
      markdown += `- **Text:** "${item.element.textContent}"\n`;
    }

    if (item.element.selectionText) {
      markdown += `- **Selected Text:** "${item.element.selectionText}"\n`;
    }

    if (item.areaRect) {
      markdown += `- **Area Selected:** x=${Math.round(item.areaRect.x)}, y=${Math.round(item.areaRect.y)}, w=${Math.round(item.areaRect.width)}, h=${Math.round(item.areaRect.height)}\n`;
    }

    if (item.element.component) {
      markdown += `- **Component:** \`${item.element.component.name}\` (${item.element.component.framework})\n`;
      if (item.element.component.hierarchy) {
        markdown += `  - **Hierarchy:** \`${item.element.component.hierarchy.join(' > ')}\`\n`;
      }
      if (item.element.component.filePath) {
        markdown += `  - **File:** \`${item.element.component.filePath}${item.element.component.lineNumber ? ':' + item.element.component.lineNumber : ''}\`\n`;
      }
    }

    if (detail === 'comprehensive') {
      if (Object.keys(item.element.dataAttributes).length > 0) {
        markdown += `- **Data Attributes:**\n`;
        for (const [key, value] of Object.entries(item.element.dataAttributes)) {
          markdown += `  - \`${key}\`: "${value}"\n`;
        }
      }

      const rect = item.element.boundingRect;
      markdown += `- **Position:** x=${Math.round(rect.x)}, y=${Math.round(rect.y)}, width=${Math.round(rect.width)}, height=${Math.round(rect.height)}\n`;

      if (item.element.component?.props) {
        markdown += `- **Component Props:**\n`;
        for (const [key, value] of Object.entries(item.element.component.props)) {
          markdown += `  - \`${key}\`: ${JSON.stringify(value).substring(0, 50)}\n`;
        }
      }
      if (item.element.accessibility) {
        markdown += `- **Accessibility:**\n`;
        for (const [key, value] of Object.entries(item.element.accessibility)) {
          markdown += `  - \`${key}\`: "${value}"\n`;
        }
      }

      if (item.state) {
        markdown += `- **Browser State:**\n`;
        if (item.state.cookies) markdown += `  - **Cookies:** \`${item.state.cookies.substring(0, 100)}${item.state.cookies.length > 100 ? '...' : ''}\`\n`;
        if (item.state.localStorage && Object.keys(item.state.localStorage).length > 0) markdown += `  - **LocalStorage Keys:** \`${Object.keys(item.state.localStorage).join(', ')}\`\n`;
        if (item.state.sessionStorage && Object.keys(item.state.sessionStorage).length > 0) markdown += `  - **SessionStorage Keys:** \`${Object.keys(item.state.sessionStorage).join(', ')}\`\n`;
      }

      if (item.element.screenshot) {
        markdown += `\n<details><summary>Element Screenshot</summary>\n\n<img src="${item.element.screenshot}" alt="Element" width="400" />\n\n</details>\n`;
      }
    }

    return markdown;
  }
}
