// ============================================================
// Sidebar Injector — Injects floating AI sidebar into Kite
// ============================================================
// Uses Shadow DOM for CSS isolation and iframe for React app
// ============================================================

import { SIDEBAR_CONFIG, STORAGE_KEYS } from '@shared/constants/config';
import { clamp } from '@shared/utils/formatters';

/**
 * Manages the floating AI sidebar injected into Kite's DOM
 */
export class SidebarInjector {
  private container: HTMLDivElement | null = null;
  private iframe: HTMLIFrameElement | null = null;
  private shadow: ShadowRoot | null = null;
  private _isInjected = false;
  private _isVisible = true;
  private width: number = SIDEBAR_CONFIG.DEFAULT_WIDTH;
  private isDragging = false;
  private isResizing = false;
  private dragOffset = { x: 0, y: 0 };

  /**
   * Check if sidebar has been injected
   */
  isInjected(): boolean {
    return this._isInjected;
  }

  /**
   * Inject the sidebar into Kite's DOM
   */
  inject(): void {
    if (this._isInjected) return;

    // Load saved width
    this.loadSettings();

    // Create host container
    this.container = document.createElement('div');
    this.container.id = 'ai-trading-copilot-root';
    this.container.setAttribute('data-atc', 'true');

    // Attach Shadow DOM for style isolation
    this.shadow = this.container.attachShadow({ mode: 'closed' });

    // Inject styles into Shadow DOM
    const style = document.createElement('style');
    style.textContent = this.getShadowStyles();
    this.shadow.appendChild(style);

    // Create sidebar wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'atc-sidebar';
    wrapper.id = 'atc-sidebar-wrapper';

    // Create drag handle (header bar)
    const dragHandle = document.createElement('div');
    dragHandle.className = 'atc-drag-handle';
    dragHandle.innerHTML = `
      <div class="atc-logo">
        <span class="atc-logo-icon">⚡</span>
        <span class="atc-logo-text">AI Copilot</span>
      </div>
      <div class="atc-controls">
        <button class="atc-btn atc-btn-minimize" title="Minimize (Ctrl+Shift+T)">─</button>
        <button class="atc-btn atc-btn-close" title="Close">✕</button>
      </div>
    `;

    // Create resize handle
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'atc-resize-handle';

    // Create iframe for React sidebar app
    this.iframe = document.createElement('iframe');
    this.iframe.className = 'atc-iframe';
    this.iframe.src = chrome.runtime.getURL('src/sidebar/index.html');
    this.iframe.allow = 'clipboard-write';
    this.iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups');

    // Assemble
    wrapper.appendChild(dragHandle);
    wrapper.appendChild(this.iframe);
    wrapper.appendChild(resizeHandle);
    this.shadow.appendChild(wrapper);

    // Add to page
    document.body.appendChild(this.container);

    // Adjust Kite's body to make room
    document.body.style.marginRight = `${this.width}px`;
    document.body.style.transition = 'margin-right 0.3s ease';

    // Setup interactions
    this.setupDrag(dragHandle, wrapper);
    this.setupResize(resizeHandle, wrapper);
    this.setupControls(dragHandle);

    this._isInjected = true;
    this._isVisible = true;

    console.log('[Sidebar Injector] Sidebar injected ✓');
  }

  /**
   * Toggle sidebar visibility
   */
  toggle(): void {
    if (!this.shadow) return;

    const wrapper = this.shadow.querySelector('.atc-sidebar') as HTMLElement;
    if (!wrapper) return;

    this._isVisible = !this._isVisible;

    if (this._isVisible) {
      wrapper.classList.remove('atc-hidden');
      document.body.style.marginRight = `${this.width}px`;
    } else {
      wrapper.classList.add('atc-hidden');
      document.body.style.marginRight = '0';
    }
  }

  /**
   * Post a message to the sidebar iframe
   */
  postMessage(message: Record<string, unknown>): void {
    if (this.iframe?.contentWindow) {
      this.iframe.contentWindow.postMessage(message, '*');
    }
  }

  /**
   * Remove the sidebar from the DOM
   */
  remove(): void {
    if (this.container) {
      this.container.remove();
      this.container = null;
      this.shadow = null;
      this.iframe = null;
      this._isInjected = false;
      document.body.style.marginRight = '0';
    }
  }

  /**
   * Setup drag functionality
   */
  private setupDrag(handle: HTMLElement, wrapper: HTMLElement): void {
    handle.addEventListener('mousedown', (e) => {
      // Only drag on the handle itself, not buttons
      if ((e.target as HTMLElement).closest('.atc-btn')) return;

      this.isDragging = true;
      this.dragOffset = {
        x: e.clientX - wrapper.getBoundingClientRect().left,
        y: e.clientY - wrapper.getBoundingClientRect().top,
      };

      wrapper.style.transition = 'none';
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;

      const x = clamp(e.clientX - this.dragOffset.x, 0, window.innerWidth - this.width);
      const y = clamp(e.clientY - this.dragOffset.y, 0, window.innerHeight - 100);

      wrapper.style.left = `${x}px`;
      wrapper.style.top = `${y}px`;
      wrapper.style.right = 'auto';
    });

    document.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        wrapper.style.transition = '';
      }
    });
  }

  /**
   * Setup resize functionality
   */
  private setupResize(handle: HTMLElement, wrapper: HTMLElement): void {
    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.isResizing = true;
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.isResizing) return;

      const newWidth = clamp(
        window.innerWidth - e.clientX,
        SIDEBAR_CONFIG.MIN_WIDTH,
        SIDEBAR_CONFIG.MAX_WIDTH,
      );

      this.width = newWidth;
      wrapper.style.width = `${newWidth}px`;
      document.body.style.marginRight = `${newWidth}px`;
    });

    document.addEventListener('mouseup', () => {
      if (this.isResizing) {
        this.isResizing = false;
        this.saveSettings();
      }
    });
  }

  /**
   * Setup header control buttons
   */
  private setupControls(header: HTMLElement): void {
    header.querySelector('.atc-btn-minimize')?.addEventListener('click', () => {
      this.toggle();
    });

    header.querySelector('.atc-btn-close')?.addEventListener('click', () => {
      this.remove();
    });
  }

  /**
   * Load saved settings
   */
  private async loadSettings(): Promise<void> {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.SIDEBAR_WIDTH);
      if (result[STORAGE_KEYS.SIDEBAR_WIDTH]) {
        this.width = result[STORAGE_KEYS.SIDEBAR_WIDTH] as number;
      }
    } catch {
      // Use defaults
    }
  }

  /**
   * Save current settings
   */
  private saveSettings(): void {
    chrome.storage.local.set({
      [STORAGE_KEYS.SIDEBAR_WIDTH]: this.width,
    });
  }

  /**
   * Shadow DOM styles for the sidebar
   * Completely isolated from Kite's CSS
   */
  private getShadowStyles(): string {
    return `
      :host {
        all: initial;
        position: fixed;
        top: 0;
        right: 0;
        z-index: 2147483647;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
      }

      .atc-sidebar {
        position: fixed;
        top: 0;
        right: 0;
        width: ${this.width}px;
        height: 100vh;
        display: flex;
        flex-direction: column;
        background: rgba(15, 15, 35, 0.95);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-left: 1px solid rgba(99, 102, 241, 0.3);
        box-shadow: -4px 0 30px rgba(0, 0, 0, 0.5);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                    opacity 0.3s ease;
        overflow: hidden;
      }

      .atc-sidebar.atc-hidden {
        transform: translateX(100%);
        opacity: 0;
        pointer-events: none;
      }

      .atc-drag-handle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.15));
        border-bottom: 1px solid rgba(99, 102, 241, 0.2);
        cursor: move;
        user-select: none;
        -webkit-user-select: none;
        min-height: 40px;
      }

      .atc-logo {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .atc-logo-icon {
        font-size: 18px;
        animation: pulse 2s infinite;
      }

      .atc-logo-text {
        font-size: 14px;
        font-weight: 700;
        background: linear-gradient(135deg, #818cf8, #a78bfa, #c084fc);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        letter-spacing: 0.5px;
      }

      .atc-controls {
        display: flex;
        gap: 4px;
      }

      .atc-btn {
        width: 28px;
        height: 28px;
        border: none;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        transition: all 0.2s ease;
      }

      .atc-btn:hover {
        background: rgba(255, 255, 255, 0.15);
        color: white;
      }

      .atc-btn-close:hover {
        background: rgba(239, 68, 68, 0.3);
        color: #f87171;
      }

      .atc-iframe {
        flex: 1;
        width: 100%;
        border: none;
        background: transparent;
      }

      .atc-resize-handle {
        position: absolute;
        left: 0;
        top: 0;
        width: 4px;
        height: 100%;
        cursor: ew-resize;
        background: transparent;
        transition: background 0.2s;
      }

      .atc-resize-handle:hover {
        background: rgba(99, 102, 241, 0.5);
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
    `;
  }
}
