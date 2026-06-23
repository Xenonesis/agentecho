import { Overlay, FeedbackManager } from '@pinmark/pinmark';
import { ChromeStorageAdapter } from './ChromeStorageAdapter';

import { sendMessage } from '../shared/messaging';

console.log('[Pinmark] Content script loaded');

function injectLogger() {
  const script = document.createElement('script');
  script.textContent = `(${function() {
    function sendLog(type: string, data: any) {
      window.postMessage({ source: 'pinmark-logger', type, data }, '*');
    }
    
    ['log', 'warn', 'error', 'info'].forEach((method) => {
      const original = (console as any)[method];
      (console as any)[method] = function(...args: any[]) {
        sendLog('console', { method, args: args.map(a => {
          try { return typeof a === 'object' ? JSON.stringify(a) : String(a); } catch { return String(a); }
        })});
        return original.apply(this, args);
      };
    });
    
    window.addEventListener('error', (e) => {
      sendLog('console', { method: 'error', args: [e.message, e.filename, e.lineno] });
    });
    
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
      sendLog('network', { type: 'fetch', url: String(args[0]), method: (args[1] as any)?.method || 'GET' });
      return originalFetch.apply(this, args);
    };
    
    const originalXHR = window.XMLHttpRequest.prototype.open;
    window.XMLHttpRequest.prototype.open = function(method, url) {
      sendLog('network', { type: 'xhr', method: String(method), url: String(url) });
      return originalXHR.apply(this, arguments as any);
    };
  }.toString()})();`;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
}

injectLogger();

let overlay: Overlay | null = null;
let feedbackManager: FeedbackManager | null = null;
let currentUrl: string = window.location.href;
const storageAdapter = new ChromeStorageAdapter();

async function initializeOverlay() {
  if (overlay) return;

  const settings = await storageAdapter.getSettings();
  const feedback = await storageAdapter.getFeedback(window.location.href);

  currentUrl = window.location.href;
  
  const config = {
    url: currentUrl,
    storage: storageAdapter,
    onSync: (item: any) => {
      chrome.runtime.sendMessage({
        type: 'SYNC_MCP',
        url: currentUrl,
        item: item
      }, (response) => {
        if (response && response.success) {
          console.log('[Pinmark] Synced annotation to MCP server via background');
        } else if (response && response.error) {
          console.warn('[Pinmark] MCP Sync failed in background:', response.error);
        }
      });
    },
    onGithubCreate: (markdown: string) => {
      chrome.runtime.sendMessage({
        type: 'CREATE_GITHUB_ISSUE',
        url: currentUrl,
        content: markdown
      }, (response) => {
        if (response && response.success) {
          console.log('[Pinmark] GitHub issue created:', response.issueUrl);
        } else if (response && response.error) {
          console.warn('[Pinmark] GitHub issue failed:', response.error);
          alert('Failed to create GitHub issue: ' + response.error);
        }
      });
    },
    onToggle: (isActive: boolean) => {
      sendMessage({ type: 'SET_STATE', state: { isActive } }).catch(console.error);
    }
  };

  try {
    console.log('[Pinmark] Initializing overlay...');
    overlay = new Overlay(settings, config, feedback);
    feedbackManager = (overlay as any).feedbackManager;
    console.log('[Pinmark] Activating overlay...');
    overlay.activate();
    console.log('[Pinmark] Overlay activated.');
  } catch (e) {
    console.error('[Pinmark] Error initializing overlay:', e);
  }
}

function deactivateOverlay() {
  if (overlay) {
    try {
      overlay.deactivate();
    } catch (e) {
      console.error('Error deactivating overlay:', e);
    }
    overlay = null;
  }
  feedbackManager = null;
}

let isHandlingUrlChange = false;

async function handleUrlChange() {
  if (isHandlingUrlChange) return;
  isHandlingUrlChange = true;

  try {
    await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)));

    const newUrl = window.location.href;

    if (newUrl !== currentUrl && overlay) {
      currentUrl = newUrl;
      overlay.clearAllMarkers();
      
      const settings = await storageAdapter.getSettings();
      const feedback = await storageAdapter.getFeedback(newUrl);
      
      if (!overlay) return;

      const config = {
        url: currentUrl,
        storage: storageAdapter,
        onSync: (item: any) => {
          chrome.runtime.sendMessage({
            type: 'SYNC_MCP',
            url: currentUrl,
            item: item
          }, () => {});
        },
        onGithubCreate: (markdown: string) => {
          chrome.runtime.sendMessage({
            type: 'CREATE_GITHUB_ISSUE',
            url: currentUrl,
            content: markdown
          }, (response) => {
            if (response && response.success) {
              console.log('[Pinmark] GitHub issue created:', response.issueUrl);
            } else if (response && response.error) {
              console.warn('[Pinmark] GitHub issue failed:', response.error);
              alert('Failed to create GitHub issue: ' + response.error);
            }
          });
        },
        onToggle: (isActive: boolean) => {
          sendMessage({ type: 'SET_STATE', state: { isActive } }).catch(console.error);
        }
      };

      // Since we can't cleanly hotswap config inside the current Overlay architecture,
      // it is safer to just recreate it for SPA navigation.
      overlay.deactivate();
      overlay = new Overlay(settings, config, feedback);
      feedbackManager = (overlay as any).feedbackManager;
      overlay.activate();
    }
  } finally {
    isHandlingUrlChange = false;
  }
}

function setupUrlMonitoring() {
  let lastCheckedUrl = window.location.href;

  function checkUrl() {
    const currentUrl = window.location.href;

    if (currentUrl !== lastCheckedUrl && overlay) {
      lastCheckedUrl = currentUrl;
      handleUrlChange();
    }

    requestAnimationFrame(checkUrl);
  }

  requestAnimationFrame(checkUrl);

  window.addEventListener('popstate', () => {
    lastCheckedUrl = window.location.href;
    handleUrlChange();
  });

  window.addEventListener('hashchange', () => {
    lastCheckedUrl = window.location.href;
    handleUrlChange();
  });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.type) {
    case 'TOGGLE_EXTENSION':
      if (message.isActive) {
        initializeOverlay();
      } else {
        deactivateOverlay();
      }
      sendResponse({ success: true });
      break;
    case 'ACTIVATE_OVERLAY':
      initializeOverlay();
      break;
    case 'DEACTIVATE_OVERLAY':
      deactivateOverlay();
      break;
    case 'TOGGLE_MARKERS':
      overlay?.toggleMarkers();
      break;
    case 'TOGGLE_PAUSE':
      overlay?.togglePause();
      break;
    case 'CLEAR_FEEDBACK':
      feedbackManager?.clearAll();
      overlay?.clearAllMarkers();
      sendResponse({ success: true });
      break;
    case 'COPY_FEEDBACK':
      const markdown = feedbackManager?.toMarkdown();
      if (markdown) {
        navigator.clipboard.writeText(markdown);
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false });
      }
      return true;
    case 'COPY_JSON':
      if (overlay) {
        overlay.copyJson();
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false });
      }
      return true;
    case 'ADD_FEEDBACK':
      feedbackManager?.add(message.item);
      overlay?.loadExistingMarkers();
      sendResponse({ success: true });
      break;
    case 'REMOVE_FEEDBACK':
      feedbackManager?.remove(message.id);
      overlay?.removeMarker(message.id);
      sendResponse({ success: true });
      break;
    case 'UPDATE_FEEDBACK':
      feedbackManager?.update(message.id, message.updates);
      overlay?.refreshMarkers();
      sendResponse({ success: true });
      break;
    case 'UPDATE_SETTINGS':
      overlay?.updateSettings(message.settings as any);
      sendResponse({ success: true });
      break;
  }
  return false;
});

setupUrlMonitoring();
