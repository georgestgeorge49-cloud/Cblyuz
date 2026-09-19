# Konstantin Bluz — personal site

A static, three-language editorial site. No build step, no framework, no runtime
dependencies. Deploys to Vercel as-is.

```bash
node tools/serve.mjs      # local preview on http://localhost:4321
```

---

## The idea

The professional half of the site is **paper** — warm off-white, ruled, restrained.
At *“But that is only one chapter.”* the ground inverts to **ink**, and the creative
work arrives as a sequence of turning pages. The site then returns to paper for the
writing, photographs and contact.

The book metaphor appears once, where the subject actually becomes literature. It is
not the visual language of the rest of the site.

---

## Structure

```
/                       language redirect (remembered choice → Accept-Language → /en/)
/en/  /he/  /ru/        landing pages, hand-written
  chapters.html         selected chapters from the novel
  musical.html          full synopsis
  writing/*.html        articles
/assets/css/site.css    the entire design system
/assets/js/main.js      reveals, header, menu, audio, video facades
/assets/js/book.js      the page-turn module
/tools/                 generators (placeholders, sub-pages, sitemap) + dev server
```

### The three editions are deliberately not identical

| | EN | HE | RU |
|---|---|---|---|
| Positioning | primary international profile | compact professional | literary / complete |
| Book chapters | 5 | 4 (no audiobook) | 5 |
| Articles | 3 | 2 | 3 |
| Photographs | 4 | 2 | 4 |

They share the design system, header, type scale, spacing and interaction language.
Hebrew runs `dir="rtl"` throughout, and the page-turn mirrors — pages hinge on the
right edge and rotate the other way.

---

## The page-turn

`assets/js/book.js` — one DOM, two behaviours:

- **pinned** (desktop, motion allowed): the section sticks to the viewport and scroll
  drives the turn. A page rests for the first 58% of its scroll segment, then lifts and
  rotates ~106° around its inner edge while the next page settles from `scale(.968)` and
  its shadow lifts. One composited gradient layer per page does the shading.
- **static** (≤860px, `prefers-reduced-motion`, or viewports under 560px tall): the same
  pages become a plain vertical sequence of chapters. No pinning, no scroll hijack, no
  multi-thousand-pixel sticky track. Mobile is lighter than desktop, not a reduced copy of it.

Tuning constants live at the top of the file (`SEGMENT`, `TAIL`, `REST`).

Accessibility: in pinned mode, off-screen chapters are `inert` so keyboard focus cannot
land in invisible content; the rail buttons move between chapters, and focus arriving in a
chapter scrolls it into view. In static mode every chapter is reachable normally.

---

## What still needs real content

Everything below is a working placeholder with the right dimensions, so replacing it
changes no layout.

### ⚠️ Confirm before launch

- **Novel title.** Russian is confirmed by the author: «Даль свободного» (a Pushkin
  allusion, from *Евгений Онегин*). English *The Wide Expanse of the Free* came with the
  brief. The Hebrew «המרחב הרחב של החופשיים» is still my translation of the English and
  has **not** been confirmed. The musical titles («Никого перед зеркалом» /
  «אף אחד מול המראה») are also unconfirmed — marked with `TODO` comments in the HTML.
- **Hebrew copy** was drafted by me and should be read by a native speaker before launch.
- **Book quotes** on chapter 02 are illustrative, not real quotations from the novel.
- **Assignment descriptions** ("Power market strategy…") are plausible placeholders.
- **Domain** — `konstantinbluz.com` appears in every canonical, hreflang, OG tag and in
  `sitemap.xml` / `robots.txt`. Search and replace if it differs.
- **Email, phone and LinkedIn** are placeholders (`hello@konstantinbluz.com`,
  `+000 00 000 0000`, `linkedin.com/in/PROFILE`), including in the JSON-LD `sameAs`.

### Images

Replace the SVGs in `/assets/img` with WebP or AVIF **at the same aspect ratio**, then
update the `src` and the `width`/`height` attributes. The ratios are what keep the layout
from shifting.

| File | Ratio | Used for |
|---|---|---|
| `portrait.svg` | 4:5 | hero |
| `book-cover.svg` | 2:3 | chapter 01 |
| `musical-poster.svg` | 3:4 | musical chapter |
| `logos/logo-01…12.svg` | ~3:1 | assignments grid |
| `photos/photo-01…04.svg` | mixed | photographs |
| `media/video-01…05.svg` | 16:9 | video thumbnails |
| `og.svg` | 1200×630 | **replace with JPG/PNG** — several social platforms will not render an SVG preview |

Regenerate the placeholders any time with `node tools/make-placeholders.mjs`.

### Audio

Drop the recording at `/assets/audio/chapter-01.mp3`. Until it exists the player renders
normally and reports *“Audio file to be uploaded”* on use — nothing breaks.

### Video

The thumbnails are click-to-load facades: nothing contacts a video host until the visitor
asks. Replace `VIDEO_ID` in each `data-embed` with the real YouTube/Vimeo embed URL.

---

## Adding an article

Edit the `PAGES` table in `tools/make-pages.mjs`, then:

```bash
node tools/make-pages.mjs
```

This writes the sub-pages **and** regenerates `sitemap.xml` from the same table, so the two
cannot drift. Then add the entry by hand to the `.writing__list` of the relevant landing
page. The landing pages are hand-written and are never overwritten by the generator.

---

## Notes

- **Fonts** load from Google Fonts (Cormorant Garamond + Inter; Frank Ruhl Libre + Heebo for
  Hebrew). To remove the third-party request, self-host the woff2 files into `/assets/fonts`
  and swap the `<link>` for an `@font-face` block.
- **Reveal animations are gated on a `.js` class** that the script adds to `<html>` at boot.
  Content is therefore visible by default — a blocked or failed script can never leave a
  section stranded at `opacity: 0`.
- **`prefers-reduced-motion`** removes the 3D turn entirely (chapters become the static
  stack), stops the scroll cue, and reduces every transition to near-zero. All content and
  functionality is preserved.
- Images below the fold are `loading="lazy"`; the hero portrait is `fetchpriority="high"`.
- `assets/img/*` is served with a one-year immutable cache (`vercel.json`). Change filenames,
  not contents, when replacing assets.
