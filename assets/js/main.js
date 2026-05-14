/**
 * Hugo Theme Lumin - Main JavaScript
 */

(function() {
  'use strict';

  // Theme Toggle
  const ThemeToggle = {
    init() {
      this.toggle = document.getElementById('theme-toggle');
      this.html = document.documentElement;
      this.storageKey = 'lumin-theme';
      
      if (!this.toggle) return;
      
      // Load saved theme
      const savedTheme = localStorage.getItem(this.storageKey);
      if (savedTheme) {
        this.setTheme(savedTheme);
      }
      
      // Listen for toggle
      this.toggle.addEventListener('click', () => this.toggleTheme());
      
      // Listen for system changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(this.storageKey)) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
    },
    
    setTheme(theme) {
      this.html.setAttribute('data-theme', theme);
      localStorage.setItem(this.storageKey, theme);
    },
    
    toggleTheme() {
      const current = this.html.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      this.setTheme(next);
    }
  };

  // Mobile Menu
  const MobileMenu = {
    init() {
      this.toggle = document.getElementById('mobile-menu-toggle');
      this.menu = document.getElementById('mobile-menu');
      
      if (!this.toggle || !this.menu) return;
      
      this.toggle.addEventListener('click', () => {
        this.menu.classList.toggle('active');
      });
      
      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!this.toggle.contains(e.target) && !this.menu.contains(e.target)) {
          this.menu.classList.remove('active');
        }
      });
    }
  };

  // Search
  const Search = {
    init() {
      this.toggle = document.getElementById('search-toggle');
      this.modal = document.getElementById('search-modal');
      this.input = document.getElementById('search-input');
      this.close = document.getElementById('search-close');
      this.results = document.getElementById('search-results');
      
      if (!this.toggle || !this.modal) return;
      
      this.toggle.addEventListener('click', () => this.open());
      this.close?.addEventListener('click', () => this.close());
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.close();
      });
      
      // Keyboard shortcuts
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.modal.classList.contains('active')) {
          this.close();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          this.open();
        }
      });
      
      // Search input
      if (this.input) {
        this.input.addEventListener('input', this.debounce(() => this.search(), 300));
      }
      
      // Load search index
      this.loadIndex();
    },
    
    async loadIndex() {
      try {
        const response = await fetch('/index.json');
        this.index = await response.json();
      } catch (e) {
        console.log('Search index not available');
      }
    },
    
    open() {
      this.modal.classList.add('active');
      this.input?.focus();
    },
    
    close() {
      this.modal.classList.remove('active');
      if (this.input) {
        this.input.value = '';
      }
      if (this.results) {
        this.results.innerHTML = '';
      }
    },
    
    search() {
      const query = this.input.value.trim().toLowerCase();
      if (!query || !this.index) {
        this.results.innerHTML = '';
        return;
      }
      
      const results = this.index.filter(item => {
        return (item.title && item.title.toLowerCase().includes(query)) ||
               (item.content && item.content.toLowerCase().includes(query)) ||
               (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)));
      }).slice(0, 10);
      
      this.renderResults(results);
    },
    
    renderResults(results) {
      if (results.length === 0) {
        this.results.innerHTML = '<p class="search-empty" style="text-align: center; color: var(--text-muted); padding: 24px;">没有找到相关结果</p>';
        return;
      }
      
      this.results.innerHTML = results.map(item => `
        <a href="${item.permalink}" class="search-result-item" style="display: block; padding: 12px 16px; border-radius: 8px; margin-bottom: 8px; transition: background 0.2s;">
          <h4 style="font-size: 1rem; font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">${item.title}</h4>
          <p style="font-size: 0.875rem; color: var(--text-tertiary); line-height: 1.5;">${item.summary || ''}</p>
        </a>
      `).join('');
      
      // Add hover effect
      this.results.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
          item.style.background = 'var(--bg-secondary)';
        });
        item.addEventListener('mouseleave', () => {
          item.style.background = 'transparent';
        });
      });
    },
    
    debounce(fn, delay) {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
      };
    }
  };

  // Calendar Widget
  const Calendar = {
    init() {
      this.container = document.getElementById('calendar-widget');
      if (!this.container) return;
      
      this.render();
    },
    
    render() {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const today = now.getDate();
      
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', 
                          '七月', '八月', '九月', '十月', '十一月', '十二月'];
      const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
      
      let html = `
        <div class="calendar-header" style="text-align: center; margin-bottom: 12px; font-weight: 600; color: var(--text-primary);">
          ${year}年${monthNames[month]}
        </div>
        <div class="calendar-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center; font-size: 0.8rem;">
          ${dayNames.map(d => `<div style="padding: 4px; color: var(--text-muted); font-weight: 500;">${d}</div>`).join('')}
      `;
      
      // Empty cells
      for (let i = 0; i < firstDay; i++) {
        html += '<div></div>';
      }
      
      // Days
      for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === today;
        const style = isToday 
          ? 'background: var(--accent-color); color: white; border-radius: 50%;' 
          : 'color: var(--text-secondary);';
        html += `<div style="padding: 4px; ${style}">${day}</div>`;
      }
      
      html += '</div>';
      
      // Week info
      const weekNumber = this.getWeekNumber(now);
      const dayOfYear = this.getDayOfYear(now);
      
      html += `
        <div class="calendar-info" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-light); font-size: 0.75rem; color: var(--text-muted); text-align: center;">
          第${weekNumber}周 · 本年第${dayOfYear}天
        </div>
      `;
      
      this.container.innerHTML = html;
    },
    
    getWeekNumber(date) {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    },
    
    getDayOfYear(date) {
      const start = new Date(date.getFullYear(), 0, 0);
      const diff = date - start;
      return Math.floor(diff / (1000 * 60 * 60 * 24));
    }
  };

  // Countdown Widget
  const Countdown = {
    init() {
      this.items = document.querySelectorAll('.countdown-item');
      if (this.items.length === 0) return;
      
      this.update();
      setInterval(() => this.update(), 60000);
    },
    
    update() {
      const now = new Date();
      
      this.items.forEach(item => {
        const targetDate = new Date(item.dataset.date);
        const diff = targetDate - now;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        
        const daysEl = item.querySelector('.countdown-days');
        if (daysEl) {
          daysEl.textContent = days > 0 ? days : 0;
        }
      });
    }
  };

  // Back to Top
  const BackToTop = {
    init() {
      this.button = document.getElementById('back-to-top');
      if (!this.button) return;
      
      window.addEventListener('scroll', () => this.toggle());
      this.button.addEventListener('click', () => this.scroll());
    },
    
    toggle() {
      if (window.scrollY > 300) {
        this.button.classList.add('visible');
      } else {
        this.button.classList.remove('visible');
      }
    },
    
    scroll() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Reward Tabs
  const RewardTabs = {
    init() {
      // Post reward
      const postTabs = document.querySelectorAll('.post-reward .reward-tab');
      const postPanels = document.querySelectorAll('.post-reward .reward-panel');
      
      postTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const target = tab.dataset.tab;
          
          postTabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          
          postPanels.forEach(panel => {
            panel.classList.toggle('active', panel.dataset.panel === target);
          });
        });
      });
      
      // Widget reward
      const widgetBtns = document.querySelectorAll('.widget-reward .reward-btn');
      const widgetImgs = document.querySelectorAll('.widget-reward .reward-img');
      
      widgetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const type = btn.dataset.type;
          
          widgetBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          
          widgetImgs.forEach(img => {
            img.style.display = img.dataset.type === type ? 'block' : 'none';
          });
        });
      });
      
      // Initialize widget images
      widgetImgs.forEach((img, index) => {
        img.style.display = index === 0 ? 'block' : 'none';
      });
    }
  };

  // Initialize all modules
  document.addEventListener('DOMContentLoaded', () => {
    ThemeToggle.init();
    MobileMenu.init();
    Search.init();
    Calendar.init();
    Countdown.init();
    BackToTop.init();
    RewardTabs.init();
  });

})();
