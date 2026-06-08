var MAX_HEIGHT = 300;

var LANG_MAP = {
  'js':'JavaScript','javascript':'JavaScript','ts':'TypeScript','typescript':'TypeScript',
  'py':'Python','python':'Python','rb':'Ruby','ruby':'Ruby','php':'PHP',
  'java':'Java','kt':'Kotlin','kotlin':'Kotlin','swift':'Swift','go':'Go','rs':'Rust','rust':'Rust',
  'c':'C','cpp':'C++','csharp':'C#','cs':'C#',
  'css':'CSS','scss':'SCSS','sass':'Sass','less':'Less',
  'html':'HTML','xml':'XML','svg':'SVG','markdown':'Markdown','md':'Markdown',
  'sql':'SQL','sh':'Shell','bash':'Shell','shell':'Shell','zsh':'Zsh','powershell':'PowerShell','ps1':'PowerShell',
  'json':'JSON','yaml':'YAML','yml':'YAML','toml':'TOML','ini':'INI','conf':'Conf',
  'dockerfile':'Docker','docker':'Docker','makefile':'Makefile',
  'vim':'Vimscript','lua':'Lua','r':'R','perl':'Perl','scala':'Scala','groovy':'Groovy',
  'diff':'Diff','git':'Git','log':'Log','regex':'Regex','text':'Text','plaintext':'Plain Text'
};

function getLangLabel(codeEl) {
  var cls = (codeEl.className || '');
  var match = cls.match(/language-(\w+)/i);
  if (!match) return '';
  var lang = match[1].toLowerCase();
  return LANG_MAP[lang] || lang.charAt(0).toUpperCase() + lang.slice(1);
}

export function init() {
  var blocks = document.querySelectorAll('.post-content pre');
  if (!blocks.length) return;

  blocks.forEach((pre) => {
    var codeEl = pre.querySelector('code');
    if (!codeEl) return;
    if (pre.closest('.code-wrapper')) return;

    var wrapper = document.createElement('div');
    wrapper.className = 'code-wrapper';
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    var toolbar = document.createElement('div');
    toolbar.className = 'code-toolbar';

    var btnGroup = document.createElement('span');
    btnGroup.className = 'code-btn-group';

    var langLabel = getLangLabel(codeEl);
    if (langLabel) {
      var label = document.createElement('span');
      label.className = 'code-lang-label';
      label.textContent = langLabel;
      btnGroup.appendChild(label);
    }

    var toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'code-toggle-btn';
    toggleBtn.setAttribute('aria-label', '\u6298\u53e0\u4ee3\u7801\u5757');
    toggleBtn.innerHTML =
      '<svg class="toggle-icon-collapse" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 14 10 20 16 14"/><line x1="20" y1="4" x2="12.01" y2="12"/></svg>' +
      '<span>\u6298\u53e0</span>';

    var copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'code-copy-btn';
    copyBtn.setAttribute('aria-label', '\u590d\u5236\u4ee3\u7801');
    copyBtn.innerHTML =
      '<svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
      '<svg class="check-icon" style="display:none" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' +
      '<span class="copy-text">复制</span>';

    btnGroup.appendChild(toggleBtn);
    btnGroup.appendChild(copyBtn);
    toolbar.appendChild(btnGroup);
    wrapper.appendChild(toolbar);

    var expandBar = document.createElement('div');
    expandBar.className = 'code-expand-bar';
    expandBar.style.display = 'none';
    var expandBtn = document.createElement('button');
    expandBtn.type = 'button';
    expandBtn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>' +
      '<span>\u67e5\u770b\u5168\u90e8</span>';
    expandBar.appendChild(expandBtn);
    wrapper.appendChild(expandBar);

    requestAnimationFrame(function() {
      var actualHeight = pre.scrollHeight;
      if (actualHeight > MAX_HEIGHT) {
        wrapper.classList.add('collapsed');
        expandBar.style.display = 'flex';
        toggleBtn.style.display = 'inline-flex';
      } else {
        toggleBtn.style.display = 'none';
      }
    });

    toggleBtn.addEventListener('click', function() {
      var isCollapsed = wrapper.classList.contains('collapsed');
      if (isCollapsed) {
        wrapper.classList.remove('collapsed');
        wrapper.classList.add('expanded');
        expandBar.style.display = 'none';
        toggleBtn.setAttribute('aria-label', '\u6298\u53e0\u4ee3\u7801\u5757');
        toggleBtn.innerHTML =
          '<svg class="toggle-icon-expand" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 10 12 4 6 10"/><line x1="4" y1="20" x2="11.99" y2="12"/></svg>' +
          '<span>\u6298\u53e0</span>';
      } else {
        wrapper.classList.remove('expanded');
        wrapper.classList.add('collapsed');
        expandBar.style.display = 'flex';
        toggleBtn.setAttribute('aria-label', '\u5c55\u5f00\u4ee3\u7801\u5757');
        toggleBtn.innerHTML =
          '<svg class="toggle-icon-collapse" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 14 10 20 16 14"/><line x1="20" y1="4" x2="12.01" y2="12"/></svg>' +
          '<span>\u6298\u53e0</span>';
      }
    });

    expandBtn.addEventListener('click', function() {
      wrapper.classList.remove('collapsed');
      wrapper.classList.add('expanded');
      expandBar.style.display = 'none';
      toggleBtn.setAttribute('aria-label', '\u6298\u53e0\u4ee3\u7801\u5757');
      toggleBtn.innerHTML =
        '<svg class="toggle-icon-expand" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 10 12 4 6 10"/><line x1="4" y1="20" x2="11.99" y2="12"/></svg>' +
        '<span>\u6298\u53e0</span>';
    });

    copyBtn.addEventListener('click', function() {
      var clone = codeEl.cloneNode(true);
      clone.querySelectorAll('.ln, .lnt').forEach(function(el) { el.remove(); });
      var text = (clone.textContent || '').replace(/^\n+/, '').replace(/\n+$/, '\n');
      navigator.clipboard.writeText(text).then(function() {
        copyBtn.classList.add('copied');
        showCopyToast();
        setTimeout(function() { copyBtn.classList.remove('copied'); }, 2000);
      }).catch(function() {});
    });
    
    // 添加键盘快捷键支持 (Ctrl+C / Cmd+C)
    pre.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        // 延迟执行，让默认复制行为先完成
        setTimeout(function() {
          showCopyToast();
        }, 100);
      }
    });
  });
}

function showCopyToast() {
  var existing = document.querySelector('.copy-toast');
  if (existing) existing.remove();

  var toast = document.createElement('div');
  toast.className = 'copy-toast';
  toast.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' +
    '<span>\u590d\u5236\u6210\u529f</span>';
  document.body.appendChild(toast);

  requestAnimationFrame(function() {
    toast.classList.add('show');
  });

  setTimeout(function() {
    toast.classList.remove('show');
    setTimeout(function() { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 350);
  }, 1800);
}
