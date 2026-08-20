(() => {
  const INJU_SYMBOL_URL = 'https://cdn.imweb.me/upload/S2025061194bb8d274d3cd/496a9732268cb.png';

  /* Korean-first typography layer */
  if (!document.querySelector('link[href*="korean-first.css"]')) {
    const koreanFirstStyle = document.createElement('link');
    koreanFirstStyle.rel = 'stylesheet';
    koreanFirstStyle.href = 'assets/css/korean-first.css?v=20260820-1';
    document.head.appendChild(koreanFirstStyle);
  }

  /* Shared inju symbol: favicon + header brand mark */
  const applyBrandSymbol = () => {
    document.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]').forEach((link) => link.remove());

    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/png';
    favicon.href = INJU_SYMBOL_URL;
    document.head.appendChild(favicon);

    const appleTouchIcon = document.createElement('link');
    appleTouchIcon.rel = 'apple-touch-icon';
    appleTouchIcon.href = INJU_SYMBOL_URL;
    document.head.appendChild(appleTouchIcon);

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
  if (nav) {
    const items = [
      ['career.html', '걸어온 길'],
      ['resume.html', '이력'],
      ['business.html', '사업체'],
      ['capabilities.html', '잘하는 일'],
      ['research.html', '연구'],
      ['projects.html', '포트폴리오'],
      ['collaborate.html', '함께하는 방법']
    ];
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
  const heroLabel = document.querySelector('.page-hero__label');
  if (heroLabel && pageLabels[path]) heroLabel.textContent = pageLabels[path];

  const hasHangul = (value = '') => /[가-힣]/.test(value);

  const splitBilingual = (value = '') => {
    const text = value.replace(/\s+/g, ' ').trim();
    if (!text.includes(' / ')) return null;

    const parts = text.split(' / ').map((part) => part.trim()).filter(Boolean);
    if (parts.length < 2) return null;

    const firstKoIndex = parts.findIndex(hasHangul);
    if (firstKoIndex > 0) {
      return {
        ko: parts.slice(firstKoIndex).join(' / '),
        en: parts.slice(0, firstKoIndex).join(' / ')
      };
    }

    if (firstKoIndex === 0) {
      const firstEnIndex = parts.findIndex((part, index) => index > 0 && !hasHangul(part));
      if (firstEnIndex > 0) {
        return {
          ko: parts.slice(0, firstEnIndex).join(' / '),
          en: parts.slice(firstEnIndex).join(' / ')
        };
      }
    }

    return null;
  };

  const renderBilingual = (element) => {
    if (!element || element.dataset.koreanFirst === 'true') return;
    const split = splitBilingual(element.textContent || '');
    if (!split) return;
    element.innerHTML = `<span class="ko-primary">${split.ko}</span><span class="en-secondary">${split.en}</span>`;
    element.dataset.koreanFirst = 'true';
  };

  /* Korean school name for undergraduate education */
  document.querySelectorAll('.record').forEach((record) => {
    const yearText = record.querySelector('.record__year')?.textContent.trim() || '';
    const title = record.querySelector('.record__title');
    const titleText = title?.textContent.trim() || '';
    if (yearText === 'B.A.' || titleText.includes('학부전공') || titleText.includes('Undergraduate Majors')) {
      if (title) {
        title.innerHTML = '<span class="ko-primary">한국교통대학교</span><span class="en-secondary">Korea National University of Transportation</span>';
        title.dataset.koreanFirst = 'true';
      }
    }
  });

  /* Resume section hierarchy: Korean title first, English as a small gray subtitle. */
  const resumeSectionTitles = {
    'PROFESSIONAL EXPERIENCE': '주요 경력',
    'CAPABILITIES': '보유 역량',
    'EDUCATION & RESEARCH': '학력·연구',
    'SELECTED DESIGN PROJECTS': '대표 디자인 프로젝트',
    'JURY & REVIEW': '심사·평가',
    'TEACHING & SEMINAR': '강의·강연',
    'ACADEMIC & EXHIBITION': '학술·전시',
    'AWARDS & RECOGNITION': '수상·선정',
    'PUBLIC & STARTUP PROGRAMS': '지원사업·컨설팅',
    'WRITING & ESSAY': '글쓰기·에세이',
    'PERSPECTIVE': '관점'
  };

  document.querySelectorAll('.resume-section__head').forEach((head) => {
    const eyebrow = head.querySelector('.eyebrow');
    const heading = head.querySelector('h2');
    if (!eyebrow || !heading || head.dataset.koreanFirst === 'true') return;

    const eyebrowText = eyebrow.textContent.replace(/\s+/g, ' ').trim();
    const englishLabel = eyebrowText.split(' / ')[0].trim();
    const koreanLabel = eyebrowText.includes(' / ') ? eyebrowText.split(' / ').slice(1).join(' / ').trim() : '';
    const englishHeading = heading.textContent.trim();
    const koreanHeading = resumeSectionTitles[englishLabel.toUpperCase()] || koreanLabel || englishHeading;

    eyebrow.innerHTML = `<span class="ko-label">${koreanLabel || koreanHeading}</span><span class="en-label">${englishLabel}</span>`;
    heading.innerHTML = `<span class="ko-primary">${koreanHeading}</span><span class="en-secondary">${englishHeading}</span>`;
    head.dataset.koreanFirst = 'true';
  });

  /* Record titles and role names throughout career/resume pages. */
  document.querySelectorAll('.record__title').forEach(renderBilingual);
  document.querySelectorAll('.record__copy b').forEach(renderBilingual);

  /* Capabilities: Korean role name becomes H3, English becomes secondary H4. */
  document.querySelectorAll('.cap-card').forEach((card) => {
    const main = card.querySelector('h3');
    const sub = card.querySelector('h4');
    if (!main || !sub || card.dataset.koreanFirst === 'true') return;
    if (!hasHangul(main.textContent) && hasHangul(sub.textContent)) {
      const english = main.textContent.trim();
      const korean = sub.textContent.trim();
      main.textContent = korean;
      sub.textContent = english;
      card.dataset.koreanFirst = 'true';
    }
  });

  /* Research/archive titles: Korean title first, English subtitle below. */
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

  /* Ordinary section headings: Korean heading remains primary; English label moves below it. */
  document.querySelectorAll('.section-heading').forEach((section) => {
    const eyebrow = section.querySelector('.eyebrow');
    const heading = section.querySelector('h2');
    if (!eyebrow || !heading || section.dataset.koreanFirst === 'true') return;

    const eyebrowText = eyebrow.textContent.replace(/\s+/g, ' ').trim();
    if (hasHangul(heading.textContent) && eyebrowText && !hasHangul(eyebrowText)) {
      const english = document.createElement('span');
      english.className = 'section-title-en';
      english.textContent = eyebrowText;
      heading.appendChild(english);
      eyebrow.classList.add('is-korean-first-hidden');
      section.dataset.koreanFirst = 'true';
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
