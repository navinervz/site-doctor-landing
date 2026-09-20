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
   - The JSON payload sent to your n8n webhook contains all technical metadata (`website_url`, `user_email`, `niche`, `lang`, `source`, `timestamp`) so n8n can process it with your Google Gemini credential and send the report via Resend.

---

## 🚀 راهنمای اتصال وب‌هوک n8n با Google Gemini و Resend

در فایل `index.html` خط ۳۳۹ متغیر زیر قرار دارد:
```javascript
const N8N_WEBHOOK_URL = "https://YOUR_N8N_DOMAIN/webhook/site-doctor-audit";
```

### ساختار ورک‌فلوی جدید در n8n:
1. **نود ۱ - Webhook Trigger:**
   - متد: `POST`
   - مسیر وب‌هوک دلخواه (مثلاً `/site-doctor-audit`)
   - داده‌های دریافتی از فرم شامل:
     ```json
     {
       "website_url": "https://example.com",
       "user_email": "user@example.com",
       "niche": "dentist",
       "source": "parsmedia.ca/site-doctor",
       "timestamp": "2026-09-20T..."
     }
     ```
2. **نود ۲ - اسکن سرعت و سرور (HTTP Request):**
   - ارسال درخواست به Google PageSpeed Insights API یا اسکن مستقیم هدرهای دامنه.
3. **نود ۳ - تجویز نسخه با Google Gemini:**
   - استفاده از کریدنشال موجود شما در n8n: **`Google Gemini(PaLM) Api mydot`**
   - پرامپت پیشنهادی:
     > «تحلیل و صدور نسخه تشخیصی سایت دکتر برای وب‌سایت {{ $json.website_url }} در صنف {{ $json.niche }}. لطفاً ۳ عارضه اصلی و ۳ راهکار اورژانسی برای افزایش رتبه گوگل و نرخ تبدیل کاربر تجویز کنید.»
4. **نود ۴ - ارسال نسخه با Resend:**
   - ارسال ایمیل قالب‌بندی شده شکیل HTML به آدرس `{{ $json.user_email }}` با موضوع: `🩺 نسخه معاینه وب‌سایت شما صادر شد | سایت دکتر & پارس مدیا`.

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
