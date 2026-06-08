/**
 * 最新评论功能
 * 在侧边栏展示最近的 Twikoo 评论
 */
(function() {
  'use strict';

  function init() {
    var commentsList = document.getElementById('recent-comments-list');
    if (!commentsList) return;

    var configEl = document.getElementById('recent-comments-config');
    if (!configEl) {
      console.error('[RecentComments] Config not found');
      return;
    }

    var config;
    try {
      config = JSON.parse(configEl.textContent);
    } catch (e) {
      console.error('[RecentComments] Invalid config:', e);
      return;
    }

    waitForTwikoo(function() {
      loadRecentComments(config, commentsList);
    });
  }

  function waitForTwikoo(callback) {
    if (typeof twikoo !== 'undefined' && twikoo.getRecentComments) {
      callback();
    } else {
      var retries = 0;
      var maxRetries = 50; // 最多等待5秒
      setTimeout(function check() {
        retries++;
        if (typeof twikoo !== 'undefined' && twikoo.getRecentComments) {
          callback();
        } else if (retries < maxRetries) {
          setTimeout(check, 100);
        } else {
          console.error('[RecentComments] Twikoo library not available after 5s');
          var container = document.getElementById('recent-comments-list');
          if (container) {
            container.innerHTML = '<div class="comments-error"><span>评论加载失败</span></div>';
          }
        }
      }, 100);
    }
  }

  function loadRecentComments(config, container) {
    console.log('[RecentComments] Loading comments...', config);

    twikoo.getRecentComments({
      envId: config.envId,
      pageSize: config.totalSize || 50,
      includeReply: true
    }).then(function(res) {
      console.log('[RecentComments] Comments loaded:', res);
      if (res && res.length > 0) {
        renderComments(res, container, config.pageSize || 5);
      } else {
        showEmpty(container);
      }
    }).catch(function(err) {
      console.error('[RecentComments] Load error:', err);
      showError(container);
    });
  }

  function renderComments(comments, container, limit) {
    // 确保按时间降序排列（最新在最上面）
    comments.sort(function(a, b) {
      return new Date(b.created) - new Date(a.created);
    });
    var html = comments.slice(0, limit).map(function(comment) {
      var avatar = comment.avatar || 'https://cravatar.cn/avatar/d41d8cd98f00b204e9800998ecf8427e?d=mp';
      var nick = escapeHtml(comment.nick || '匿名');
      var content = escapeHtml(truncateText(stripHtml(comment.comment), 50));
      var timeAgo = formatTimeAgo(comment.created);
      var url = comment.url || '#';

      return '<a href="' + url + '" class="comment-item" target="_blank" rel="noopener">' +
        '<img src="' + avatar + '" alt="' + nick + '" class="comment-avatar">' +
        '<div class="comment-content">' +
          '<div class="comment-text">' + content + '</div>' +
          '<div class="comment-meta">' +
            '<span class="comment-author">' + nick + '</span>' +
            '<span class="comment-divider">/</span>' +
            '<span class="comment-time">' + timeAgo + '</span>' +
          '</div>' +
        '</div>' +
      '</a>';
    }).join('');

    container.innerHTML = html;
  }

  function showEmpty(container) {
    container.innerHTML = '<div class="comments-empty">' +
      '<span>还没有评论</span>' +
    '</div>';
  }

  function showError(container) {
    container.innerHTML = '<div class="comments-error">' +
      '<span>加载失败</span>' +
    '</div>';
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function stripHtml(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  function formatTimeAgo(timestamp) {
    var now = Date.now();
    var past = new Date(timestamp).getTime();
    var diff = now - past;

    var minute = 60 * 1000;
    var hour = 60 * minute;
    var day = 24 * hour;
    var month = 30 * day;

    if (diff < minute) {
      return '刚刚';
    } else if (diff < hour) {
      return Math.floor(diff / minute) + '分钟前';
    } else if (diff < day) {
      return Math.floor(diff / hour) + '小时前';
    } else if (diff < 7 * day) {
      return Math.floor(diff / day) + '天前';
    } else if (diff < month) {
      return Math.floor(diff / (7 * day)) + '周前';
    } else {
      var date = new Date(timestamp);
      return (date.getMonth() + 1) + '/' + date.getDate();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
