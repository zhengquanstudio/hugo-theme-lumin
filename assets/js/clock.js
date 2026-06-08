// Header Clock Component
class HeaderClock {
  constructor(element) {
    this.element = element;
    this.timeElement = element.querySelector('.clock-time');
    this.timerID = null;

    // 分离时分秒显示元素
    this.hourElement = null;
    this.minuteElement = null;
    this.secondElement = null;
    this.lastSeconds = -1;
    this.lastMinutes = -1;
    this.lastHours = -1;

    if (!this.timeElement) return;

    this.initTimeElements();
    this.init();
  }

  initTimeElements() {
    // 直接获取已存在的时分秒元素（避免重新创建导致闪烁）
    this.hourElement = this.timeElement.querySelector('.hour');
    this.minuteElement = this.timeElement.querySelector('.minute');
    this.secondElement = this.timeElement.querySelector('.second');

    // 如果元素不存在，则创建（兼容性处理）
    if (!this.hourElement || !this.minuteElement || !this.secondElement) {
      this.timeElement.innerHTML = `
        <span class="hour">00</span>
        <span class="separator">:</span>
        <span class="minute">00</span>
        <span class="separator">:</span>
        <span class="second">00</span>
      `;
      this.hourElement = this.timeElement.querySelector('.hour');
      this.minuteElement = this.timeElement.querySelector('.minute');
      this.secondElement = this.timeElement.querySelector('.second');
    }
  }

  init() {
    // 使用 requestAnimationFrame 代替 setInterval，性能更好
    this.animateClock();
  }

  animateClock() {
    const now = new Date();
    const currentSeconds = now.getSeconds();
    const currentMinutes = now.getMinutes();
    const currentHours = now.getHours();

    // 只有当秒数变化时才更新（避免同一秒内多次更新）
    if (currentSeconds !== this.lastSeconds) {
      this.secondElement.textContent = this.zeroPadding(currentSeconds, 2);
      this.lastSeconds = currentSeconds;
    }

    // 分钟和小时变化频率低，单独判断更新
    if (currentMinutes !== this.lastMinutes) {
      this.minuteElement.textContent = this.zeroPadding(currentMinutes, 2);
      this.lastMinutes = currentMinutes;
    }

    if (currentHours !== this.lastHours) {
      this.hourElement.textContent = this.zeroPadding(currentHours, 2);
      this.lastHours = currentHours;
    }

    // 继续动画循环
    this.timerID = requestAnimationFrame(() => this.animateClock());
  }

  zeroPadding(num, digit) {
    return String(num).padStart(digit, '0');
  }

  destroy() {
    if (this.timerID !== null) {
      cancelAnimationFrame(this.timerID);
    }
  }
}

// Initialize clock immediately or on DOM ready
(function initClock() {
  const clockElement = document.getElementById('header-clock');
  if (clockElement) {
    window.headerClock = new HeaderClock(clockElement);
  } else if (document.readyState === 'loading') {
    // If DOM is still loading, wait for DOMContentLoaded
    document.addEventListener('DOMContentLoaded', function() {
      const clockElement = document.getElementById('header-clock');
      if (clockElement) {
        window.headerClock = new HeaderClock(clockElement);
      }
    });
  }
})();

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
  if (window.headerClock) {
    window.headerClock.destroy();
  }
});
