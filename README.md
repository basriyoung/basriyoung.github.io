# hasanbasri.dev

Personal portfolio site for **Hasan Basri**, IT systems administrator and computer
vision researcher based in Southeast Sulawesi, Indonesia (UTC+8).

**Live:** [hasanbasri.dev](https://hasanbasri.dev) · Bahasa Indonesia version at [/id.html](https://hasanbasri.dev/id.html)

---

## About this build

A deliberately dependency-free static site. No framework, no build step, no package
manager, nothing fetched from a CDN at runtime. Everything the page needs ships in
this repository, so it renders identically today and in five years, and it cannot
break because someone else's service went down.

| | |
|---|---|
| Page weight | ~42 KB HTML, ~20 KB CSS, ~12 KB JS |
| External runtime dependencies | none |
| Build step | none (one optional Python script, see below) |
| Hosting | GitHub Pages |
| Languages | English (default) and Bahasa Indonesia |

### Why no framework

The site is two static pages. A framework would add a toolchain, a `node_modules`
folder and a deployment pipeline to solve problems this project does not have.
Hand-written CSS with custom properties handles theming in about 20 KB, and 12 KB
of vanilla JavaScript covers everything interactive.

---

## Structure

```
index.html          English page (canonical, x-default)
id.html             Bahasa Indonesia page (generated, see below)
assets/
  style.css         Shared stylesheet, both pages
  app.js            Shared behaviour, both pages
basri.jpg           Profile photo
og-cover.jpg        Open Graph preview card (1200x630)
og-cover.svg        Editable source for the card above
robots.txt          Crawl rules, AI crawlers allowed
sitemap.xml         Both pages with hreflang alternates
CNAME               Custom domain for GitHub Pages
build_id.py         Generates id.html from index.html
```

CSS and JavaScript are shared files rather than inlined in each page, so switching
between languages costs one small HTML download instead of re-fetching the whole
stylesheet and script.

---

## The two-language setup

`index.html` is the source of truth. `id.html` is generated from it by
`build_id.py`, which applies an explicit list of English-to-Indonesian string
replacements and leaves every tag, class and attribute untouched. That guarantees
the two pages cannot drift apart structurally.

```bash
python3 build_id.py
```

If any expected string is missing or appears an unexpected number of times, the
script reports which one and exits without writing the file. It never produces a
half-translated page silently.

Strings rendered by JavaScript (toasts, button labels, ARIA labels) are not in that
list. `assets/app.js` carries both languages in a small dictionary and picks one by
reading `document.documentElement.lang`, so a single shared script serves both pages.

Search engines are told about the pairing through `hreflang` tags on both pages and
`xhtml:link` alternates in the sitemap.

---

## Implementation notes

**Theming.** Light and dark are CSS custom properties redefined under
`html[data-theme="dark"]`. The initial value follows `prefers-color-scheme`, and a
manual choice is stored in `localStorage`. Every storage access is wrapped in
`try/catch`, because private browsing and blocked site data make those calls throw,
and a thrown error there would stop the rest of the script.

**Icons.** A single inline SVG sprite referenced with `<use href="#id">`. Kept inline
rather than in an external file because external sprite references have a history of
inconsistent support across browsers, and the sprite is only about 3 KB.

**Contact form.** Ships in WhatsApp mode: it composes a message and opens WhatsApp
with it prefilled. Setting `FORM_ENDPOINT` at the top of `app.js` to a Formspree or
Web3Forms URL switches it to a real POST, and the button label and hint text update
themselves. A hidden honeypot field filters bots. There is no fake success state:
the form never claims a message was sent when it was not.

**Email obfuscation.** The address is assembled from two variables at runtime rather
than written into the HTML, which keeps it out of the reach of simple scrapers.

**Accessibility.** Skip link, one `h1` per page, labels bound to inputs with
`for`/`id`, `aria-expanded` on the menu toggle, `aria-pressed` on the filter tabs,
`role="status"` on the toast, visible focus rings, and a `prefers-reduced-motion`
block that disables animation.

**SEO.** Canonical URLs, Open Graph and Twitter Card metadata, JSON-LD `Person`
structured data with `knowsAbout` and `sameAs`, and a sitemap covering both language
versions.

---

## Verification

Both pages are checked in headless Chromium before each deploy: no console errors,
no failed requests, no horizontal overflow at 390 px, CSS and JS resolving from
`assets/`, correct `lang` attribute, correct language on JavaScript-rendered strings,
and the theme toggle, skill filter and workflow walk-through all exercised.

---

## Contact

- Email: email@hasanbasri.dev
- GitHub: [@basriyoung](https://github.com/basriyoung)
- YouTube: [@basriyoung](https://www.youtube.com/@basriyoung)

Open to remote, hybrid and on-site roles. UTC+8, which overlaps a full working day
with Singapore, Hong Kong, Perth and Manila, and European mornings.
