var likeBtn = null;
var likeCountEl = null;
var liked = false;
var envId = '';

function getLikeKey() {
  return 'lumin-like-' + window.location.pathname;
}

function checkLiked() {
  try { return !!localStorage.getItem(getLikeKey()); } catch(e) { return false; }
}

function saveLiked() {
  try { localStorage.setItem(getLikeKey(), '1'); } catch(e) {}
}

function updateUI(count) {
  if (!likeBtn || !likeCountEl) return;
  liked = checkLiked();
  if (liked) {
    likeBtn.classList.add('liked');
  }
  likeCountEl.textContent = count > 0 ? count : 0;
}

function initTwikooCounter() {
  if (typeof twikoo === 'undefined') return false;

  twikoo.getCommentsCount({
    envId: envId,
    urls: [window.location.pathname],
    includeReply: false
  }).then(function(res) {
    var count = 0;
    if (res && res.length && res[0]) {
      count = res[0].count || 0;
    }
    updateUI(count);
  }).catch(function() {
    updateUI(0);
  });

  return true;
}

function handleLike() {
  if (liked) return;
  saveLiked();
  liked = true;
  likeBtn.classList.add('liked');

  var currentCount = parseInt(likeCountEl.textContent, 10) || 0;
  likeCountEl.textContent = currentCount + 1;

  likeBtn.classList.add('like-animate');
  setTimeout(function() { likeBtn.classList.remove('like-animate'); }, 600);
}

export function init() {
  likeBtn = document.getElementById('post-like-btn');
  likeCountEl = document.getElementById('post-like-count');
  if (!likeBtn || !likeCountEl) return;

  envId = likeBtn.dataset.envId || '';
  if (!envId) {
    // envId 缺失
    return;
  }

  liked = checkLiked();
  if (liked) likeBtn.classList.add('liked');

  // 添加点击事件
  likeBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    handleLike();
  });

  // 加载 Twikoo 并获取点赞数
  if (typeof twikoo !== 'undefined') {
    initTwikooCounter();
  } else {
    var script = document.createElement('script');
    script.src = '/libs/twikoo/twikoo.all.min.js';
    script.onload = function() { 
      initTwikooCounter(); 
    };
    script.onerror = function() { 
      // Twikoo 加载失败，使用本地计数
      updateUI(0); 
    };
    document.head.appendChild(script);
  }
}
