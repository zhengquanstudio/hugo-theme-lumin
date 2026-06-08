var bar, fill, article, tooltip;
var lastScrollTime = 0;
var scrollTimeout;

function update() {
  if (!article || !fill) return;
  
  var articleRect = article.getBoundingClientRect();
  var articleTop = articleRect.top + window.scrollY;
  var articleHeight = article.offsetHeight;
  var windowHeight = window.innerHeight;
  var scrolled = Math.max(0, window.scrollY - articleTop + windowHeight * 0.3);
  var total = articleHeight - windowHeight * 0.3;
  var progress = Math.min(100, Math.max(0, (scrolled / total) * 100));
  
  // 更新进度条宽度
  fill.style.width = progress.toFixed(2) + '%';
  
  // 更新颜色渐变（根据进度）
  updateProgressColor(progress);
  
  // 更新提示框（防抖处理）
  var now = Date.now();
  if (now - lastScrollTime > 100) {
    updateTooltip(progress, articleHeight, scrolled, windowHeight);
    lastScrollTime = now;
  }
}

// 更新进度条颜色（根据进度变化）
function updateProgressColor(progress) {
  if (!fill) return;
  
  var hue, saturation, lightness;
  
  if (progress < 50) {
    // 0-50%: 蓝色 -> 绿色
    hue = 210 + (progress / 50) * 90; // 210(blue) -> 120(green)
    saturation = 70;
    lightness = 55;
  } else {
    // 50-100%: 绿色 -> 橙色
    hue = 120 - ((progress - 50) / 50) * 60; // 120(green) -> 30(orange)
    saturation = 80;
    lightness = 50;
  }
  
  fill.style.background = 'linear-gradient(90deg, hsl(' + hue + ', ' + saturation + '%, ' + lightness + '%), hsl(' + (hue - 20) + ', ' + saturation + '%, ' + (lightness + 5) + '%))';
  fill.style.boxShadow = '0 0 8px hsla(' + hue + ', ' + saturation + '%, ' + lightness + '%, 0.5)';
}

// 更新提示框（显示百分比和剩余时间）
function updateTooltip(progress, articleHeight, scrolled, windowHeight) {
  if (!tooltip) return;
  
  var percent = Math.round(progress);
  
  // 计算剩余阅读时间（假设每分钟读300字）
  var remainingHeight = articleHeight - scrolled;
  var estimatedMinutes = Math.ceil(remainingHeight / 1000); // 简化估算
  
  if (percent >= 100) {
    tooltip.innerHTML = '<i class="fas fa-check-circle"></i> 已读完';
  } else {
    var timeText = estimatedMinutes > 0 ? ' · 剩' + estimatedMinutes + '分钟' : '';
    tooltip.innerHTML = '<i class="fas fa-book-reader"></i> ' + percent + '%' + timeText;
  }
  
  // 显示提示框
  tooltip.classList.add('show');
  
  // 清除之前的定时器
  if (scrollTimeout) clearTimeout(scrollTimeout);
  
  // 停止滚动后隐藏提示框
  scrollTimeout = setTimeout(function() {
    tooltip.classList.remove('show');
  }, 1500);
}

// 点击进度条跳转
function handleClick(e) {
  if (!article || !bar) return;
  
  e.preventDefault();
  
  var rect = bar.getBoundingClientRect();
  var clickX = e.clientX - rect.left;
  var clickPercent = clickX / rect.width;
  
  var articleRect = article.getBoundingClientRect();
  var articleTop = articleRect.top + window.scrollY;
  var articleHeight = article.offsetHeight;
  var windowHeight = window.innerHeight;
  
  // 计算目标滚动位置
  var targetScroll = articleTop - windowHeight * 0.3 + (articleHeight - windowHeight * 0.3) * clickPercent;
  
  // 平滑滚动到目标位置
  window.scrollTo({
    top: targetScroll,
    behavior: 'smooth'
  });
}

export function init() {
  bar = document.getElementById('reading-progress');
  fill = document.querySelector('.reading-progress-fill');
  if (!bar || !fill) return;

  article = document.querySelector('.single-post');
  if (!article) return;
  
  // 创建提示框元素
  tooltip = document.createElement('div');
  tooltip.className = 'reading-progress-tooltip';
  document.body.appendChild(tooltip);

  window.addEventListener('scroll', function() { update(); }, { passive: true });
  
  // 添加点击跳转功能
  bar.addEventListener('click', handleClick);
  
  update();

  window.initReadingProgress = init;
}
