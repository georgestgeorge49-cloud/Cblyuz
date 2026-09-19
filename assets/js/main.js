/**
 * Site behaviour. Small, dependency-free, all of it optional —
 * every section is fully readable and usable with JavaScript disabled.
 */
import { initBook } from './book.js';
import { initCarousel } from './carousel.js';

// Opt in to the JS-only presentation. Until this line runs, every reveal
// target is visible, so a failed or blocked script can never hide content.
document.documentElement.classList.add('js');

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const canHover = window.matchMedia('(hover: hover) and (min-width: 861px)');
const $ = (sel, scope = document) => scope.querySelector(sel);
const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

/* ------------------------------------------------------------------ reveal */
function initReveal() {
  const targets = $$('[data-reveal], [data-reveal-lines]');
  if (!targets.length) return;

  // Stagger children of a group so a row of items arrives as one gesture.
  $$('[data-reveal-group]').forEach((group) => {
    const step = parseFloat(group.dataset.revealGroup) || 0.08;
    $$('[data-reveal]', group).forEach((child, i) => {
      child.style.setProperty('--reveal-delay', `${(i * step).toFixed(3)}s`);
    });
  });

  $$('[data-reveal-lines]').forEach((block) => {
    $$('.line', block).forEach((line, i) => {
      line.style.setProperty('--line-delay', `${(i * 0.09).toFixed(3)}s`);
    });
  });

  if (reduced.matches) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
  );

  targets.forEach((el) => io.observe(el));
}

/* ------------------------------------------------------------------ header */
function initHeader() {
  const header = $('[data-header]');
  if (!header) return;

  let inkZones = [];

  const measure = () => {
    inkZones = $$('.mode-ink').map((el) => {
      const rect = el.getBoundingClientRect();
      return { top: rect.top + window.scrollY, bottom: rect.bottom + window.scrollY };
    });
  };

  const update = () => {
    const y = window.scrollY;
    const band = y + header.offsetHeight * 0.5;

    header.classList.toggle('is-scrolled', y > 24);
    header.classList.toggle(
      'mode-ink',
      inkZones.some((z) => band > z.top && band < z.bottom)
    );
  };

  measure();
  update();

  let ticking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        update();
      });
    },
    { passive: true }
  );
  window.addEventListener('resize', () => {
    measure();
    update();
  });
}

/* -------------------------------------------------------------------- menu */
function initMenu() {
  const toggle = $('[data-menu-toggle]');
  const nav = $('[data-nav]');
  if (!toggle || !nav) return;

  const root = document.documentElement;

  const setOpen = (open) => {
    root.classList.toggle('is-menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    toggle.setAttribute('aria-expanded', String(open));
    if (open) $('a', nav)?.focus({ preventScroll: true });
  };

  toggle.addEventListener('click', () =>
    setOpen(!root.classList.contains('is-menu-open'))
  );
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('is-menu-open')) {
      setOpen(false);
      toggle.focus();
    }
  });
  window.matchMedia('(min-width: 861px)').addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });
}

/* --------------------------------------------------------------- scrollspy */
function initScrollspy() {
  const links = $$('[data-nav] a[href^="#"]');
  if (!links.length) return;

  const map = new Map();
  links.forEach((link) => {
    const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (target) map.set(target, link);
  });
  if (!map.size) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = map.get(entry.target);
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach((l) => l.setAttribute('aria-current', 'false'));
          link.setAttribute('aria-current', 'true');
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );
  map.forEach((_, target) => io.observe(target));
}

/* ------------------------------------------------------------ audio player */
const BARS = 72;

function initAudio() {
  $$('[data-audio]').forEach((root) => {
    const audio = $('audio', root);
    const toggle = $('[data-audio-toggle]', root);
    const wave = $('[data-audio-wave]', root);
    const cur = $('[data-audio-current]', root);
    const dur = $('[data-audio-duration]', root);
    const note = $('[data-audio-note]', root);
    if (!audio || !toggle || !wave) return;

    const rtl = getComputedStyle(root).direction === 'rtl';

    // Deterministic pseudo-waveform with a speech-like envelope, so the
    // shape is stable between loads and identical across languages.
    const build = (cls) => {
      const layer = document.createElement('div');
      layer.className = `audio__wave-layer ${cls}`;
      layer.setAttribute('aria-hidden', 'true');
      for (let i = 0; i < BARS; i++) {
        const bar = document.createElement('span');
        const n = i / BARS;
        const envelope = 0.38 + 0.62 * Math.sin(Math.PI * Math.min(1, n * 1.08));
        const grain =
          0.5 +
          0.5 * Math.sin(i * 1.37) * Math.cos(i * 0.53) +
          0.18 * Math.sin(i * 3.1);
        bar.style.setProperty('--h', (0.12 + envelope * Math.abs(grain) * 0.86).toFixed(3));
        layer.append(bar);
      }
      return layer;
    };

    wave.append(build('audio__wave-base'), build('audio__wave-layer--played'));
    const played = $('.audio__wave-layer--played', wave);

    const fmt = (s) =>
      Number.isFinite(s)
        ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
        : '--:--';

    const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);
    const setProgress = (p) => {
      played.style.setProperty('--p', String(clamp01(p)));
      wave.setAttribute('aria-valuenow', String(Math.round(clamp01(p) * 100)));
    };

    let available = true;

    toggle.addEventListener('click', () => {
      if (!available) return;
      if (audio.paused) {
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    });

    audio.addEventListener('play', () => root.classList.add('is-playing'));
    audio.addEventListener('pause', () => root.classList.remove('is-playing'));
    audio.addEventListener('loadedmetadata', () => {
      if (dur) dur.textContent = fmt(audio.duration);
    });
    audio.addEventListener('timeupdate', () => {
      if (cur) cur.textContent = fmt(audio.currentTime);
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
    });
    audio.addEventListener('ended', () => {
      root.classList.remove('is-playing');
      setProgress(0);
    });
    audio.addEventListener('error', () => {
      available = false;
      root.classList.add('is-unavailable');
      toggle.setAttribute('aria-disabled', 'true');
      if (note && note.dataset.missing) note.textContent = note.dataset.missing;
    });

    /* Seeking — pointer and keyboard. */
    const seekTo = (clientX) => {
      if (!available || !audio.duration) return;
      const rect = wave.getBoundingClientRect();
      let p = (clientX - rect.left) / rect.width;
      if (rtl) p = 1 - p;
      audio.currentTime = clamp01(p) * audio.duration;
      setProgress(clamp01(p));
    };

    let dragging = false;
    wave.addEventListener('pointerdown', (e) => {
      dragging = true;
      wave.setPointerCapture(e.pointerId);
      seekTo(e.clientX);
    });
    wave.addEventListener('pointermove', (e) => dragging && seekTo(e.clientX));
    wave.addEventListener('pointerup', () => (dragging = false));
    wave.addEventListener('pointercancel', () => (dragging = false));

    wave.addEventListener('keydown', (e) => {
      if (!available || !audio.duration) return;
      const step = e.shiftKey ? 30 : 10;
      const back = rtl ? 'ArrowRight' : 'ArrowLeft';
      const fwd = rtl ? 'ArrowLeft' : 'ArrowRight';
      if (e.key === back) audio.currentTime = Math.max(0, audio.currentTime - step);
      else if (e.key === fwd) audio.currentTime = Math.min(audio.duration, audio.currentTime + step);
      else if (e.key === 'Home') audio.currentTime = 0;
      else if (e.key === ' ' || e.key === 'Enter') audio.paused ? audio.play() : audio.pause();
      else return;
      e.preventDefault();
    });

    setProgress(0);
  });
}

/* ----------------------------------------------------------- video facade */
/** Nothing loads from a video host until the visitor asks for it. */
function initVideo() {
  $$('[data-embed]').forEach((button) => {
    button.addEventListener('click', () => {
      const src = button.dataset.embed;
      if (!src || src.includes('VIDEO_ID')) {
        button.classList.add('is-pending');
        const label = button.closest('.reel')?.querySelector('.reel__label') || $('.video__label', button);
        if (label && button.dataset.pendingLabel) label.textContent = button.dataset.pendingLabel;
        return;
      }
      const frame = document.createElement('iframe');
      frame.src = src;
      frame.title = button.dataset.title || 'Video';
      frame.loading = 'lazy';
      frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture';
      frame.allowFullscreen = true;
      button.replaceChildren(frame);
    });
  });
}

/* ---------------------------------------------------------------- reviews */
/** One reader quote at a time, stepped through with the two arrows. */
function initReviews(scope = document) {
  $$('[data-reviews]', scope).forEach((root) => {
    const slides = $$('[data-review]', root);
    if (slides.length < 2) return;

    const prev = $('[data-review-prev]', root);
    const next = $('[data-review-next]', root);
    const current = $('[data-review-current]', root);
    const total = $('[data-review-total]', root);
    const pad = (n) => String(n).padStart(2, '0');

    let i = Math.max(0, slides.findIndex((s) => s.classList.contains('is-current')));
    if (total) total.textContent = pad(slides.length);

    // Reserve the tallest quote's height so stepping never resizes the page.
    const show = (n) => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('is-current', k === i));
      if (current) current.textContent = pad(i + 1);
    };

    show(i);
    prev?.addEventListener('click', () => show(i - 1));
    next?.addEventListener('click', () => show(i + 1));
  });
}

/* ---------------------------------------------------------- entry preview */
/** A small image that trails the cursor over the writing list. Desktop only. */
function initEntryPreview() {
  const list = $('[data-preview-list]');
  if (!list || !canHover.matches || reduced.matches) return;

  const preview = document.createElement('figure');
  preview.className = 'entry__preview';
  preview.setAttribute('aria-hidden', 'true');
  const img = document.createElement('img');
  img.alt = '';
  img.decoding = 'async';
  preview.append(img);
  document.body.append(preview);

  let target = { x: 0, y: 0 };
  let pos = { x: 0, y: 0 };
  let running = false;

  const loop = () => {
    pos.x += (target.x - pos.x) * 0.12;
    pos.y += (target.y - pos.y) * 0.12;
    preview.style.setProperty('--x', `${pos.x.toFixed(1)}px`);
    preview.style.setProperty('--y', `${pos.y.toFixed(1)}px`);
    if (running) requestAnimationFrame(loop);
  };

  $$('[data-preview]', list).forEach((entry) => {
    entry.addEventListener('pointerenter', () => {
      img.src = entry.dataset.preview;
      preview.classList.add('is-visible');
      if (!running) {
        running = true;
        requestAnimationFrame(loop);
      }
    });
    entry.addEventListener('pointerleave', () => {
      preview.classList.remove('is-visible');
      running = false;
    });
  });

  list.addEventListener('pointermove', (e) => {
    target = { x: e.clientX - 136, y: e.clientY - 90 };
    if (pos.x === 0 && pos.y === 0) pos = { ...target };
  });
}

/* -------------------------------------------------------- language memory */
/** Remembers the chosen language so / can send the visitor back to it. */
function initLanguage() {
  $$('[data-lang]').forEach((link) => {
    link.addEventListener('click', () => {
      try {
        localStorage.setItem('kb-lang', link.dataset.lang);
      } catch (_) {
        /* private mode — the redirect simply falls back to Accept-Language */
      }
    });
  });
}

/* ------------------------------------------------------------- gas policy */
/** Independent expand/collapse rows — any number can be open at once. */
function initGasTimeline() {
  $$('[data-gas-toggle]').forEach((toggle) => {
    const row = toggle.closest('[data-gas-row]');
    const label = $('[data-gas-label]', toggle);
    const arrow = $('[data-gas-arrow]', toggle);

    toggle.addEventListener('click', () => {
      const open = row.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      if (label) label.textContent = open ? 'Hide details' : 'View details';
      if (arrow) arrow.textContent = open ? '↑' : '→';
    });
  });
}

/* -------------------------------------------------------------------- boot */
initReveal();
initHeader();
initMenu();
initScrollspy();
initAudio();
initVideo();
initReviews();
initEntryPreview();
initLanguage();
initBook();
initCarousel();
initGasTimeline();
