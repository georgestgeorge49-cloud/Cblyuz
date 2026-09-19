/**
 * BookFlip — the site's signature interaction.
 *
 * One DOM, two behaviours:
 *
 *   pinned  (desktop, motion allowed)
 *           The section pins to the viewport and scroll drives a page turn.
 *           A page rests for most of its scroll segment, then lifts and
 *           rotates away around its inner edge while the next page settles
 *           underneath. Shading is a single composited gradient layer per
 *           page — enough to read as paper, never a skeuomorphic 3D book.
 *
 *   static  (<= 860px, prefers-reduced-motion, or very short viewports)
 *           The same pages become a vertical sequence of editorial chapters.
 *           No pinning, no scroll hijack, no thousand-pixel sticky track.
 *
 * RTL: the turn mirrors — pages hinge on their right edge and rotate the
 * other way, because a Hebrew reader turns pages in the opposite direction.
 *
 * The module owns no global state and can be instantiated more than once.
 */

const SEGMENT = 1.05;  // scroll distance per chapter, in viewport heights
const TAIL = 0.55;     // extra dwell on the final chapter before releasing
const REST = 0.58;     // share of a segment the page holds still before turning

const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Smooth ramp from `a` to `b`. */
const between = (a, b, x) => clamp01((x - a) / (b - a));

/** Symmetric ease — slow to leave, decisive through, soft to land. */
const easeTurn = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export class BookFlip {
  constructor(root) {
    this.root = root;
    this.track = root.querySelector('[data-book-track]');
    this.stage = root.querySelector('[data-book-stage]');
    this.pages = Array.from(root.querySelectorAll('[data-page]'));
    this.rail = root.querySelector('[data-book-rail]');
    this.countCurrent = root.querySelector('[data-book-current]');

    if (!this.track || !this.stage || this.pages.length < 2) return;

    // Reachable from the element for debugging and re-initialisation.
    root.bookFlip = this;

    this.rtl = getComputedStyle(root).direction === 'rtl';
    this.mode = null;
    this.index = -1;
    this.ticking = false;
    this.cache = new Map();

    this.pages.forEach((page, i) => {
      page.style.zIndex = String(this.pages.length - i);
      if (!page.querySelector('.page__shade')) {
        const shade = document.createElement('div');
        shade.className = 'page__shade';
        shade.setAttribute('aria-hidden', 'true');
        page.append(shade);
      }
      page.addEventListener('focusin', () => this.onPageFocus(i));
    });

    this.buildRail();

    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.onResize.bind(this);
    this.render = this.render.bind(this);

    const coarse = window.matchMedia('(max-width: 860px)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const short = window.matchMedia('(max-height: 560px)');
    [coarse, reduced, short].forEach((mq) =>
      mq.addEventListener('change', () => this.applyMode())
    );
    this.queries = { coarse, reduced, short };

    // Resize is the belt to matchMedia's braces: it also covers the case where
    // the mode boundary is crossed without a media query event being delivered
    // (background tabs, some in-app webviews), and re-measures the track.
    window.addEventListener('resize', this.onResize);

    this.applyMode();
  }

  /* ------------------------------------------------------------------ rail */
  buildRail() {
    if (!this.rail) return;
    this.dots = this.pages.map((page, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      const title = page.dataset.title || `Chapter ${i + 1}`;
      dot.setAttribute('aria-label', title);
      dot.addEventListener('click', () => this.goTo(i));
      this.rail.append(dot);
      return dot;
    });
  }

  /* ------------------------------------------------------------------ mode */
  wantsStatic() {
    const { coarse, reduced, short } = this.queries;
    return coarse.matches || reduced.matches || short.matches;
  }

  applyMode() {
    const next = this.wantsStatic() ? 'static' : 'pinned';
    if (next === this.mode) return;
    this.mode = next;

    if (next === 'static') {
      this.teardownPinned();
      this.root.classList.add('is-static');
      this.pages.forEach((page) => {
        page.style.cssText = '';
        page.style.zIndex = '';
        this.release(page);
      });
      this.cache.clear();
    } else {
      this.root.classList.remove('is-static');
      this.pages.forEach((page, i) => { page.style.zIndex = String(this.pages.length - i); });
      window.addEventListener('scroll', this.onScroll, { passive: true });
      this.measure();
      this.update(true);
    }
  }

  teardownPinned() {
    window.removeEventListener('scroll', this.onScroll);
    this.track.style.height = '';
  }

  /* --------------------------------------------------------------- measure */
  measure() {
    this.vh = window.innerHeight;
    this.segment = this.vh * SEGMENT;
    this.track.style.height =
      (this.vh + this.segment * (this.pages.length - 1) + this.vh * TAIL) + 'px';
  }

  onResize() {
    this.applyMode();
    if (this.mode !== 'pinned') return;
    this.measure();
    this.cache.clear();
    this.update(true);
  }

  onScroll() {
    if (this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(this.render);
  }

  render() {
    this.ticking = false;
    this.update(false);
  }

  /* ---------------------------------------------------------------- update */
  update(force) {
    if (this.mode !== 'pinned') return;

    const last = this.pages.length - 1;
    const top = this.track.getBoundingClientRect().top;

    // Skip work entirely while the section is far off-screen.
    if (!force && (top > this.vh || top + this.track.offsetHeight < 0)) return;

    const raw = Math.max(0, Math.min(-top / this.segment, last));
    const index = Math.min(Math.floor(raw), last);
    const local = raw - index;
    const turn = index >= last ? 0 : easeTurn(between(REST, 1, local));

    this.pages.forEach((page, i) => {
      let transform = '';
      let opacity = 0;
      let shade = 0;
      let visible = false;

      if (i === index) {
        // The page currently being read, and — past REST — turned away.
        const deg = turn * 106 * (this.rtl ? 1 : -1);
        transform = `translateZ(${(turn * 26).toFixed(2)}px) rotateY(${deg.toFixed(2)}deg)`;
        opacity = 1 - between(0.62, 1, turn);
        shade = turn * 0.55;
        visible = true;
      } else if (i === index + 1) {
        // Revealed underneath: settles up out of the shadow of the page above.
        const s = (0.968 + 0.032 * turn).toFixed(4);
        transform = `translate3d(0, ${((1 - turn) * 12).toFixed(2)}px, 0) scale(${s})`;
        opacity = between(0, 0.4, turn);
        shade = (1 - turn) * 0.62 * (turn > 0 ? 1 : 0);
        visible = turn > 0;
      } else if (i < index) {
        transform = `rotateY(${this.rtl ? 106 : -106}deg)`;
      }

      this.write(page, i, transform, opacity, shade, visible);
    });

    // Follow what is actually on screen: the rail flips at the midpoint of the
    // turn, not when the scroll segment begins.
    const current = Math.min(index + (turn > 0.5 ? 1 : 0), last);
    if (current !== this.index || force) {
      this.index = current;
      this.pages.forEach((page, i) => (i === current ? this.expose(page) : this.release(page)));
      if (this.dots) {
        this.dots.forEach((dot, i) =>
          dot.setAttribute('aria-current', i === current ? 'true' : 'false')
        );
      }
      if (this.countCurrent) {
        this.countCurrent.textContent = String(current + 1).padStart(2, '0');
      }
    }
  }

  /** Only touch the DOM when a value actually changed. */
  write(page, i, transform, opacity, shade, visible) {
    const key = `${transform}|${opacity.toFixed(3)}|${shade.toFixed(3)}|${visible}`;
    if (this.cache.get(i) === key) return;
    this.cache.set(i, key);

    page.style.transform = transform;
    page.style.opacity = String(opacity);
    page.style.visibility = visible || opacity > 0 ? 'visible' : 'hidden';

    const shadeEl = page.querySelector('.page__shade');
    if (shadeEl) shadeEl.style.opacity = String(shade);
  }

  /* ----------------------------------------------------------------- a11y */
  expose(page) {
    page.removeAttribute('aria-hidden');
    page.inert = false;
  }

  release(page) {
    if (this.mode !== 'pinned') {
      page.removeAttribute('aria-hidden');
      page.inert = false;
      return;
    }
    page.setAttribute('aria-hidden', 'true');
    page.inert = true;
  }

  /** Focus landing on an off-screen chapter scrolls it into view. */
  onPageFocus(i) {
    if (this.mode !== 'pinned' || i === this.index) return;
    this.goTo(i, 'auto');
  }

  goTo(i, behavior) {
    if (this.mode !== 'pinned') {
      this.pages[i]?.scrollIntoView({ behavior: behavior || 'smooth', block: 'start' });
      return;
    }
    const reduced = this.queries.reduced.matches;
    window.scrollTo({
      top: window.scrollY + this.track.getBoundingClientRect().top + i * this.segment + 1,
      behavior: behavior || (reduced ? 'auto' : 'smooth'),
    });
  }
}

export function initBook(scope = document) {
  return Array.from(scope.querySelectorAll('[data-book]')).map((el) => new BookFlip(el));
}
