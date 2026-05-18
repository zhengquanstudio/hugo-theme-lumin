/**
 * Lumin Theme - 文章加密（密码验证 + 内容显隐）
 *
 * 原理：文章内容已渲染在隐藏的 #encrypted-article 中，
 *       用户输入正确密码后通过 SHA-256 哈希比对验证，验证通过则显示文章。
 *       密码缓存到 sessionStorage，同一会话无需重复输入。
 */
(function() {
  'use strict';

  // ===== DOM 元素 =====
  var wrapper,   // #encrypted-content
      article,   // #encrypted-article (hidden)
      configEl,  // #encrypt-config (password hash)
      formEl,
      inputEl,
      submitBtn,
      errEl;

  // ===== 工具：检测 crypto.subtle 可用性 =====
  var cryptoSupported = !!(window.crypto && window.crypto.subtle && typeof window.crypto.subtle.digest === 'function');

  function init() {
    wrapper = document.getElementById('encrypted-content');
    if (!wrapper) return;

    article = document.getElementById('encrypted-article');
    if (!article) return;

    configEl = document.getElementById('encrypt-config');

    formEl = wrapper.querySelector('.encrypt-form');
    inputEl = document.getElementById('encrypt-pwd');
    submitBtn = document.getElementById('submit-btn') || document.getElementById('encrypt-submit');
    errEl = wrapper.querySelector('.encrypt-error');

    if (formEl && inputEl) {
      formEl.addEventListener('submit', handleSubmit);
      // 聚焦输入框（不再阻止 Enter 默认行为，让表单自然提交）
      if (inputEl) {
        inputEl.focus();
      }
    }

    // 尝试自动解锁（sessionStorage 有缓存时）
    tryAutoUnlock();
  }

  // ===== SHA-256 哈希（带兼容性降级）=====
  function sha256(text) {
    return new Promise(function(resolve, reject) {
      if (!cryptoSupported) {
        reject(new Error('当前浏览器不支持加密运算'));
        return;
      }
      try {
        var enc = new TextEncoder();
        window.crypto.subtle.digest('SHA-256', enc.encode(text)).then(function(buf) {
          var hash = Array.from(new Uint8Array(buf)).map(function(b) {
            return b.toString(16).padStart(2, '0');
          }).join('');
          resolve(hash);
        }).catch(reject);
      } catch(e) {
        reject(e);
      }
    });
  }

  // ===== UI 操作 =====
  function setError(msg) {
    if (errEl) {
      errEl.textContent = msg;
      errEl.style.display = 'block';
    }
    if (inputEl) {
      inputEl.classList.add('shake');
      setTimeout(function() { inputEl.classList.remove('shake'); }, 500);
    }
  }

  function clearError() {
    if (errEl) errEl.style.display = 'none';
  }

  function setLoading(on) {
    if (inputEl) inputEl.disabled = on;
    if (submitBtn) {
      submitBtn.disabled = on;
      submitBtn.textContent = on ? '验证中...' : '解锁';
    }
  }

  // 解锁成功：隐藏锁屏，显示文章
  function unlockArticle() {
    if (!wrapper || !article) return;

    // 隐藏锁屏界面
    var lockScreen = wrapper.querySelector('.encrypt-lock-screen');
    if (lockScreen) {
      lockScreen.style.opacity = '0';
      setTimeout(function() { lockScreen.style.display = 'none'; }, 300);
    }

    // 显示文章
    article.style.display = '';
    wrapper.classList.add('unlocked');

    // 滚动到文章顶部
    setTimeout(function() {
      article.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // 触发事件让 KaTeX、Mermaid 等处理新可见内容
      var evt = new CustomEvent('contentDecrypted', { bubbles: true });
      article.dispatchEvent(evt);

      // 重新初始化阅读进度条
      if (typeof window.initReadingProgress === 'function') {
        window.initReadingProgress();
      }
    }, 350);
  }

  // ===== 提交处理（完整错误捕获）=====
  function handleSubmit(e) {
    e.preventDefault();

    try {
      doSubmit();
    } catch(err) {
      console.error('[Lumin Encrypt] 提交异常:', err);
      setError('验证过程出错，请重试');
      setLoading(false);
    }
  }

  async function doSubmit() {
    if (!inputEl || !configEl) {
      setError('页面配置缺失，请刷新重试');
      return;
    }

    var pwd = inputEl.value.trim();
    if (!pwd) {
      setError('请输入访问密码');
      inputEl.focus();
      return;
    }

    clearError();
    setLoading(true);

    try {
      // 计算用户输入的密码哈希
      var inputHash = await sha256(pwd);
      var expectedHash = configEl.getAttribute('data-pwd-hash') || '';

      if (inputHash === expectedHash) {
        // 验证成功
        try {
          sessionStorage.setItem('lumin_enc_' + location.pathname, pwd);
        } catch(ex) {}
        unlockArticle();
      } else {
        setError('密码错误，请重试');
        inputEl.value = '';
        inputEl.focus();
      }
    } catch(hashErr) {
      console.error('[Lumin Encrypt] SHA-256 计算失败:', hashErr);
      setError('密码验证失败，请检查浏览器兼容性');
      inputEl.focus();
    } finally {
      setLoading(false);
    }
  }

  // ===== 自动解锁（sessionStorage 缓存）=====
  function tryAutoUnlock() {
    try {
      var cached = sessionStorage.getItem('lumin_enc_' + location.pathname);
      if (cached && configEl) {
        sha256(cached).then(function(cachedHash) {
          var expectedHash = configEl.getAttribute('data-pwd-hash') || '';
          if (cachedHash === expectedHash) {
            unlockArticle();
          }
        }).catch(function(err) {
          console.warn('[Lumin Encrypt] 自动解锁失败:', err);
        });
      }
    } catch(ex) {
      // sessionStorage 不可用时静默失败
    }
  }

  // ===== 初始化入口 =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
