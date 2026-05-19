(function() {
  'use strict';
  var config = window.__CLICK_EFFECT_CONFIG__ || {};
  if (!config.enable) return;
  var effectType = config.type || 'fireworks';
  var settings = config[effectType] || {};

  function random(min, max) { return Math.random() * (max - min) + min; }
  function randomInt(min, max) { return Math.floor(random(min, max + 1)); }
  function randomFromArray(arr) { if (!arr || !arr.length) return null; return arr[randomInt(0, arr.length - 1)]; }

  function createEl(tag, cls, styles) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (styles) Object.keys(styles).forEach(function(k) { el.style[k] = styles[k]; });
    return el;
  }

  function createFirework(x, y) {
    var particles = [];
    var count = Math.min(settings.particleCount || 20, 25);
    var spread = (settings.spread || 60) * Math.PI / 180;
    var colors = settings.colors || ['#ff3366','#ff6b35','#f7c948','#2ed573','#1e90ff','#a55eea','#ff4757','#ffa502'];
    for (var i = 0; i < count; i++) {
      var angle = (i / count) * Math.PI * 2 + random(-spread/2, spread/2);
      var velocity = random(4, 10);
      particles.push({
        x:x,y:y,
        vx:Math.cos(angle)*velocity,
        vy:Math.sin(angle)*velocity,
        life:1,
        decay:random(0.018,0.035),
        size:randomInt(3,7),
        color:randomFromArray(colors)
      });
    }
    var canvas = createEl('canvas', 'ce-canvas',{
      position:'fixed',top:'0',left:'0',width:'100%',height:'100%',
      pointerEvents:'none',zIndex:'99999'
    });
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);
    var animId;
    function animate() {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      var alive = false;
      particles.forEach(function(p) {
        if (p.life <= 0) return;
        alive = true;
        p.x+=p.vx;
        p.y+=p.vy;
        p.vy+=0.12;
        p.life-=p.decay;
        var alpha = Math.max(0, p.life);
        var radius = Math.max(0.5, p.size * p.life);
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
        if(canvas.parentNode) canvas.parentNode.removeChild(canvas);
      }
    }
    animate();
  }

  function createText(x,y) {
    var msgs = settings.messages||['✨'];
    var fontSize = parseInt(settings.fontSize)||18;
    var color = settings.color||'#ff3366';
    var el = createEl('span','ce-text',{
      position:'fixed',
      left:x+'px',
      top:y+'px',
      fontSize:(fontSize+4)+'px',
      color:color,
      fontWeight:'900',
      pointerEvents:'none',
      zIndex:'99999',
      whiteSpace:'nowrap',
      userSelect:'none',
      textShadow:'0 0 8px '+color+', 0 2px 4px rgba(0,0,0,0.3), 0 0 20px '+color+'40',
      transform:'translate(-50%,-50%) scale(0)',
      opacity:'0',
      letterSpacing:'2px'
    });
    el.textContent = randomFromArray(msgs);
    document.body.appendChild(el);
    var dur = settings.duration||900;
    requestAnimationFrame(function(){
      el.style.transition='all '+dur+'ms cubic-bezier(.34,1.56,.64,1)';
      el.style.transform='translate(-50%,-50%) scale(1.2)';
      el.style.opacity='1';
    });
    setTimeout(function(){
      el.style.transition='all '+(dur*0.6)+'ms cubic-bezier(.55,0,.85,.36)';
      el.style.transform='translate(-50%,-180%) scale(0.5)';
      el.style.opacity='0';
      setTimeout(function(){if(el.parentNode)el.parentNode.removeChild(el);},dur*0.6);
    },dur*0.65);
  }

  function createHeart(x,y) {
    var count = Math.min(settings.count||4, 6);
    var color = settings.color||'#ff4757';
    var size = (settings.size||22)+4;
    for(var i=0;i<count;i++)(function(idx){
      setTimeout(function(){
        var h=createEl('span','ce-heart',{
          position:'fixed',left:x+'px',top:y+'px',
          fontSize:size+'px',
          pointerEvents:'none',zIndex:'99999',
          transform:'translate(-50%,-50%) scale(0)',
          opacity:'0',
          filter:'drop-shadow(0 0 6px '+color+') drop-shadow(0 2px 4px rgba(0,0,0,0.25))'
        });
        h.innerHTML='❤️';
        document.body.appendChild(h);
        requestAnimationFrame(function(){
          h.style.transition='all 900ms cubic-bezier(.34,1.56,.64,1)';
          h.style.transform='translate(-50%,-50%) scale(1.1) translate('+random(-40,40)+'px,'+(-random(60,120))+'px)';
          h.style.opacity='1';
        });
        setTimeout(function(){
          h.style.transition='all 700ms cubic-bezier(.55,0,.85,.36)';
          h.style.transform='translate(-50%,-50%) scale(0) translate('+random(-80,80)+'px,'+(-random(150,250))+'px)';
          h.style.opacity='0';
          setTimeout(function(){if(h.parentNode)h.parentNode.removeChild(h);},700);
        },750);
      },idx*45);
    })(i);
  }

  function createStar(x,y) {
    var count = Math.min(settings.count||6, 8);
    var color = settings.color||'#ffc107';
    var size = (settings.size||16)+4;
    for(var i=0;i<count;i++)(function(idx){
      setTimeout(function(){
        var s=createEl('span','ce-star',{
          position:'fixed',left:x+'px',top:y+'px',
          fontSize:size+'px',
          pointerEvents:'none',zIndex:'99999',
          transform:'translate(-50%,-50%) scale(0) rotate(0deg)',
          opacity:'0',
          filter:'drop-shadow(0 0 8px '+color+') drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
        });
        s.innerHTML='⭐';
        document.body.appendChild(s);
        var ang=random(0,Math.PI*2), dist=random(50,100), rot=random(-180,180);
        requestAnimationFrame(function(){
          s.style.transition='all 750ms cubic-bezier(.34,1.56,.64,1)';
          s.style.transform='translate(-50%,-50%) scale(1.15) rotate('+rot+'deg) translate('+Math.cos(ang)*dist+'px,'+Math.sin(ang)*dist+'px)';
          s.style.opacity='1';
        });
        setTimeout(function(){
          s.style.transition='all 550ms cubic-bezier(.55,0,.85,.36)';
          s.style.transform='translate(-50%,-50%) scale(0) rotate('+(rot*2)+'deg) translate('+Math.cos(ang)*dist*1.8+'px,'+Math.sin(ang)*dist*1.8+'px)';
          s.style.opacity='0';
          setTimeout(function(){if(s.parentNode)s.parentNode.removeChild(s);},550);
        },550);
      },idx*25);
    })(i);
  }

  function createBubble(x,y) {
    var colors=settings.colors||['#ff6b81','#70a1ff','#7bed9f','#ffa502','#a55eea','#ff4757'];
    var range=settings.sizeRange||[10,28];
    var count=Math.min(settings.count||8, 10);
    for(var i=0;i<count;i++)(function(idx){
      setTimeout(function(){
        var sz=random(range[0],range[1]);
        var bColor=randomFromArray(colors);
        var b=createEl('div','ce-bubble',{
          position:'fixed',left:x+'px',top:y+'px',
          width:sz+'px',height:sz+'px',
          borderRadius:'50%',
          background:'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.9), '+bColor+' 60%, '+bColor+')',
          boxShadow:'0 0 '+Math.round(sz*0.6)+'px '+bColor+'80, inset -'+Math.round(sz*0.15)+'px -'+Math.round(sz*0.15)+'px '+Math.round(sz*0.25)+'px rgba(255,255,255,0.5), 0 4px 12px rgba(0,0,0,0.15)',
          pointerEvents:'none',zIndex:'99999',
          transform:'translate(-50%,-50%) scale(0)',
          opacity:'0'
        });
        document.body.appendChild(b);
        var ox=random(-50,50), oy=random(-80,-35);
        requestAnimationFrame(function(){
          b.style.transition='all 800ms cubic-bezier(.34,1.56,.64,1)';
          b.style.transform='translate(-50%,-50%) scale(1) translate('+ox+'px,'+oy+'px)';
          b.style.opacity='0.85';
        });
        setTimeout(function(){
          b.style.transition='all 600ms cubic-bezier(.55,0,.85,.36)';
          b.style.transform='translate(-50%,-50%) scale(0) translate('+(ox*1.4)+'px,'+(oy*1.4)+')';
          b.style.opacity='0';
          setTimeout(function(){if(b.parentNode)b.parentNode.removeChild(b);},600);
        },650);
      },idx*18);
    })(i);
  }

  function createSnow(x,y) {
    var snowColors=['#ffffff','#e8f4fd','#d4ecfa','#c0e4f8','#a8daf4'];
    var range=settings.sizeRange||[6,16];
    var count=Math.min(settings.count||14, 18);
    for(var i=0;i<count;i++)(function(idx){
      setTimeout(function(){
        var sz=random(range[0],range[1]);
        var sfColor=randomFromArray(snowColors);
        var sf=createEl('div','ce-snow',{
          position:'fixed',left:x+'px',top:y+'px',
          width:sz+'px',height:sz+'px',
          backgroundColor:sfColor,
          borderRadius:'50%',
          boxShadow:'0 0 '+Math.round(sz*0.8)+'px '+sfColor+'90, 0 0 '+Math.round(sz*1.5)+'px '+sfColor+'40, 0 2px 6px rgba(0,0,0,0.1)',
          pointerEvents:'none',zIndex:'99999',
          transform:'translate(-50%,-50%) scale(0) rotate(0deg)',
          opacity:'0'
        });
        document.body.appendChild(sf);
        var ox=random(-70,70), drift=random(-25,25), fallDist=random(80,160);
        var rot1=random(0,360), rot2=random(360,720);
        requestAnimationFrame(function(){
          sf.style.transition='all 1000ms cubic-bezier(.34,1.56,.64,1)';
          sf.style.transform='translate(-50%,-50%) scale(1) translateX('+(ox+drift)+'px) translateY('+fallDist+'px) rotate('+rot1+'deg)';
          sf.style.opacity='0.9';
        });
        setTimeout(function(){
          sf.style.transition='all 800ms cubic-bezier(.55,0,.85,.36)';
          sf.style.transform='translate(-50%,-50%) scale(0) translateX('+(ox+drift*2)+')px) translateY('+(fallDist*1.4)+')px) rotate('+rot2+'deg)';
          sf.style.opacity='0';
          setTimeout(function(){if(sf.parentNode)sf.parentNode.removeChild(sf);},800);
        },850);
      },idx*14);
    })(i);
  }

  function createEffect(x,y){
    switch(effectType){
      case'fireworks':createFirework(x,y);break;
      case'text':createText(x,y);break;
      case'heart':createHeart(x,y);break;
      case'star':createStar(x,y);break;
      case'bubble':createBubble(x,y);break;
      case'snow':createSnow(x,y);break;
    }
  }

  var lastTime=0, throttle=120;
  document.addEventListener('click',function(e){
    var now=Date.now();
    if(now-lastTime<throttle)return;
    lastTime=now;
    var tag=e.target.tagName, exclude=['A','BUTTON','INPUT','TEXTAREA','SELECT'];
    for(var i=0;i<exclude.length;i++){if(tag===exclude[i])return;}
    var parent=e.target.parentElement, depth=0;
    while(parent&&depth<5){
      for(var j=0;j<exclude.length;j++){if(parent.tagName===exclude[j])return;}
      parent=parent.parentElement; depth++;
    }
    createEffect(e.clientX,e.clientY);
  });

  var style=document.createElement('style');
  style.textContent='.ce-canvas{mix-blend-mode:normal!important}.ce-text{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",Roboto,sans-serif}.ce-heart,.ce-star{font-family:"Apple Color Emoji","Segoe UI Emoji",sans-serif}.ce-bubble,.ce-snow{will-change:transform,opacity}';
  document.head.appendChild(style);
})();
