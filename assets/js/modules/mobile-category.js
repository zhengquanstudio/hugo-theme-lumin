export function init() {
  var toggles = document.querySelectorAll('.mobile-nav-toggle');
  if (!toggles.length) return;
  toggles.forEach((toggle) => {
    toggle.addEventListener('click', function(e) {
      e.stopPropagation();
      var parent = this.closest('.mobile-nav-item');
      if (parent) parent.classList.toggle('active');
    });
  });
}
