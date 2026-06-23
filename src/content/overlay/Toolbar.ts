

const TOOLBAR_STYLES = `
  .pinmark-toolbar {
    position: fixed;
    top: 16px;
    left: calc(100vw - 320px);
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px;
    background: #1C1C1C;
    border-radius: 999px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08);
    z-index: 2147483646;
    pointer-events: all;
    cursor: move;
    user-select: none;
    transition: transform 0.2s ease;
  }

  .pinmark-toolbar:hover {
    transform: scale(1.02);
  }

  .pinmark-toolbar-btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: rgba(255, 255, 255, 0.85);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .pinmark-toolbar-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  .pinmark-toolbar-btn:active {
    transform: scale(0.95);
  }

  .pinmark-toolbar-btn.active {
    background: rgba(59, 130, 246, 0.25);
    color: #3b82f6;
  }

  .pinmark-toolbar-btn svg {
    width: 16px;
    height: 16px;
  }

  .pinmark-toolbar-divider {
    width: 1px;
    height: 16px;
    background: rgba(255, 255, 255, 0.15);
    margin: 0 4px;
  }

  .pinmark-tooltip {
    position: absolute;
    top: -30px;
    background: #111;
    color: #fff;
    font-size: 11px;
    padding: 4px 8px;
    border-radius: 6px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transform: translateY(4px);
    transition: all 0.15s ease;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .pinmark-toolbar-btn:hover .pinmark-tooltip {
    opacity: 1;
    transform: translateY(0);
  }

  .pinmark-toolbar-btn.exit-btn {
    background: rgba(255, 255, 255, 0.1);
  }
  .pinmark-toolbar-btn.exit-btn:hover {
    background: rgba(255, 60, 60, 0.2);
    color: #ff4444;
  }
`;

const ICONS = {
  pause: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`,
  play: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
  eyeOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>`,
  copy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2-2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  exit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
};

export class Toolbar {
  private element: HTMLElement;
  private isPaused = false;
  private markersVisible = true;

  onPauseToggle?: () => void;
  onMarkersToggle?: () => void;
  onCopy?: () => void;
  onClear?: () => void;
  onSettingsClick?: () => void;
  onExitClick?: () => void;

  constructor(shadowRoot: ShadowRoot) {
    const style = document.createElement('style');
    style.textContent = TOOLBAR_STYLES;
    shadowRoot.appendChild(style);

    this.element = this.createToolbar();
    shadowRoot.appendChild(this.element);

    this.setupDragListeners();
  }

  private setupDragListeners() {
    let isDragging = false;
    let currentX: number;
    let currentY: number;
    let initialX: number;
    let initialY: number;
    let xOffset = 0;
    let yOffset = 0;

    const dragStart = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('button')) return;

      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;

      if (e.target === this.element) {
        isDragging = true;
      }
    };

    const dragEnd = () => {
      initialX = currentX;
      initialY = currentY;
      isDragging = false;
    };

    const drag = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        xOffset = currentX;
        yOffset = currentY;
        this.setTranslate(currentX, currentY, this.element);
      }
    };

    this.element.addEventListener('mousedown', dragStart);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('mousemove', drag);
  }

  private setTranslate(xPos: number, yPos: number, el: HTMLElement) {
    el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
  }

  private createToolbar(): HTMLElement {
    const toolbar = document.createElement('div');
    toolbar.className = 'pinmark-toolbar';

    const pauseBtn = this.createButton('pause', 'Pause', 'pause');
    pauseBtn.onclick = (e) => {
      e.stopPropagation();
      this.togglePause();
      this.onPauseToggle?.();
    };

    const eyeBtn = this.createButton('eye', 'Toggle markers', 'markers');
    eyeBtn.classList.add('active');
    eyeBtn.onclick = (e) => {
      e.stopPropagation();
      this.toggleMarkers();
      this.onMarkersToggle?.();
    };

    const divider1 = document.createElement('div');
    divider1.className = 'pinmark-toolbar-divider';

    const copyBtn = this.createButton('copy', 'Copy to clipboard', 'copy');
    copyBtn.onclick = (e) => {
      e.stopPropagation();
      this.onCopy?.();
    };

    const clearBtn = this.createButton('trash', 'Clear all', 'clear');
    clearBtn.onclick = (e) => {
      e.stopPropagation();
      this.onClear?.();
    };

    const divider2 = document.createElement('div');
    divider2.className = 'pinmark-toolbar-divider';

    const settingsBtn = this.createButton('settings', 'Settings', 'settings');
    settingsBtn.onclick = (e) => {
      e.stopPropagation();
      this.onSettingsClick?.();
    };

    const divider3 = document.createElement('div');
    divider3.className = 'pinmark-toolbar-divider';

    const exitBtn = this.createButton('exit', 'Exit [Esc]', 'exit');
    exitBtn.onclick = (e) => {
      e.stopPropagation();
      this.onExitClick?.();
    };

    toolbar.appendChild(pauseBtn);
    toolbar.appendChild(eyeBtn);
    toolbar.appendChild(divider1);
    toolbar.appendChild(copyBtn);
    toolbar.appendChild(clearBtn);
    toolbar.appendChild(divider2);
    toolbar.appendChild(settingsBtn);
    toolbar.appendChild(divider3);
    toolbar.appendChild(exitBtn);

    return toolbar;
  }

  private createButton(iconKey: keyof typeof ICONS, title: string, action: string): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = 'pinmark-toolbar-btn';
    if (action === 'exit') {
      btn.classList.add('exit-btn');
    }
    btn.dataset.action = action;
    btn.innerHTML = ICONS[iconKey];

    const tooltip = document.createElement('div');
    tooltip.className = 'pinmark-tooltip';
    if (title.includes('[')) {
      const parts = title.split('[');
      tooltip.innerHTML = `${parts[0].trim()} <span style="opacity:0.6;font-size:10px;margin-left:4px">${parts[1].replace(']', '')}</span>`;
    } else {
      tooltip.textContent = title;
    }
    btn.appendChild(tooltip);

    return btn;
  }

  setPaused(paused: boolean) {
    this.isPaused = paused;
    const pauseBtn = this.element.querySelector('[data-action="pause"]') as HTMLButtonElement;
    if (pauseBtn) {
      pauseBtn.innerHTML = paused ? ICONS.play : ICONS.pause;
      pauseBtn.title = paused ? 'Resume' : 'Pause';
    }
  }

  setMarkersVisible(visible: boolean) {
    this.markersVisible = visible;
    const eyeBtn = this.element.querySelector('[data-action="markers"]') as HTMLButtonElement;
    if (eyeBtn) {
      eyeBtn.innerHTML = visible ? ICONS.eye : ICONS.eyeOff;
      if (visible) {
        eyeBtn.classList.add('active');
      } else {
        eyeBtn.classList.remove('active');
      }
    }
  }

  private togglePause() {
    this.setPaused(!this.isPaused);
  }

  private toggleMarkers() {
    this.setMarkersVisible(!this.markersVisible);
  }

  showCopySuccess() {
    const copyBtn = this.element.querySelector('[data-action="copy"]') as HTMLButtonElement;
    if (copyBtn) {
      const originalIcon = copyBtn.innerHTML;
      copyBtn.innerHTML = ICONS.check;
      copyBtn.style.background = 'var(--pmk-success, #22c55e)';
      setTimeout(() => {
        copyBtn.innerHTML = originalIcon;
        copyBtn.style.background = '';
      }, 1500);
    }
  }
}

