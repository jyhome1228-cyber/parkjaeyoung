(() => {
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  const header = document.querySelector('[data-header]');
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const nav = document.querySelector('.site-nav');
  if (nav) {
    const items = [
      ['goal.html', '목표'],
      ['capabilities.html', '잘하는 일'],
      ['career.html', '걸어온 길'],
      ['business.html', '사업체'],
      ['research.html', '연구'],
      ['resume.html', '이력'],
      ['projects.html', '프로젝트'],
      ['notes.html', '기록']
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
    'goal.html': '01 / GOAL',
    'capabilities.html': '02 / CAPABILITIES',
    'career.html': '03 / CAREER',
    'business.html': '04 / BUSINESS',
    'research.html': '05 / RESEARCH',
    'resume.html': '06 / RESUME',
    'projects.html': '07 / PROJECTS',
    'notes.html': '08 / NOTES'
  };
  const heroLabel = document.querySelector('.page-hero__label');
  if (heroLabel && pageLabels[path]) heroLabel.textContent = pageLabels[path];

  const decodeGzipBase64 = async (path) => {
    const base64 = (await (await fetch(path)).text()).trim();
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
