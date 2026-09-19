/**
 * Sub-page generator — reader, synopsis and article pages.
 *
 * These pages share one layout, so they are generated from a content table
 * rather than maintained as fourteen near-identical files. To add an article:
 * add an entry to PAGES below and re-run `node tools/make-pages.mjs`.
 *
 * The landing pages (/en/, /he/, /ru/) are hand-written and NOT touched here.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://konstantinbluz.com';

const LANGS = {
  en: { dir: 'ltr', back: 'Back', home: 'Konstantin Bluz', arrow: '&larr;',
        fonts: 'family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Inter:wght@400;500',
        skip: 'Skip to content', note: 'Placeholder text' },
  ru: { dir: 'ltr', back: 'Назад', home: 'Константин Блюз', arrow: '&larr;',
        fonts: 'family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Inter:wght@400;500',
        skip: 'Перейти к содержанию', note: 'Текст-заполнитель' },
  he: { dir: 'rtl', back: 'חזרה', home: 'קונסטנטין בלוז', arrow: '&rarr;',
        fonts: 'family=Cormorant+Garamond:wght@400;500&family=Frank+Ruhl+Libre:wght@300;400;500&family=Heebo:wght@400;500',
        skip: 'דילוג לתוכן', note: 'טקסט זמני' },
};

/** Placeholder body shown until the real text is supplied. Deliberately
 *  neutral: it demonstrates the typography without imitating the author. */
const filler = {
  en: {
    notice: 'Placeholder text. The author&rsquo;s final text will replace this section.',
    paras: [
      'This page is ready for its text. The measure, leading and rhythm below are the ones the finished piece will use, so the layout can be judged before a single final word arrives.',
      'A paragraph at this width holds roughly sixty-five characters to the line, which is the range where sustained reading stays comfortable. The type is set in the same serif that carries the display headings, one size down, with generous line height.',
      'Section breaks, pull quotes and emphasis are all styled and waiting.',
    ],
    quote: 'A pull quote sits here, indented against a hairline rule.',
    heading: 'A section heading',
  },
  ru: {
    notice: 'Текст-заполнитель. Окончательный авторский текст заменит этот раздел.',
    paras: [
      'Страница готова к тексту. Ширина строки, интерлиньяж и ритм ниже — те же, что будут в готовом материале, поэтому вёрстку можно оценить до появления финальных слов.',
      'Абзац такой ширины удерживает примерно шестьдесят пять знаков в строке — диапазон, в котором длительное чтение остаётся комфортным. Набор выполнен той же антиквой, что и заголовки, на ступень мельче и с увеличенным межстрочным расстоянием.',
      'Разделители, выносные цитаты и выделения уже оформлены и ждут своего текста.',
    ],
    quote: 'Здесь стоит выносная цитата, отбитая тонкой линейкой.',
    heading: 'Подзаголовок раздела',
  },
  he: {
    notice: 'טקסט זמני. הטקסט הסופי של המחבר יחליף את החלק הזה.',
    paras: [
      'העמוד מוכן לטקסט. רוחב השורה, הרווח והקצב שלהלן זהים לאלה של הגרסה הסופית, כך שאפשר להעריך את העיצוב עוד לפני שנכתבת המילה האחרונה.',
      'פסקה ברוחב כזה מחזיקה כשישים וחמישה תווים בשורה — הטווח שבו קריאה ממושכת נשארת נוחה. הטקסט מסודר באותה גופן מודגש כמו הכותרות, בגודל אחד קטן יותר וברווח שורות נדיב.',
      'מפרידי חלקים, ציטוטים בולטים והדגשות כבר מעוצבים וממתינים.',
    ],
    quote: 'כאן יופיע ציטוט בולט, מוסט כנגד קו דק.',
    heading: 'כותרת חלק',
  },
};

/* --------------------------------------------------------------- content */
const PAGES = [
  /* ---- the novel reader ---- */
  { slug: 'chapters', langs: ['en', 'ru', 'he'], kind: 'reader',
    en: { eyebrow: 'The Wide Expanse of the Free', title: 'Selected chapters',
          meta: ['Novel', '2025', 'Excerpt'],
          desc: 'Selected chapters from The Wide Expanse of the Free, the debut novel by Konstantin Bluz.' },
    ru: { eyebrow: 'Широкий простор свободных', title: 'Избранные главы',
          meta: ['Роман', '2025', 'Фрагмент'],
          desc: 'Избранные главы романа «Широкий простор свободных» Константина Блюза.' },
    he: { eyebrow: 'המרחב הרחב של החופשיים', title: 'פרקים נבחרים',
          meta: ['רומן', '2025', 'קטע'],
          desc: 'פרקים נבחרים מתוך הרומן «המרחב הרחב של החופשיים» מאת קונסטנטין בלוז.' } },

  /* ---- the musical synopsis ---- */
  { slug: 'musical', langs: ['en', 'ru', 'he'], kind: 'synopsis',
    en: { eyebrow: 'Musical', title: 'No One in Front of the Mirror',
          meta: ['Musical', 'Book &amp; lyrics', 'Full synopsis'],
          desc: 'Full synopsis of No One in Front of the Mirror, a chamber musical with book and lyrics by Konstantin Bluz.' },
    ru: { eyebrow: 'Мюзикл', title: 'Никого перед зеркалом',
          meta: ['Мюзикл', 'Либретто и тексты', 'Полный синопсис'],
          desc: 'Полный синопсис камерного мюзикла «Никого перед зеркалом». Либретто и тексты — Константин Блюз.' },
    he: { eyebrow: 'מחזמר', title: 'אף אחד מול המראה',
          meta: ['מחזמר', 'מחזה ומילים', 'תקציר מלא'],
          desc: 'התקציר המלא של המחזמר הקאמרי «אף אחד מול המראה». מחזה ומילים: קונסטנטין בלוז.' } },

  /* ---- articles ---- */
  { slug: 'writing/gas-decade', langs: ['en', 'ru', 'he'], kind: 'article',
    en: { eyebrow: 'Energy policy &middot; 2024', title: 'Israel&rsquo;s gas decade: what regulation actually built',
          meta: ['Energy policy', '2024'],
          desc: 'What a decade of natural gas regulation actually built in Israel — licensing, tariffs, network development and market rules.' },
    ru: { eyebrow: 'Энергополитика &middot; 2024', title: 'Газовое десятилетие Израиля: что на самом деле построило регулирование',
          meta: ['Энергополитика', '2024'],
          desc: 'Что на самом деле построило десятилетие регулирования газовой отрасли Израиля: лицензии, тарифы, сети и правила рынка.' },
    he: { eyebrow: 'מדיניות אנרגיה &middot; 2024', title: 'עשור הגז של ישראל: מה הרגולציה באמת בנתה',
          meta: ['מדיניות אנרגיה', '2024'],
          desc: 'מה באמת בנה עשור של רגולציה במשק הגז הטבעי בישראל: רישוי, תעריפים, פיתוח רשת וכללי שוק.' } },

  { slug: 'writing/energy-diplomacy', langs: ['en', 'ru', 'he'], kind: 'article',
    en: { eyebrow: 'Commentary &middot; 2023', title: 'Diplomacy at the pipeline: energy as a language between states',
          meta: ['Commentary', '2023'],
          desc: 'On energy as a working language of diplomacy, written from two embassies.' },
    ru: { eyebrow: 'Комментарий &middot; 2023', title: 'Дипломатия у трубы: энергия как язык между государствами',
          meta: ['Комментарий', '2023'],
          desc: 'Об энергии как рабочем языке дипломатии — заметки из двух посольств.' },
    he: { eyebrow: 'פרשנות &middot; 2023', title: 'דיפלומטיה ליד הצינור: אנרגיה כשפה בין מדינות',
          meta: ['פרשנות', '2023'],
          desc: 'על אנרגיה כשפת עבודה של הדיפלומטיה — מתוך שתי שגרירויות.' } },

  { slug: 'writing/novel-and-office', langs: ['en', 'ru'], kind: 'article',
    en: { eyebrow: 'Essay &middot; 2025', title: 'On writing a novel while working in government',
          meta: ['Essay', '2025'],
          desc: 'An essay on writing fiction in the hours around a public sector job.' },
    ru: { eyebrow: 'Эссе &middot; 2025', title: 'Как писать роман, работая в правительстве',
          meta: ['Эссе', '2025'],
          desc: 'Эссе о том, как пишется проза в часы вокруг государственной службы.' } },
];

/* ---------------------------------------------------------------- layout */
const layout = ({ lang, slug, page, langs }) => {
  const L = LANGS[lang];
  const F = filler[lang];
  const url = `${SITE}/${lang}/${slug}.html`;
  const depth = slug.includes('/') ? '../' : '';

  const alternates = langs
    .map((l) => `<link rel="alternate" hreflang="${l}" href="${SITE}/${l}/${slug}.html">`)
    .join('\n');

  return `<!doctype html>
<html lang="${lang}" dir="${L.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

<title>${strip(page.title)} — ${L.home}</title>
<meta name="description" content="${page.desc}">

<link rel="canonical" href="${url}">
${alternates}

<meta property="og:type" content="article">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${strip(page.title)}">
<meta property="og:description" content="${page.desc}">
<meta property="og:image" content="${SITE}/assets/img/og.svg">
<meta name="twitter:card" content="summary_large_image">

<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${L.fonts}&display=swap">
<link rel="stylesheet" href="/assets/css/site.css">
<script type="module" src="/assets/js/main.js"></script>
</head>

<body>
<a class="skip-link" href="#main">${L.skip}</a>

<header class="header is-scrolled" data-header>
  <div class="wrap header__inner">
    <a class="brand" href="/${lang}/">${L.home}</a>
    <div class="langs">
      ${langs.map((l) => l === lang
        ? `<a href="/${l}/${slug}.html" data-lang="${l}" aria-current="page" hreflang="${l}">${l.toUpperCase()}</a>`
        : `<a href="/${l}/${slug}.html" data-lang="${l}" hreflang="${l}" lang="${l}">${l.toUpperCase()}</a>`
      ).join('\n      <span aria-hidden="true">/</span>\n      ')}
    </div>
  </div>
</header>

<main id="main" class="subpage wrap">
  <div class="subpage__head">
    <p class="back-link-wrap">
      <a class="back-link" href="/${lang}/#chapters">
        <i aria-hidden="true">${L.arrow}</i>${L.back}
      </a>
    </p>

    <p class="eyebrow" style="margin-block-start:clamp(2rem,6vh,3.5rem)" data-reveal>${page.eyebrow}</p>
    <h1 class="subpage__title" data-reveal>${page.title}</h1>
    <p class="subpage__meta" data-reveal>
      ${page.meta.map((m) => `<span>${m}</span>`).join('\n      ')}
    </p>
  </div>

  <article class="prose">
    <p class="prose__notice">${F.notice}</p>
    <p class="drop">${F.paras[0]}</p>
    <p>${F.paras[1]}</p>
    <blockquote>${F.quote}</blockquote>
    <h2>${F.heading}</h2>
    <p>${F.paras[2]}</p>
    <hr>
    <p class="back-link-wrap">
      <a class="back-link" href="/${lang}/#chapters">
        <i aria-hidden="true">${L.arrow}</i>${L.back}
      </a>
    </p>
  </article>
</main>

<footer class="footer wrap">
  <p>&copy; <span>2026</span> ${L.home}</p>
  <p>
    ${['en', 'he', 'ru'].map((l) => `<a href="/${l}/"${l === lang ? '' : ` lang="${l}"`}>${l.toUpperCase()}</a>`).join(' &middot;\n    ')}
  </p>
</footer>

</body>
</html>
`;
};

const strip = (s) => s.replace(/&rsquo;/g, '’').replace(/&amp;/g, '&');

/* ----------------------------------------------------------------- build */
const written = [];
for (const entry of PAGES) {
  for (const lang of entry.langs) {
    const html = layout({ lang, slug: entry.slug, page: entry[lang], langs: entry.langs });
    const path = join(ROOT, lang, `${entry.slug}.html`);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, html, 'utf8');
    written.push(`${lang}/${entry.slug}.html`);
  }
}
console.log(`Generated ${written.length} sub-pages:\n  ${written.join('\n  ')}`);

/* --------------------------------------------------------------- sitemap */
/** Built from the same table, so the sitemap can never drift from the pages. */
const today = new Date().toISOString().slice(0, 10);

const urlEntry = (loc, alternates, priority) =>
  `  <url>\n    <loc>${loc}</loc>\n` +
  alternates.map((a) => `    <xhtml:link rel="alternate" hreflang="${a.lang}" href="${a.href}"/>\n`).join('') +
  `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/en/"/>\n` +
  `    <lastmod>${today}</lastmod>\n    <priority>${priority}</priority>\n  </url>`;

const entries = [];

// Language home pages.
const homeAlts = ['en', 'he', 'ru'].map((l) => ({ lang: l, href: `${SITE}/${l}/` }));
for (const lang of ['en', 'he', 'ru']) {
  entries.push(urlEntry(`${SITE}/${lang}/`, homeAlts, lang === 'en' ? '1.0' : '0.9'));
}

// Sub-pages.
for (const entry of PAGES) {
  const alts = entry.langs.map((l) => ({ lang: l, href: `${SITE}/${l}/${entry.slug}.html` }));
  for (const lang of entry.langs) {
    entries.push(urlEntry(`${SITE}/${lang}/${entry.slug}.html`, alts, '0.7'));
  }
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;

writeFileSync(join(ROOT, 'sitemap.xml'), sitemap, 'utf8');
console.log(`\nGenerated sitemap.xml with ${entries.length} URLs.`);
