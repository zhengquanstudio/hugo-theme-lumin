const selectors = ['.main-wrapper', '.single-post', '.post-content', '.page-content', '.list-container'];
let el = null;
for (let i = 0; i < selectors.length; i++) {
  el = document.querySelector(selectors[i]);
  if (el) break;
}
if (!el) return;

el.classList.add('content-fade-wrapper');

const triggerFadeIn = () => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.classList.add('fade-in');
    });
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', triggerFadeIn);
} else {
  triggerFadeIn();
}
