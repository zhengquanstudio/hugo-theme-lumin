var clock, timer;

function update() {
  if (!clock) return;
  var now = new Date();
  var h = String(now.getHours()).padStart(2, '0');
  var m = String(now.getMinutes()).padStart(2, '0');
  var s = String(now.getSeconds()).padStart(2, '0');
  clock.textContent = h + ':' + m + ':' + s;
}

export function init() {
  clock = document.getElementById('header-clock');
  if (!clock) { console.warn('[Clock] #header-clock 未找到'); return; }
  update();
  timer = setInterval(update, 1000);
  console.log('[Clock] ✓ 时钟已启动');
}
