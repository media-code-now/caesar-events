# Caesar Events USA

Marketing site for Caesar Events USA — premium event and party rentals across
Miami, Orlando, Houston, San Diego, Las Vegas and Los Angeles.

Static HTML with no framework and no runtime dependencies. Styling is inline
plus a small per-page `<style>` block using the shared `.ce-*` class
conventions.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Home — hero, value strip, categories, locations |
| `about.html` | Company story, team, recent work |
| `rentals.html` | Rental catalogue with filtering and quote list |
| `linens.html` | Linen collection with filtering and quote list |
| `gallery.html` | Portfolio grid with category filters and lightbox |
| `blog.html` | Article listing with category filters |
| `blog-post.html` | Single-article template — copy this for new posts |
| `contact.html` | Contact form, locations and FAQ |
| `quote.html` | Quote request form |

## Shared header and footer

The primary navigation and the footer live in `partials/` and are injected into
every page by `build.js`. Edit the partial, never the generated block inside a
page — anything between `<!-- @include name -->` and `<!-- @end -->` is
overwritten on the next build.

```text
partials/
  nav-left.html        Home · About · Rentals · Linens · Locations
  nav-right.html       Gallery · Blog · Contact · quote button
  nav-right-cart.html  Same, with the quote-list counter (rentals, linens)
  footer.html          Footer, used by every page
```

Rebuild after changing a partial:

```bash
node build.js
```

Confirm every page is up to date (used by CI):

```bash
node build.js --check
```

The build writes plain static HTML, so pages stay crawlable and work when
opened directly from disk. Active nav state is applied automatically from the
`data-nav` attributes.

### Adding a page

1. Create the HTML file, including the three marker pairs for the left nav,
   right nav and footer.
2. Register it in the `PAGES` and `ACTIVE` maps in `build.js`.
3. Run `node build.js`.

## Local preview

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Deployment

Pushing to `main` triggers `.github/workflows/pages.yml`, which verifies the
partials are in sync and publishes the site to GitHub Pages.

One-time setup: in the repository, go to **Settings → Pages** and set
**Source** to **GitHub Actions**.

## Notes

The contact, quote and newsletter forms are front-end only — they validate
input and show a success state, but do not submit anywhere yet. Connect a form
handler (Formspree, Netlify Forms, or a custom endpoint) to receive
submissions.
