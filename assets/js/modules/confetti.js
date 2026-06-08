var triggers = document.querySelectorAll('[data-confetti]');

if (triggers.length === 0) {
  // 不需要 confetti，不加载库
}

function parseNumber(value, defaultValue) {
  var num = parseFloat(value);
  return isNaN(num) ? defaultValue : num;
}

function loadConfetti() {
  return new Promise(function(resolve, reject) {
    if (typeof window.confetti === 'function') {
      resolve();
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function launchConfetti(el) {
  if (typeof window.confetti !== 'function') {
    return;
  }

  var duration = parseNumber(el.getAttribute('data-confetti-duration'), 15000);
  var initialCount = parseInt(el.getAttribute('data-confetti-initial'), 10);

  var colorsAttr = el.getAttribute('data-confetti-colors');
  var colors = colorsAttr ? colorsAttr.split(',').map((c) => { return c.trim(); }) : [
    '#ff0000', '#ff6b00', '#ffcc00', '#00ff00', '#00ccff', '#0066ff', '#9900ff', '#ff00cc'
  ];

  if (initialCount > 0) {
    window.confetti({
      particleCount: initialCount,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors,
      gravity: parseNumber(el.getAttribute('data-confetti-gravity'), Math.random() * 0.2 + 0.4),
      scalar: parseNumber(el.getAttribute('data-confetti-scalar'), 1)
    });
  }

  if (duration > 0) {
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    var interval = setInterval(function() {
      var timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      window.confetti({
        ...defaults,
        particleCount: 3,
        origin: {
          x: randomInRange(0.1, 0.3),
          y: Math.random() * 0.2 + 0.5
        },
        colors: colors,
        gravity: parseNumber(el.getAttribute('data-confetti-gravity'), Math.random() * 0.2 + 0.4)
      });

      window.confetti({
        ...defaults,
        particleCount: 3,
        origin: {
          x: randomInRange(0.7, 0.9),
          y: Math.random() * 0.2 + 0.5
        },
        colors: colors,
        gravity: parseNumber(el.getAttribute('data-confetti-gravity'), Math.random() * 0.2 + 0.4)
      });
    }, 250);
  }
}

export function init() {
  triggers = document.querySelectorAll('[data-confetti]');
  if (triggers.length === 0) return;

  loadConfetti().then(function() {
    triggers.forEach((el) => {
      if (el.getAttribute('data-confetti-fired') === 'true') {
        return;
      }

      el.addEventListener('click', function() {
        if (el.getAttribute('data-confetti-fired') === 'true') {
          return;
        }
        el.setAttribute('data-confetti-fired', 'true');
        launchConfetti(el);
      });

      if (el.getAttribute('data-confetti-auto') === 'true') {
        el.setAttribute('data-confetti-fired', 'true');
        launchConfetti(el);
      }
    });
  }).catch(function(err) {
    console.error('[Confetti] Failed to load canvas-confetti:', err);
  });
}
