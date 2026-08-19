(() => {
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  const header = document.querySelector('[data-header]');
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav]').forEach((link) => {
    if (link.getAttribute('href') === path) {
      link.classList.add('is-current');
      link.setAttribute('aria-current', 'page');
    }
  });

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
