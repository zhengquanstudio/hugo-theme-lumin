// 分享功能
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    // 复制链接功能
    const copyLinkBtn = document.getElementById('btn-copy-link');
    if (copyLinkBtn) {
      copyLinkBtn.addEventListener('click', function() {
        const url = window.location.href;
        const title = document.title;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function() {
            showToast('链接已复制到剪贴板！');
          }).catch(function() {
            fallbackCopy(url);
          });
        } else {
          fallbackCopy(url);
        }
      });
    }

    // 分享到微博
    const shareWeiboBtn = document.getElementById('btn-share-weibo');
    if (shareWeiboBtn) {
      shareWeiboBtn.addEventListener('click', function() {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);
        const weiboUrl = `https://service.weibo.com/share/share.php?url=${url}&title=${title}`;
        window.open(weiboUrl, '_blank', 'width=600,height=400');
      });
    }

    // 分享到 QQ
    const shareQQBtn = document.getElementById('btn-share-qq');
    if (shareQQBtn) {
      shareQQBtn.addEventListener('click', function() {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);
        const qqUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${url}&title=${title}`;
        window.open(qqUrl, '_blank', 'width=600,height=400');
      });
    }

    // 分享到微信（显示二维码弹窗）
    const shareWechatBtn = document.getElementById('btn-share-wechat');
    if (shareWechatBtn) {
      shareWechatBtn.addEventListener('click', function() {
        showWechatModal();
      });
    }


  });

  function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('链接已复制到剪贴板！');
    } catch (err) {
      showToast('复制失败，请手动复制');
    }
    document.body.removeChild(textArea);
  }

  function showToast(message) {
    // 检查是否已有 toast
    let toast = document.querySelector('.share-toast');
    if (toast) {
      toast.remove();
    }

    toast = document.createElement('div');
    toast.className = 'share-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 9999;
      font-size: 14px;
      animation: toastFadeIn 0.3s ease;
    `;
    document.body.appendChild(toast);

    setTimeout(function() {
      toast.style.animation = 'toastFadeOut 0.3s ease';
      setTimeout(function() {
        toast.remove();
      }, 300);
    }, 2000);
  }

  function showWechatModal() {
    // 检查是否已有弹窗
    let modal = document.querySelector('.wechat-share-modal');
    if (modal) {
      modal.remove();
    }

    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.className = 'wechat-share-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 9998;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s ease;
    `;

    // 创建弹窗内容
    modal = document.createElement('div');
    modal.className = 'wechat-share-modal';
    modal.style.cssText = `
      background: white;
      padding: 30px;
      border-radius: 16px;
      text-align: center;
      max-width: 320px;
      position: relative;
      animation: slideIn 0.3s ease;
    `;

    // 关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = `
      position: absolute;
      top: 10px;
      right: 15px;
      font-size: 24px;
      border: none;
      background: none;
      cursor: pointer;
      color: #999;
    `;
    closeBtn.addEventListener('click', function() {
      overlay.remove();
    });
    modal.appendChild(closeBtn);

    // 标题
    const title = document.createElement('h3');
    title.textContent = '分享到微信';
    title.style.cssText = `
      margin: 0 0 20px 0;
      font-size: 18px;
      color: #333;
    `;
    modal.appendChild(title);

    // 使用 API 生成二维码
    const qrContainer = document.createElement('div');
    qrContainer.style.cssText = `
      margin: 20px 0;
      padding: 10px;
      background: white;
      border: 1px solid #eee;
      border-radius: 8px;
      display: inline-block;
    `;
    
    const qrImg = document.createElement('img');
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`;
    qrImg.alt = '微信二维码';
    qrImg.style.cssText = `
      width: 200px;
      height: 200px;
      display: block;
    `;
    qrContainer.appendChild(qrImg);
    modal.appendChild(qrContainer);

    // 提示文字
    const hint = document.createElement('p');
    hint.textContent = '使用微信扫描二维码分享';
    hint.style.cssText = `
      margin: 15px 0 0 0;
      color: #666;
      font-size: 14px;
    `;
    modal.appendChild(hint);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // 点击遮罩关闭
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        overlay.remove();
      }
    });

    // ESC 关闭
    const escHandler = function(e) {
      if (e.key === 'Escape') {
        overlay.remove();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  // 添加动画样式
  const style = document.createElement('style');
  style.textContent = `
    @keyframes toastFadeIn {
      from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
      to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    @keyframes toastFadeOut {
      from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      to { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    [data-theme="dark"] .wechat-share-modal {
      background: #1e1e1e !important;
    }
    [data-theme="dark"] .wechat-share-modal h3 {
      color: #e0e0e0 !important;
    }
    [data-theme="dark"] .wechat-share-modal p {
      color: #aaa !important;
    }
  `;
  document.head.appendChild(style);
})();
