/* ═══════════════════════════════════════════════════════════
   MAIN.JS v2 — SAGIV FINGER PORTFOLIO
   Powered by GSAP + ScrollTrigger
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);


  /* ══════════════════════════════════════════════════════
     CUSTOM CURSOR  (desktop only)
  ══════════════════════════════════════════════════════ */
  const cursorDot  = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursor-ring');

  if (cursorDot && cursorRing && window.innerWidth > 768) {
    let mx = 0, my = 0;
    let rx = 0, ry = 0;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      gsap.to(cursorDot, { x: mx, y: my, duration: 0.06, ease: 'none' });
    });

    (function ringLoop() {
      rx += (mx - rx) * 0.11;
      ry += (my - ry) * 0.11;
      gsap.set(cursorRing, { x: rx, y: ry });
      requestAnimationFrame(ringLoop);
    })();

    document.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
    });

    document.addEventListener('mouseleave',  () => gsap.to([cursorDot, cursorRing], { opacity: 0 }));
    document.addEventListener('mouseenter',  () => gsap.to([cursorDot, cursorRing], { opacity: 1 }));
  }


  /* ══════════════════════════════════════════════════════
     NAVIGATION — scroll state + mobile menu
  ══════════════════════════════════════════════════════ */
  const nav = document.getElementById('nav');

  /* Scrolled state (background blur) */
  ScrollTrigger.create({
    start: 'top -60',
    onToggle: (self) => nav.classList.toggle('scrolled', self.isActive),
  });

  /* Hide on scroll down, reveal on scroll up */
  let lastScrollY = 0;
  let navVisible  = true;
  const NAV_THRESHOLD = 120; /* px from top before hide kicks in */
  const NAV_H = 72;          /* hover trigger zone height in px */

  window.addEventListener('scroll', () => {
    const y    = window.scrollY;
    const diff = y - lastScrollY;

    if (y < NAV_THRESHOLD) {
      /* Always show near the top */
      if (!navVisible) { nav.classList.remove('nav-hidden'); navVisible = true; }
    } else if (diff > 6 && navVisible) {
      /* Scrolling down — hide */
      nav.classList.add('nav-hidden');
      navVisible = false;
    } else if (diff < -6 && !navVisible) {
      /* Scrolling up — show */
      nav.classList.remove('nav-hidden');
      navVisible = true;
    }

    lastScrollY = y;
  }, { passive: true });

  /* Reveal nav when mouse hovers near the top of the page */
  document.addEventListener('mousemove', (e) => {
    if (e.clientY < NAV_H && !navVisible) {
      nav.classList.remove('nav-hidden');
      navVisible = true;
    }
  }, { passive: true });

  const burger     = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const opening = !burger.classList.contains('open');
      burger.classList.toggle('open', opening);
      burger.setAttribute('aria-expanded', opening);
      mobileMenu.setAttribute('aria-hidden', !opening);

      if (opening) {
        mobileMenu.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        gsap.fromTo(mobileMenu, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' });
        gsap.fromTo('.mobile-link',
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, stagger: 0.07, duration: 0.5, ease: 'power3.out', delay: 0.1 }
        );
      } else {
        closeMobileMenu();
      }
    });

    mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  function closeMobileMenu() {
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    gsap.to(mobileMenu, {
      opacity: 0, duration: 0.25,
      onComplete: () => { mobileMenu.style.display = 'none'; }
    });
  }


  /* ══════════════════════════════════════════════════════
     HERO — cinematic entrance
  ══════════════════════════════════════════════════════ */
  const tl = gsap.timeline({ delay: 0.2 });

  tl.to('#nav', { opacity: 1, duration: 0.8, ease: 'power2.out' }, 0);

  tl.to('.hero-eyebrow', { opacity: 1, duration: 0.7, ease: 'power3.out' }, 0.3);

  tl.to('.hero-name-line', {
    y: 0,
    stagger: 0.14,
    duration: 1.4,
    ease: 'power4.out',
  }, 0.5);

  tl.to('.hero-rule', {
    opacity: 1,
    scaleX: 1,
    duration: 0.8,
    ease: 'power3.out',
  }, 1.1);

  tl.to('.hero-subtitle', {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: 'power3.out',
  }, 1.3);

  tl.to('.hero-actions', {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power3.out',
  }, 1.6);

  tl.to('.hero-scroll', { opacity: 1, duration: 0.7 }, 1.9);
  tl.to('.hero-meta',   { opacity: 0.5, duration: 0.7 }, 2.0);


  /* About section stays black — no page color change */


  /* ══════════════════════════════════════════════════════
     HERO IMAGE CAROUSEL
  ══════════════════════════════════════════════════════ */
  (function () {
    const slides   = Array.from(document.querySelectorAll('.hc-slide'));
    const dotsWrap = document.querySelector('.hc-dots');
    const btnPrev  = document.querySelector('.hc-prev');
    const btnNext  = document.querySelector('.hc-next');
    if (!slides.length) return;

    let current = 0;
    let autoTimer;
    const INTERVAL = 5000; // ms between auto-advances

    /* Build dot elements */
    const dots = slides.map((_, i) => {
      const d = document.createElement('button');
      d.className = 'hc-dot' + (i === 0 ? ' hc-dot--active' : '');
      d.setAttribute('aria-label', `מעבר לתמונה ${i + 1}`);
      d.addEventListener('click', () => { goTo(i); resetTimer(); });
      dotsWrap && dotsWrap.appendChild(d);
      return d;
    });

    function goTo(n) {
      slides[current].classList.remove('hc-slide--active');
      dots[current] && dots[current].classList.remove('hc-dot--active');
      current = ((n % slides.length) + slides.length) % slides.length;
      slides[current].classList.add('hc-slide--active');
      dots[current] && dots[current].classList.add('hc-dot--active');
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startTimer() {
      autoTimer = setInterval(next, INTERVAL);
    }
    function resetTimer() {
      clearInterval(autoTimer);
      startTimer();
    }

    btnNext && btnNext.addEventListener('click', () => { next(); resetTimer(); });
    btnPrev && btnPrev.addEventListener('click', () => { prev(); resetTimer(); });

    /* Pause auto-advance while user hovers the hero */
    const heroEl = document.getElementById('hero');
    if (heroEl) {
      heroEl.addEventListener('mouseenter', () => clearInterval(autoTimer));
      heroEl.addEventListener('mouseleave', startTimer);
    }

    startTimer();
  })();


  /* ══════════════════════════════════════════════════════
     SCROLL REVEALS
  ══════════════════════════════════════════════════════ */

  /* Section headers */
  gsap.utils.toArray('.section-header').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0,
        duration: 1.0, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 86%', once: true },
      }
    );
  });

  /* Project cards */
  gsap.utils.toArray('.project-card').forEach((card, i) => {
    gsap.to(card, {
      opacity: 1, y: 0,
      duration: 1.1, delay: i * 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 88%', once: true },
    });
  });

  /* About portrait */
  gsap.to('.about-portrait', {
    opacity: 1, y: 0,
    duration: 1.2, ease: 'power3.out',
    scrollTrigger: { trigger: '.about-layout', start: 'top 80%', once: true },
  });

  /* About text (delayed) */
  gsap.to('.about-text', {
    opacity: 1, y: 0,
    duration: 1.1, delay: 0.15, ease: 'power3.out',
    scrollTrigger: { trigger: '.about-layout', start: 'top 80%', once: true },
  });

  /* Skill groups staggered */
  gsap.utils.toArray('.skill-group').forEach((group, i) => {
    gsap.fromTo(group,
      { opacity: 0, y: 16 },
      {
        opacity: 1, y: 0,
        duration: 0.7, delay: i * 0.08, ease: 'power2.out',
        scrollTrigger: { trigger: '.skills', start: 'top 88%', once: true },
      }
    );
  });

  /* Timeline items */
  gsap.utils.toArray('.timeline-item').forEach((item, i) => {
    gsap.to(item, {
      opacity: 1, y: 0,
      duration: 1.0, delay: i * 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: item, start: 'top 87%', once: true },
    });
  });

  /* Contact */
  gsap.to('.contact-email-wrap', {
    opacity: 1, y: 0,
    duration: 1.1, ease: 'power3.out',
    scrollTrigger: { trigger: '.contact-layout', start: 'top 82%', once: true },
  });
  gsap.to('.contact-socials', {
    opacity: 1,
    duration: 0.8, delay: 0.25, ease: 'power2.out',
    scrollTrigger: { trigger: '.contact-layout', start: 'top 82%', once: true },
  });


  /* ══════════════════════════════════════════════════════
     ABOUT — ANIMATED BACKGROUND PATHS (CSS-only, performant)
     12 paths total (vs 72 before), no getTotalLength() calls,
     pure CSS animation — GPU composited, no JS per frame.
  ══════════════════════════════════════════════════════ */
  (function initAboutBgPaths() {
    const container = document.querySelector('.about-bg-paths');
    if (!container) return;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    /* Wider viewBox so the curved paths stay within the section bounds */
    svg.setAttribute('viewBox', '-200 -100 1100 600');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    container.appendChild(svg);

    /* 8 paths per position = 16 total — good visual density, still fast */
    const STEPS = [0, 4, 8, 12, 16, 20, 24, 28];

    function addPaths(position) {
      STEPS.forEach((i) => {
        /* Original formula from background-paths.tsx, unchanged */
        const a  = 380 - i * 5 * position;
        const b  = 189 + i * 6;
        const c  = 312 - i * 5 * position;
        const e  = 216 - i * 6;
        const fx = 152 - i * 5 * position;
        const gy = 343 - i * 6;
        const h  = 616 - i * 5 * position;
        const k  = 470 - i * 6;
        const mx = 684 - i * 5 * position;
        const ny = 875 - i * 6;

        const d = `M${-a} ${-b}C${-a} ${-b} ${-c} ${e} ${fx} ${gy}C${h} ${k} ${mx} ${ny} ${mx} ${ny}`;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('stroke', 'currentColor');
        path.setAttribute('stroke-width', String(1 + i * 0.04));
        path.setAttribute('fill', 'none');

        const dash = 500 + i * 15;
        path.style.strokeDasharray  = `${dash} ${dash * 3}`;
        path.style.strokeDashoffset = '0';

        const dur   = 25 + (i / 4) * 5;        /* 25s – 60s */
        const delay = -(Math.random() * dur);   /* random phase start */
        path.style.animation = `bg-path-flow ${dur}s ${delay}s linear infinite`;

        svg.appendChild(path);
      });
    }

    addPaths(1);
    addPaths(-1);
  })();


  /* ══════════════════════════════════════════════════════
     SHUFFLE TESTIMONIALS
  ══════════════════════════════════════════════════════ */
  (function initShuffle() {
    const deck = document.getElementById('shuffleDeck');
    if (!deck) return;

    const cards = Array.from(deck.querySelectorAll('.scard'));
    if (cards.length < 2) return;

    /* position definitions */
    const POS = {
      front:  { rotate: -6, x: 0,   z: 2 },
      middle: { rotate:  0, x: 33,  z: 1 },
      back:   { rotate:  6, x: 66,  z: 0 },
    };
    const ORDER = ['front', 'middle', 'back'];
    let positions = [...ORDER]; /* positions[i] = position name for card i */

    function applyPositions() {
      cards.forEach((card, i) => {
        const pos = positions[i] || 'back';
        const t   = POS[pos];
        card.dataset.pos    = pos;
        card.style.zIndex   = t.z;
        card.style.transform = `rotate(${t.rotate}deg) translateX(${t.x}%)`;
      });
    }

    function shuffle() {
      /* move last position to front */
      positions = [positions[positions.length - 1], ...positions.slice(0, -1)];
      applyPositions();
    }

    /* Drag-to-shuffle: drag front card left > 150px to advance */
    let dragStartX = 0;
    let dragging   = false;

    deck.addEventListener('pointerdown', (e) => {
      const front = deck.querySelector('[data-pos="front"]');
      if (!front || !front.contains(e.target)) return;
      dragStartX = e.clientX;
      dragging   = true;
      front.setPointerCapture(e.pointerId);
    });
    deck.addEventListener('pointerup', (e) => {
      if (!dragging) return;
      dragging = false;
      if (dragStartX - e.clientX > 150) shuffle();
    });

    /* Click non-front card to bring to front */
    deck.addEventListener('click', (e) => {
      const card = e.target.closest('.scard');
      if (!card || card.dataset.pos === 'front') return;
      shuffle();
    });

    /* GSAP scroll reveal */
    gsap.fromTo('.shuffle-stage',
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0,
        duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.shuffle-testi', start: 'top 85%', once: true },
      }
    );

    applyPositions();
  })();


  /* ══════════════════════════════════════════════════════
     SMOOTH SCROLL for anchor links
  ══════════════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id     = link.getAttribute('href');
      const target = document.querySelector(id);
      if (!target || id === '#') return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      /* GSAP scroll — silky smooth */
      gsap.to(window, {
        scrollTo: { y: top, autoKill: true },
        duration: 2.0,
        ease: 'expo.inOut',
      });
    });
  });


  /* ══════════════════════════════════════════════════════
     VIDEO MODAL
  ══════════════════════════════════════════════════════ */
  (function initVideoModal() {
    const modal      = document.getElementById('videoModal');
    const frame      = document.getElementById('videoModalFrame');
    const closeBtn   = modal && modal.querySelector('.vmodal-close');
    const overlay    = modal && modal.querySelector('.vmodal-overlay');
    const iframeWrap = document.getElementById('vmodalIframeWrap');
    if (!modal || !frame) return;

    function openModal(videoId, isShort) {
      frame.src = 'https://www.youtube.com/embed/' + videoId +
                  '?rel=0&modestbranding=1&autoplay=1';
      iframeWrap.classList.toggle('is-short', isShort);
      modal.setAttribute('aria-hidden', 'false');
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      /* stop video after CSS transition completes */
      setTimeout(function() { frame.src = ''; }, 400);
    }

    closeBtn  && closeBtn.addEventListener('click', closeModal);
    overlay   && overlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });

    /* Wire up all project cards that have a data-video-id */
    document.querySelectorAll('.project-card[data-video-id]').forEach(function(card) {
      var link = card.querySelector('.project-link');
      if (!link) return;
      link.addEventListener('click', function(e) {
        e.preventDefault();
        openModal(card.dataset.videoId, card.dataset.videoShort === 'true');
      });
    });
  })();

})();


/* ═══════════════════════════════════════════════════════════
   SCROLL REVEAL  —  Intersection Observer
   Adds .visible to any element with class .reveal when it
   enters the viewport. Pair with CSS transition in main.css.
   To stagger: add .reveal-d1 / .reveal-d2 / .reveal-d3
   ═══════════════════════════════════════════════════════════ */
(function initReveal() {
  'use strict';

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); /* fire once only */
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -48px 0px'
  });

  document.querySelectorAll('.reveal').forEach(function(el) {
    observer.observe(el);
  });
})();


/* ═══════════════════════════════════════════════════════════
   WEBGL SMOKE BACKGROUND
   Ported from SmokeBackground React component.
   Runs on a fixed full-page canvas behind all content.
   ═══════════════════════════════════════════════════════════ */
(function initSmoke() {
  const canvas = document.getElementById('smokeCanvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl2');
  if (!gl) { canvas.style.display = 'none'; return; }

  const vertSrc = `#version 300 es
precision highp float;
in vec4 position;
void main(){ gl_Position = position; }`;

  const fragSrc = `#version 300 es
precision highp float;
out vec4 O;
uniform float time;
uniform vec2 resolution;
uniform vec3 u_color;
#define FC gl_FragCoord.xy
#define R resolution
#define T (time+660.)
float rnd(vec2 p){p=fract(p*vec2(12.9898,78.233));p+=dot(p,p+34.56);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(rnd(i),rnd(i+vec2(1,0)),u.x),mix(rnd(i+vec2(0,1)),rnd(i+1.),u.x),u.y);}
float fbm(vec2 p){float t=.0,a=1.;for(int i=0;i<5;i++){t+=a*noise(p);p*=mat2(1,-1.2,.2,1.2)*2.;a*=.5;}return t;}
void main(){
  vec2 uv=(FC-.5*R)/R.y;
  vec3 col=vec3(1);
  uv.x+=.25;
  uv*=vec2(2,1);
  float n=fbm(uv*.28-vec2(T*.01,0));
  n=noise(uv*3.+n*2.);
  col.r-=fbm(uv+vec2(0,T*.015)+n);
  col.g-=fbm(uv*1.003+vec2(0,T*.015)+n+.003);
  col.b-=fbm(uv*1.006+vec2(0,T*.015)+n+.006);
  col=mix(col,u_color,dot(col,vec3(.21,.71,.07)));
  col=mix(vec3(.08),col,min(time*.1,1.));
  col=clamp(col,.08,1.);
  O=vec4(col,1);
}`;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  const prg = gl.createProgram();
  gl.attachShader(prg, compile(gl.VERTEX_SHADER,   vertSrc));
  gl.attachShader(prg, compile(gl.FRAGMENT_SHADER, fragSrc));
  gl.linkProgram(prg);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,1,-1,-1,1,1,1,-1]), gl.STATIC_DRAW);
  gl.useProgram(prg);
  const pos = gl.getAttribLocation(prg, 'position');
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

  const uRes   = gl.getUniformLocation(prg, 'resolution');
  const uTime  = gl.getUniformLocation(prg, 'time');
  const uColor = gl.getUniformLocation(prg, 'u_color');

  /* Brand red — more saturated (#d91010) */
  gl.uniform3fv(uColor, [0.88, 0.06, 0.06]);

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = window.innerWidth  * dpr;
    canvas.height = window.innerHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  function loop(now) {
    gl.useProgram(prg);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.uniform2f(uRes,  canvas.width, canvas.height);
    gl.uniform1f(uTime, now * 1e-3);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
