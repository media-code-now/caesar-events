#!/usr/bin/env node
/**
 * Caesar Events — static partial builder.
 *
 * Injects the shared header navigation and footer from `partials/` into every
 * page, so markup lives in exactly one place while the output stays plain,
 * fully static HTML (no runtime JS, no SEO cost).
 *
 * Usage:  node build.js        build once
 *         node build.js --check  verify pages are in sync (exit 1 if not)
 *
 * On first run the script finds the existing nav/footer blocks and wraps them
 * in `<!-- @include name -->` … `<!-- @end -->` markers. After that it simply
 * refreshes whatever sits between those markers.
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PARTIALS = path.join(ROOT, 'partials');
const CHECK = process.argv.includes('--check');

/** Pages to build, and which right-hand nav variant each one uses. */
const PAGES = {
  'index.html':     { nav: 'nav-right' },
  'about.html':     { nav: 'nav-right' },
  'rentals.html':   { nav: 'nav-right-cart' },
  'linens.html':    { nav: 'nav-right-cart' },
  'gallery.html':   { nav: 'nav-right' },
  'blog.html':      { nav: 'nav-right' },
  'blog-post.html': { nav: 'nav-right' },
  'contact.html':   { nav: 'nav-right' },
  'quote.html':     { nav: 'nav-right' },
};

/** Which nav item is highlighted on each page. */
const ACTIVE = {
  'index.html': 'index',
  'about.html': 'about',
  'rentals.html': 'rentals',
  'linens.html': 'linens',
  'gallery.html': 'gallery',
  'blog.html': 'blog',
  'blog-post.html': 'blog',
  'contact.html': 'contact',
  'quote.html': null,
};

const ACTIVE_STYLE = 'color: #E4D5BC';

const read = (p) => fs.readFileSync(p, 'utf8');
const partial = (name) => read(path.join(PARTIALS, `${name}.html`)).replace(/\s*$/, '');

/** Mark the current page's nav link with aria-current and the accent colour. */
function applyActive(html, key) {
  if (!key) return html;
  return html.replace(
    new RegExp(`(<a\\b[^>]*?\\bdata-nav="${key}")([^>]*)>`),
    (full, head, rest) => {
      if (/aria-current/.test(rest)) return full;
      const withStyle = /style="/.test(rest)
        ? rest.replace(/style="/, `style="${ACTIVE_STYLE}; `)
        : `${rest} style="${ACTIVE_STYLE}"`;
      return `${head} aria-current="page"${withStyle}>`;
    }
  );
}

/**
 * Replace a region of the page with freshly rendered partial content.
 * Prefers existing markers; falls back to the legacy block on first run.
 */
function inject(html, name, body, legacy) {
  const block = `<!-- @include ${name} -->\n${body}\n<!-- @end -->`;
  const marker = new RegExp(
    `<!-- @include ${name} -->[\\s\\S]*?<!-- @end -->`
  );

  if (marker.test(html)) return html.replace(marker, block);
  if (legacy && legacy.test(html)) return html.replace(legacy, block);

  console.warn(`  ! could not locate "${name}" region`);
  return html;
}

// Legacy (pre-marker) block patterns, used once to migrate each page.
const LEGACY = {
  left: /<nav class="ce-nav ce-side"[\s\S]*?<\/nav>/,
  right: /<div class="ce-nav[\s\S]*?<\/div>\s*(?=<\/header>)/,
  footer: /<!-- FOOTER -->[\s\S]*?<\/footer>/,
};

let changed = 0;
const stale = [];

for (const [file, cfg] of Object.entries(PAGES)) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) {
    console.warn(`! missing page: ${file}`);
    continue;
  }

  const before = read(full);
  const key = ACTIVE[file];

  let out = before;
  out = inject(out, 'nav-left', applyActive(partial('nav-left'), key), LEGACY.left);
  out = inject(out, 'nav-right', applyActive(partial(cfg.nav), key), LEGACY.right);
  out = inject(out, 'footer', partial('footer'), LEGACY.footer);

  if (out === before) {
    console.log(`  = ${file}`);
    continue;
  }

  if (CHECK) {
    stale.push(file);
    console.log(`  ✗ ${file} (out of date)`);
    continue;
  }

  fs.writeFileSync(full, out);
  changed++;
  console.log(`  ✓ ${file}`);
}

if (CHECK) {
  if (stale.length) {
    console.error(`\n${stale.length} page(s) out of sync. Run: node build.js`);
    process.exit(1);
  }
  console.log('\nAll pages are in sync.');
} else {
  console.log(`\nDone — ${changed} page(s) updated.`);
}
