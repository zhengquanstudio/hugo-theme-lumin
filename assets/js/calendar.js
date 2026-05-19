/**
 * 日历卡片功能
 * 显示当前日期、农历、周数等信息，以及当月迷你日历
 */
(function() {
  'use strict';

  // 等待 Lunar 库加载
  function waitForLunar(callback) {
    if (typeof Lunar !== 'undefined') {
      callback();
    } else {
      setTimeout(() => waitForLunar(callback), 100);
    }
  }

  // 计算一年中的第几周（ISO 8601标准）
  function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  // 计算一年中的第几天
  function getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  // 获取星期几的中文
  function getWeekdayChinese(day) {
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    return '周' + weekdays[day];
  }

  // 生成当月日历
  function generateCalendar(year, month, today) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];

    // 填充前面的空白
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: '', isToday: false, isEmpty: true });
    }

    // 填充日期
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day: day,
        isToday: day === today,
        isEmpty: false
      });
    }

    return days;
  }

  // 计算春节日期（农历正月初一）
  function getSpringFestivalDate(year) {
    try {
      // 获取指定年份的春节日期
      const lunar = Lunar.fromYmd(year, 1, 1);
      const solar = lunar.getSolar();
      return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay());
    } catch (e) {
      console.error('[Calendar] Get spring festival error:', e);
      return new Date(year, 1, 1); // 默认返回2月1日
    }
  }

  // 更新日历显示
  function updateCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const date = now.getDate();
    const day = now.getDay();

    // 更新左侧信息
    document.getElementById('calendar-week').textContent = `第${getWeekNumber(now)}周`;
    document.getElementById('calendar-weekday').textContent = getWeekdayChinese(day);
    document.getElementById('calendar-day').textContent = date;
    document.getElementById('calendar-date').textContent = `${year}年${month + 1}月`;
    document.getElementById('calendar-year-day').textContent = `第${getDayOfYear(now)}天`;

    // 更新农历（使用 Lunar 库）
    try {
      const lunar = Lunar.fromDate(now);
      const lunarYearInGanZhi = lunar.getYearInGanZhi(); // 天干地支年份
      const lunarYearShengXiao = lunar.getYearShengXiao(); // 生肖
      const lunarMonth = lunar.getMonthInChinese();
      const lunarDay = lunar.getDayInChinese();

      document.getElementById('calendar-lunar-year').textContent = `${lunarYearInGanZhi}${lunarYearShengXiao}年`;
      document.getElementById('calendar-lunar-month').textContent = `${lunarMonth}月`;
      document.getElementById('calendar-lunar-day').textContent = lunarDay;
    } catch (e) {
      console.error('[Calendar] Lunar calculation error:', e);
      document.getElementById('calendar-lunar-year').textContent = '农历加载中';
      document.getElementById('calendar-lunar-month').textContent = '';
      document.getElementById('calendar-lunar-day').textContent = '';
    }

    // 生成迷你日历
    const calendarDays = generateCalendar(year, month, date);
    const daysContainer = document.getElementById('calendar-days');
    daysContainer.innerHTML = '';

    calendarDays.forEach(dayInfo => {
      const dayEl = document.createElement('span');
      dayEl.className = 'calendar-day-cell';

      if (dayInfo.isEmpty) {
        dayEl.classList.add('empty');
      } else {
        dayEl.textContent = dayInfo.day;
        if (dayInfo.isToday) {
          dayEl.classList.add('today');
        }
      }

      daysContainer.appendChild(dayEl);
    });
  }

  // 初始化
  function init() {
    // 检查是否有日历卡片
    const hasCalendar = document.querySelector('.tk-calendar-card');

    if (!hasCalendar) {
      return;
    }

    console.log('[Calendar] Initializing calendar...');

    // 等待 Lunar 库加载后初始化
    waitForLunar(() => {
      console.log('[Calendar] Lunar library loaded');
      updateCalendar();

      // 每秒检查一次，如果日期变化则更新
      let lastDate = new Date().getDate();
      setInterval(() => {
        const currentDate = new Date().getDate();
        if (currentDate !== lastDate) {
          console.log('[Calendar] Date changed, updating...');
          updateCalendar();
          lastDate = currentDate;
        }
      }, 1000);
    });
  }

  // DOM加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
