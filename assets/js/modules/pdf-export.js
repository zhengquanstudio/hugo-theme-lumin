function loadScript(src, callback) {
  if (window.html2pdf && window.html2pdf().set) return callback();
  var s = document.createElement('script');
  s.src = s.dataset.fallbackSrc || src;
  s.async = true;
  s.onerror = function() {
    var f = document.createElement('script');
    f.src = src.replace('cdnjs', 'unpkg').replace('@0.10.1', '@0.10.1/dist');
    f.async = true;
    f.onload = callback;
    f.onerror = function() {
      alert('无法加载 PDF 导出库，请使用打印功能');
      var btn = document.getElementById('btn-export-pdf');
      if (btn) btn.classList.remove('loading');
    };
    document.head.appendChild(f);
  };
  s.onload = callback;
  document.head.appendChild(s);
}

function exportPDF() {
  var btn = document.getElementById('btn-export-pdf');
  if (!btn || btn.classList.contains('loading')) return;

  btn.classList.add('loading');

  // 确保页面链接可点击（恢复 Swup）
  var links = document.querySelectorAll('a[href]');
  links.forEach(function(link) {
    link.style.pointerEvents = '';
  });

  loadScript(
    'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
    function() {
      // 再次检查按钮状态
      var currentBtn = document.getElementById('btn-export-pdf');
      if (!currentBtn || !currentBtn.classList.contains('loading')) return;

      var element = document.querySelector('.single-post');
      if (!element) { 
        currentBtn.classList.remove('loading'); 
        alert('无法找到文章内容，请刷新页面后重试');
        return; 
      }

      var title = document.querySelector('.post-title')?.textContent || 'article';

      var opt = {
        margin: [12, 16, 12, 16],
        filename: title.replace(/[\\/:*?"<>|]/g, '_') + '.pdf',
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false,
          backgroundColor: '#ffffff',
          timeout: 60000  // 添加超时设置
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      var toolbar = document.querySelector('.post-toolbar');
      if (toolbar) toolbar.style.display = 'none';

      try {
        html2pdf().set(opt).from(element).save().then(function() {
          if (toolbar) toolbar.style.display = '';
          if (currentBtn) currentBtn.classList.remove('loading');
        }).catch(function(err) {
          console.error('[PDF] 导出失败:', err);
          if (toolbar) toolbar.style.display = '';
          if (currentBtn) currentBtn.classList.remove('loading');
          alert('PDF 导出失败：' + (err.message || '未知错误') + '\n请重试或使用打印功能');
        });
      } catch (err) {
        console.error('[PDF] 初始化失败:', err);
        if (toolbar) toolbar.style.display = '';
        if (currentBtn) currentBtn.classList.remove('loading');
        alert('PDF 导出初始化失败，请使用打印功能');
      }
    }
  );
}

function exportPDFWrapper(e) {
  e.preventDefault();
  e.stopPropagation();
  exportPDF();
}

function printWrapper(e) {
  e.preventDefault();
  e.stopPropagation();
  window.print();
}

export function init() {
  var pdfBtn = document.getElementById('btn-export-pdf');
  var printBtn = document.getElementById('btn-print-article');

  // 解绑旧事件，避免重复绑定
  if (pdfBtn) {
    pdfBtn.removeEventListener('click', exportPDFWrapper);
    pdfBtn.addEventListener('click', exportPDFWrapper);
  }
  
  if (printBtn) {
    printBtn.removeEventListener('click', printWrapper);
    printBtn.addEventListener('click', printWrapper);
  }
}
