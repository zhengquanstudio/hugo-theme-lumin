import { getBannerConfig } from './banner-config.js';

var slides, total, current, interval, timer, randomMode;
var transitioning = false;

function switchTo(index) {
  if (!slides || index < 0 || index >= total || transitioning) return;

  transitioning = true;
  var prevIndex = current;
  current = index;

  var prev = slides[prevIndex];
  var next = slides[index];

  for (var i = 0; i < total; i++) {
    if (i !== prevIndex && i !== index) {
      slides[i].classList.remove('active');
      slides[i].style.cssText = 'opacity:0;z-index:0;position:absolute;inset:0;';
    }
  }

  next.classList.add('active');
  next.style.cssText = 'opacity:0;z-index:1;position:absolute;inset:0;transition:opacity 1.2s ease-in-out;';
  void next.offsetHeight;

  prev.style.cssText = 'opacity:0;z-index:2;position:absolute;inset:0;transition:opacity 1.2s ease-in-out;';
  next.style.cssText = 'opacity:1;z-index:1;position:absolute;inset:0;transition:opacity 1.2s ease-in-out;';

  console.log('[Banner] 🔄 ' + (prevIndex+1) + '→' + (index+1) + '/' + total);

  setTimeout(function() {
    prev.classList.remove('active');
    prev.style.cssText = 'opacity:0;z-index:0;position:absolute;inset:0;transition:opacity 1.2s ease-in-out;';
    next.style.cssText = 'opacity:1;z-index:2;position:absolute;inset:0;transition:opacity 1.2s ease-in-out;';
    transitioning = false;
  }, 1300);
}

function next() {
  if (!slides || total < 2 || transitioning) return;
  switchTo((current + 1) % total);
}

export function init() {
  slides = document.querySelectorAll('.banner-slide');
  if (!slides || !slides.length) { console.warn('[Banner] 未找到 .banner-slide'); return; }

  total = slides.length;
  current = 0;
  transitioning = false;

  try {
    var cfg = getBannerConfig();
    interval = Math.max(3000, (cfg.interval || 5000));
    randomMode = (cfg.randomMode === true);
  } catch(e) { interval = 5000; randomMode = false; }

  console.log('[Banner] ✓ 初始化: ' + total + ' 张, 间隔=' + interval + 'ms');

  for (var k = 0; k < total; k++) {
    slides[k].style.cssText = 'position:absolute;inset:0;transition:opacity 1.2s ease-in-out;';
  }

  var imgs = document.querySelectorAll('.banner-slide-image');
  for (var j = 0; j < imgs.length; j++) {
    if (imgs[j].src) new Image().src = imgs[j].src;
  }

  if (randomMode && total > 1) {
    var rnd = Math.floor(Math.random() * total);
    console.log('[Banner] 🎲 随机选择第 ' + (rnd + 1) + ' 张');
    slides[rnd].classList.add('active');
    slides[rnd].style.opacity = '1';
    slides[rnd].style.zIndex = '2';
    current = rnd;
  } else {
    slides[0].classList.add('active');
    slides[0].style.opacity = '1';
    slides[0].style.zIndex = '2';
  }

  if (total >= 2) {
    if (timer) clearInterval(timer);
    timer = setInterval(next, interval);
    console.log('[Banner] ⏱️ 轮播已启动 (' + interval + 'ms, 淡入淡出1.2s)');
  }
}
