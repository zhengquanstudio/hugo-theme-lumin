var header;

export function init() {
  header = document.querySelector('.site-header');
  if (!header) return;
  window.addEventListener('scroll', function() {
    header.classList.toggle('scrolled', window.scrollY > 100);
  });
}
