var tocNav;

export function init() {
  tocNav = document.getElementById('toc-nav');
  if (!tocNav) return;

  var items = tocNav.querySelectorAll('li');
  items.forEach(function(li) {
    var childUl = li.querySelector(':scope > ul');
    if (!childUl) return;

    var firstChild = li.firstChild;
    var toggle = document.createElement('span');
    toggle.className = 'toc-toggle expanded';
    toggle.setAttribute('role', 'button');
    toggle.setAttribute('aria-label', '折叠目录');

    if (firstChild && (firstChild.nodeType === 1 || (firstChild.nodeType === 3 && !firstChild.textContent.trim()))) {
      li.insertBefore(toggle, firstChild);
    } else {
      li.prepend(toggle);
    }

    childUl.dataset.naturalHeight = childUl.scrollHeight + 'px';

    toggle.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleItem(toggle, childUl);
    });
  });

  if (!(window.siteConfig && window.siteConfig.tocExpandAll)) {
    autoCollapse();
  }
}

function toggleItem(toggle, ul) {
  var isExpanded = toggle.classList.contains('expanded');
  if (isExpanded) {
    ul.style.maxHeight = ul.scrollHeight + 'px';
    requestAnimationFrame(function() {
      ul.classList.add('collapsed');
      ul.style.maxHeight = '0';
    });
    toggle.classList.remove('expanded');
    toggle.setAttribute('aria-label', '展开目录');
  } else {
    ul.style.maxHeight = '0';
    ul.classList.remove('collapsed');
    ul.style.maxHeight = ul.scrollHeight + 'px';
    toggle.classList.add('expanded');
    toggle.setAttribute('aria-label', '折叠目录');
    setTimeout(function() { if (!ul.classList.contains('collapsed')) ul.style.maxHeight = ''; }, 320);
  }
}

function autoCollapse() {
  var subUls = tocNav.querySelectorAll('ul ul');
  subUls.forEach(function(ul) {
    var parentLi = ul.parentElement;
    var toggle = parentLi.querySelector('.toc-toggle');
    if (toggle && toggle.classList.contains('expanded')) {
      toggleItem(toggle, ul);
    }
  });
}
