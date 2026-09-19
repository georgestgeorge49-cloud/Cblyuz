/**
 * DepthCarousel — a coverflow-style photo carousel.
 *
 * One card in focus, the rest recede in Z and fan out in X under a
 * perspective on the root. Nothing about the geometry is hardcoded here:
 * card size, depth, spread, tilt, how many neighbours show, how fast they
 * fade and blur — all of it lives in --dc-* custom properties on the root
 * element (see .dc in site.css) and is re-read from computed style on every
 * layout pass. That's what lets a @media query reshape the whole carousel
 * for a breakpoint without touching a single number in this file.
 *
 * Distance-from-focus is computed once per card per render and drives
 * translateX/Z, rotateY, opacity and blur together, so cards read as one
 * coherent recession rather than several effects layered by coincidence.
 * The actual tween between states is a plain CSS transition (transform,
 * opacity, filter) — there's no animation loop to own or get wrong.
 *
 * The module owns no global state and can be instantiated more than once.
 */

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

class DepthCarousel {
  constructor(root) {
    this.root = root;
    this.stage = root.querySelector('[data-dc-stage]');
    this.cards = Array.from(root.querySelectorAll('[data-dc-card]'));
    this.prevBtn = root.querySelector('[data-dc-prev]');
    this.nextBtn = root.querySelector('[data-dc-next]');
    this.dotsHost = root.querySelector('[data-dc-dots]');
    this.captionEl = root.querySelector('[data-dc-caption]');

    if (!this.stage || this.cards.length < 2) return;

    this.count = this.cards.length;
    this.index = 0;
    this.lastWidth = 0;
    this.cfg = null;
    this.dragging = false;
    this.autoplayTimer = null;
    this.autoplayDelay = 5500;

    this.buildDots();
    this.bindEvents();
    this.layout(true);
  }

  /** Read every --dc-* dimension straight off computed style. No fallback
   *  number here is meant to be tuned — that's what the CSS is for; these
   *  only cover the case where a property is missing entirely. */
  readConfig() {
    const cs = getComputedStyle(this.root);
    const num = (name, fallback) => {
      const v = parseFloat(cs.getPropertyValue(name));
      return Number.isFinite(v) ? v : fallback;
    };
    return {
      cardW: num('--dc-card-w', 300),
      cardH: num('--dc-card-h', 380),
      depth: num('--dc-depth', 90),
      spread: num('--dc-spread', 190),
      tilt: num('--dc-tilt', 24),
      visible: Math.max(1, Math.round(num('--dc-visible', 2))),
      falloff: num('--dc-falloff', 0.4),
      blur: num('--dc-blur', 6),
      dotsH: num('--dc-dots', 44),
    };
  }

  buildDots() {
    if (!this.dotsHost) return;
    this.dots = this.cards.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'dc__dot';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', `Фото ${i + 1}`);
      b.addEventListener('click', () => this.goTo(i));
      this.dotsHost.append(b);
      return b;
    });
  }

  /** Layout depends only on the root's own width — never on its height,
   *  which this same method writes. A ResizeObserver on that root would
   *  therefore re-fire every time it sets that height; guarding on
   *  clientWidth breaks that loop (the second, self-triggered callback
   *  sees an unchanged width and returns immediately). `force` bypasses
   *  the guard for the window-resize backup path and first run. */
  layout(force) {
    const w = this.root.clientWidth;
    if (!force && w === this.lastWidth) return;
    this.lastWidth = w;
    this.cfg = this.readConfig();
    this.root.style.height = `${this.cfg.cardH + this.cfg.dotsH}px`;
    this.render();
  }

  /** Shortest signed distance from the focused index to card i, e.g. -1 is
   *  "one to the left of focus" — wraps around the ends for the loop. */
  signedOffset(i) {
    let d = i - this.index;
    const half = this.count / 2;
    if (d > half) d -= this.count;
    if (d < -half) d += this.count;
    return d;
  }

  render() {
    if (!this.cfg) return;
    const { cardW, cardH, depth, spread, tilt, visible, falloff, blur } = this.cfg;

    this.cards.forEach((card, i) => {
      const offset = this.signedOffset(i);
      const abs = Math.abs(offset);
      const hidden = abs > visible;

      const tx = offset * spread;
      const tz = -abs * depth;
      const ry = -offset * tilt;
      const opacity = hidden ? 0 : Math.max(0, 1 - abs * falloff);
      const blurPx = abs > 0 ? Math.min(blur, (abs / (visible + 1)) * blur * 1.6) : 0;

      card.style.width = `${cardW}px`;
      card.style.height = `${cardH}px`;
      card.style.transform =
        `translate(-50%, 0) translate3d(${tx}px, 0, ${tz}px) rotateY(${ry}deg)`;
      card.style.opacity = String(opacity);
      card.style.filter = blurPx > 0.05 ? `blur(${blurPx.toFixed(2)}px)` : 'none';
      card.style.zIndex = String(1000 - abs);
      card.style.pointerEvents = hidden ? 'none' : 'auto';
      card.setAttribute('aria-hidden', offset === 0 ? 'false' : 'true');

      const tint = card.querySelector('.dc__tint');
      if (tint) tint.style.opacity = String(Math.min(1, abs * falloff));
    });

    this.dots?.forEach((d, i) =>
      d.setAttribute('aria-selected', i === this.index ? 'true' : 'false')
    );
    if (this.captionEl) {
      this.captionEl.textContent = this.cards[this.index].dataset.caption || '';
    }
  }

  goTo(i) {
    const next = ((i % this.count) + this.count) % this.count;
    if (next === this.index) return;
    this.index = next;
    this.render();
    this.scheduleAutoplay();
  }

  next() { this.goTo(this.index + 1); }
  prev() { this.goTo(this.index - 1); }

  scheduleAutoplay() {
    clearTimeout(this.autoplayTimer);
    if (reduced.matches || this.dragging) return;
    this.autoplayTimer = setTimeout(() => this.next(), this.autoplayDelay);
  }
  pauseAutoplay() { clearTimeout(this.autoplayTimer); }

  bindEvents() {
    this.prevBtn?.addEventListener('click', () => this.prev());
    this.nextBtn?.addEventListener('click', () => this.next());

    this.cards.forEach((card, i) => {
      card.addEventListener('click', () => this.goTo(i));
    });

    this.root.addEventListener('mouseenter', () => this.pauseAutoplay());
    this.root.addEventListener('mouseleave', () => this.scheduleAutoplay());
    this.root.addEventListener('focusin', () => this.pauseAutoplay());
    this.root.addEventListener('focusout', (e) => {
      if (!this.root.contains(e.relatedTarget)) this.scheduleAutoplay();
    });

    this.root.addEventListener('keydown', (e) => {
      const rtl = getComputedStyle(this.root).direction === 'rtl';
      if (e.key === 'ArrowRight') { e.preventDefault(); rtl ? this.prev() : this.next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); rtl ? this.next() : this.prev(); }
    });

    // Pointer-based drag/swipe: measure the gesture, decide on release.
    // No `wheel` handler — a mouse over this block should keep scrolling
    // the page, not get eaten by the carousel.
    let startX = 0;
    let deltaX = 0;
    const THRESHOLD = 40;

    const onDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      startX = e.clientX;
      deltaX = 0;
      this.dragging = true;
      this.pauseAutoplay();
      this.stage.setPointerCapture?.(e.pointerId);
    };
    const onMove = (e) => {
      if (!this.dragging) return;
      deltaX = e.clientX - startX;
    };
    const onUp = () => {
      if (!this.dragging) return;
      this.dragging = false;
      const rtl = getComputedStyle(this.root).direction === 'rtl';
      if (deltaX > THRESHOLD) rtl ? this.next() : this.prev();
      else if (deltaX < -THRESHOLD) rtl ? this.prev() : this.next();
      else this.scheduleAutoplay();
      deltaX = 0;
    };

    this.stage.addEventListener('pointerdown', onDown);
    this.stage.addEventListener('pointermove', onMove);
    this.stage.addEventListener('pointerup', onUp);
    this.stage.addEventListener('pointercancel', onUp);

    const ro = new ResizeObserver(() => this.layout());
    ro.observe(this.root);
    window.addEventListener('resize', () => this.layout(true));

    this.scheduleAutoplay();
  }
}

export function initCarousel(scope = document) {
  return Array.from(scope.querySelectorAll('[data-dc]')).map((el) => new DepthCarousel(el));
}
