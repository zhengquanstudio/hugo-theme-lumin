/**
 * Live2D 看板娘初始化 — 配置通过 #l2d-config 的 data-* 属性传入
 * 依赖 l2d-widget CDN 加载的 window.L2D_WIDGET
 */
(function() {
  var cfg = document.getElementById('l2d-config');
  if (!cfg) return;

  var modelPath = cfg.dataset.model || '/live2d/miku/miku_sample_t04.model3.json';
  var baseWidth = parseInt(cfg.dataset.width) || 280;
  var baseHeight = parseInt(cfg.dataset.height) || 250;
  var pos = cfg.dataset.position || 'left';

  function initWidget() {
    if (!window.L2D_WIDGET || !window.L2D_WIDGET.createWidget) {
      setTimeout(initWidget, 200);
      return;
    }

    window.L2D_WIDGET.createWidget({
      model: {
        path: modelPath,
        tips: {
          welcomeMessage: ['欢迎来到我的博客！', '很高兴见到你～', '今天想看点什么呢？', '点击菜单可以导航哦～'],
          messages: ['记得多来看看我哦～', '有什么想看的文章吗？', '戳我一下试试～', '今天也要开心呀！', '别忘了收藏本站哦～', '文章都很有趣呢～'],
          duration: 4000,
          interval: 6000,
          typing: { param: 'PARAM_MOUTH_OPEN_Y', speed: 200 }
        }
      },
      position: pos === 'right' ? 'bottom-right' : 'bottom-left',
      size: { width: baseWidth, height: baseHeight },
      transitionDuration: 1500,
      menus: {
        align: 'right',
        items: [
          { label: '首页', icon: 'mdi:home', onClick: function() { window.location.href = '/'; } },
          { label: '关于', icon: 'mdi:information', onClick: function() { window.location.href = '/about/'; } },
          { label: '标签', icon: 'mdi:tag-multiple', onClick: function() { window.location.href = '/tags/'; } },
          { label: '归档', icon: 'mdi:archive', onClick: function() { window.location.href = '/archives/'; } },
          { label: '留言', icon: 'mdi:comment', onClick: function() { window.location.href = '/guestbook/'; } },
          { label: '友链', icon: 'mdi:account-group', onClick: function() { window.location.href = '/friends/'; } },
          { label: 'RSS', icon: 'mdi:rss', onClick: function() { window.open('/index.xml', '_blank'); } },
          { label: '休息', icon: 'mdi:sleep', onClick: function(w) { w.sleep(); } }
        ]
      }
    });
  }

  document.addEventListener('DOMContentLoaded', initWidget);
})();
