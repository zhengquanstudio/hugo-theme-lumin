export function init() {
  var c = document.getElementById('calendar-widget');
  if (!c) return;
  var now = new Date(), y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
  var fd = new Date(y, m, 1).getDay(), dim = new Date(y, m + 1, 0).getDate();
  var mn = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
  var dn = ['日','一','二','三','四','五','六'];

  var startOfYear = new Date(y, 0, 1);
  var pastDays = Math.floor((now - startOfYear) / 86400000);
  var weekNum = Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
  var dayOfYear = pastDays + 1;

  var lunarInfo = [
    0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
    0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
    0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
    0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
    0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
    0x06ca0,0x0b550,0x15355,0x04da0,0x0a5d0,0x14573,0x052d0,0x0a9a8,0x0e950,0x06aa0,
    0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
    0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,
    0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
    0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x05ac0,0x0ab60,0x096d5,0x092e0,
    0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
    0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
    0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
    0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
    0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0
  ];
  var lunarMonth = ['正','二','三','四','五','六','七','八','九','十','冬','腊'];
  var lunarDay = ['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
                  '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
                  '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];
  var tianGan = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  var diZhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  var shengXiao = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
  function getLunar(y, m, d) {
    var baseDate = new Date(1900, 0, 31);
    var offset = Math.floor((new Date(y, m, d) - baseDate) / 86400000);
    var lunarYear = 1900, temp = 0;
    for (var i = 1900; i < 2100 && offset > 0; i++) { temp = getLunarYearDays(i); offset -= temp; if (offset <= 0) { offset += temp; break; } lunarYear++; }
    var leapMonth = getLeapMonth(lunarYear), isLeap = false;
    for (var j = 1; j < 13 && offset > 0; j++) {
      if (j === leapMonth + 1 && !isLeap) { --j; isLeap = true; temp = getLeapDays(lunarYear); } else { temp = getLunarMonthDays(lunarYear, j); }
      if (offset > temp) { offset -= temp; if (!isLeap) leapMonth = 0; } else { if (isLeap) leapMonth = j; break; }
    }
    var lm = isLeap ? '闰' + lunarMonth[leapMonth || j - 1] : lunarMonth[j - 1], ld = lunarDay[offset - 1];
    var gzYear = (lunarYear - 4) % 10, gzYue = (lunarYear - 4 + j) % 10, gzRi = (lunarYear - 4 + offset) % 10;
    var dzYear = (lunarYear - 4) % 12, dzYue = (lunarYear - 4 + j) % 12, dzRi = (lunarYear - 4 + offset) % 12;
    return {month: lm, day: ld, year: tianGan[gzYear] + diZhi[dzYear], animal: shengXiao[dzYear]};
  }
  function lYearDays(y) { var sum = 348; for (var i = 0x8000; i > 0x8; i >>= 1) sum += (lunarInfo[y - 1900] & i) ? 1 : 0; return sum + leapDays(y); }
  function leapDays(y) { if (leapMonth(y)) return (lunarInfo[y - 1900] & 0x10000) ? 30 : 29; return 0; }
  function leapMonth(y) { return lunarInfo[y - 1900] & 0xf; }
  function getLunarYearDays(y) { var days = 348; for (var i = 0x8000; i > 0x8; i >>= 1) days += (lunarInfo[y - 1900] & i) ? 1 : 0; return days + leapDays(y); }
  function getLeapDays(y) { if (getLeapMonth(y)) return (lunarInfo[y - 1900] & 0x10000) ? 30 : 29; return 0; }
  function getLeapMonth(y) { return lunarInfo[y - 1900] & 0xf; }
  function getLunarMonthDays(y, m) { return (lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29; }

  var lunar = getLunar(y, m, d);

  var h = '';
  h += '<div class="cal-body">';
  h += '<div class="cal-left">';
  h += '<div class="cal-top"><span class="cal-week-num">第' + weekNum + '周</span><span class="cal-weekday">周' + dn[now.getDay()] + '</span></div>';
  h += '<div class="cal-center"><div class="cal-day">' + d + '</div></div>';
  h += '<div class="cal-bottom">';
  h += '<div class="cal-info">' + y + '年' + (m + 1) + '月 第' + dayOfYear + '天</div>';
  h += '<div class="cal-lunar">' + lunar.year + lunar.animal + '年 ' + lunar.month + '月 ' + lunar.day + '</div>';
  h += '</div></div>';
  h += '<div class="cal-divider"></div>';
  h += '<div class="cal-right">';
  h += '<table class="cal-grid"><thead><tr>';
  dn.forEach(function(x) { h += '<th>' + x + '</th>'; });
  h += '</tr></thead><tbody><tr>';
  for (var i = 0; i < fd; i++) h += '<td class="cal-empty"></td>';
  for (var day = 1; day <= dim; day++) {
    var cls = '';
    if (day === d) cls = ' cal-today';
    h += '<td class="cal-cell' + cls + '">' + day + '</td>';
    if ((fd + day) % 7 === 0 && day < dim) h += '</tr><tr>';
  }
  h += '</td></tr></tbody></table></div></div>';

  c.innerHTML = h;
}
