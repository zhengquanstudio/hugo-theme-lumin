var deferredPrompt = null;
var dismissed = false;

function showPrompt() {
  if (dismissed || !deferredPrompt || document.querySelector('.pwa-install-prompt')) return;

  var banner = document.createElement('div');
  banner.className = 'pwa-install-prompt';
  banner.innerHTML =
    '<img class="pwa-icon" src="' + (document.querySelector('link[rel="apple-touch-icon"]')?.href || '/apple-touch-icon.png') + '" alt="">' +
    '<div class="pwa-text"><strong>添加到主屏</strong><small>离线访问，更佳体验</small></div>' +
    '<button class="btn-accept">安装</button>' +
    '<button class="btn-dismiss">稍后</button>';

  banner.querySelector('.btn-accept').addEventListener('click', install);
  banner.querySelector('.btn-dismiss').addEventListener('click', dismiss);

  document.body.appendChild(banner);
}

function install() {
  var prompt = deferredPrompt;
  if (prompt && prompt.prompt) {
    prompt.prompt();
    prompt.userChoice.then(function(choiceResult) {
      console.log('[PWA] 用户选择:', choiceResult.outcome);
      document.querySelector('.pwa-install-prompt')?.remove();
    });
  }
}

function dismiss() {
  dismissed = true;
  sessionStorage.setItem('pwa-dismissed', '1');
  document.querySelector('.pwa-install-prompt')?.remove();
}

export function init() {
  window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredPrompt = e;

    if (!sessionStorage.getItem('pwa-dismissed')) {
      setTimeout(showPrompt, 3000);
    }
  });

  window.addEventListener('appinstalled', function() {
    deferredPrompt = null;
    var el = document.querySelector('.pwa-install-prompt');
    if (el) el.remove();
    console.log('[PWA] 已安装到主屏');
  });
}
