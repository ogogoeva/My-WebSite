(() => {
  'use strict';
  const COUNTER = 114379082;
  const KEY = 'ogogo-statistics-consent-v1';
  const LIFETIME = 180 * 24 * 60 * 60 * 1000;
  const english = document.documentElement.lang === 'en';
  const production = ['ogogoeva.ru', 'www.ogogoeva.ru'].includes(location.hostname);
  const text = english ? {
    title: 'Help improve this website',
    body: 'With your permission, Yandex Metrica can count visits and clicks on booking links. It does not record your screen or messages.',
    allow: 'Allow statistics', deny: 'Necessary only', details: 'About your data', settings: 'Statistics settings'
  } : {
    title: 'Помочь сделать сайт удобнее',
    body: 'С вашего разрешения Яндекс Метрика посчитает посещения и нажатия на запись. Запись экрана и содержимое переписок не собираются.',
    allow: 'Разрешить статистику', deny: 'Только необходимые', details: 'Об обработке данных', settings: 'Настройки статистики'
  };
  let consent = readConsent();
  let running = false;
  let scriptAdded = false;
  let openedBy = null;

  function readConsent() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      if (saved && ['granted', 'denied'].includes(saved.value) && Number.isFinite(saved.time) && Date.now() - saved.time < LIFETIME) return saved.value;
    } catch {}
    return null;
  }

  function pageURL() {
    const url = new URL(location.origin + location.pathname);
    const current = new URL(location.href);
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
      const value = current.searchParams.get(key);
      if (value && /^[a-z0-9_-]{1,80}$/i.test(value)) url.searchParams.set(key, value);
    }
    return url.href;
  }

  function start() {
    if (running || consent !== 'granted' || !production) return;
    running = true;
    window['disableYaCounter' + COUNTER] = false;
    window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
    window.ym.l = window.ym.l || Date.now();
    if (!scriptAdded) {
      scriptAdded = true;
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://mc.yandex.ru/metrika/tag.js?id=' + COUNTER;
      document.head.append(script);
    }
    let referrer = '';
    try { referrer = document.referrer ? new URL(document.referrer).origin + '/' : ''; } catch {}
    window.ym(COUNTER, 'init', {
      clickmap: false, trackLinks: false, webvisor: false,
      accurateTrackBounce: true, ecommerce: false,
      url: pageURL(), referrer, params: { site_language: english ? 'en' : 'ru' }
    });
  }

  function stop() {
    if (running && typeof window.ym === 'function') window.ym(COUNTER, 'destruct');
    running = false;
    window['disableYaCounter' + COUNTER] = true;
    for (const item of document.cookie.split(';')) {
      const name = item.split('=')[0].trim();
      if (!/^_ym_/.test(name)) continue;
      for (const domain of ['', '; domain=' + location.hostname, '; domain=.' + location.hostname]) {
        document.cookie = name + '=; Max-Age=0; path=/' + domain + '; SameSite=Lax; Secure';
      }
    }
  }

  const panel = document.createElement('section');
  panel.className = 'wrap analytics-consent';
  panel.id = 'statistics-consent';
  panel.hidden = true;
  panel.setAttribute('aria-labelledby', 'statistics-title');
  const copy = document.createElement('div');
  const heading = document.createElement('h2');
  heading.id = 'statistics-title'; heading.textContent = text.title;
  const explanation = document.createElement('p'); explanation.textContent = text.body;
  const policy = document.createElement('a');
  policy.href = (english ? 'privacy-en.html' : 'privacy.html') + '#analytics'; policy.textContent = text.details;
  copy.append(heading, explanation, policy);
  const actions = document.createElement('div'); actions.className = 'analytics-actions';
  const allow = document.createElement('button'); allow.type = 'button'; allow.textContent = text.allow;
  const deny = document.createElement('button'); deny.type = 'button'; deny.textContent = text.deny;
  actions.append(allow, deny); panel.append(copy, actions);
  const hero = document.querySelector('main > .preview-topics, .editorial-hero, .privacy-page h1');
  if (hero) hero.after(panel);
  else document.querySelector('main').append(panel);

  const settings = [...document.querySelectorAll('[data-statistics-settings]')];
  settings.forEach(button => {
    button.setAttribute('aria-controls', panel.id);
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', () => {
      openedBy = button;
      panel.hidden = false;
      settings.forEach(item => item.setAttribute('aria-expanded', 'true'));
      panel.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'instant' : 'smooth', block: 'center' });
      allow.focus({ preventScroll: true });
    });
  });

  function choose(value) {
    consent = value;
    try { localStorage.setItem(KEY, JSON.stringify({ value, time: Date.now() })); } catch {}
    if (value === 'granted') start(); else stop();
    panel.hidden = true;
    settings.forEach(button => button.setAttribute('aria-expanded', 'false'));
    if (openedBy) { openedBy.focus({ preventScroll: true }); openedBy = null; }
  }
  allow.addEventListener('click', () => choose('granted'));
  deny.addEventListener('click', () => choose('denied'));
  window.addEventListener('storage', event => {
    if (event.key !== KEY) return;
    consent = readConsent();
    if (consent === 'granted') start(); else stop();
    panel.hidden = consent !== null;
  });

  function goal(name, parameters = {}) {
    if (consent !== 'granted' || !running || typeof window.ym !== 'function') return;
    window.ym(COUNTER, 'reachGoal', name, { site_language: english ? 'en' : 'ru', ...parameters });
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    let url;
    try { url = new URL(link.href); } catch { return; }
    if (/\.pdf$/i.test(url.pathname) && url.origin === location.origin) { goal('resource_download'); return; }
    const personalTelegram = url.hostname === 't.me' && /^\/ogogoevaa\/?$/.test(url.pathname);
    const whatsapp = ['wa.me', 'api.whatsapp.com', 'web.whatsapp.com'].includes(url.hostname);
    if (!personalTelegram && !whatsapp) return;
    if (link.closest('.site-credit')) { goal('website_request'); return; }
    let placement = link.closest('#session') ? 'fees' : link.closest('.hero, .hero-action') ? 'hero' : link.closest('#contact') ? 'contact' : 'service_page';
    let format = 'general';
    if (link.closest('.package-prices')) format = 'package';
    else if (link.closest('#session article')) format = link.closest('article') === document.querySelector('#session .prices article') ? 'individual' : 'couple';
    else if (location.pathname.includes('individual-therapy')) format = 'individual';
    else if (location.pathname.includes('couples-therapy')) format = 'couple';
    const channel = whatsapp ? 'whatsapp' : 'telegram';
    goal('booking_click', { placement, format, channel });
    if (format !== 'general') goal('book_' + format, { placement, channel });
  });
  document.querySelectorAll('.preview-audio audio').forEach(audio => {
    let counted = false;
    audio.addEventListener('play', () => { if (!counted && consent === 'granted') { goal('voice_intro_play'); counted = true; } });
  });
  if (consent === 'granted') start();
  else if (consent === null && !navigator.globalPrivacyControl && navigator.doNotTrack !== '1') panel.hidden = false;
  settings.forEach(button => button.setAttribute('aria-expanded', String(!panel.hidden))); 
})();
