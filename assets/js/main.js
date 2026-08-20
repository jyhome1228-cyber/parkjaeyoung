(() => {
  const INJU_SYMBOL_URL = 'https://cdn.imweb.me/upload/S2025061194bb8d274d3cd/496a9732268cb.png';

  if (!document.querySelector('link[href*="korean-first.css"]')) {
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = 'assets/css/korean-first.css?v=20260820-2';
    document.head.appendChild(style);
  }

  const applyBrandSymbol = () => {
    document.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]').forEach((link) => link.remove());
    const favicon = document.createElement('link');
    favicon.rel = 'icon'; favicon.type = 'image/png'; favicon.href = INJU_SYMBOL_URL;
    document.head.appendChild(favicon);
    const apple = document.createElement('link');
    apple.rel = 'apple-touch-icon'; apple.href = INJU_SYMBOL_URL;
    document.head.appendChild(apple);
    document.querySelectorAll('.site-logo').forEach((logo) => {
      if (logo.querySelector('.site-logo__mark')) return;
      const mark = document.createElement('img');
      mark.className = 'site-logo__mark';
      mark.src = INJU_SYMBOL_URL;
      mark.alt = '';
      mark.setAttribute('aria-hidden', 'true');
      mark.decoding = 'async';
      mark.loading = 'eager';
      logo.prepend(mark);
    });
  };
  applyBrandSymbol();

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  const header = document.querySelector('[data-header]');
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const nav = document.querySelector('.site-nav');
  const items = [
    ['career.html', '걸어온 길'],
    ['resume.html', '이력'],
    ['business.html', '사업체'],
    ['capabilities.html', '잘하는 일'],
    ['research.html', '연구'],
    ['projects.html', '포트폴리오'],
    ['collaborate.html', '함께하는 방법']
  ];
  if (nav) {
    nav.innerHTML = items.map(([href, label]) => `<a data-nav href="${href}">${label}</a>`).join('');
    nav.setAttribute('aria-label', '박재영 개인사이트 메뉴');
  }

  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav]').forEach((link) => {
    if (link.getAttribute('href') === path) {
      link.classList.add('is-current');
      link.setAttribute('aria-current', 'page');
    }
  });

  const pageLabels = {
    'career.html': '01 / 걸어온 길',
    'resume.html': '02 / 이력',
    'business.html': '03 / 사업체',
    'capabilities.html': '04 / 잘하는 일',
    'research.html': '05 / 연구',
    'projects.html': '06 / 포트폴리오',
    'collaborate.html': '07 / 함께하는 방법'
  };
  const heroTitles = {
    'career.html': '걸어온 길',
    'resume.html': '이력',
    'business.html': '운영 중인 사업과 프로젝트',
    'capabilities.html': '잘하는 일',
    'research.html': '연구',
    'projects.html': '포트폴리오',
    'collaborate.html': '함께하는 방법'
  };
  const heroLabel = document.querySelector('.page-hero__label');
  if (heroLabel && pageLabels[path]) heroLabel.textContent = pageLabels[path];
  const heroTitle = document.querySelector('.page-hero h1');
  if (heroTitle && heroTitles[path]) heroTitle.textContent = heroTitles[path];

  if (path === 'index.html') {
    document.querySelector('.home-hero__top > .eyebrow')?.remove();
    document.querySelector('.footer__center')?.remove();
  }

  const hasHangul = (value = '') => /[가-힣]/.test(value);
  const splitBilingual = (value = '') => {
    const text = value.replace(/\s+/g, ' ').trim();
    if (!text.includes(' / ')) return null;
    const parts = text.split(' / ').map((part) => part.trim()).filter(Boolean);
    if (parts.length < 2) return null;
    const firstKoIndex = parts.findIndex(hasHangul);
    if (firstKoIndex > 0) return { ko: parts.slice(firstKoIndex).join(' / '), en: parts.slice(0, firstKoIndex).join(' / ') };
    if (firstKoIndex === 0) {
      const firstEnIndex = parts.findIndex((part, index) => index > 0 && !hasHangul(part));
      if (firstEnIndex > 0) return { ko: parts.slice(0, firstEnIndex).join(' / '), en: parts.slice(firstEnIndex).join(' / ') };
    }
    return null;
  };
  const renderBilingual = (element) => {
    if (!element || element.dataset.koreanFirst === 'true' || element.querySelector('.record__en')) return;
    const split = splitBilingual(element.textContent || '');
    if (!split) return;
    element.innerHTML = `<span class="ko-primary">${split.ko}</span><span class="en-secondary">${split.en}</span>`;
    element.dataset.koreanFirst = 'true';
  };

  document.querySelectorAll('.record').forEach((record) => {
    const yearText = record.querySelector('.record__year')?.textContent.trim() || '';
    const title = record.querySelector('.record__title');
    const titleText = title?.textContent.trim() || '';
    if ((yearText === 'B.A.' || titleText.includes('학부전공') || titleText.includes('Undergraduate Majors')) && !titleText.includes('한국교통대학교')) {
      if (title) {
        title.innerHTML = '<span class="ko-primary">한국교통대학교</span><span class="en-secondary">Korea National University of Transportation</span>';
        title.dataset.koreanFirst = 'true';
      }
    }
  });

  document.querySelectorAll('.record__title').forEach(renderBilingual);
  document.querySelectorAll('.record__copy b').forEach(renderBilingual);

  document.querySelectorAll('.archive-item').forEach((item) => {
    const main = item.querySelector('h2, h3');
    const sub = item.querySelector('h4');
    if (!main || !sub || item.dataset.koreanFirst === 'true') return;
    if (!hasHangul(main.textContent) && hasHangul(sub.textContent)) {
      const english = main.textContent.trim();
      const korean = sub.textContent.trim();
      main.textContent = korean;
      sub.textContent = english;
      item.dataset.koreanFirst = 'true';
    }
  });

  const decodeGzipBase64 = async (assetPath) => {
    const base64 = (await (await fetch(assetPath)).text()).trim();
    const bytes = Uint8Array.from(atob(base64), char => char.charCodeAt(0));
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return new Response(stream).text();
  };
  const loadBrandLogo = async () => {
    if (!('DecompressionStream' in window)) return;
    try {
      const svg = await decodeGzipBase64('assets/logo-data.txt');
      const image = document.querySelector('[data-brand-logo]');
      const fallback = document.querySelector('[data-logo-fallback]');
      if (!image) return;
      image.src = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
      image.hidden = false;
      if (fallback) fallback.hidden = true;
    } catch (error) {
      console.warn('Brand logo fallback is being used.', error);
    }
  };
  loadBrandLogo();
})();