export function getBannerConfig() {
  if (window.LUMIN_BANNER) return window.LUMIN_BANNER;
  var el = document.getElementById('banner-config');
  if (el) {
    try { return JSON.parse(el.textContent); } catch (e) {}
  }
  return {};
}
