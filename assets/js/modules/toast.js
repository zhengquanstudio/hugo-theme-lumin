/**
 * Toast 通知系统 (ESM Module)
 * 
 * 功能特性:
 * - 4种通知类型: info / warning / error / success
 * - 暗色主题自动适配
 * - 动画效果: 滑入/滑出
 * - 自动消失 + 手动关闭
 * - 响应式设计
 * 
 * 使用方式:
 * import { Toast } from '/js/modules/toast.js';
 * const toast = new Toast();
 * toast.warning('标题', '消息内容');
 */

export class Toast {
  private container: HTMLElement;
  private autoHideTimers: Map<number, NodeJS.Timeout> = new Map();
  private counter: number = 0;

  constructor(containerId: string = 'cdn-toast-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.warn('[Toast] ⚠️ 容器元素未找到:', containerId);
    }
  }

  show(options: ToastOptions): HTMLElement | null {
    if (!this.container) {
      console.error('[Toast] ✗ 无法显示提示: 容器不存在');
      return null;
    }

    const opts: Required<ToastOptions> = {
      type: 'info',
      title: '提示',
      message: '',
      duration: 5000,
      closable: true,
      icon: true,
      ...options
    };

    const toastEl = this.createToastElement(opts);
    this.container.appendChild(toastEl);

    if (opts.duration > 0) {
      const timerId = window.setTimeout(() => {
        this.hide(toastEl);
      }, opts.duration);
      
      this.counter++;
      this.autoHideTimers.set(this.counter, timerId);
      toastEl.dataset.timerId = String(this.counter);
    }
    return toastEl;
  }

  hide(toastEl: HTMLElement | null): void {
    if (!toastEl || toastEl.classList.contains('hiding')) return;

    toastEl.classList.add('hiding');

    // 清除自动隐藏定时器
    const timerId = toastEl.dataset.timerId;
    if (timerId) {
      const timer = this.autoHideTimers.get(Number(timerId));
      if (timer) {
        clearTimeout(timer);
        this.autoHideTimers.delete(Number(timerId));
      }
    }

    setTimeout(() => {
      if (toastEl.parentNode) {
        toastEl.parentNode.removeChild(toastEl);
      }
    }, 250);
  }

  warning(title: string, message?: string, duration?: number): HTMLElement | null {
    return this.show({ type: 'warning', title, message: message || '', duration: duration || 6000 });
  }

  error(title: string, message?: string, duration?: number): HTMLElement | null {
    return this.show({ type: 'error', title, message: message || '', duration: duration || 8000 });
  }

  info(title: string, message?: string, duration?: number): HTMLElement | null {
    return this.show({ type: 'info', title, message: message || '', duration: duration || 4000 });
  }

  success(title: string, message?: string, duration?: number): HTMLElement | null {
    return this.show({ type: 'success', title, message: message || '', duration: duration || 3000 });
  }

  clear(): void {
    const toasts = this.container?.querySelectorAll('.cdn-toast');
    toasts?.forEach((toast) => {
      this.hide(toast as HTMLElement);
    });

    // 清除所有定时器
    this.autoHideTimers.forEach((timer) => clearTimeout(timer));
    this.autoHideTimers.clear();
  }

  private createToastElement(opts: Required<ToastOptions>): HTMLElement {
    const toast = document.createElement('div');
    toast.className = `cdn-toast toast-${opts.type}`;

    const icons = this.getIcons();

    let html = '';

    if (opts.icon) {
      html += `<div class="cdn-toast-icon">${icons[opts.type] || icons.info}</div>`;
    }

    html += '<div class="cdn-toast-body">';
    html += `<div class="cdn-toast-title">${this.escapeHtml(opts.title)}</div>`;
    
    if (opts.message) {
      html += `<div class="cdn-toast-message">${this.escapeHtml(opts.message)}</div>`;
    }
    
    html += '</div>';

    if (opts.closable) {
      html += `<button class="cdn-toast-close" aria-label="关闭" onclick="
        (function(btn){
          var toast = btn.closest('.cdn-toast');
          if(toast){ 
            toast.classList.add('hiding'); 
            setTimeout(function(){
              if(toast.parentNode) toast.parentNode.removeChild(toast);
            },250); 
          }
        })(this);
      ">`;
      html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">';
      html += '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>';
      html += '</svg></button>';
    }

    toast.innerHTML = html;
    return toast;
  }

  private getIcons(): Record<string, string> {
    return {
      warning: '<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      error: '<svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
    };
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export interface ToastOptions {
  type?: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message?: string;
  duration?: number;
  closable?: boolean;
  icon?: boolean;
}

console.log('[Toast Module] ✓ ESM 模块已加载');
