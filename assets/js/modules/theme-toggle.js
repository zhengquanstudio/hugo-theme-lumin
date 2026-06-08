var toggle, html, key, transitioning;
var DURATION = 1000;
var EFFECT = 'circle';

function frostColor(alpha) { return 'rgba(180,180,195,' + alpha + ')'; }
function accentC(dark) { return dark ? 'rgba(100,116,139,0.35)' : 'rgba(148,163,184,0.4)'; }

function glassWrap() {
  var w = document.createElement('div');
  w.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999;' +
    'pointer-events:none;overflow:hidden;' +
    'backdrop-filter:saturate(0.8);';
  return w;
}

function commitTheme(next) {
  html.setAttribute('data-theme', next);
  localStorage.setItem(key, next);
  
  // 触发代码高亮主题更新
  updateCodeHighlightTheme(next);
}

// 更新代码高亮样式（根据主题模式）
function updateCodeHighlightTheme(theme) {
  var codeBlocks = document.querySelectorAll('.code-wrapper pre');
  if (!codeBlocks.length) return;
  
  console.log('[Theme] 🎨 更新代码高亮主题: ' + theme);
  
  // CSS 会通过 [data-theme] 选择器自动应用样式
  // 这里只需要确保代码块重新渲染（如果需要更复杂的逻辑）
  codeBlocks.forEach(function(pre) {
    // 触发动画重绘
    pre.style.transition = 'none';
    requestAnimationFrame(function() {
      pre.style.transition = '';
    });
  });
}

function cleanup(wrap, delay) {
  setTimeout(function() {
    if (wrap && wrap.parentNode) wrap.parentNode.removeChild(wrap);
    document.body.classList.remove('is-switching-theme');
    transitioning = false;
  }, delay || 200);
}

function effectRipple(next, x, y) {
  var wrap = glassWrap();
  var glass = document.createElement('div');
  glass.style.cssText =
    'position:absolute;top:0;left:0;width:100%;height:100%;' +
    'background:' + frostColor(0) + ';' +
    'backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);' +
    'transition:background 600ms ease-in-out;';
  wrap.appendChild(glass);

  for (var i = 0; i < 3; i++) {
    (function(idx) {
      var wave = document.createElement('div');
      wave.style.cssText =
        'position:absolute;top:' + y + 'px;left:' + x + 'px;' +
        'width:14px;height:14px;margin:-7px 0 0 -7px;' +
        'border-radius:50%;border:2px solid ' + accentC(next === 'dark') + ';' +
        'opacity:0;transform:scale(0);' +
        'box-shadow:0 0 16px ' + accentC(next === 'dark') + ';';
      wrap.appendChild(wave);

      setTimeout(function() {
        wave.style.transition = 'transform ' + (1100 + idx * 280) + 'ms cubic-bezier(.22,1,.36,1), opacity 900ms ease-out';
        wave.style.transform = 'scale(150)';
        wave.style.opacity = '0.5';
        setTimeout(function() { wave.style.opacity = '0'; }, 400);
      }, 35 + idx * 120);
    })(i);
  }

  document.body.appendChild(wrap);
  document.body.classList.add('is-switching-theme');

  requestAnimationFrame(function() {
    glass.style.background = frostColor(0.38);
  });

  setTimeout(function() { commitTheme(next); }, DURATION * 0.42);

  setTimeout(function() {
    glass.style.transition = 'background 700ms cubic-bezier(.4,0,.2,1)';
    glass.style.background = frostColor(0);
  }, DURATION * 0.65);

  cleanup(wrap, DURATION + 400);
}

function effectDiagonal(next) {
  var wrap = glassWrap();

  var sweep = document.createElement('div');
  sweep.style.cssText =
    'position:absolute;top:0;left:0;width:100%;height:100%;' +
    'clip-path:polygon(100% 0, 100% 0, 100% 0);' +
    'background:' + frostColor(0.4) + ';' +
    'backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);' +
    'transition:clip-path ' + DURATION + 'ms cubic-bezier(.4,0,.2,1);';
  wrap.appendChild(sweep);

  document.body.appendChild(wrap);
  document.body.classList.add('is-switching-theme');

  requestAnimationFrame(function() {
    sweep.style.clipPath = 'polygon(100% 0, 100% 100%, 0 100%)';
  });

  setTimeout(function() { commitTheme(next); }, DURATION * 0.38);

  setTimeout(function() {
    sweep.style.transition = 'opacity 500ms ease-out, clip-path 550ms ease-in-out';
    sweep.style.opacity = '0';
    sweep.style.clipPath = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
  }, DURATION + 50);

  cleanup(wrap, DURATION + 650);
}

function effectBlinds(next) {
  var wrap = glassWrap();
  wrap.style.perspective = '1400px';

  var cols = 10;
  for (var i = 0; i < cols; i++) {
    var blade = document.createElement('div');
    blade.style.cssText =
      'position:absolute;top:0;height:100%;' +
      'left:' + (i * 100 / cols) + '%;width:' + (100 / cols + 1) + '%;' +
      'transform-origin:left center;' +
      'background:' + frostColor(0.42) + ';' +
      'backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);' +
      'transform:rotateY(-90deg);' +
      'backface-visibility:hidden;' +
      'transition:transform ' + (600 + i * 55) + 'ms cubic-bezier(.22,1,.36,1), opacity 400ms ease-out;';
    wrap.appendChild(blade);
  }

  document.body.appendChild(wrap);
  document.body.classList.add('is-switching-theme');

  requestAnimationFrame(function() {
    var blades = wrap.children;
    for (var j = 0; j < blades.length; j++) {
      (function(b) { b.style.transform = 'rotateY(0deg)'; })(blades[j]);
    }
  });

  setTimeout(function() { commitTheme(next); }, DURATION * 0.4);

  setTimeout(function() {
    var blades = wrap.children;
    for (var k = 0; k < blades.length; k++) {
      blades[k].style.transform = 'rotateY(30deg)';
      blades[k].style.opacity = '0';
    }
  }, DURATION + 120);

  cleanup(wrap, DURATION + 700);
}

function effectCircle(next, x, y) {
  var maxX = Math.max(x, window.innerWidth - x);
  var maxY = Math.max(y, window.innerHeight - y);
  var endR = Math.sqrt(maxX * maxX + maxY * maxY) + 200;

  var wrap = glassWrap();

  var circle = document.createElement('div');
  circle.style.cssText =
    'position:absolute;top:0;left:0;width:100%;height:100%;' +
    'clip-path:circle(0px at ' + x + 'px ' + y + 'px);' +
    'background:' + frostColor(0.4) + ';' +
    'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);' +
    'transition:clip-path ' + DURATION + 'ms cubic-bezier(.22,1,.36,1);';
  wrap.appendChild(circle);

  var glow = document.createElement('div');
  glow.style.cssText =
    'position:absolute;top:' + y + 'px;left:' + x + 'px;' +
    'width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;' +
    'background:radial-gradient(circle,' + accentC(next === 'dark') + ', transparent 75%);' +
    'transform:scale(0);opacity:0.7;' +
    'transition:transform ' + (DURATION + 250) + 'ms cubic-bezier(.22,1,.36,1), opacity 900ms ease-out;';
  wrap.appendChild(glow);

  document.body.appendChild(wrap);
  document.body.classList.add('is-switching-theme');

  requestAnimationFrame(function() {
    circle.style.clipPath = 'circle(' + endR + 'px at ' + x + 'px ' + y + 'px)';
    glow.style.transform = 'scale(26)';
  });

  setTimeout(function() { glow.style.opacity = '0'; }, DURATION * 0.35);
  setTimeout(function() { commitTheme(next); }, DURATION * 0.4);

  setTimeout(function() {
    circle.style.transition = 'opacity 500ms ease-out, clip-path 550ms cubic-bezier(.55,.06,.68,.19)';
    circle.style.opacity = '0';
    circle.style.clipPath = 'circle(' + (endR * 1.5) + 'px at ' + x + 'px ' + y + 'px)';
  }, DURATION + 80);

  cleanup(wrap, DURATION + 700);
}

function effectStar(next, x, y) {
  var wrap = glassWrap();

  var core = document.createElement('div');
  core.style.cssText =
    'position:absolute;top:' + y + 'px;left:' + x + 'px;width:8px;height:8px;' +
    'margin:-4px 0 0 -4px;border-radius:50%;' +
    'background:radial-gradient(circle,#fff 0%,' + accentC(next === 'dark') + ' 55%,transparent 100%);' +
    'box-shadow:0 0 20px 10px rgba(255,255,255,0.4), 0 0 45px 22px rgba(255,255,255,0.15);' +
    'transform:scale(0);opacity:0;' +
    'transition:transform 550ms cubic-bezier(.175,.885,.32,1.275), opacity 350ms ease-out;';
  wrap.appendChild(core);

  for (var i = 0; i < 8; i++) {
    (function(idx) {
      var ray = document.createElement('div');
      ray.style.cssText =
        'position:absolute;top:' + y + 'px;left:' + x + 'px;width:2px;height:200px;' +
        'margin:-100px 0 0 -1px;' +
        'background:linear-gradient(to bottom, ' + accentC(next === 'dark') + ', transparent);' +
        'transform-origin:center top;' +
        'transform:rotate(' + (idx * 45) + 'deg) scaleY(0);' +
        'border-radius:2px;opacity:0;' +
        'transition:transform 750ms cubic-bezier(.34,1.56,.64,1), opacity 550ms ease-out;';
      wrap.appendChild(ray);

      setTimeout(function() {
        ray.style.transform = 'rotate(' + (idx * 45) + 'deg) scaleY(1)';
        ray.style.opacity = '0.4';
      }, 45 + idx * 35);
    })(i);
  }

  document.body.appendChild(wrap);
  document.body.classList.add('is-switching-theme');

  setTimeout(function() {
    core.style.transform = 'scale(14)';
    core.style.opacity = '1';
  }, 30);

  setTimeout(function() { core.style.opacity = '0'; }, DURATION * 0.4);
  setTimeout(function() { commitTheme(next); }, DURATION * 0.38);

  setTimeout(function() {
    var ch = wrap.children;
    for (var j = 0; j < ch.length; j++) {
      ch[j].style.transition = 'opacity 450ms ease-out';
      ch[j].style.opacity = '0';
    }
  }, DURATION + 40);

  cleanup(wrap, DURATION + 600);
}

function switchTheme() {
  if (transitioning || !toggle || !html) return;
  transitioning = true;

  var cur = html.getAttribute('data-theme') || 'light';
  var next = cur === 'dark' ? 'light' : 'dark';

  console.log('[Theme] 🔄 切换: ' + cur + ' → ' + next + ' (' + EFFECT + ')');

  var rect = toggle.getBoundingClientRect();
  var x = rect.left + rect.width / 2;
  var y = rect.top + rect.height / 2;

  switch (EFFECT) {
    case 'ripple':   effectRipple(next, x, y); break;
    case 'diagonal': effectDiagonal(next); break;
    case 'blinds':   effectBlinds(next); break;
    case 'star':     effectStar(next, x, y); break;
    default:         effectCircle(next, x, y); break;
  }
}

export function init() {
  html = document.documentElement;
  key = 'lumin-theme';

  // 优先读取 URL 参数 ?theme=dark|light（来自后台管理的主题同步）
  var params = new URLSearchParams(location.search);
  var urlTheme = params.get('theme');
  if (urlTheme === 'dark' || urlTheme === 'light') {
    localStorage.setItem(key, urlTheme);
    html.setAttribute('data-theme', urlTheme);
  } else {
    var saved = localStorage.getItem(key);
    if (saved) { html.setAttribute('data-theme', saved); }
  }

  // 监听其他标签页的主题变更（与后台管理系统同步）
  window.addEventListener('storage', function(e) {
    if (e.key === key && e.newValue && (e.newValue === 'dark' || e.newValue === 'light')) {
      html.setAttribute('data-theme', e.newValue);
      console.log('[Theme] 🔄 从其他标签页同步主题: ' + e.newValue);
      // 更新代码高亮主题
      updateCodeHighlightTheme(e.newValue);
    }
  });

  toggle = document.getElementById('theme-toggle');
  if (!toggle) { console.warn('[Theme] #theme-toggle 未找到，主题已应用但切换按钮不可用'); return; }

  try {
    if (window.LUMIN_BANNER && window.LUMIN_BANNER.themeEffect) {
      EFFECT = window.LUMIN_BANNER.themeEffect;
    }
  } catch(e) {}

  toggle.addEventListener('click', function(e) { e.preventDefault(); switchTheme(); });

  // 初始化时更新代码高亮主题
  var currentTheme = html.getAttribute('data-theme') || 'light';
  updateCodeHighlightTheme(currentTheme);

  console.log('[Theme] ✓ 主题切换已初始化 (当前: ' + currentTheme + ', 效果: ' + EFFECT + ')');
}
