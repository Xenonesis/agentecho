import { HoverBox } from './HoverBox';
import { AreaSelectionBox } from './AreaSelectionBox';
import { MarkerManager } from './MarkerManager';
import { Toolbar } from './Toolbar';
import { FeedbackModal } from './FeedbackModal';
import { ElementAnalyzer } from './ElementAnalyzer';
import { MarkdownFormatter } from './MarkdownFormatter';
import { FeedbackManager } from '../core/FeedbackManager';
import type { PinmarkSettings, PinmarkConfig } from '../core/types';
import type { PinmarkAnnotation as FeedbackItem } from '@pinmark/core';
import html2canvas from 'html2canvas';
import * as rrweb from 'rrweb';

const OVERLAY_STYLES = `
  :host {
    all: initial;
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 2147483647;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

    --pmk-bg: #1f2937;
    --pmk-bg-2: #111827;
    --pmk-bg-3: #374151;
    --pmk-text: #f9fafb;
    --pmk-text-muted: #9ca3af;
    --pmk-border: #374151;
    --pmk-accent: #3b82f6;
    --pmk-danger: #ef4444;
    --pmk-success: #22c55e;
  }

  :host(.blocking) {
    pointer-events: all;
    cursor: crosshair;
  }

  .pinmark-block-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    pointer-events: all;
    z-index: 2147483640;
  }
`;

export class Overlay {
  private container: HTMLElement;
  private shadowRoot: ShadowRoot;
  private blockOverlay: HTMLElement | null = null;
  private hoverBox: HoverBox;
  private areaSelectionBox: AreaSelectionBox;
  private markerManager: MarkerManager;
  private toolbar: Toolbar;
  private feedbackModal: FeedbackModal;
  private elementAnalyzer: ElementAnalyzer;
  private feedbackManager: FeedbackManager;
  private settings: PinmarkSettings;
  private config: PinmarkConfig;
  private _isActive = false;
  get isActive() { return this._isActive; }
  private isPaused = false;
  private markersVisible = true;
  private targetElement: HTMLElement | null = null;
  private isModalOpen = false;
  private isAreaSelectActive = false;

  // Track drag state for area selection
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;

  private consoleLogs: any[] = [];
  private networkRequests: any[] = [];
  
  private rrwebEvents: any[] = [];
  private stopRecording: (() => void) | null = null;

  constructor(settings: PinmarkSettings, config: PinmarkConfig, initialFeedback: FeedbackItem[] = []) {
    this.settings = settings;
    this.config = config;
    this.feedbackManager = new FeedbackManager(config, initialFeedback);

    this.container = document.createElement('pinmark-overlay');
    this.container.className = 'pinmark-overlay-container';
    this.shadowRoot = this.container.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.id = 'pinmark-overlay-styles';
    style.textContent = OVERLAY_STYLES;
    this.shadowRoot.appendChild(style);
    this.applyTheme(settings);

    this.hoverBox = new HoverBox(this.shadowRoot);
    this.areaSelectionBox = new AreaSelectionBox(this.shadowRoot);
    this.markerManager = new MarkerManager(this.shadowRoot, settings as any, {
      onEdit: (id) => this.handleEditFeedback(id),
      onDelete: (id) => this.handleDeleteFeedback(id),
      onCopy: (id) => this.handleCopyFeedback(id),
    });
    this.elementAnalyzer = new ElementAnalyzer();
    this.toolbar = new Toolbar(this.shadowRoot);
    this.feedbackModal = new FeedbackModal(this.shadowRoot);

    this.setupToolbarListeners();
    this.loadExistingMarkers();

    // Apply block interactions setting
    if (this.settings.blockInteractions) {
      this.enableBlockingMode();
    }
  }

  private setupEventListeners() {
    window.addEventListener('message', this.handleWindowMessage);
    document.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('click', this.handleClick, true);
    document.addEventListener('keydown', this.handleKeydown, true);
    window.addEventListener('resize', this.handleResize);
  }

  private removeEventListeners() {
    window.removeEventListener('message', this.handleWindowMessage);
    document.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('click', this.handleClick, true);
    document.removeEventListener('keydown', this.handleKeydown, true);
    window.removeEventListener('resize', this.handleResize);
  }

  private handleKeydown = (e: KeyboardEvent) => {
    // Don't intercept if user is typing in our modal
    if (this.isModalOpen) {
      if (e.key === 'Escape') {
        // We let the modal handle Escape, but we don't want to close the whole overlay
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      this.deactivate();
    } else if (e.key.toLowerCase() === 'p') {
      e.preventDefault();
      this.togglePause();
    } else if (e.key.toLowerCase() === 'h') {
      e.preventDefault();
      this.toggleMarkers();
    } else if (e.key.toLowerCase() === 'c' && !e.ctrlKey && !e.metaKey) {
      // Only trigger if just 'c' is pressed (not Ctrl+C which is copy text)
      e.preventDefault();
      this.copyFeedback();
    }
  };

  private handleWindowMessage = (e: MessageEvent) => {
    if (e.data?.source === 'pinmark-logger') {
      if (e.data.type === 'console') {
        this.consoleLogs.push({ time: Date.now(), ...e.data.data });
        if (this.consoleLogs.length > 50) this.consoleLogs.shift();
      } else if (e.data.type === 'network') {
        this.networkRequests.push({ time: Date.now(), ...e.data.data });
        if (this.networkRequests.length > 50) this.networkRequests.shift();
      }
    }
  };

  private handleMouseDown = (e: MouseEvent) => {
    if (!this.isActive || this.isPaused || this.isModalOpen) return;

    // Only initiate drag selection if area select mode is active
    if (!this.isAreaSelectActive) return;

    const target = e.target as HTMLElement;
    if (this.shadowRoot.contains(target) || target === this.container) return;

    // We'll initiate dragging if they click and move.
    this.isDragging = false;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.isActive || this.isPaused || this.isModalOpen) return;

    if (this.isAreaSelectActive && e.buttons === 1) { // Left mouse button is held down
      const distance = Math.sqrt(Math.pow(e.clientX - this.dragStartX, 2) + Math.pow(e.clientY - this.dragStartY, 2));
      if (distance > 5) {
        if (!this.isDragging) {
          this.isDragging = true;
          this.areaSelectionBox.start(this.dragStartX, this.dragStartY);
          this.hoverBox.hide();
        }
        this.areaSelectionBox.update(e.clientX, e.clientY);
        return;
      }
    }

    if (this.isDragging) return;

    // If area select mode is active, we don't hover elements
    if (this.isAreaSelectActive) {
      this.hoverBox.hide();
      this.targetElement = null;
      return;
    }

    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (!target || target === this.container || target === this.blockOverlay) {
      this.hoverBox.hide();
      this.targetElement = null;
      return;
    }

    if (this.shadowRoot.contains(target)) {
      return;
    }

    if (target instanceof HTMLElement) {
      this.hoverBox.show(target);
      this.targetElement = target;
    }
  };

  private handleMouseUp = () => {
    if (this.isDragging) {
      const areaRect = this.areaSelectionBox.end();
      this.isDragging = false;
      
      if (areaRect) {
        // Find a representative element for the area, or use body
        const target = document.elementFromPoint(areaRect.x + areaRect.width / 2, areaRect.y + areaRect.height / 2) as HTMLElement;
        this.promptForFeedback(target || document.body, areaRect);
        
        // Turn off Area Select Mode after selection
        this.isAreaSelectActive = false;
        this.toolbar.toggleAreaSelect(false);
      }
    }
  };

  private handleResize = () => {
    if (this.isActive && !this.isPaused) {
      this.markerManager.updatePositions(this.feedbackManager.getAll());
    }
  };

  private handleClick = (e: MouseEvent) => {
    if (!this.isActive || this.isPaused || this.isModalOpen) return;

    const target = e.target as HTMLElement;

    // When clicking an element inside Shadow DOM, the event target is retargeted to the host (this.container)
    if (this.shadowRoot.contains(target) || target === this.container) {
      return;
    }

    // Check if clicking on the block overlay or if blocking is enabled
    // We prioritize feedback selection over blocking
    if (this.targetElement && !this.isAreaSelectActive) {
      e.preventDefault();
      e.stopPropagation();
      this.promptForFeedback(this.targetElement);
      return;
    }

    if (this.settings.blockInteractions || target === this.blockOverlay || this.isAreaSelectActive) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return;
    }

    // Default behavior for non-target clicks when blocking is disabled
    // (do nothing, let event propagate)
  };

  private async promptForFeedback(element: HTMLElement, overrideRect?: DOMRect) {
    const selection = window.getSelection();
    let selectionText: string | undefined;
    let selectionRect: DOMRect | undefined = overrideRect;

    if (!overrideRect && selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const text = selection.toString().trim();
      if (text) {
        selectionText = text;
        selectionRect = selection.getRangeAt(0).getBoundingClientRect();
      }
    }

    this.isModalOpen = true;
    this.hoverBox.hide();

    let screenshot: string | undefined;
    try {
      this.container.style.display = 'none';
      const canvas = await html2canvas(element, {
        useCORS: true,
        logging: false,
        scale: window.devicePixelRatio || 1,
        ignoreElements: (node) => node.tagName === 'SCRIPT' || node.tagName === 'NOSCRIPT' || node.tagName === 'IFRAME' || node.tagName === 'LINK'
      });
      screenshot = canvas.toDataURL('image/jpeg', 0.8);
    } catch (e) {
      console.warn('[Pinmark] Failed to capture screenshot:', e);
    } finally {
      this.container.style.display = 'block';
    }

    const result = await this.feedbackModal.show(element, undefined, screenshot);
    this.isModalOpen = false;

    if (!result) return;
    
    if (result.screenshot) {
      screenshot = result.screenshot;
    }

    const elementInfo = this.elementAnalyzer.analyze(element);
    
    // If there is an active text selection, overwrite the element's bounding rect and text
    // to match exactly what the user highlighted.
    if (selectionText && selectionRect) {
      elementInfo.selectionText = selectionText;
      elementInfo.boundingRect = {
        x: selectionRect.x,
        y: selectionRect.y,
        width: selectionRect.width,
        height: selectionRect.height,
        top: selectionRect.top,
        right: selectionRect.right,
        bottom: selectionRect.bottom,
        left: selectionRect.left
      };
    }

    // Screenshot already captured before modal

    if (screenshot) {
      elementInfo.screenshot = screenshot;
    }

    const state: any = {};
    try {
      state.localStorage = { ...window.localStorage };
      state.sessionStorage = { ...window.sessionStorage };
      state.cookies = document.cookie;
    } catch (e) {
      console.warn('[Pinmark] Could not capture state:', e);
    }

    const feedback: FeedbackItem = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      index: this.feedbackManager.getAll().length + 1,
      comment: result.comment,
      timestamp: Date.now(),
      url: this.config.url || window.location.href,
      element: elementInfo,
      state,
      consoleLogs: [...this.consoleLogs],
      networkRequests: [...this.networkRequests],
      sessionRecording: [...this.rrwebEvents],
      ...(overrideRect ? { areaRect: { x: overrideRect.x, y: overrideRect.y, width: overrideRect.width, height: overrideRect.height } } : {})
    };

    this.feedbackManager.add(feedback);
    this.markerManager.addMarker(feedback);
  }

  private async handleEditFeedback(id: string) {
    const feedback = this.feedbackManager.getAll().find(f => f.id === id);
    if (!feedback) return;

    // Find the element again using the selector
    const element = document.querySelector(feedback.element.selector) as HTMLElement;
    if (!element) {
      // Element no longer exists, use a placeholder
      const placeholder = document.createElement('div');
      placeholder.textContent = 'Element not found';
      this.isModalOpen = true;
      const result = await this.feedbackModal.show(placeholder, feedback.comment);
      this.isModalOpen = false;

      if (result) {
        this.feedbackManager.update(id, { comment: result.comment });
        this.markerManager.updateMarkerTooltip(id, result.comment);
        if (this.config.onSync) this.config.onSync({ ...feedback, comment: result.comment });
      }
      return;
    }

    this.isModalOpen = true;
    const result = await this.feedbackModal.show(element, feedback.comment);
    this.isModalOpen = false;

    if (result) {
      this.feedbackManager.update(id, { comment: result.comment });
      this.markerManager.updateMarkerTooltip(id, result.comment);
      if (this.config.onSync) this.config.onSync({ ...feedback, comment: result.comment });
    }
  }

  private async handleDeleteFeedback(id: string) {
    this.feedbackManager.remove(id);
    this.markerManager.removeMarker(id);
    // Re-index remaining markers
    await this.reindexMarkers();
  }

  private async handleCopyFeedback(id: string) {
    const item = this.feedbackManager.getAll().find(f => f.id === id);
    if (!item) return;
    try {
      const fmt = new MarkdownFormatter();
      const markdown = fmt.formatItem(item, this.settings as any);
      await this.copyToClipboard(markdown);
    } catch (e) {
      console.error('Failed to copy feedback item:', e);
    }
  }

  private async reindexMarkers() {
    const allFeedback = this.feedbackManager.getAll();
    allFeedback.forEach((feedback, index) => {
      feedback.index = index + 1;
    });
    // Update storage
    try {
      await this.feedbackManager.save();
    } catch (e) {
      console.error('Failed to save reindexed markers:', e);
    }
    // Refresh markers
    this.markerManager.clearAll();
    allFeedback.forEach((item) => {
      this.markerManager.addMarker(item);
    });
  }

  private setupToolbarListeners() {
    this.toolbar.onPauseToggle = () => this.togglePause();
    this.toolbar.onMarkersToggle = () => this.toggleMarkers();
    this.toolbar.onAreaSelectToggle = () => {
      this.isAreaSelectActive = !this.isAreaSelectActive;
      if (this.isAreaSelectActive) {
        this.hoverBox.hide();
        this.targetElement = null;
      }
    };
    this.toolbar.onCopy = () => this.copyFeedback();
    this.toolbar.onDownloadJson = () => this.downloadJson();
    this.toolbar.onGithubCreate = () => this.createGithubIssue();
    this.toolbar.onClear = () => this.clearAll();
    this.toolbar.onWebhookSend = () => this.sendToWebhook();
    this.toolbar.onSettingsClick = () => {
      try {
        if (typeof (window as any).chrome !== 'undefined' && (window as any).chrome.runtime) {
          (window as any).chrome.runtime.sendMessage({ type: 'OPEN_SETTINGS' });
        } else {
          console.warn('[Pinmark] Cannot open settings: not running as an extension');
        }
      } catch (e) {
        console.warn('[Pinmark] Cannot open settings:', e);
      }
    };
    this.toolbar.onExitClick = () => this.deactivate();

    if (this.settings.webhookUrl) {
      this.toolbar.setWebhookEnabled(true);
    }
  }

  public async sendToWebhook() {
    if (!this.settings.webhookUrl) return;

    try {
      const allFeedback = this.feedbackManager.getAll();
      const response = await fetch(this.settings.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: this.config.url || window.location.href,
          timestamp: Date.now(),
          annotations: allFeedback
        })
      });

      if (response.ok) {
        this.toolbar.showSendSuccess();
        if (this.settings.clearAfterCopy) {
          this.clearAll();
        }
      } else {
        console.error('Webhook failed:', response.statusText);
      }
    } catch (e) {
      console.error('Failed to send webhook:', e);
    }
  }

  public loadExistingMarkers() {
    const feedback = this.feedbackManager.getAll();
    feedback.forEach((item) => {
      this.markerManager.addMarker(item);
    });
  }

  private enableBlockingMode() {
    this.container.classList.add('blocking');
    if (!this.blockOverlay) {
      this.blockOverlay = document.createElement('div');
      this.blockOverlay.className = 'pinmark-block-overlay';
      this.shadowRoot.appendChild(this.blockOverlay);
    }
  }

  private disableBlockingMode() {
    this.container.classList.remove('blocking');
    if (this.blockOverlay) {
      this.blockOverlay.remove();
      this.blockOverlay = null;
    }
  }

  activate() {
    this._isActive = true;
    document.body.appendChild(this.container);
    this.setupEventListeners();
    if (this.config.onToggle) this.config.onToggle(true);
    
    try {
      this.stopRecording = rrweb.record({
        emit: (event) => {
          this.rrwebEvents.push(event);
          if (this.rrwebEvents.length > 2000) {
            this.rrwebEvents = this.rrwebEvents.slice(-1000);
          }
        },
      }) as unknown as () => void;
    } catch (e) {
      console.warn('[Pinmark] Failed to start rrweb recording:', e);
    }

    // Initial update to fix position if layout changed since save
    requestAnimationFrame(() => {
      try {
        this.markerManager.updatePositions(this.feedbackManager.getAll());
      } catch (e) {
        console.error('Failed to update marker positions:', e);
      }
    });
  }

  deactivate() {
    this._isActive = false;
    this.removeEventListeners();
    this.removePauseStyles();
    this.container.remove();
    this.isAreaSelectActive = false;
    this.toolbar.toggleAreaSelect(false);
    
    if (this.stopRecording) {
      this.stopRecording();
      this.stopRecording = null;
    }

    if (this.config.onToggle) this.config.onToggle(false);
  }

  private pauseStyleElement: HTMLStyleElement | null = null;

  togglePause() {
    this.isPaused = !this.isPaused;
    this.toolbar.setPaused(this.isPaused);
    if (this.isPaused) {
      this.hoverBox.hide();
      this.injectPauseStyles();
    } else {
      this.removePauseStyles();
    }
  }

  private injectPauseStyles() {
    if (!this.pauseStyleElement) {
      this.pauseStyleElement = document.createElement('style');
      this.pauseStyleElement.id = 'pinmark-pause-animations';
      this.pauseStyleElement.textContent = `
        *, *::before, *::after {
          animation-play-state: paused !important;
          transition: none !important;
        }
      `;
      document.head.appendChild(this.pauseStyleElement);
    }
  }

  private removePauseStyles() {
    if (this.pauseStyleElement) {
      this.pauseStyleElement.remove();
      this.pauseStyleElement = null;
    }
  }

  toggleMarkers() {
    this.markersVisible = !this.markersVisible;
    this.markerManager.setVisible(this.markersVisible);
    this.toolbar.setMarkersVisible(this.markersVisible);
  }

  async copyToClipboard(text: string): Promise<boolean> {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn('[Pinmark] navigator.clipboard failed, trying fallback:', err);
      }
    }

    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    let success = false;
    try {
      success = document.execCommand('copy');
    } catch (err) {
      console.error('[Pinmark] Fallback copy failed:', err);
    }
    
    document.body.removeChild(textArea);
    return success;
  }

  async copyFeedback() {
    const markdown = this.feedbackManager.toMarkdown();
    const success = await this.copyToClipboard(markdown);
    if (success) {
      this.toolbar.showCopySuccess();
    }

    if (this.settings.clearAfterCopy) {
      this.clearAll();
    }
  }

  async copyJson() {
    const data = this.feedbackManager.getAll();
    await this.copyToClipboard(JSON.stringify(data, null, 2));

    if (this.settings.clearAfterCopy) {
      this.clearAll();
    }
  }

  downloadJson() {
    const data = this.feedbackManager.getAll();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pinmark-annotations-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (this.settings.clearAfterCopy) {
      this.clearAll();
    }
  }

  clearAll() {
    this.feedbackManager.clearAll();
    this.markerManager.clearAll();
  }

  clearAllMarkers() {
    this.markerManager.clearAll();
  }

  removeMarker(id: string) {
    this.markerManager.removeMarker(id);
  }

  refreshMarkers() {
    this.markerManager.clearAll();
    this.loadExistingMarkers();
  }

  private createGithubIssue() {
    const markdown = this.feedbackManager.toMarkdown();
    if (this.config.onGithubCreate) {
      this.config.onGithubCreate(markdown);
    }
  }

  updateSettings(settings: Partial<PinmarkSettings>) {
    const oldBlockInteractions = this.settings.blockInteractions;
    this.settings = { ...this.settings, ...settings };
    this.markerManager.updateSettings(this.settings as any);

    // Handle blocking mode change
    if (this.settings.blockInteractions !== oldBlockInteractions) {
      if (this.settings.blockInteractions) {
        this.enableBlockingMode();
      } else {
        this.disableBlockingMode();
      }
    }
    
    // Toggle webhook visibility
    this.toolbar.setWebhookEnabled(!!this.settings.webhookUrl);

    // Re-apply theme if the theme setting itself changed
    this.applyTheme(this.settings);
  }

  /** Resolve light/dark from settings and set CSS vars on the host. */
  private applyTheme(settings: PinmarkSettings) {
    const mode = settings.theme === 'auto'
      ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : settings.theme;
    const host = this.container;
    if (mode === 'light') {
      host.style.setProperty('--pmk-bg', '#ffffff');
      host.style.setProperty('--pmk-bg-2', '#f9fafb');
      host.style.setProperty('--pmk-bg-3', '#e5e7eb');
      host.style.setProperty('--pmk-text', '#1f2937');
      host.style.setProperty('--pmk-text-muted', '#6b7280');
      host.style.setProperty('--pmk-border', '#e5e7eb');
    } else {
      host.style.setProperty('--pmk-bg', '#1f2937');
      host.style.setProperty('--pmk-bg-2', '#111827');
      host.style.setProperty('--pmk-bg-3', '#374151');
      host.style.setProperty('--pmk-text', '#f9fafb');
      host.style.setProperty('--pmk-text-muted', '#9ca3af');
      host.style.setProperty('--pmk-border', '#374151');
    }
  }

  updateFeedbackManager(feedbackManager: FeedbackManager) {
    this.feedbackManager = feedbackManager;
  }
}
