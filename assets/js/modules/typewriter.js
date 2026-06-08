var el, texts, textIdx, charIdx, isDel, typeSpd, delSpd, pauseTmr, typeTmr;
var apiEnabled = false;
var apiSource = 1;
var localTexts = [];

function getConfig() {
  try {
    if (window.LUMIN_BANNER) return window.LUMIN_BANNER;
  } catch(e) {}
  try {
    var cfgEl = document.getElementById('banner-config');
    if (cfgEl) return JSON.parse(cfgEl.textContent);
  } catch(e) {}
  return {};
}

function fetchHitokoto(callback) {
  fetch('https://v1.hitokoto.cn', { signal: AbortSignal.timeout(8000) })
    .then(function(res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function(data) {
      if (data && data.hitokoto) {
        var text = data.hitokoto;
        var from = data.from ? ' — ' + data.from : '';
        callback(true, text + from);
      } else {
        throw new Error('返回数据异常');
      }
    })
    .catch(function(err) {
      console.warn('[Typewriter] hitokoto 失败: ' + err.message);
      callback(false);
    });
}

function fetchYiyan(callback) {
  fetch('https://v.api.aa1.cn/api/yiyan/index.php', { signal: AbortSignal.timeout(8000) })
    .then(function(res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.text();
    })
    .then(function(html) {
      var match = html.match(/<p>(.*?)<\/p>/);
      if (match && match[1]) {
        callback(true, match[1]);
      } else {
        throw new Error('解析失败');
      }
    })
    .catch(function(err) {
      console.warn('[Typewriter] yiyan 失败: ' + err.message);
      callback(false);
    });
}

function fetchJinrishici(callback) {
  var script = document.createElement('script');
  script.src = 'https://sdk.jinrishici.com/v2/browser/jinrishici.js';
  script.onload = function() {
    if (window.jinrishici) {
      window.jinrishici.load(function(result) {
        if (result && result.data && result.data.content) {
          var text = result.data.content;
          var from = result.data.origin && result.data.origin.dynasty ? ' — ' + result.data.origin.dynasty : '';
          callback(true, text + from);
        } else {
          callback(false);
        }
      });
    } else {
      callback(false);
    }
  };
  script.onerror = function() {
    console.warn('[Typewriter] jinrishici 脚本加载失败');
    callback(false);
  };
  document.head.appendChild(script);
}

function fetchFromApi(callback) {
  switch (apiSource) {
    case 1:
      fetchHitokoto(callback);
      break;
    case 2:
      fetchYiyan(callback);
      break;
    case 3:
      fetchJinrishici(callback);
      break;
    default:
      fetchHitokoto(callback);
  }
}

function fetchMultiple(count, callback, existingResults) {
  var results = existingResults || [];
  var maxAttempts = count + 3;

  function attempt(attemptIdx) {
    if (attemptIdx >= maxAttempts || results.length >= count) {
      callback(results);
      return;
    }
    fetchFromApi(function(success, text) {
      if (success && text) results.push(text);
      attempt(attemptIdx + 1);
    });
  }
  attempt(0);
}

function start() {
  el = document.getElementById('typewriter-text');
  if (!el) { console.warn('[Typewriter] #typewriter-text 未找到'); return; }

  var cfg = getConfig();
  typeSpd = (cfg.typingSpeed || 100);
  delSpd = (cfg.deletingSpeed || 50);
  pauseTmr = (cfg.pauseTime || 2000);

  localTexts = cfg.subtitles || [];
  if (!localTexts.length || !localTexts[0]) {
    localTexts = ['明心见性，爱自己', '记录生活，分享技术', '每一天都是新的开始', '用心感悟，用爱生活'];
  }

  apiEnabled = (cfg.apiEnabled === true);
  apiSource = cfg.apiSource || 1;

  if (apiEnabled) {
    fetchMultiple(5, function(apiTexts) {
      texts = apiTexts.concat(localTexts);
      if (apiTexts.length === 0) {
        console.warn('[Typewriter] API 失败，使用本地配置 (' + texts.length + ' 条)');
      }
      textIdx = 0; charIdx = 0; isDel = false;
      tick();
    });
  } else {
    texts = localTexts;
    textIdx = 0; charIdx = 0; isDel = false;
    tick();
  }
}

function tick() {
  if (!el) return;
  var txt = texts[textIdx % texts.length];

  if (isDel) {
    charIdx--;
    el.textContent = txt.substring(0, charIdx);
    if (charIdx <= 0) {
      isDel = false;
      textIdx++;
      if (apiEnabled && textIdx % texts.length === 0) {
        fetchFromApi(function(ok, newText) {
          if (ok && newText) { texts.push(newText); }
          typeTmr = setTimeout(tick, 300);
        });
      } else {
        typeTmr = setTimeout(tick, 300);
      }
    } else {
      typeTmr = setTimeout(tick, delSpd);
    }
  } else {
    charIdx++;
    el.textContent = txt.substring(0, charIdx);
    if (charIdx >= txt.length) {
      isDel = true;
      typeTmr = setTimeout(tick, pauseTmr);
    } else {
      typeTmr = setTimeout(tick, typeSpd);
    }
  }
}

export { start as init };
