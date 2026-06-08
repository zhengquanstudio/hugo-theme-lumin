(function() {
  var section = document.getElementById('ai-summary-section');
  if (!section) return;

  var btn = document.getElementById('btn-ai-summary');
  var content = document.getElementById('ai-summary-content');
  var text = document.getElementById('ai-summary-text');
  var loading = document.getElementById('ai-summary-loading');
  var errorEl = document.getElementById('ai-summary-error');
  var errorText = document.getElementById('ai-error-text');
  var retryBtn = document.getElementById('ai-retry-btn');

  if (!btn) return;

  var config = window.__AI_SUMMARY_CONFIG__ || {};
  var apiBase = (config.apiBase || '/api').replace(/\/+$/, '');

  function getArticleContent() {
    var el = document.querySelector('.post-content');
    if (!el) return '';
    return el.innerText || el.textContent || '';
  }

  function getArticleTitle() {
    var el = document.querySelector('.post-title');
    return el ? el.textContent.trim() : '';
  }

  function showLoading() {
    content.style.display = 'none';
    errorEl.style.display = 'none';
    loading.style.display = 'flex';
    btn.disabled = true;
    btn.classList.add('loading');
  }

  function showResult(summary) {
    loading.style.display = 'none';
    errorEl.style.display = 'none';
    text.textContent = summary;
    content.style.display = 'block';
    btn.disabled = false;
    btn.classList.remove('loading');
    btn.querySelector('span').textContent = '重新生成';
  }

  function showError(msg) {
    loading.style.display = 'none';
    content.style.display = 'none';
    errorText.textContent = msg || '生成失败，请稍后重试';
    errorEl.style.display = 'flex';
    btn.disabled = false;
    btn.classList.remove('loading');
  }

  function generateSummary() {
    var articleContent = getArticleContent();
    if (!articleContent || articleContent.trim().length < 50) {
      showError('文章内容过短，无法生成摘要');
      return;
    }

    showLoading();

    fetch(apiBase + '/ai/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: articleContent,
        title: getArticleTitle()
      })
    })
    .then(function(res) {
      if (!res.ok) {
        throw new Error('HTTP ' + res.status);
      }
      return res.json();
    })
    .then(function(data) {
      if (data.code === 200 && data.data && data.data.summary) {
        showResult(data.data.summary);
      } else if (data.code === 200 && data.data && data.data.message) {
        showError(data.data.message);
      } else if (data.message) {
        showError(data.message);
      } else {
        showError('AI 服务返回异常');
      }
    })
    .catch(function(err) {
      if (err.message && err.message.indexOf('HTTP') === 0) {
        showError('请求失败 (' + err.message + ')，请检查 adminApiUrl 配置是否正确');
      } else if (err.message && err.message.indexOf('Failed to fetch') >= 0) {
        showError('无法连接到后台服务，请确认：1) 后台已启动 2) adminApiUrl 配置正确 3) CORS 已启用');
      } else {
        showError('请求失败: ' + (err.message || '未知错误'));
      }
    });
  }

  btn.addEventListener('click', generateSummary);
  if (retryBtn) retryBtn.addEventListener('click', generateSummary);

  if (config.autoGenerate === true || config.autoGenerate === 'true') {
    setTimeout(generateSummary, 800);
  }
})();
