export function init() {
  var toggle = document.getElementById('mobile-menu-toggle');
  var menu = document.getElementById('mobile-menu');
  var overlay = document.getElementById('mobile-menu-overlay');
  if (!toggle || !menu) return;

  var prevFocus = null;

  function toggleMenu(show) {
    if (show) {
      prevFocus = document.activeElement;
      menu.classList.add('active');
      menu.setAttribute('aria-hidden', 'false');
      if (overlay) overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      var firstLink = menu.querySelector('a, button, [tabindex]');
      if (firstLink) firstLink.focus();
    } else {
      menu.classList.remove('active');
      menu.setAttribute('aria-hidden', 'true');
      if (overlay) overlay.classList.remove('active');
      document.body.style.overflow = '';
      if (prevFocus && prevFocus.focus) prevFocus.focus();
      prevFocus = null;
    }
  }

  toggle.addEventListener('click', function() {
    var isActive = menu.classList.contains('active');
    toggleMenu(!isActive);
  });

  if (overlay) {
    overlay.addEventListener('click', function() {
      toggleMenu(false);
    });
  }

  document.addEventListener('click', function(e) {
    if (!toggle.contains(e.target) && !menu.contains(e.target)) {
      toggleMenu(false);
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && menu.classList.contains('active')) {
      toggleMenu(false);
    }
    if (e.key === 'Tab' && menu.classList.contains('active')) {
      trapMenuFocus(e);
    }
  });

  function trapMenuFocus(e) {
    var focusable = menu.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  var toggles = menu.querySelectorAll('.mobile-nav-toggle');
  toggles.forEach((toggle) => {
    toggle.addEventListener('click', function() {
      var isActive = this.classList.contains('active');
      var submenu = this.nextElementSibling;

      toggles.forEach((otherToggle) => {
        if (otherToggle !== toggle) {
          otherToggle.classList.remove('active');
          var otherSubmenu = otherToggle.nextElementSibling;
          if (otherSubmenu) otherSubmenu.classList.remove('active');
        }
      });

      this.classList.toggle('active', !isActive);
      if (submenu) submenu.classList.toggle('active', !isActive);
    });
  });
}
