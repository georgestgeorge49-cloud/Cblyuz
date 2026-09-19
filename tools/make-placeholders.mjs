/**
 * Placeholder asset generator.
 *
 * Every image on the site is a real file at a real aspect ratio so that layout
 * is stable (no CLS) before the final photography arrives. Replace the files
 * in /assets/img with WebP/AVIF of the SAME aspect ratio and update the
 * <img src>/<source> — nothing else needs to change. See README.md.
 *
 * Usage:  node tools/make-placeholders.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const IMG = join(ROOT, 'assets', 'img');

const INK = '#14130F';
const FIELD = '#E4E0D6';
const FIELD_DARK = '#26241E';
const SHAPE = '#D2CCBE';
const SHAPE_DARK = '#333028';
const MUTED = '#8D877A';

const write = (rel, svg) => {
  const p = join(IMG, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, svg.trim() + '\n', 'utf8');
  return rel;
};

const label = (x, y, text, size, fill = MUTED, anchor = 'middle') =>
  `<text x="${x}" y="${y}" font-family="Helvetica Neue, Arial, sans-serif" font-size="${size}" ` +
  `letter-spacing="${(size * 0.18).toFixed(2)}" fill="${fill}" text-anchor="${anchor}">${text}</text>`;

/* ---------------------------------------------------------------- portrait */
/** Editorial portrait field: soft vertical light-fall + abstract figure mass. */
const portrait = (w, h, dark = false) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
  <defs>
    <linearGradient id="lf" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="${dark ? '#2C2921' : '#EDE9E0'}"/>
      <stop offset="1" stop-color="${dark ? '#1A1813' : '#DAD5C9'}"/>
    </linearGradient>
    <linearGradient id="fig" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0" stop-color="${dark ? '#3B3830' : '#C9C3B4'}"/>
      <stop offset="1" stop-color="${dark ? '#242119' : '#B8B2A2'}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#lf)"/>
  <g opacity="0.9">
    <ellipse cx="${w * 0.5}" cy="${h * 0.36}" rx="${w * 0.155}" ry="${w * 0.195}" fill="url(#fig)"/>
    <path d="M ${w * 0.16} ${h} C ${w * 0.19} ${h * 0.72}, ${w * 0.33} ${h * 0.6}, ${w * 0.5} ${h * 0.6}
             C ${w * 0.67} ${h * 0.6}, ${w * 0.81} ${h * 0.72}, ${w * 0.84} ${h} Z" fill="url(#fig)"/>
  </g>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="none" stroke="${dark ? '#3A372E' : '#CFC9BA'}"/>
  ${label(w / 2, h - 46, 'PORTRAIT PLACEHOLDER', Math.round(w / 40), dark ? '#6F6A5E' : MUTED)}
</svg>`;

/* ------------------------------------------------------------- book cover */
const bookCover = (w, h) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
  <defs>
    <linearGradient id="bc" x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0" stop-color="#1D1B16"/><stop offset="1" stop-color="#0D0C0A"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bc)"/>
  <line x1="${w * 0.055}" y1="0" x2="${w * 0.055}" y2="${h}" stroke="#2E2B23"/>
  <g fill="none" stroke="#8A7247" stroke-width="${w * 0.004}">
    <circle cx="${w * 0.5}" cy="${h * 0.42}" r="${w * 0.235}"/>
    <path d="M ${w * 0.265} ${h * 0.42} Q ${w * 0.5} ${h * 0.235}, ${w * 0.735} ${h * 0.42}"/>
    <path d="M ${w * 0.265} ${h * 0.42} Q ${w * 0.5} ${h * 0.605}, ${w * 0.735} ${h * 0.42}"/>
  </g>
  ${label(w / 2, h * 0.72, 'THE WIDE EXPANSE', Math.round(w / 22), '#E6E1D5')}
  ${label(w / 2, h * 0.775, 'OF THE FREE', Math.round(w / 22), '#E6E1D5')}
  ${label(w / 2, h * 0.86, 'NOVEL &#183; 2025', Math.round(w / 42), '#8A7247')}
  ${label(w / 2, h - 40, 'COVER PLACEHOLDER', Math.round(w / 52), '#514C3F')}
</svg>`;

/* ---------------------------------------------------------- musical poster */
const poster = (w, h) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
  <rect width="${w}" height="${h}" fill="#17150F"/>
  <g opacity="0.85">
    <rect x="${w * 0.18}" y="${h * 0.11}" width="${w * 0.64}" height="${h * 0.46}" fill="none" stroke="#8A7247" stroke-width="${w * 0.005}"/>
    <path d="M ${w * 0.18} ${h * 0.57} L ${w * 0.82} ${h * 0.11}" stroke="#2F2C24" stroke-width="${w * 0.004}"/>
    <ellipse cx="${w * 0.5}" cy="${h * 0.34}" rx="${w * 0.1}" ry="${h * 0.105}" fill="#221F18" stroke="#3A362B"/>
  </g>
  ${label(w / 2, h * 0.71, 'NO ONE IN FRONT', Math.round(w / 24), '#E6E1D5')}
  ${label(w / 2, h * 0.775, 'OF THE MIRROR', Math.round(w / 24), '#E6E1D5')}
  ${label(w / 2, h * 0.855, 'MUSICAL', Math.round(w / 44), '#8A7247')}
  ${label(w / 2, h - 40, 'POSTER PLACEHOLDER', Math.round(w / 50), '#4E493D')}
</svg>`;

/* -------------------------------------------------------------- logo marks */
/** Twelve distinct geometric marks so the grid reads as a real client wall. */
const marks = [
  (s) => `<circle cx="${s / 2}" cy="${s / 2}" r="${s * 0.36}" fill="none" stroke="currentColor" stroke-width="1.5"/>`,
  (s) => `<rect x="${s * 0.16}" y="${s * 0.16}" width="${s * 0.68}" height="${s * 0.68}" fill="none" stroke="currentColor" stroke-width="1.5"/>`,
  (s) => `<path d="M${s / 2} ${s * 0.14} L${s * 0.86} ${s * 0.82} L${s * 0.14} ${s * 0.82} Z" fill="none" stroke="currentColor" stroke-width="1.5"/>`,
  (s) => `<path d="M${s * 0.14} ${s / 2} A ${s * 0.36} ${s * 0.36} 0 0 1 ${s * 0.86} ${s / 2}" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="${s * 0.14}" y1="${s * 0.78}" x2="${s * 0.86}" y2="${s * 0.78}" stroke="currentColor" stroke-width="1.5"/>`,
  (s) => `<path d="M${s / 2} ${s * 0.12} L${s * 0.83} ${s * 0.31} L${s * 0.83} ${s * 0.69} L${s / 2} ${s * 0.88} L${s * 0.17} ${s * 0.69} L${s * 0.17} ${s * 0.31} Z" fill="none" stroke="currentColor" stroke-width="1.5"/>`,
  (s) => `<circle cx="${s * 0.38}" cy="${s / 2}" r="${s * 0.26}" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="${s * 0.62}" cy="${s / 2}" r="${s * 0.26}" fill="none" stroke="currentColor" stroke-width="1.5"/>`,
  (s) => `<line x1="${s * 0.16}" y1="${s * 0.16}" x2="${s * 0.84}" y2="${s * 0.84}" stroke="currentColor" stroke-width="1.5"/><line x1="${s * 0.84}" y1="${s * 0.16}" x2="${s * 0.16}" y2="${s * 0.84}" stroke="currentColor" stroke-width="1.5"/><circle cx="${s / 2}" cy="${s / 2}" r="${s * 0.2}" fill="none" stroke="currentColor" stroke-width="1.5"/>`,
  (s) => `<rect x="${s * 0.16}" y="${s * 0.16}" width="${s * 0.4}" height="${s * 0.4}" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="${s * 0.44}" y="${s * 0.44}" width="${s * 0.4}" height="${s * 0.4}" fill="none" stroke="currentColor" stroke-width="1.5"/>`,
  (s) => `<path d="M${s * 0.16} ${s * 0.84} L${s * 0.38} ${s * 0.3} L${s * 0.6} ${s * 0.62} L${s * 0.84} ${s * 0.2}" fill="none" stroke="currentColor" stroke-width="1.5"/>`,
  (s) => `<circle cx="${s / 2}" cy="${s / 2}" r="${s * 0.36}" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="${s * 0.14}" y1="${s / 2}" x2="${s * 0.86}" y2="${s / 2}" stroke="currentColor" stroke-width="1.5"/>`,
  (s) => `<path d="M${s * 0.18} ${s * 0.82} L${s * 0.5} ${s * 0.18} L${s * 0.82} ${s * 0.82}" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="${s * 0.32}" y1="${s * 0.56}" x2="${s * 0.68}" y2="${s * 0.56}" stroke="currentColor" stroke-width="1.5"/>`,
  (s) => `<rect x="${s * 0.16}" y="${s * 0.3}" width="${s * 0.68}" height="${s * 0.4}" rx="${s * 0.2}" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="${s * 0.5}" cy="${s * 0.5}" r="${s * 0.07}" fill="currentColor"/>`,
];

const logo = (i) => {
  const W = 200, H = 64, S = 40;
  const n = String(i).padStart(2, '0');
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" color="${INK}">
  <g transform="translate(4 ${(H - S) / 2})">${marks[(i - 1) % marks.length](S)}</g>
  <text x="${S + 18}" y="${H / 2 + 5}" font-family="Helvetica Neue, Arial, sans-serif" font-size="15"
        letter-spacing="2.6" fill="${INK}">LOGO ${n}</text>
</svg>`;
};

/* ------------------------------------------------------------------ fields */
/** Generic photographic field, used for photography + article thumbs. */
const field = (w, h, text, seed = 1) => {
  const r = (n) => ((Math.sin(seed * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
  <rect width="${w}" height="${h}" fill="${FIELD}"/>
  <g fill="${SHAPE}" opacity="0.75">
    <circle cx="${(0.2 + r(1) * 0.6) * w}" cy="${(0.2 + r(2) * 0.5) * h}" r="${(0.12 + r(3) * 0.16) * Math.min(w, h)}"/>
    <rect x="${r(4) * w * 0.5}" y="${(0.45 + r(5) * 0.35) * h}" width="${(0.3 + r(6) * 0.45) * w}" height="${(0.12 + r(7) * 0.2) * h}"/>
  </g>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" fill="none" stroke="#CFC9BA"/>
  ${label(w / 2, h / 2 + 6, text, Math.max(11, Math.round(Math.min(w, h) / 26)))}
</svg>`;
};

/* ------------------------------------------------------------ video thumbs */
const videoThumb = (i, caption) => {
  const w = 1280, h = 720;
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
  <defs><linearGradient id="v${i}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${FIELD_DARK}"/><stop offset="1" stop-color="#131209"/>
  </linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#v${i})"/>
  <g stroke="${SHAPE_DARK}" fill="none" stroke-width="2">
    <path d="M0 ${h * 0.72} Q ${w * 0.25} ${h * 0.56}, ${w * 0.5} ${h * 0.68} T ${w} ${h * 0.6}"/>
    <path d="M0 ${h * 0.82} Q ${w * 0.3} ${h * 0.66}, ${w * 0.55} ${h * 0.78} T ${w} ${h * 0.7}"/>
  </g>
  <circle cx="${w / 2}" cy="${h / 2}" r="46" fill="none" stroke="#8A7247" stroke-width="1.5"/>
  <path d="M${w / 2 - 12} ${h / 2 - 18} L${w / 2 + 22} ${h / 2} L${w / 2 - 12} ${h / 2 + 18} Z" fill="#8A7247"/>
  ${label(w / 2, h - 64, caption, 22, '#6F6A5E')}
</svg>`;
};

/* --------------------------------------------------------------- open graph */
const og = () => {
  const w = 1200, h = 630;
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
  <rect width="${w}" height="${h}" fill="#F4F2ED"/>
  <rect x="0" y="0" width="${w * 0.34}" height="${h}" fill="#E4E0D6"/>
  <ellipse cx="${w * 0.17}" cy="${h * 0.42}" rx="70" ry="88" fill="#C9C3B4"/>
  <path d="M ${w * 0.04} ${h} C ${w * 0.06} ${h * 0.76}, ${w * 0.11} ${h * 0.66}, ${w * 0.17} ${h * 0.66}
           C ${w * 0.23} ${h * 0.66}, ${w * 0.28} ${h * 0.76}, ${w * 0.3} ${h} Z" fill="#C9C3B4"/>
  <text x="${w * 0.42}" y="${h * 0.44}" font-family="Georgia, serif" font-size="72" fill="${INK}">Konstantin Bluz</text>
  <text x="${w * 0.42}" y="${h * 0.55}" font-family="Helvetica Neue, Arial, sans-serif" font-size="24"
        letter-spacing="2" fill="#6B675E">Energy consultant &#183; Diplomat &#183; Lecturer &#183; Author</text>
  <line x1="${w * 0.42}" y1="${h * 0.62}" x2="${w * 0.92}" y2="${h * 0.62}" stroke="#CFC9BA"/>
  <text x="${w * 0.42}" y="${h * 0.7}" font-family="Helvetica Neue, Arial, sans-serif" font-size="18"
        letter-spacing="3" fill="#8A7247">ONE BIOGRAPHY, SEVERAL CHAPTERS</text>
</svg>`;
};

/* -------------------------------------------------------------------- build */
const made = [];
made.push(write('portrait.svg', portrait(1000, 1250)));
made.push(write('portrait-dark.svg', portrait(1000, 1250, true)));
made.push(write('book-cover.svg', bookCover(900, 1350)));
made.push(write('musical-poster.svg', poster(1000, 1333)));
made.push(write('og.svg', og()));

for (let i = 1; i <= 12; i++) made.push(write(`logos/logo-${String(i).padStart(2, '0')}.svg`, logo(i)));

const photoSpecs = [
  ['photos/photo-01.svg', 1400, 1750, 'PHOTOGRAPH 01'],
  ['photos/photo-02.svg', 1600, 1000, 'PHOTOGRAPH 02'],
  ['photos/photo-03.svg', 1100, 1100, 'PHOTOGRAPH 03'],
  ['photos/photo-04.svg', 1400, 1900, 'PHOTOGRAPH 04'],
];
photoSpecs.forEach(([p, w, h, t], i) => made.push(write(p, field(w, h, t, i + 3))));

for (let i = 1; i <= 3; i++)
  made.push(write(`writing-${String(i).padStart(2, '0')}.svg`, field(900, 620, `ARTICLE 0${i}`, i + 11)));

['Conference keynote', 'Musical — staged excerpt', 'Chamber music evening', 'Book presentation', 'Lecture — energy markets']
  .forEach((c, i) => made.push(write(`media/video-${String(i + 1).padStart(2, '0')}.svg`, videoThumb(i + 1, c))));

console.log(`Generated ${made.length} placeholder assets in assets/img/`);
