var reported = false;

function sendToBackend(metrics) {
  if (!navigator.sendBeacon) return;
  var payload = JSON.stringify({
    url: window.location.href,
    path: window.location.pathname,
    metrics: metrics,
    timestamp: Date.now(),
    userAgent: navigator.userAgent
  });
  navigator.sendBeacon('/api/vitals', payload);
}

function observeLCP() {
  if (!('PerformanceObserver' in window)) return;
  try {
    var po = new PerformanceObserver(function(list) {
      var entries = list.getEntries();
      if (entries.length) {
        var last = entries[entries.length - 1];
        return { name: 'LCP', value: last.startTime, rating: last.startTime <= 2500 ? 'good' : last.startTime <= 4000 ? 'needs-improvement' : 'poor' };
      }
    });
    po.observe({ type: 'largest-contentful-paint', buffered: true });
    return po;
  } catch(e) { return null; }
}

function observeFID() {
  if (!('PerformanceObserver' in window)) return;
  try {
    var po = new PerformanceObserver(function(list) {
      var entries = list.getEntries();
      if (entries.length) {
        var first = entries[0];
        return { name: 'FID', value: first.processingStart - first.startTime, rating: (first.processingStart - first.startTime) <= 100 ? 'good' : 'needs-improvement' };
      }
    });
    po.observe({ type: 'first-input', buffered: true });
    return po;
  } catch(e) { return null; }
}

function observeCLS() {
  if (!('PerformanceObserver' in window)) return;
  try {
    var clsValue = 0;
    var po = new PerformanceObserver(function(list) {
      for (var i = 0; i < list.getEntries().length; i++) {
        var entry = list.getEntries()[i];
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
    });
    po.observe({ type: 'layout-shift', buffered: true });
    return { observer: po, getValue: function() { return clsValue; } };
  } catch(e) { return null; }
}

function collectAndReport() {
  if (reported) return;
  reported = true;

  var metrics = {};

  var lcpObs = observeLCP();
  var fidObs = observeFID();
  var clsObs = observeCLS();

  var nav = performance.getEntriesByType('navigation')[0];
  if (nav) {
    metrics.FCP = nav.loadEventEnd - nav.startTime;
    metrics.TTFB = nav.responseStart - nav.requestStart;
    metrics['DOM-Ready'] = nav.domContentLoadedEventEnd - nav.startTime;
    metrics.Load = nav.loadEventEnd - nav.startTime;
  }

  setTimeout(function() {
    if (lcpObs) {
      var entries = lcpObs.takeRecords ? lcpObs.takeRecords() : [];
      if (entries.length) {
        var last = entries[entries.length - 1];
        metrics.LCP = last.startTime;
      }
    }
    if (clsObs) {
      metrics.CLS = clsObs.getValue();
    }
    if (fidObs) {
      var fidEntries = fidObs.takeRecords ? fidObs.takeRecords() : [];
      if (fidEntries.length) {
        metrics.FID = fidEntries[0].processingStart - fidEntries[0].startTime;
      }
    }

    sendToBackend(metrics);

    if (lcpObs && lcpObs.disconnect) lcpObs.disconnect();
    if (fidObs && fidObs.disconnect) fidObs.disconnect();
    if (clsObs && clsObs.observer) clsObs.observer.disconnect();
  }, 3000);
}

export function init() {
  if (document.readyState === 'complete') {
    collectAndReport();
  } else {
    window.addEventListener('load', function() {
      setTimeout(collectAndReport, 100);
    });
  }
}
