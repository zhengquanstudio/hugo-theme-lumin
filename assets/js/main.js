import { init as initBannerSlideshow } from './modules/banner-slideshow.js';
import { init as initTypewriter } from './modules/typewriter.js';
import { init as initThemeToggle } from './modules/theme-toggle.js';
import { init as initMobileMenu } from './modules/mobile-menu.js';
import { init as initNavScrollHide } from './modules/nav-scroll-hide.js';
import { init as initRightSide } from './modules/right-side.js';
import { init as initSearch } from './modules/search.js';
import { init as initCalendar } from './modules/calendar.js';
import { init as initVisitor } from './modules/visitor.js';
import { init as initCountdown } from './modules/countdown.js';
import { init as initBackToTop } from './modules/back-to-top.js';
import { init as initHeaderScroll } from './modules/header-scroll.js';
import { init as initScrollDownHint } from './modules/scroll-down-hint.js';
import { init as initHeaderClock } from './modules/header-clock.js';
import { init as initTocCollapsible } from './modules/toc-collapsible.js';
import { init as initTocHighlight } from './modules/toc-highlight.js';
import { init as initMobileCategory } from './modules/mobile-category.js';
import { init as initArchivePagination } from './modules/archive-pagination.js';
import { init as initCodeBlock } from './modules/code-block.js';
import { init as initReadingProgress } from './modules/reading-progress.js';
import { init as initFriendLinkCount } from './modules/friend-link-count.js';
import { init as initCopyCopyright } from './modules/copy-copyright.js';
import { init as initShare } from './modules/share.js';
import { init as initTagCloud } from './modules/tag-cloud.js';
import { init as initReadingMode } from './modules/reading-mode.js';
import { init as initGlobalAudio } from './modules/global-audio.js';
import { init as initKeyboardShortcuts } from './modules/keyboard-shortcuts.js';
import { init as initFancybox } from './modules/fancybox-init.js';
import { init as initPostLike } from './modules/post-like.js';
import { init as initHeadingAnchor } from './modules/heading-anchor.js';
import { init as initMobileToc } from './modules/mobile-toc.js';
import { init as initScrollMemory } from './modules/scroll-memory.js';
import { init as initSubscription } from './modules/subscription.js';

var coreModules = [
  { name: 'HeaderScroll',      fn: initHeaderScroll },
  { name: 'HeaderClock',       fn: initHeaderClock },
  { name: 'BannerSlideshow',   fn: initBannerSlideshow },
  { name: 'Typewriter',        fn: initTypewriter },
  { name: 'ThemeToggle',       fn: initThemeToggle },
  { name: 'MobileMenu',        fn: initMobileMenu },
  { name: 'MobileCategory',    fn: initMobileCategory },
  { name: 'NavScrollHide',     fn: initNavScrollHide },
  { name: 'RightSide',         fn: initRightSide },
  { name: 'Search',            fn: initSearch },
  { name: 'Calendar',          fn: initCalendar },
  { name: 'Visitor',           fn: initVisitor },
  { name: 'Countdown',         fn: initCountdown },
  { name: 'BackToTop',         fn: initBackToTop },
  { name: 'ScrollDownHint',    fn: initScrollDownHint },
  { name: 'TocCollapsible',    fn: initTocCollapsible },
  { name: 'TocHighlight',      fn: initTocHighlight },
  { name: 'ArchivePagination', fn: initArchivePagination },
  { name: 'CodeBlock',         fn: initCodeBlock },
  { name: 'ReadingProgress',   fn: initReadingProgress },
  { name: 'FriendLinkCount',   fn: initFriendLinkCount },
  { name: 'CopyCopyright',     fn: initCopyCopyright },
  { name: 'Share',             fn: initShare },
  { name: 'TagCloud',          fn: initTagCloud },
  { name: 'ReadingMode',       fn: initReadingMode },
  { name: 'GlobalAudio',       fn: initGlobalAudio },
  { name: 'KeyboardShortcuts', fn: initKeyboardShortcuts },
  { name: 'Fancybox',          fn: initFancybox },
  { name: 'PostLike',           fn: initPostLike },
  { name: 'HeadingAnchor',      fn: initHeadingAnchor },
  { name: 'MobileToc',          fn: initMobileToc },
  { name: 'ScrollMemory',       fn: initScrollMemory },
  { name: 'Subscription',       fn: initSubscription }
];

var swupContentModules = [
  { name: 'CodeBlock',         fn: initCodeBlock },
  { name: 'Calendar',          fn: initCalendar },
  { name: 'Visitor',           fn: initVisitor },
  { name: 'Countdown',         fn: initCountdown },
  { name: 'ReadingProgress',   fn: initReadingProgress },
  { name: 'TocCollapsible',    fn: initTocCollapsible },
  { name: 'TocHighlight',      fn: initTocHighlight },
  { name: 'ArchivePagination', fn: initArchivePagination },
  { name: 'FriendLinkCount',   fn: initFriendLinkCount },
  { name: 'Share',             fn: initShare },
  { name: 'TagCloud',          fn: initTagCloud },
  { name: 'ReadingMode',       fn: initReadingMode },
  { name: 'CopyCopyright',     fn: initCopyCopyright },
  { name: 'Fancybox',          fn: initFancybox },
  { name: 'PostLike',          fn: initPostLike },
  { name: 'HeadingAnchor',      fn: initHeadingAnchor },
  { name: 'MobileToc',          fn: initMobileToc },
  { name: 'PdfExport',         fn: function() { import('./modules/pdf-export.js').then(function(m) { m.init(); }).catch(function(){}); } },
  { name: 'LazyLoad',          fn: function() { import('./modules/lazy-load.js').then(function(m) { m.init(); }).catch(function(){}); } }
];

function runModules(list) {
  for (var i = 0; i < list.length; i++) {
    try {
      list[i].fn();
    } catch(e) {
      console.warn('[Lumin] 模块 ' + list[i].name + ' 初始化失败:', e.message || e);
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  runModules(coreModules);
  console.log('[Lumin] ✓ 核心模块初始化完成');

  document.addEventListener('swup:contentReplaced', function() {
    runModules(swupContentModules);
    loadDeferredModules();
  });
});

var deferredLoaded = false;
function loadDeferredModules() {
  if (deferredLoaded) return;
  deferredLoaded = true;
  import('./modules/pwa-install.js').then(function(m) { m.init(); }).catch(function(){});
  import('./modules/pdf-export.js').then(function(m) { m.init(); }).catch(function(){});
  import('./modules/lazy-load.js').then(function(m) { m.init(); }).catch(function(){});
  import('./modules/confetti.js').then(function(m) { m.init(); }).catch(function(){});
  import('./modules/web-vitals.js').then(function(m) { m.init(); }).catch(function(){});
}

if (document.readyState === 'complete') {
  loadDeferredModules();
} else {
  window.addEventListener('load', function() {
    setTimeout(loadDeferredModules, 300);
  });
}