# 🩺 Site Doctor (سایت دکتر) — Emergency Website Health & SEO Triage

A high-converting, single-page landing page engineered for **Site Doctor** in alignment with **[Pars Media](https://parsmedia.ca)** (Vancouver, BC). Features bilingual support (English primary with Persian localization), automatic Geo-location detection with user confirmation, dynamic text replacement (DTR), and an **n8n Webhook** integration.

---

## 🌟 Key Updates & Features

1. **English-First with Bilingual Localization:**
   - **Default Language:** English (`en` / `ltr`) with modern typography (`Plus Jakarta Sans`).
   - **Persian Localization:** Seamless switch to Persian (`fa` / `rtl`) with `Vazirmatn` font.
   - **Persistent Switcher:** Permanent `[ 🌐 FA / EN ]` toggle button in the navbar.
   - **Smart Geo-Location & User Confirmation:** Automatically detects if the visitor is arriving from Iran or a Persian-locale browser/timezone/IP. Displays an unobtrusive confirmation banner:
     *"📍 Visiting from a Persian-speaking region? Switch to Persian (فارسی)?"*
     `[تغییر به فارسی]` / `[Keep in English]`
     Saves user decision in `localStorage` without forcing unexpected redirects.

2. **Upgraded Professional Medical-Tech Icons:**
   - Replaced basic icons with refined dual-tone, SVG-rendered medical and tech diagnostics:
     - **Hexagonal Medical Shield Core:** Multi-layered crosshair and cardiac pulse.
     - **Vital Signs Monitor:** Biometric ECG wave with speed performance metrics.
     - **Technical SEO Scanner:** Multi-axis radar shield diagnosing indexing penalties.
     - **Prescription Roadmap:** High-tech digital clinical report icon.

3. **Clean Enterprise Branding (Zero Internal Vendor Leaks):**
   - User-facing UI does not expose internal backend plumbing (no mention of Resend or internal AI model names to visitors).
   - Visitors see a cohesive, trust-inducing medical SaaS interface: **"Site Doctor AI Health Core"** and **"Instant Inbox Delivery"**.
   - The page POSTs `{website_url, user_email, niche, lang, company_website (honeypot), source, timestamp}` to the n8n **Site Doctor v2** webhook.

4. **Instant result + emailed report (v2):**
   - The webhook answers within a few seconds with `{ok, instant:{score, grade, counts, passed, top:[{sev,title:{en,fa}}]}}`; the page renders the score, grade, issue counts and top findings in the visitor's language.
   - The full bilingual report (category scores, Core Web Vitals when available, treatment plan) is emailed in the background.
   - Rejections (`invalid_url`, `invalid_email`, `blocked_host`, `blocked_port`, `domain_not_found`, `rate_limited`, HTTP 400/429) are mapped to friendly bilingual messages.
   - Language detection uses `navigator.languages` and the timezone only; no third-party geo-IP call is made.

---

## 🚀 n8n v2 workflow (Evidence-based audit)

Set the webhook in `index.html`:
```javascript
const N8N_WEBHOOK_URL = "https://n8n.psygstore.shop/webhook/site-doctor-audit-v2";
```

Pipeline: Webhook → validation (SSRF guard, rate limits, honeypot) → DNS guard → deterministic checks (indexing, on-page, security headers, SPF/DMARC, performance hints) → instant JSON response → PageSpeed Insights (CWV) → AI narration (Groq, Mistral fallback; facts only) → Resend email.

---

## 💻 نحوه اجرا و تست محلی
فایل `index.html` به صورت Standalone بدون نیاز به کامپایل یا بیلد قابل اجراست:
- کافی است فایل `index.html` را در مرورگر باز کنید، یا با اکستنشن Live Server در VS Code اجرا فرمایید.
- برای تست نمونه‌های DTR:
  - `index.html?niche=dentist`
  - `index.html?niche=ecommerce`
  - `index.html?niche=doctor`
  - `index.html?niche=realestate`
  - `index.html?niche=lawyer`
