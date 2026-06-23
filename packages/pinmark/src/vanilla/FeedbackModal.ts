const MODAL_STYLES = `
  .pinmark-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2147483647;
    pointer-events: all;
  }

  .pinmark-modal {
    background: var(--pmk-bg);
    border-radius: 12px;
    padding: 24px;
    width: 400px;
    max-width: 90vw;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .pinmark-modal-title {
    color: var(--pmk-text);
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 16px 0;
  }

  .pinmark-modal-input {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid var(--pmk-border);
    border-radius: 8px;
    background: var(--pmk-bg-2);
    color: var(--pmk-text);
    font-size: 14px;
    outline: none;
    transition: border-color 0.15s ease;
    box-sizing: border-box;
    resize: vertical;
    min-height: 80px;
    font-family: inherit;
  }

  .pinmark-modal-input:focus {
    border-color: var(--pmk-accent);
  }

  .pinmark-modal-input::placeholder {
    color: var(--pmk-text-muted);
  }

  .pinmark-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 16px;
  }

  .pinmark-modal-btn {
    padding: 10px 18px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.15s ease, opacity 0.15s ease;
  }

  .pinmark-modal-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .pinmark-modal-btn.cancel {
    background: var(--pmk-bg-3);
    color: var(--pmk-text);
  }

  .pinmark-modal-btn.cancel:hover:not(:disabled) {
    background: #4b5563;
  }

  .pinmark-modal-btn.submit {
    background: var(--pmk-accent);
    color: white;
  }

  .pinmark-modal-btn.submit:hover:not(:disabled) {
    background: #2563eb;
  }

  .pinmark-modal-element-info {
    background: var(--pmk-bg-2);
    border-radius: 6px;
    padding: 10px 12px;
    margin-bottom: 16px;
    font-size: 12px;
    color: var(--pmk-text-muted);
    font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pinmark-modal-element-tag {
    color: #f472b6;
  }

  .pinmark-modal-element-class {
    color: #60a5fa;
  }

  .pinmark-modal-element-id {
    color: #fbbf24;
  }
`;

export type ModalResult = { comment: string; screenshot?: string } | null;

export class FeedbackModal {
  private shadowRoot: ShadowRoot;
  private modalOverlay: HTMLElement | null = null;
  private resolvePromise: ((result: ModalResult) => void) | null = null;

  constructor(shadowRoot: ShadowRoot) {
    this.shadowRoot = shadowRoot;
    this.injectStyles();
  }

  private injectStyles() {
    let styleElement = this.shadowRoot.querySelector('#pinmark-modal-styles');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'pinmark-modal-styles';
      this.shadowRoot.appendChild(styleElement);
    }
    (styleElement as HTMLStyleElement).textContent = MODAL_STYLES;
  }

  show(element: HTMLElement, existingComment?: string, screenshotUrl?: string): Promise<ModalResult> {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
      this.render(element, existingComment, screenshotUrl);
    });
  }

  private render(element: HTMLElement, existingComment?: string, screenshotUrl?: string) {
    // Create overlay
    this.modalOverlay = document.createElement('div');
    this.modalOverlay.className = 'pinmark-modal-overlay';
    this.modalOverlay.onclick = (e) => {
      if (e.target === this.modalOverlay) {
        this.close(null);
      }
    };

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'pinmark-modal';

    // Title
    const title = document.createElement('h3');
    title.className = 'pinmark-modal-title';
    title.textContent = existingComment ? 'Edit Feedback' : 'Add Feedback';

    // Element info
    const elementInfo = document.createElement('div');
    elementInfo.className = 'pinmark-modal-element-info';
    elementInfo.innerHTML = this.formatElementInfo(element);

    // Input
    const input = document.createElement('textarea');
    input.className = 'pinmark-modal-input';
    input.placeholder = 'Enter your feedback...';
    input.value = existingComment || '';

    let drawnScreenshot: string | undefined = screenshotUrl;

    if (screenshotUrl) {
      const markupContainer = document.createElement('div');
      markupContainer.style.marginTop = '16px';
      markupContainer.style.position = 'relative';
      markupContainer.style.border = '1px solid var(--pmk-border)';
      markupContainer.style.borderRadius = '8px';
      markupContainer.style.overflow = 'hidden';
      markupContainer.style.background = '#000';
      markupContainer.style.display = 'flex';
      markupContainer.style.flexDirection = 'column';

      const canvas = document.createElement('canvas');
      canvas.style.maxWidth = '100%';
      canvas.style.maxHeight = '200px';
      canvas.style.objectFit = 'contain';
      canvas.style.display = 'block';
      canvas.style.cursor = 'crosshair';
      
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
      };
      img.src = screenshotUrl;

      let isDrawing = false;
      canvas.onmousedown = (e) => {
        isDrawing = true;
        ctx?.beginPath();
        ctx?.moveTo(e.offsetX * (canvas.width / canvas.offsetWidth), e.offsetY * (canvas.height / canvas.offsetHeight));
      };
      canvas.onmousemove = (e) => {
        if (isDrawing && ctx) {
          ctx.lineTo(e.offsetX * (canvas.width / canvas.offsetWidth), e.offsetY * (canvas.height / canvas.offsetHeight));
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = Math.max(3, canvas.width / 100);
          ctx.stroke();
        }
      };
      const endDrawing = () => {
        if (isDrawing) {
          isDrawing = false;
          drawnScreenshot = canvas.toDataURL('image/jpeg', 0.8);
        }
      };
      canvas.onmouseup = endDrawing;
      canvas.onmouseleave = endDrawing;

      const hint = document.createElement('div');
      hint.textContent = 'Draw on the screenshot to add markup';
      hint.style.fontSize = '12px';
      hint.style.color = '#fff';
      hint.style.padding = '4px 8px';
      hint.style.background = 'rgba(0,0,0,0.5)';
      hint.style.position = 'absolute';
      hint.style.top = '0';
      hint.style.left = '0';
      hint.style.pointerEvents = 'none';

      markupContainer.appendChild(canvas);
      markupContainer.appendChild(hint);
      modal.appendChild(markupContainer);
    }

    const actions = document.createElement('div');
    actions.className = 'pinmark-modal-actions';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'pinmark-modal-btn cancel';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = () => this.close(null);

    const submitBtn = document.createElement('button');
    submitBtn.className = 'pinmark-modal-btn submit';
    submitBtn.textContent = existingComment ? 'Save' : 'Add';
    submitBtn.onclick = () => {
      const comment = input.value.trim();
      if (comment) {
        this.close({ comment, screenshot: drawnScreenshot });
      }
    };

    // Handle keyboard
    input.onkeydown = (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const comment = input.value.trim();
        if (comment) {
          this.close({ comment, screenshot: drawnScreenshot });
        }
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        this.close(null);
      }
      e.stopPropagation();
    };

    actions.appendChild(cancelBtn);
    actions.appendChild(submitBtn);

    modal.appendChild(title);
    modal.appendChild(elementInfo);
    modal.appendChild(input);
    modal.appendChild(actions);

    this.modalOverlay.appendChild(modal);
    this.shadowRoot.appendChild(this.modalOverlay);

    // Focus input
    setTimeout(() => input.focus(), 0);
  }

  private formatElementInfo(element: HTMLElement): string {
    const tag = element.tagName.toLowerCase();
    const id = element.id ? `<span class="pinmark-modal-element-id">#${element.id}</span>` : '';
    const classes = element.className && typeof element.className === 'string'
      ? element.className.split(' ').filter(c => c && !c.startsWith('pinmark')).slice(0, 3).map(c => `<span class="pinmark-modal-element-class">.${c}</span>`).join('')
      : '';
    
    return `<span class="pinmark-modal-element-tag">&lt;${tag}&gt;</span>${id}${classes}`;
  }

  private close(result: ModalResult) {
    if (this.modalOverlay) {
      this.modalOverlay.remove();
      this.modalOverlay = null;
    }
    if (this.resolvePromise) {
      this.resolvePromise(result);
      this.resolvePromise = null;
    }
  }

  isOpen(): boolean {
    return this.modalOverlay !== null;
  }
}
