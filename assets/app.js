(function () {
  'use strict';

  var WEBHOOK = 'https://n8n.psygstore.shop/webhook/site-doctor-audit-v2';
  var LS = { lang: 'site_doctor_lang', dismissed: 'site_doctor_lang_dismissed' };

  // IP country -> suggested language (country comes from the hosting edge; see api/geo.js)
  var COUNTRY_LANG = {};
  function map(lang, list) { list.split(' ').forEach(function (c) { COUNTRY_LANG[c] = lang; }); }
  map('fa', 'IR AF TJ');
  map('ar', 'SA AE EG IQ JO KW LB LY MA DZ TN SY YE OM QA BH SD PS MR');
  map('es', 'ES MX AR CO CL PE VE EC GT CU BO DO HN PY SV NI CR PA UY PR GQ');
  map('fr', 'FR MC LU SN CI ML BF NE CD MG HT GA CG BJ TG GN');
  map('de', 'DE AT LI');
  map('tr', 'TR');
  map('ru', 'RU BY KZ KG');
  map('zh', 'CN TW HK MO');
  map('hi', 'IN');

  var LANGS = window.LANGS, I18N = window.I18N;
  var current = 'en';
  var lastResult = null;

  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function $(id) { return document.getElementById(id); }
  function supported(l) { return l && Object.prototype.hasOwnProperty.call(LANGS, l); }
  function t(key) { return (I18N[current] && I18N[current][key]) || I18N.en[key] || ''; }

  function normalize(code) {
    if (!code) return null;
    var base = String(code).toLowerCase().split(/[-_]/)[0];
    if (base === 'prs' || base === 'pes') base = 'fa';
    return supported(base) ? base : null;
  }

  // ---------- Applying a language
  function applyLang(lang, persist) {
    if (!supported(lang)) lang = 'en';
    current = lang;
    if (persist) safeSet(LS.lang, lang);
    var de = document.documentElement;
    de.lang = lang;
    de.dir = LANGS[lang].dir;
    document.title = t('title');
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', t('desc'));
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = t(nodes[i].getAttribute('data-i18n'));
    $('lang-select').value = lang;
    applyNiche();
    if (lastResult) renderResult(lastResult);
  }

  function applyNiche() {
    var h1 = $('hero-title'), lead = $('hero-lead'), badge = $('hero-badge');
    var niche = (new URLSearchParams(location.search).get('niche') || '').toLowerCase().trim();
    var cfg = window.NICHE_CONFIG && window.NICHE_CONFIG[current] && window.NICHE_CONFIG[current][niche];
    h1.classList.toggle('wide', !!cfg);
    if (cfg) {
      badge.textContent = cfg.badge;
      h1.textContent = cfg.title;
      lead.textContent = cfg.subtitle;
    }
  }

  // ---------- Language suggestion based on the visitor's IP country (+ browser language)
  function showGeoBanner(lang) {
    var d = I18N[lang];
    $('geo-text').textContent = d.geoText;
    var yes = $('geo-yes');
    yes.textContent = d.geoYes;
    yes.onclick = function () { applyLang(lang, true); hideGeo(true); };
    $('geo-no').textContent = t('geoNo');
    $('geo-banner').classList.add('show');
    $('geo-banner').setAttribute('lang', lang);
    $('geo-banner').setAttribute('dir', LANGS[lang].dir);
  }
  function hideGeo(remember) {
    $('geo-banner').classList.remove('show');
    if (remember) safeSet(LS.dismissed, '1');
  }

  function suggestLanguage() {
    var fromBrowser = null;
    var nl = navigator.languages || [navigator.language];
    for (var i = 0; i < nl.length && !fromBrowser; i++) fromBrowser = normalize(nl[i]);

    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 2500) : null;
    fetch('/api/geo', { cache: 'no-store', signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function () { return {}; })
      .then(function (g) {
        if (timer) clearTimeout(timer);
        var byIp = g && g.country ? COUNTRY_LANG[String(g.country).toUpperCase()] : null;
        var pick = byIp || fromBrowser;
        if (pick && pick !== current && !safeGet(LS.dismissed)) showGeoBanner(pick);
      });
  }

  // ---------- Result rendering
  function renderResult(r) {
    var score = Math.max(0, Math.min(100, Number(r.score) || 0));
    var color = score >= 80 ? 'var(--ok)' : score >= 65 ? 'var(--warn)' : 'var(--crit)';
    var C = 2 * Math.PI * 60;
    var val = $('gauge-val');
    val.setAttribute('stroke', color);
    val.setAttribute('stroke-dasharray', String(C));
    val.setAttribute('stroke-dashoffset', String(C * (1 - score / 100)));
    $('gauge-score').textContent = String(score);
    $('gauge-score').style.color = color;
    $('gauge-grade').textContent = String(r.grade || '');
    $('gauge-cap').textContent = t('score');

    var counts = r.counts || {};
    var chips = $('chips');
    chips.textContent = '';
    [['c', 'critical'], ['i', 'important'], ['m', 'minor']].forEach(function (p) {
      var s = document.createElement('span');
      s.className = 'chip ' + p[0];
      s.textContent = t(p[1]) + ' ' + (Number(counts[p[1]]) || 0);
      chips.appendChild(s);
    });
    if (typeof r.passed === 'number') {
      var ps = document.createElement('span');
      ps.className = 'chip p';
      ps.textContent = t('passed') + ' ' + r.passed;
      chips.appendChild(ps);
    }

    var ul = $('top');
    ul.textContent = '';
    (Array.isArray(r.top) ? r.top.slice(0, 5) : []).forEach(function (f) {
      var li = document.createElement('li');
      var dot = document.createElement('span');
      dot.className = 'dot ' + (f.sev === 'critical' ? 'critical' : f.sev === 'important' ? 'important' : '');
      var title = f.title && typeof f.title === 'object' ? (f.title[current] || f.title.en || '') : String(f.title || '');
      var tx = document.createElement('span');
      tx.textContent = title;
      li.appendChild(dot);
      li.appendChild(tx);
      ul.appendChild(li);
    });
    $('top-wrap').hidden = !ul.children.length;
  }

  // ---------- Form
  function showError(reason) {
    var key = 'e_' + reason;
    var msg = I18N.en[key] ? t(key) : (reason === 'http_429' ? t('e_rate_limited') : reason === 'http_400' ? t('e_invalid_url') : t('e_generic'));
    $('error-msg').textContent = msg;
    $('error-box').hidden = false;
  }

  function setLoading(on) {
    var b = $('submit-btn');
    b.disabled = on;
    $('btn-label').textContent = t(on ? 'btnLoading' : 'btn');
    $('btn-spin').hidden = !on;
  }

  function onSubmit(ev) {
    ev.preventDefault();
    $('error-box').hidden = true;
    var url = $('website_url').value.trim();
    var email = $('user_email').value.trim();
    var params = new URLSearchParams(location.search);
    var payload = {
      website_url: url,
      user_email: email,
      niche: params.get('niche') || 'general',
      lang: current,
      company_website: $('company_website').value || '',
      source: location.hostname,
      timestamp: new Date().toISOString()
    };
    setLoading(true);
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 45000);
    var status = 0;
    fetch(WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: ctrl.signal })
      .then(function (res) { status = res.status; return res.json().catch(function () { return null; }).then(function (data) { return { res: res, data: data }; }); })
      .then(function (o) {
        if (!o.res.ok || (o.data && o.data.ok === false)) {
          var e = new Error('rejected');
          e.reason = (o.data && o.data.reason) || ('http_' + status);
          throw e;
        }
        var inst = o.data && (o.data.instant || (typeof o.data.score === 'number' ? o.data : null));
        lastResult = inst || null;
        $('res-domain').textContent = url.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
        $('instant').hidden = !inst;
        if (inst) renderResult(inst);
        $('audit-form').hidden = true;
        $('result').hidden = false;
        $('result').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      })
      .catch(function (err) { showError(err && err.reason ? err.reason : 'generic'); })
      .then(function () { clearTimeout(timer); setLoading(false); });
  }

  function reset() {
    lastResult = null;
    $('result').hidden = true;
    $('audit-form').hidden = false;
    $('website_url').value = '';
    $('website_url').focus();
  }

  // ---------- Init
  function init() {
    var sel = $('lang-select');
    Object.keys(LANGS).forEach(function (code) {
      var o = document.createElement('option');
      o.value = code;
      o.textContent = LANGS[code].name;
      sel.appendChild(o);
    });
    sel.addEventListener('change', function () { applyLang(sel.value, true); hideGeo(true); });
    $('geo-no').addEventListener('click', function () { hideGeo(true); });
    $('audit-form').addEventListener('submit', onSubmit);
    $('again').addEventListener('click', reset);
    var year = $('year'); if (year) year.textContent = String(new Date().getFullYear());

    var q = normalize(new URLSearchParams(location.search).get('lang'));
    var saved = normalize(safeGet(LS.lang));
    if (q) applyLang(q, true);
    else if (saved) applyLang(saved, false);
    else { applyLang('en', false); suggestLanguage(); }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
