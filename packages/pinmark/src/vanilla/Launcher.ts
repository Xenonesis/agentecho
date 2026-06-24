export const LAUNCHER_STYLES = `
  .pinmark-launcher {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background-color: #000;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 2147483647;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s, background-color 0.2s;
    border: none;
    outline: none;
    padding: 0;
  }
  .pinmark-launcher:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    background-color: #111;
  }
  .pinmark-launcher:active {
    transform: scale(0.95);
  }
  .pinmark-launcher-icon {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
  }
  .pinmark-launcher-line {
    width: 16px;
    height: 2px;
    background-color: #fff;
    border-radius: 1px;
    transition: transform 0.3s, opacity 0.3s;
  }
  .pinmark-launcher.active .pinmark-launcher-line:nth-child(1) {
    transform: translateY(6px) rotate(45deg);
  }
  .pinmark-launcher.active .pinmark-launcher-line:nth-child(2) {
    opacity: 0;
  }
  .pinmark-launcher.active .pinmark-launcher-line:nth-child(3) {
    transform: translateY(-6px) rotate(-45deg);
  }
  .pinmark-launcher-sparkle {
    position: absolute;
    bottom: 12px;
    right: 12px;
    width: 14px;
    height: 14px;
    color: #fff;
  }
`;

export class Launcher {
  private element: HTMLElement;
  public onClick?: () => void;

  constructor() {
    this.element = document.createElement('div');
    this.element.id = 'pinmark-launcher-container';
    const shadowRoot = this.element.attachShadow({ mode: 'open' });
    
    const style = document.createElement('style');
    style.textContent = LAUNCHER_STYLES;
    shadowRoot.appendChild(style);

    const btn = document.createElement('button');
    btn.className = 'pinmark-launcher';
    
    const icon = document.createElement('div');
    icon.className = 'pinmark-launcher-icon';
    icon.innerHTML = `
      <div class="pinmark-launcher-line"></div>
      <div class="pinmark-launcher-line"></div>
      <div class="pinmark-launcher-line"></div>
    `;
    
    const sparkle = document.createElement('div');
    sparkle.className = 'pinmark-launcher-sparkle';
    sparkle.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2L14.6 9.4L22 12L14.6 14.6L12 22L9.4 14.6L2 12L9.4 9.4L12 2Z"/></svg>`;

    btn.appendChild(icon);
    btn.appendChild(sparkle);
    
    btn.onclick = () => {
      this.onClick?.();
    };

    shadowRoot.appendChild(btn);
    document.documentElement.appendChild(this.element);
  }

  public setActive(active: boolean) {
    const btn = this.element.shadowRoot?.querySelector('.pinmark-launcher');
    if (btn) {
      if (active) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  }

  public destroy() {
    this.element.remove();
  }
}
