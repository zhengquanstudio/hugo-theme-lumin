(function() {
  'use strict';
  var btn = document.getElementById('back-to-top');
  if (!btn) return;

  var progressRing = btn.querySelector('.btt-progress');
  var radius = 18;
  var circumference = 2 * Math.PI * radius;

  if (progressRing) {
    progressRing.style.strokeDasharray = circumference + ' ' + circumference;
    progressRing.style.strokeDashoffset = circumference;
  }

  var ticking = false;
  var showThreshold = 300;

  function update() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var scrollPercent = docHeight > 0 ? (scrollTop / docHeight) : 0;

    if (progressRing) {
      var offset = circumference - (scrollPercent * circumference);
      progressRing.style.strokeDashoffset = Math.max(0, offset);
    }

    if (scrollTop > showThreshold) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
    ticking = false;
  }

  function scrollToTop(e) {
    e && e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  btn.addEventListener('click', scrollToTop);

  update();
})();
