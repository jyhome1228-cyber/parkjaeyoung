(() => {
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  const header = document.querySelector('[data-header]');
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* Personal archive order: 목표 → 잘하는 일 → 걸어온 길 → 연구 → 프로젝트 → 기록 */
  const profile = document.querySelector('#profile');
  const research = document.querySelector('#research');
  if (profile && research && profile.parentNode === research.parentNode) {
    research.parentNode.insertBefore(profile, research);
  }

  const nav = document.querySelector('.site-primary-nav');
  if (nav) {
    const items = [
      ['#index', '목표'],
      ['#capabilities', '잘하는 일'],
      ['#profile', '걸어온 길'],
      ['#research', '연구'],
      ['#projects', '프로젝트'],
      ['#notes', '기록']
    ];
    nav.innerHTML = items.map(([href, label]) => `<a href="${href}">${label}</a>`).join('');
    nav.setAttribute('aria-label', '박재영 개인 아카이브 메뉴');
  }

  const labels = {
    index: '01 / 목표',
    capabilities: '02 / 잘하는 일',
    profile: '03 / 걸어온 길',
    research: '04 / 연구',
    projects: '05 / 프로젝트',
    notes: '06 / 기록'
  };
  Object.entries(labels).forEach(([id, text]) => {
    const eyebrow = document.querySelector(`#${id} .eyebrow`);
    if (eyebrow) eyebrow.textContent = text;
  });

  const capabilityKo = document.querySelector('#capabilities .section-title__ko');
  if (capabilityKo) capabilityKo.textContent = '제가 잘하는 일';

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
