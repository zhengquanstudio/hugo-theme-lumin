/**
 * 鼠标点击特效系统 (IIFE - ES6)
 *
 * 支持的特效类型:
 * - fireworks: 烟花粒子效果 (Canvas)
 * - text: 文字浮动效果
 * - heart: 爱心飘散效果
 * - star: 星星旋转效果
 * - bubble: 气泡上升效果
 * - snow: 雪花飘落效果
 *
 * 配置来源: window.__CLICK_EFFECT_CONFIG__ (由 baseof.html 注入)
 * Hugo 通过 hugo.toml [params.clickEffect] 控制各项参数
 */
(() => {
  'use strict';

  const config = window.__CLICK_EFFECT_CONFIG__ || {};
  if (!config.enable) return;

  const effectType = config.type || 'fireworks';
  const settings = config[effectType] || {};

  const random = (min, max) => Math.random() * (max - min) + min;
  const randomInt = (min, max) => Math.floor(random(min, max + 1));
  const randomFromArray = (arr) => {
    if (!arr || !arr.length) return null;
    return arr[randomInt(0, arr.length - 1)];
  };

  const createEl = (tag, cls, styles) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (styles) Object.keys(styles).forEach((k) => { el.style[k] = styles[k]; });
    return el;
  };

  const createFirework = (x, y) => {
    const particles = [];
    const count = Math.min(settings.particleCount || 20, 25);
    const spread = (settings.spread || 60) * Math.PI / 180;
    const colors = settings.colors || [
      '#ff3366', '#ff6b35', '#f7c948', '#2ed573', '#1e90ff', '#a55eea', '#ff4757', '#ffa502',
    ];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + random(-spread / 2, spread / 2);
      const velocity = random(4, 10);
      particles.push({
        x, y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: 1,
        decay: random(0.018, 0.035),
        size: randomInt(3, 7),
        color: randomFromArray(colors),
      });
    }

    const canvas = createEl('canvas', 'ce-canvas', {
      position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: '99999',
    });
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);

    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach((p) => {
        if (p.life <= 0) return;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.life -= p.decay;

        const alpha = Math.max(0, p.life);
        const radius = Math.max(0.5, p.size * p.life);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = Math.max(0, radius * 2);
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      if (alive) {
        animId = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(animId);
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      }
    };

    animate();
  };

  const createText = (x, y) => {
    const msgs = settings.messages || ['✨'];
    const fontSize = parseInt(settings.fontSize) || 18;
    const color = settings.color || '#ff3366';

    const el = createEl('span', 'ce-text', {
      position: 'fixed',
      left: `${x}px`,
      top: `${y}px`,
      fontSize: `${fontSize + 4}px`,
      color,
      fontWeight: '900',
      pointerEvents: 'none',
      zIndex: '99999',
      whiteSpace: 'nowrap',
      userSelect: 'none',
      textShadow: `0 0 8px ${color}, 0 2px 4px rgba(0,0,0,0.3), 0 0 20px ${color}40`,
      transform: 'translate(-50%,-50%) scale(0)',
      opacity: '0',
      letterSpacing: '2px',
    });

    el.textContent = randomFromArray(msgs);
    document.body.appendChild(el);

    const dur = settings.duration || 900;

    requestAnimationFrame(() => {
      el.style.transition = `all ${dur}ms cubic-bezier(.34,1.56,.64,1)`;
      el.style.transform = 'translate(-50%,-50%) scale(1.2)';
      el.style.opacity = '1';
    });

    setTimeout(() => {
      el.style.transition = `all ${dur * 0.6}ms cubic-bezier(.55,0,.85,.36)`;
      el.style.transform = 'translate(-50%,-180%) scale(0.5)';
      el.style.opacity = '0';
      setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, dur * 0.6);
    }, dur * 0.65);
  };

  const createHeart = (x, y) => {
    const count = Math.min(settings.count || 4, 6);
    const color = settings.color || '#ff4757';
    const size = (settings.size || 22) + 4;

    for (let i = 0; i < count; i++) {
      ((idx) => {
        setTimeout(() => {
          const h = createEl('span', 'ce-heart', {
            position: 'fixed', left: `${x}px`, top: `${y}px`,
            fontSize: `${size}px`,
            pointerEvents: 'none', zIndex: '99999',
            transform: 'translate(-50%,-50%) scale(0)',
            opacity: '0',
            filter: `drop-shadow(0 0 6px ${color}) drop-shadow(0 2px 4px rgba(0,0,0,0.25))`,
          });
          h.innerHTML = '❤️';
          document.body.appendChild(h);

          requestAnimationFrame(() => {
            h.style.transition = 'all 900ms cubic-bezier(.34,1.56,.64,1)';
            h.style.transform = `translate(-50%,-50%) scale(1.1) translate(${random(-40, 40)}px,${-random(60, 120)}px)`;
            h.style.opacity = '1';
          });

          setTimeout(() => {
            h.style.transition = 'all 700ms cubic-bezier(.55,0,.85,.36)';
            h.style.transform = `translate(-50%,-50%) scale(0) translate(${random(-80, 80)}px,${-random(150, 250)}px)`;
            h.style.opacity = '0';
            setTimeout(() => { if (h.parentNode) h.parentNode.removeChild(h); }, 700);
          }, 750);
        }, idx * 45);
      })(i);
    }
  };

  const createStar = (x, y) => {
    const count = Math.min(settings.count || 6, 8);
    const color = settings.color || '#ffc107';
    const size = (settings.size || 16) + 4;

    for (let i = 0; i < count; i++) {
      ((idx) => {
        setTimeout(() => {
          const s = createEl('span', 'ce-star', {
            position: 'fixed', left: `${x}px`, top: `${y}px`,
            fontSize: `${size}px`,
            pointerEvents: 'none', zIndex: '99999',
            transform: 'translate(-50%,-50%) scale(0) rotate(0deg)',
            opacity: '0',
            filter: `drop-shadow(0 0 8px ${color}) drop-shadow(0 2px 4px rgba(0,0,0,0.2))`,
          });
          s.innerHTML = '⭐';
          document.body.appendChild(s);

          const ang = random(0, Math.PI * 2);
          const dist = random(50, 100);
          const rot = random(-180, 180);

          requestAnimationFrame(() => {
            s.style.transition = 'all 750ms cubic-bezier(.34,1.56,.64,1)';
            s.style.transform = `translate(-50%,-50%) scale(1.15) rotate(${rot}deg) translate(${Math.cos(ang) * dist}px,${Math.sin(ang) * dist}px)`;
            s.style.opacity = '1';
          });

          setTimeout(() => {
            s.style.transition = 'all 550ms cubic-bezier(.55,0,.85,.36)';
            s.style.transform = `translate(-50%,-50%) scale(0) rotate(${rot * 2}deg) translate(${Math.cos(ang) * dist * 1.8}px,${Math.sin(ang) * dist * 1.8}px)`;
            s.style.opacity = '0';
            setTimeout(() => { if (s.parentNode) s.parentNode.removeChild(s); }, 550);
          }, 550);
        }, idx * 25);
      })(i);
    }
  };

  const createBubble = (x, y) => {
    const colors = settings.colors || ['#ff6b81', '#70a1ff', '#7bed9f', '#ffa502', '#a55eea', '#ff4757'];
    const range = settings.sizeRange || [10, 28];
    const count = Math.min(settings.count || 8, 10);

    for (let i = 0; i < count; i++) {
      ((idx) => {
        setTimeout(() => {
          const sz = random(range[0], range[1]);
          const bColor = randomFromArray(colors);

          const b = createEl('div', 'ce-bubble', {
            position: 'fixed', left: `${x}px`, top: `${y}px`,
            width: `${sz}px`, height: `${sz}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.9), ${bColor} 60%, ${bColor})`,
            boxShadow: `0 0 ${Math.round(sz * 0.6)}px ${bColor}80, inset -${Math.round(sz * 0.15)}px -${Math.round(sz * 0.15)}px ${Math.round(sz * 0.25)}px rgba(255,255,255,0.5), 0 4px 12px rgba(0,0,0,0.15)`,
            pointerEvents: 'none', zIndex: '99999',
            transform: 'translate(-50%,-50%) scale(0)',
            opacity: '0',
          });
          document.body.appendChild(b);

          const ox = random(-50, 50);
          const oy = random(-80, -35);

          requestAnimationFrame(() => {
            b.style.transition = 'all 800ms cubic-bezier(.34,1.56,.64,1)';
            b.style.transform = `translate(-50%,-50%) scale(1) translate(${ox}px,${oy}px)`;
            b.style.opacity = '0.85';
          });

          setTimeout(() => {
            b.style.transition = 'all 600ms cubic-bezier(.55,0,.85,.36)';
            b.style.transform = `translate(-50%,-50%) scale(0) translate(${ox * 1.4}px,${oy * 1.4})`;
            b.style.opacity = '0';
            setTimeout(() => { if (b.parentNode) b.parentNode.removeChild(b); }, 600);
          }, 650);
        }, idx * 18);
      })(i);
    }
  };

  const createSnow = (x, y) => {
    const snowColors = ['#ffffff', '#e8f4fd', '#d4ecfa', '#c0e4f8', '#a8daf4'];
    const range = settings.sizeRange || [6, 16];
    const count = Math.min(settings.count || 14, 18);

    for (let i = 0; i < count; i++) {
      ((idx) => {
        setTimeout(() => {
          const sz = random(range[0], range[1]);
          const sfColor = randomFromArray(snowColors);

          const sf = createEl('div', 'ce-snow', {
            position: 'fixed', left: `${x}px`, top: `${y}px`,
            width: `${sz}px`, height: `${sz}px`,
            backgroundColor: sfColor,
            borderRadius: '50%',
            boxShadow: `0 0 ${Math.round(sz * 0.8)}px ${sfColor}90, 0 0 ${Math.round(sz * 1.5)}px ${sfColor}40, 0 2px 6px rgba(0,0,0,0.1)`,
            pointerEvents: 'none', zIndex: '99999',
            transform: 'translate(-50%,-50%) scale(0) rotate(0deg)',
            opacity: '0',
          });
          document.body.appendChild(sf);

          const ox = random(-70, 70);
          const drift = random(-25, 25);
          const fallDist = random(80, 160);
          const rot1 = random(0, 360);
          const rot2 = random(360, 720);

          requestAnimationFrame(() => {
            sf.style.transition = 'all 1000ms cubic-bezier(.34,1.56,.64,1)';
            sf.style.transform = `translate(-50%,-50%) scale(1) translateX(${ox + drift}px) translateY(${fallDist}px) rotate(${rot1}deg)`;
            sf.style.opacity = '0.9';
          });

          setTimeout(() => {
            sf.style.transition = 'all 800ms cubic-bezier(.55,0,.85,.36)';
            sf.style.transform = `translate(-50%,-50%) scale(0) translateX(${ox + drift * 2}px) translateY(${fallDist * 1.4}px) rotate(${rot2}deg)`;
            sf.style.opacity = '0';
            setTimeout(() => { if (sf.parentNode) sf.parentNode.removeChild(sf); }, 800);
          }, 850);
        }, idx * 14);
      })(i);
    }
  };

  const createEffect = (x, y) => {
    switch (effectType) {
      case 'fireworks': createFirework(x, y); break;
      case 'text': createText(x, y); break;
      case 'heart': createHeart(x, y); break;
      case 'star': createStar(x, y); break;
      case 'bubble': createBubble(x, y); break;
      case 'snow': createSnow(x, y); break;
    }
  };

  let lastTime = 0;
  const throttle = 120;

  document.addEventListener('click', (e) => {
    const now = Date.now();
    if (now - lastTime < throttle) return;
    lastTime = now;

    const exclude = ['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT'];
    if (exclude.includes(e.target.tagName)) return;

    let parent = e.target.parentElement;
    let depth = 0;
    while (parent && depth < 5) {
      if (exclude.includes(parent.tagName)) return;
      parent = parent.parentElement;
      depth++;
    }

    createEffect(e.clientX, e.clientY);
  });

  // 注入特效样式
  const style = document.createElement('style');
  style.textContent = '.ce-canvas{mix-blend-mode:normal!important}.ce-text{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",Roboto,sans-serif}.ce-heart,.ce-star{font-family:"Apple Color Emoji","Segoe UI Emoji",sans-serif}.ce-bubble,.ce-snow{will-change:transform,opacity}';
  document.head.appendChild(style);
})();
