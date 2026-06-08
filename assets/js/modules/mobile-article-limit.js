/**
 * MobileArticleLimit - 移动端文章分页加载
 * 配置通过 .article-grid 的 data-mobile-initial-show / data-mobile-load-more-step 属性传入
 */
class MobileArticleLimit {
  #MOBILE_BREAKPOINT = 768;
  #INITIAL_SHOW = 8;
  #LOAD_STEP = 8;
  #currentVisible = 0;
  #totalArticles = 0;
  #isInitialized = false;

  constructor() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.#init());
    } else {
      this.#init();
    }
  }

  #init() {
    if (this.#isInitialized) return;
    const grid = document.querySelector('.article-grid');
    if (!grid) return;
    const initialShow = parseInt(grid.dataset.mobileInitialShow) || this.#INITIAL_SHOW;
    const loadStep = parseInt(grid.dataset.mobileLoadMoreStep) || this.#LOAD_STEP;
    const cards = grid.querySelectorAll(':scope > .article-card');
    this.#totalArticles = cards.length;
    if (this.#totalArticles <= initialShow + 2) return;
    this.#createButton();
    this.#applyMobileView(initialShow, loadStep);
    this.#isInitialized = true;
    window.addEventListener('resize', this.#debounce(() => {
      if (window.innerWidth < this.#MOBILE_BREAKPOINT) {
        if (!document.querySelector('.mobile-load-more-container')) this.#createButton();
        this.#applyMobileView(initialShow, loadStep);
      } else {
        this.#showAll();
      }
    }, 200));
  }

  #createButton() {
    const container = document.createElement('div');
    container.className = 'mobile-load-more-container';
    container.innerHTML = '<button class="mobile-load-more-btn" type="button">加载更多</button>';
    container.querySelector('.mobile-load-more-btn').addEventListener('click', () => {
      const step = parseInt(document.querySelector('.article-grid').dataset.mobileLoadMoreStep) || this.#LOAD_STEP;
      this.#handleLoadMore(step);
    });
    document.querySelector('.article-grid').parentNode.insertBefore(container, document.querySelector('.article-grid').nextSibling);
  }

  #applyMobileView(showCount, loadStep) {
    const cards = document.querySelectorAll('.article-card');
    const isMobile = window.innerWidth < this.#MOBILE_BREAKPOINT;
    cards.forEach((card, index) => {
      if (isMobile) {
        card.style.display = index < showCount ? '' : 'none';
      } else {
        card.style.display = '';
      }
    });
    this.#currentVisible = showCount;
    this.#updateButton(loadStep);
    this.#toggleContainer(isMobile);
  }

  #showAll() {
    document.querySelectorAll('.article-card').forEach(card => { card.style.display = ''; });
    this.#toggleContainer(false);
  }

  #handleLoadMore(loadStep) {
    const nextVisible = Math.min(this.#currentVisible + loadStep, this.#totalArticles);
    const cards = document.querySelectorAll('.article-card');
    for (let i = this.#currentVisible; i < nextVisible; i++) {
      if (cards[i]) {
        cards[i].style.display = '';
        cards[i].style.opacity = '0';
        cards[i].style.transform = 'translateY(20px)';
        setTimeout(() => {
          cards[i].style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          cards[i].style.opacity = '1';
          cards[i].style.transform = 'translateY(0)';
        }, (i - this.#currentVisible) * 50);
      }
    }
    this.#currentVisible = nextVisible;
    this.#updateButton(loadStep);
  }

  #updateButton(loadStep) {
    const btn = document.querySelector('.mobile-load-more-btn');
    if (!btn) return;
    const remaining = this.#totalArticles - this.#currentVisible;
    if (remaining <= 0) {
      btn.textContent = '没有更多了';
      btn.disabled = true;
      btn.style.cursor = 'not-allowed';
    } else {
      btn.textContent = `加载更多 (${Math.min(remaining, loadStep)})`;
    }
  }

  #toggleContainer(show) {
    const container = document.querySelector('.mobile-load-more-container');
    if (container) container.style.display = show ? '' : 'none';
  }

  #debounce(fn, delay) {
    let timer = null;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }
}
new MobileArticleLimit();
