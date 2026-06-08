function renderProgress() {
  var now = new Date(), y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
  var yearStart = new Date(y, 0, 1), yearEnd = new Date(y + 1, 0, 1);
  var yearTotal = Math.ceil((yearEnd - yearStart) / 86400000);
  var yearPassed = Math.floor((now - yearStart) / 86400000) + 1;
  var yearLeft = yearTotal - yearPassed, yearPct = Math.round(yearPassed / yearTotal * 100);
  var monthStart = new Date(y, m, 1), monthEnd = new Date(y, m + 1, 0);
  var monthTotal = monthEnd.getDate();
  var monthPassed = d, monthLeft = monthTotal - d, monthPct = Math.round(d / monthTotal * 100);
  var dow = now.getDay() || 7;
  var weekPassed = dow, weekLeft = 7 - dow, weekPct = Math.round(dow / 7 * 100);

  var pEl = document.getElementById('cd-progress');
  if (!pEl) return;
  pEl.innerHTML =
    barHTML(yearPct, '本年还剩' + yearLeft + '天') +
    barHTML(monthPct, '本月还剩' + monthLeft + '天') +
    barHTML(weekPct, '本周还剩' + weekLeft + '天');
}

function barHTML(pct, label) {
  return '<div class="cd-progress-row">' +
    '<div class="cd-bar-header"><span class="cd-pct">' + pct + '%</span><span class="cd-label">' + label + '</span></div>' +
    '<div class="cd-bar-track"><div class="cd-bar-fill" style="width:' + pct + '%"></div></div>' +
    '</div>';
}

function updateEvent() {
  var el = document.querySelector('.countdown-event');
  if (!el) return;
  var target = new Date(el.dataset.date);
  if (isNaN(target.getTime())) return;
  var diff = Math.max(0, Math.ceil((target - new Date()) / 86400000));
  var daysEl = el.querySelector('.countdown-event-days');
  if (daysEl) daysEl.textContent = diff;
}

export function init() {
  var el = document.getElementById('countdown-widget');
  if (!el) return;
  renderProgress();
  updateEvent();
  setInterval(updateEvent, 60000);
}
