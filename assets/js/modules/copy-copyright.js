var MIN_LENGTH = 30;

export function init() {
  var article = document.querySelector('.single-post .post-content');
  if (!article) return;

  document.addEventListener('copy', function(e) {
    var selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    var text = selection.toString();
    if (text.length < MIN_LENGTH) return;

    var metaItems = document.querySelectorAll('.post-meta .meta-item');
    var authorText = '';
    if (metaItems.length > 0) {
      authorText = metaItems[0].textContent.trim();
    }
    var titleEl = document.querySelector('.post-title');
    var titleText = titleEl ? titleEl.textContent.trim() : '';
    var permalink = window.location.href;

    var appendix = '\n\n' +
      '-----------------------\n' +
      '作者：' + authorText + '\n' +
      '文章：' + titleText + '\n' +
      '链接：' + permalink + '\n' +
      '声明：本文为原创文章，转载请注明出处。';

    if (e.clipboardData && e.clipboardData.setData) {
      e.preventDefault();
      e.clipboardData.setData('text/plain', text + appendix);

      var htmlAppendix = '<br><br><hr style="border:none;border-top:1px solid #ddd;margin:12px 0;">' +
        '<p style="color:#888;font-size:13px;">' +
        '作者：' + authorText + '<br>' +
        '文章：<a href="' + permalink + '">' + titleText + '</a><br>' +
        '声明：本文为原创文章，转载请注明出处。</p>';
      e.clipboardData.setData('text/html', selection.toString() + htmlAppendix);
    }
  });
}
