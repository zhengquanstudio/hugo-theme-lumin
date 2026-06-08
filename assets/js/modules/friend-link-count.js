export function init() {
  var grid = document.querySelector('.friends-grid');
  if (!grid) return;
  var count = grid.querySelectorAll('.friend-card').length;
  var totalEl = document.getElementById('friend-link-total');
  var statRow = document.getElementById('stats-friend-links');
  if (totalEl) totalEl.textContent = count;
  if (statRow) statRow.style.display = '';
}
