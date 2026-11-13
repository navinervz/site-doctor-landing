# 🩺 Site Doctor — landing

Landing page for **Site Doctor**, a free evidence-based website health check by [Pars Media](https://parsmedia.ca).
Static site (no build step, no CSS framework) deployed on Vercel, talking to an n8n workflow.

## Structure
| Path | Purpose |
|---|---|
| `index.html` | Page + SEO (canonical, hreflang, Open Graph, JSON-LD) |
| `assets/styles.css` | Hand-written CSS (RTL-safe, logical properties) |
| `assets/i18n.js` | UI strings for 10 languages (en fa ar es fr de tr ru zh hi) |
| `assets/app.js` | Language logic, form → n8n webhook, instant result rendering |
| `assets/niches.js` | Outreach variants (`?niche=dentist`, …) for en/fa |
| `api/geo.js` | Vercel function: returns only the visitor's country (edge header) to *suggest* a language |
| `llms.txt`, `llms-full.txt` | Guide for AI assistants (GEO): what Site Doctor is, facts, API |
| `robots.txt`, `sitemap.xml` | Crawlers incl. AI bots explicitly allowed; hreflang alternates |
| `vercel.json` | Security headers (CSP, etc.) and caching |

## How it works
1. The form POSTs `{website_url, user_email, lang, niche, company_website (honeypot), source, timestamp}` to the n8n webhook `…/webhook/site-doctor-audit-v2` (set in `assets/app.js`).
2. n8n answers within seconds with `{ok, instant:{score, grade, counts, passed, top:[{sev,title:{en,fa}}]}}`; the page renders it. The full report follows by email.
3. Rejections (`invalid_url`, `invalid_email`, `blocked_host`, `blocked_port`, `domain_not_found`, `rate_limited`, HTTP 400/429) are mapped to localized messages.

## Languages
- The UI language is chosen by `?lang=xx`, then the saved choice. Otherwise English is shown and a banner **suggests** a language based on the IP country (`/api/geo`) or the browser language.
- To add a language: add it to `LANGS` and `I18N` in `assets/i18n.js` (all keys required) and to `COUNTRY_LANG` in `assets/app.js`.
- `lang` is sent to n8n, which decides the language of the emailed report.

## Local run
`python3 -m http.server` in the repo root (the `/api/geo` call simply fails locally; no suggestion banner is shown).
