export class LayoutMode {
  private container: HTMLElement;
  private isActive = false;
  private shadowRoot: ShadowRoot;

  constructor(shadowRoot: ShadowRoot) {
    this.shadowRoot = shadowRoot;
    
    const style = document.createElement('style');
    style.textContent = `
      .pinmark-layout-sidebar {
        position: fixed;
        top: 0;
        right: 0;
        width: 250px;
        height: 100vh;
        background: var(--pmk-bg-2, #111827);
        border-left: 1px solid var(--pmk-border, #374151);
        z-index: 2147483646;
        display: none;
        flex-direction: column;
        padding: 16px;
        box-sizing: border-box;
        overflow-y: auto;
        color: var(--pmk-text, #f9fafb);
      }
      .pinmark-layout-sidebar.active {
        display: flex;
      }
      .pinmark-layout-title {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 16px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--pmk-text-muted, #9ca3af);
      }
      .pinmark-component-item {
        background: var(--pmk-bg-3, #374151);
        border: 1px solid var(--pmk-border, #4b5563);
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 8px;
        cursor: grab;
        font-size: 13px;
        display: flex;
        align-items: center;
        transition: border-color 0.2s;
      }
      .pinmark-component-item:hover {
        border-color: var(--pmk-accent, #3b82f6);
      }
      .pinmark-component-item:active {
        cursor: grabbing;
      }
    `;
    this.shadowRoot.appendChild(style);

    this.container = document.createElement('div');
    this.container.className = 'pinmark-layout-sidebar';
    this.shadowRoot.appendChild(this.container);

    this.renderPalette();
    this.setupGlobalDragDrop();
  }

  private renderPalette() {
    const title = document.createElement('div');
    title.className = 'pinmark-layout-title';
    title.textContent = 'Components';
    this.container.appendChild(title);

    const components = [
      { type: 'button', label: 'Primary Button', html: '<button style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">Button</button>' },
      { type: 'card', label: 'Container Card', html: '<div style="padding: 24px; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; min-height: 100px;"></div>' },
      { type: 'text', label: 'Text Block', html: '<p style="font-family: sans-serif; color: #374151; line-height: 1.5;">This is a text block. You can edit this content directly.</p>' },
      { type: 'image', label: 'Image Placeholder', html: '<div style="width: 100%; height: 200px; background: #e5e7eb; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-family: sans-serif; border-radius: 4px;">Image Placeholder</div>' }
    ];

    components.forEach(comp => {
      const item = document.createElement('div');
      item.className = 'pinmark-component-item';
      item.textContent = comp.label;
      item.draggable = true;
      item.addEventListener('dragstart', (e) => {
        if (e.dataTransfer) {
          e.dataTransfer.setData('text/html', comp.html);
          e.dataTransfer.setData('application/x-pinmark-type', comp.type);
          e.dataTransfer.effectAllowed = 'copy';
        }
      });
      this.container.appendChild(item);
    });
  }

  private setupGlobalDragDrop() {
    // Note: To make an element a valid drop target, we must prevent default on dragover
    document.addEventListener('dragover', (e) => {
      if (!this.isActive) return;
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    });

    document.addEventListener('drop', (e) => {
      if (!this.isActive) return;
      e.preventDefault();

      const html = e.dataTransfer?.getData('text/html');
      const target = e.target as HTMLElement;

      if (html && target && target !== document.body) {
        // Simple DOM injection
        // If dropping inside an existing element, append it.
        const wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        const newElement = wrapper.firstElementChild;
        if (newElement) {
          target.appendChild(newElement);
        }
      } else if (html) {
        // Dropped on body
        const wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        const newElement = wrapper.firstElementChild as HTMLElement;
        if (newElement) {
          newElement.style.position = 'absolute';
          newElement.style.left = `${e.pageX}px`;
          newElement.style.top = `${e.pageY}px`;
          document.body.appendChild(newElement);
        }
      }
    });
  }

  toggle() {
    this.isActive = !this.isActive;
    if (this.isActive) {
      this.container.classList.add('active');
      this.enableElementDragging();
    } else {
      this.container.classList.remove('active');
      this.disableElementDragging();
    }
  }

  private enableElementDragging() {
    // Optionally make existing elements draggable
    // In a full implementation, we'd add listeners to all DOM nodes
  }

  private disableElementDragging() {
    // Clean up
  }
}
