var TIMEOUT = 8000;

// 免费 HTTPS + CORS 前端 IP API 列表（按优先级排序，2026-06 更新）
var GEO_APIS = [
  { url: 'https://api.ipapi.is/', parse: function(j) { var loc = j.location || {}; return { ip: j.ip || '', country: loc.country_code || '', country_name: loc.country || '', region: loc.state || '', city: loc.city || '', isp: (j.company && j.company.name) || (j.asn && j.asn.descr) || '', latitude: loc.latitude, longitude: loc.longitude }; } },
  { url: 'https://ipinfo.io/json', parse: function(j) { var parts = j.loc ? j.loc.split(',') : []; return { ip: j.ip || '', country: j.country || '', country_name: j.country || '', region: j.region || '', city: j.city || '', isp: j.org || '', latitude: parseFloat(parts[0]) || 0, longitude: parseFloat(parts[1]) || 0 }; } }
];

function buildHTML(ip, country, region, city, isp) {
  var locArr = [country, region, city, isp].filter(Boolean);
  var locationStr = locArr.length > 0 ? '来自：' + locArr.join(' · ') : '';
  return '<div class="visitor-welcome">欢迎访问我的博客</div>' +
    '<div class="visitor-ip">' + ip + '</div>' +
    '<div class="visitor-location">' + locationStr + '</div>';
}

function showError(el) {
  el.innerHTML =
    '<div class="visitor-welcome">欢迎访问我的博客</div>' +
    '<div class="visitor-location">无法获取访客信息</div>';
}

function isValidData(data) {
  return data && data.ip && data.ip !== '::1' && data.ip !== '127.0.0.1' && data.country;
}

function fetchWithTimeout(url, timeout) {
  var controller = new AbortController();
  var timer = setTimeout(function() { controller.abort(); }, timeout);
  return fetch(url, { signal: controller.signal }).then(function(res) {
    clearTimeout(timer);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  }).catch(function(err) {
    clearTimeout(timer);
    throw err;
  });
}

// 依次尝试多个 API，直到成功
function tryAPIs(apis, index, el) {
  if (index >= apis.length) {
    console.warn('[Visitor] all geoip APIs failed');
    showError(el);
    return;
  }
  var api = apis[index];
  fetchWithTimeout(api.url, TIMEOUT)
    .then(function(json) {
      var data = api.parse(json);
      if (isValidData(data)) {
        el.innerHTML = buildHTML(data.ip, data.country_name || data.country, data.region, data.city, data.isp);
      } else {
        console.warn('[Visitor] API ' + api.url + ' returned invalid data');
        tryAPIs(apis, index + 1, el);
      }
    })
    .catch(function(err) {
      console.warn('[Visitor] API ' + api.url + ' error:', err.message || err);
      tryAPIs(apis, index + 1, el);
    });
}

export function init() {
  var el = document.getElementById('visitor-widget');
  if (!el) return;

  var isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  if (isLocal) {
    // 本地开发：用后端 API
    fetchWithTimeout('http://localhost:8888/api/public/geoip', TIMEOUT)
      .then(function(json) {
        var data = {
          ip: json.ip || '',
          country: json.country || '',
          country_name: json.country_name || json.country || '',
          region: json.region || '',
          city: json.city || '',
          isp: json.isp || ''
        };
        if (isValidData(data)) {
          el.innerHTML = buildHTML(data.ip, data.country_name || data.country, data.region, data.city, data.isp);
        } else {
          showError(el);
        }
      })
      .catch(function(err) {
        console.warn('[Visitor] local geoip error:', err.message || err);
        showError(el);
      });
  } else {
    // 线上环境：依次尝试多个前端 CDN API
    tryAPIs(GEO_APIS, 0, el);
  }
}
