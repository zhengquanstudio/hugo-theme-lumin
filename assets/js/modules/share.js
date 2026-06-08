var panelActive = false;

export function init() {
  var shareBtn = document.getElementById('btn-share');
  if (!shareBtn) return;
  shareBtn.addEventListener('click', openSharePanel);
}

function openSharePanel() {
  if (panelActive) return;
  panelActive = true;

  var url = window.location.href;
  var title = document.title;
  var encodedUrl = encodeURIComponent(url);
  var encodedTitle = encodeURIComponent(title);
  var metaDesc = document.querySelector('meta[name="description"]');
  var encodedDesc = metaDesc ? encodeURIComponent(metaDesc.content) : '';

  var overlay = document.createElement('div');
  overlay.className = 'share-panel-overlay';

  var panel = document.createElement('div');
  panel.className = 'share-panel';

  var header = document.createElement('div');
  header.className = 'share-panel-header';
  var h3 = document.createElement('h3');
  h3.textContent = '分享文章';
  var closeBtn = document.createElement('button');
  closeBtn.className = 'share-panel-close';
  closeBtn.setAttribute('aria-label', '关闭');
  closeBtn.innerHTML = '&times;';
  header.appendChild(h3);
  header.appendChild(closeBtn);
  panel.appendChild(header);

  var urlDisplay = document.createElement('div');
  urlDisplay.className = 'share-panel-url';
  var displayUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (displayUrl.length > 45) displayUrl = displayUrl.substring(0, 45) + '...';
  urlDisplay.innerHTML = '<i class="fas fa-link" style="font-size:11px;opacity:0.4"></i><span>' + displayUrl + '</span>';
  panel.appendChild(urlDisplay);

  var grid = document.createElement('div');
  grid.className = 'share-panel-grid';

  var copyItem = createShareItem('copy', '#6366f1', 'fas fa-link', '复制链接');
  var weiboItem = createShareItem('weibo', '#E6162D', 'fab fa-weibo', '微博');
  var qqItem = createShareItem('qq', '#12B7F5', 'fab fa-qq', 'QQ');
  var wechatItem = createShareItem('wechat', '#07C160', 'fab fa-weixin', '微信');
  grid.appendChild(copyItem);
  grid.appendChild(weiboItem);
  grid.appendChild(qqItem);
  grid.appendChild(wechatItem);
  panel.appendChild(grid);

  var qrSection = document.createElement('div');
  qrSection.className = 'share-qr-section';

  var qrLoading = document.createElement('div');
  qrLoading.className = 'share-qr-loading';
  qrLoading.innerHTML = '<div class="share-qr-spinner"></div><span>二维码生成中...</span>';
  qrSection.appendChild(qrLoading);

  var qrContainer = document.createElement('div');
  qrContainer.className = 'share-qr-container';
  qrContainer.style.display = 'none';

  var qrImg = document.createElement('img');
  qrImg.alt = '微信二维码';
  qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' + encodedUrl;
  qrImg.addEventListener('load', function () {
    qrContainer.style.display = 'inline-block';
    qrLoading.style.display = 'none';
  });
  qrImg.addEventListener('error', function () {
    qrLoading.innerHTML = '<p style="color:var(--text-muted);font-size:0.8rem;margin:0">二维码加载失败，请复制链接分享</p>';
  });
  qrContainer.appendChild(qrImg);
  qrSection.appendChild(qrContainer);

  var qrHint = document.createElement('p');
  qrHint.className = 'share-qr-hint';
  qrHint.textContent = '扫描二维码分享到微信';
  qrSection.appendChild(qrHint);
  panel.appendChild(qrSection);

  overlay.appendChild(panel);
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeSharePanel();
  });
  closeBtn.addEventListener('click', closeSharePanel);

  var escHandler = function (e) {
    if (e.key === 'Escape') closeSharePanel();
  };
  document.addEventListener('keydown', escHandler);
  overlay._escHandler = escHandler;

  copyItem.addEventListener('click', function () {
    copyToClipboard(url);
    var icon = this.querySelector('.share-icon');
    var label = this.querySelector('span');
    icon.innerHTML = '<i class="fas fa-check"></i>';
    icon.style.background = '#10b981';
    label.textContent = '已复制';
    var btn = this;
    setTimeout(function () {
      icon.innerHTML = '<i class="fas fa-link"></i>';
      icon.style.background = '#6366f1';
      label.textContent = '复制链接';
    }, 2000);
  });

  weiboItem.addEventListener('click', function () {
    window.open(
      'https://service.weibo.com/share/share.php?url=' + encodedUrl + '&title=' + encodedTitle,
      '_blank',
      'width=600,height=400'
    );
    closeSharePanel();
  });

  qqItem.addEventListener('click', function () {
    window.open(
      'https://connect.qq.com/widget/shareqq/index.html?url=' + encodedUrl + '&title=' + encodedTitle + '&summary=' + encodedDesc,
      '_blank',
      'width=600,height=400'
    );
    closeSharePanel();
  });

  wechatItem.addEventListener('click', function () {
    var qr = panel.querySelector('.share-qr-section');
    if (qr) qr.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

function createShareItem(action, color, iconClass, label) {
  var item = document.createElement('button');
  item.className = 'share-item';
  item.setAttribute('data-action', action);
  item.innerHTML =
    '<div class="share-icon" style="background:' + color + '">' +
    '<i class="' + iconClass + '"></i></div>' +
    '<span>' + label + '</span>';
  return item;
}

function closeSharePanel() {
  var overlay = document.querySelector('.share-panel-overlay');
  if (!overlay) return;

  if (overlay._escHandler) {
    document.removeEventListener('keydown', overlay._escHandler);
  }

  overlay.classList.add('share-panel-closing');

  setTimeout(function () {
    if (overlay.parentNode) overlay.remove();
    document.body.style.overflow = '';
    panelActive = false;
  }, 250);
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () {
      showToast('链接已复制到剪贴板');
    }).catch(function () {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  var textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.cssText =
    'position:fixed;top:0;left:0;width:2em;height:2em;padding:0;border:none;outline:none;boxShadow:none;background:transparent';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast('链接已复制到剪贴板');
  } catch (err) {
    showToast('复制失败，请手动复制');
  }
  document.body.removeChild(textArea);
}

function showToast(message) {
  var existing = document.querySelector('.share-toast');
  if (existing) existing.remove();

  var toast = document.createElement('div');
  toast.className = 'share-toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(function () {
    toast.classList.add('share-toast-out');
    setTimeout(function () {
      toast.remove();
    }, 300);
  }, 2000);
}
