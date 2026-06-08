var tocNav, tocLinks, headingsData, activeLink;
var observer = null;
var userScrollingToc = false, userScrollTimer = null;
var tocScrollHandler = null;

export function setActive(link) {
  if (activeLink === link) return;
  if (activeLink) { activeLink.classList.remove('active'); activeLink.style.cssText = ''; }
  link.classList.add('active');
  link.style.cssText = 'background:var(--accent-color,#3b82f6)!important;color:#fff!important;font-weight:600!important;border-left:3px solid var(--accent-color,#3b82f6)!important;padding-left:12px!important;border-radius:0 6px 6px 0!important;box-shadow:0 2px 8px rgba(59,130,246,.25)!important;';
  activeLink = link;
  scrollTocToActive(link);
}

function scrollTocToActive(activeEl) {
  if (!tocNav || !activeEl || userScrollingToc) return;
  var containerHeight = tocNav.clientHeight;
  var containerScrollTop = tocNav.scrollTop;
  var elOffsetTop = activeEl.offsetTop;
  var elHeight = activeEl.offsetHeight;
  var targetScroll = elOffsetTop - (containerHeight / 2) + (elHeight / 2);
  if (targetScroll < 0) targetScroll = 0;
  var maxScroll = tocNav.scrollHeight - containerHeight;
  if (targetScroll > maxScroll) targetScroll = maxScroll;
  if (Math.abs(containerScrollTop - targetScroll) > 2) {
    tocNav.scrollTo({
      top: Math.round(targetScroll),
      behavior: 'smooth'
    });
  }
}

function cleanupListeners() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (tocScrollHandler && tocNav) {
    tocNav.removeEventListener('scroll', tocScrollHandler);
    tocScrollHandler = null;
  }
}

export function init() {
  cleanupListeners();

  tocNav = document.getElementById('toc-nav');
  if (!tocNav) return;

  tocLinks = tocNav.querySelectorAll('a[href^="#"]');
  if (!tocLinks.length) return;

  headingsData = [];

  for (var li = 0; li < tocLinks.length; li++) {
    (function(link) {
      var href = link.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;
      var id = href.slice(1);
      var heading = document.getElementById(id);
      if (!heading) { try { heading = document.getElementById(decodeURIComponent(id)); } catch(e){} }
      if (!heading) {
        var txt = link.textContent.trim().toLowerCase().replace(/\s+/g,' ');
        var hs = document.querySelectorAll('h1,h2,h3,h4,h5,h6');
        for (var hi=0;hi<hs.length;hi++) {
          var ht = hs[hi].textContent.trim().toLowerCase().replace(/\s+/g,' ');
          if (ht===txt || ht.indexOf(txt)!==-1 || txt.indexOf(ht)!==-1) { heading=hs[hi]; break; }
        }
      }
      if (heading) { headingsData.push({el:heading,link:link}); }
    })(tocLinks[li]);
  }

  if (!headingsData.length) return;

  var visibleEntries = new Map();

  observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        visibleEntries.set(entry.target, entry);
      } else {
        visibleEntries.delete(entry.target);
      }
    });

    if (!visibleEntries.size) return;

    var topEntry = null;
    var topY = Infinity;
    visibleEntries.forEach(function(entry, target) {
      var rect = entry.boundingClientRect;
      if (rect.top < topY) {
        topY = rect.top;
        topEntry = entry;
      }
    });

    if (topEntry) {
      var matched = headingsData.filter(function(h) { return h.el === topEntry.target; });
      if (matched.length) setActive(matched[0].link);
    }
  }, {
    rootMargin: '-80px 0px -60% 0px',
    threshold: 0
  });

  headingsData.forEach(function(h) {
    observer.observe(h.el);
  });

  tocScrollHandler = function() {
    userScrollingToc = true;
    clearTimeout(userScrollTimer);
    userScrollTimer = setTimeout(function() { userScrollingToc = false; }, 1500);
  };
  tocNav.addEventListener('scroll', tocScrollHandler, {passive:true});
}
