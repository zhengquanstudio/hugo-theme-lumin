var container, paginationEl;
var pageSize = 30;
var currentPage = 1;
var totalPages = 1;

function goToPage(page) {
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  var items = container.querySelectorAll('.archive-item');
  var start = (page - 1) * pageSize;
  var end = start + pageSize;

  for (var i = 0; i < items.length; i++) {
    if (i >= start && i < end) {
      items[i].removeAttribute('data-hidden');
    } else {
      items[i].setAttribute('data-hidden', '');
    }
  }

  renderPagination();
  window.scrollTo({ top: container.offsetTop - 100, behavior: 'smooth' });
}

function renderPagination() {
  if (!paginationEl || totalPages <= 1) {
    if (paginationEl) paginationEl.innerHTML = '';
    return;
  }

  var html = '';

  html += '<button class="page-btn' + (currentPage === 1 ? ' disabled' : '') + '" data-page="' + (currentPage - 1) + '">‹</button>';

  var pages = getVisiblePages(currentPage, totalPages);
  for (var i = 0; i < pages.length; i++) {
    if (pages[i] === '...') {
      html += '<span class="page-ellipsis">…</span>';
    } else {
      html += '<button class="page-btn' + (pages[i] === currentPage ? ' active' : '') + '" data-page="' + pages[i] + '">' + pages[i] + '</button>';
    }
  }

  html += '<button class="page-btn' + (currentPage === totalPages ? ' disabled' : '') + '" data-page="' + (currentPage + 1) + '">›</button>';
  html += '<span class="page-info">' + currentPage + ' / ' + totalPages + '</span>';

  paginationEl.innerHTML = html;
}

function getVisiblePages(current, total) {
  if (total <= 7) {
    var arr = [];
    for (var i = 1; i <= total; i++) arr.push(i);
    return arr;
  }
  if (current <= 3) return [1, 2, 3, 4, '...', total];
  if (current >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}

export function init() {
  container = document.getElementById('archives-timeline');
  paginationEl = document.getElementById('archives-pagination');
  if (!container || !paginationEl) return;

  pageSize = parseInt(container.getAttribute('data-page-size')) || 30;
  var total = parseInt(container.getAttribute('data-total')) || 0;
  totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) {
    paginationEl.innerHTML = '';
    return;
  }

  paginationEl.addEventListener('click', function(e) {
    var btn = e.target.closest('.page-btn');
    if (!btn || btn.classList.contains('disabled') || btn.classList.contains('active')) return;
    var page = parseInt(btn.getAttribute('data-page'));
    if (page) goToPage(page);
  });

  goToPage(1);
}
