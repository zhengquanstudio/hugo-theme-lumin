/**
 * Ribbon 彩带动画 - Canvas 粒子效果
 * 配置通过 #ribbon-canvas 的 data-* 属性传入
 */
(function() {
  var canvas = document.getElementById('ribbon-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;

  var config = {
    ribbonCount: parseInt(canvas.dataset.ribbonCount) || 3,
    alpha: parseFloat(canvas.dataset.alpha) || 0.5,
    saturation: canvas.dataset.saturation || '70%',
    brightness: canvas.dataset.brightness || '55%',
    colorCycleSpeed: parseInt(canvas.dataset.colorCycleSpeed) || 5,
    horizontalSpeed: parseInt(canvas.dataset.horizontalSpeed) || 180,
    parallaxAmount: parseFloat(canvas.dataset.parallaxAmount) || -0.2,
    strokeSize: parseInt(canvas.dataset.strokeSize) || 0
  };

  var winW, winH, scrollY;
  var ribbons = [];
  var animId;
  var hueOffset = 0;

  function getSize() {
    winW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 0;
    winH = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;
    canvas.width = winW * dpr;
    canvas.height = winH * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  function getScroll() {
    scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createPoint(x, y) {
    return { x: x, y: y };
  }

  function createRibbon() {
    var fromLeft = Math.random() > 0.5;
    var startX = fromLeft ? -200 : winW + 200;
    var endX = fromLeft ? winW + 200 : -200;

    var segments = [];
    var prev = createPoint(startX, rand(100, winH - 100));
    var next = createPoint(startX, rand(100, winH - 100));

    for (var i = 0; i < 120; i++) {
      var speed = rand(0.2, 1.0) * config.horizontalSpeed;
      var distY = rand(-0.5, 0.5) * (0.25 * winH);
      var nextY = next.y + distY;
      if (nextY < 50) nextY = 50;
      if (nextY > winH - 50) nextY = winH - 50;

      var third = createPoint(
        fromLeft ? next.x + speed : next.x - speed,
        nextY
      );

      if (fromLeft && third.x >= winW + 200) break;
      if (!fromLeft && third.x <= -200) break;

      segments.push({
        point1: { x: prev.x, y: prev.y },
        point2: { x: next.x, y: next.y },
        point3: { x: third.x, y: third.y },
        color: i * config.colorCycleSpeed,
        delay: i * 4,
        alpha: 0,
        phase: 0
      });

      prev = { x: next.x, y: next.y };
      next = { x: third.x, y: third.y };
    }

    return segments;
  }

  function drawSegments() {
    ctx.clearRect(0, 0, winW, winH);

    hueOffset += 0.015;

    for (var r = 0; r < ribbons.length; r++) {
      var segments = ribbons[r];

      for (var i = 0; i < segments.length; i++) {
        var seg = segments[i];

        if (seg.phase >= 1 && seg.alpha <= 0) continue;

        if (seg.delay <= 0) {
          seg.phase += 0.02;
          seg.alpha = Math.sin(seg.phase);
          seg.alpha = Math.max(0, Math.min(seg.alpha, 1));
        } else {
          seg.delay -= 0.5;
          continue;
        }

        if (seg.alpha <= 0.005) continue;

        var hue = (seg.color * 0.5 + hueOffset * 360) % 360;
        var fillColor = 'hsla(' + hue + ', ' + config.saturation + ', ' + config.brightness + ', ' + (seg.alpha * config.alpha) + ')';

        ctx.save();

        if (config.parallaxAmount !== 0) {
          ctx.translate(0, scrollY * config.parallaxAmount);
        }

        ctx.beginPath();
        ctx.moveTo(seg.point1.x, seg.point1.y);
        ctx.lineTo(seg.point2.x, seg.point2.y);
        ctx.lineTo(seg.point3.x, seg.point3.y);
        ctx.closePath();

        ctx.fillStyle = fillColor;
        ctx.fill();

        if (config.strokeSize > 0) {
          ctx.lineWidth = config.strokeSize;
          ctx.strokeStyle = fillColor;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        ctx.restore();
      }
    }
  }

  function cleanupAndSpawn() {
    for (var r = 0; r < ribbons.length; r++) {
      ribbons[r] = ribbons[r].filter(function(seg) {
        return seg.phase < 1 || seg.alpha > 0;
      });
      if (ribbons[r].length === 0) {
        ribbons[r] = createRibbon();
      }
    }
  }

  function animate() {
    drawSegments();
    cleanupAndSpawn();
    animId = requestAnimationFrame(animate);
  }

  function init() {
    getSize();
    getScroll();
    ribbons = [];
    for (var i = 0; i < config.ribbonCount; i++) {
      ribbons.push(createRibbon());
    }
  }

  window.addEventListener('resize', function() {
    getSize();
    init();
  });

  window.addEventListener('scroll', getScroll);

  init();
  animate();

  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      animate();
    }
  });
})();
