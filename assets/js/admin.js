(() => {
  const DRAFT_KEY = 'parkjaeyoung-admin-draft-v1';
  const state = {
    current: [],
    business: [],
    researchCount: 0,
    selected: { current: null, business: null },
    dirty: false
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const toast = (message) => {
    const el = $('[data-toast]');
    if (!el) return;
    el.textContent = message;
    el.classList.add('is-show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('is-show'), 2200);
  };

  const clean = (value = '') => value.replace(/\s+/g, ' ').trim();

  const loadPublicData = async () => {
    const [currentHtml, businessHtml, researchHtml] = await Promise.all([
      fetch('current.html', { cache: 'no-store' }).then(r => r.text()),
      fetch('business.html', { cache: 'no-store' }).then(r => r.text()),
      fetch('research.html', { cache: 'no-store' }).then(r => r.text())
    ]);

    const parser = new DOMParser();

    const currentDoc = parser.parseFromString(currentHtml, 'text/html');
    state.current = $$('.current-work-card', currentDoc).map((card, index) => {
      const meta = $$('.current-work-card__meta span', card);
      const foot = $$('.current-work-card__foot span', card);
      return {
        id: 'current-' + (index + 1),
        no: String(index + 1).padStart(2, '0'),
        category: clean(meta[0]?.textContent || '').replace(/^\d+\s*\/\s*/, ''),
        status: clean(meta[1]?.textContent || ''),
        title: clean($('h2', card)?.textContent || ''),
        subtitle: clean($('h3', card)?.textContent || ''),
        description: clean($('p', card)?.textContent || ''),
        tags: clean(foot[0]?.textContent || ''),
        year: clean(foot[1]?.textContent || '')
      };
    });

    const businessDoc = parser.parseFromString(businessHtml, 'text/html');
    state.business = $$('.business-card', businessDoc).map((card, index) => {
      const meta = $$('.business-card__meta span', card);
      const footer = $$('.business-card__footer > *', card);
      const link = $('.business-card__footer a', card);
      return {
        id: 'business-' + (index + 1),
        no: String(index + 1).padStart(2, '0'),
        category: clean(meta[0]?.textContent || '').replace(/^\d+\s*\/\s*/, ''),
        statusTop: clean(meta[1]?.textContent || ''),
        title: clean($('h2', card)?.textContent || ''),
        subtitle: clean($('h3', card)?.textContent || ''),
        description: clean($('p', card)?.textContent || ''),
        state: clean(footer[0]?.textContent || ''),
        footer: link ? clean(link.textContent || '') : clean(footer[1]?.textContent || ''),
        url: link?.getAttribute('href') || ''
      };
    });

    const researchDoc = parser.parseFromString(researchHtml, 'text/html');
    state.researchCount = $$('.archive-item', researchDoc).length;

    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        if (Array.isArray(draft.current)) state.current = draft.current;
        if (Array.isArray(draft.business)) state.business = draft.business;
        toast('저장된 로컬 초안을 불러왔습니다.');
      } catch (e) {
        console.warn(e);
      }
    }

    renderAll();
  };

  const renderAll = () => {
    $('[data-count-current]').textContent = state.current.length;
    $('[data-count-business]').textContent = state.business.length;
    $('[data-count-research]').textContent = state.researchCount;
    renderList('current');
    renderList('business');
  };

  const renderList = (type) => {
    const root = $('[data-list-' + type + ']');
    if (!root) return;
    const items = state[type];

    if (!items.length) {
      root.innerHTML = '<div class="admin-empty-state"><span>EMPTY</span><p>등록된 항목이 없습니다.</p></div>';
      return;
    }

    root.innerHTML = items.map((item, index) => `
      <button class="admin-list-item ${state.selected[type] === item.id ? 'is-active' : ''}" type="button" data-item="${type}" data-id="${item.id}">
        <span class="admin-list-item__no">${String(index + 1).padStart(2, '0')}</span>
        <span><strong>${escapeHtml(item.title || '새 항목')}</strong><small>${escapeHtml(item.subtitle || item.category || '')}</small></span>
        <span class="admin-list-item__state">${escapeHtml(item.status || item.state || item.statusTop || '')}</span>
      </button>
    `).join('');

    $$('[data-item="' + type + '"]', root).forEach(button => {
      button.addEventListener('click', () => {
        state.selected[type] = button.dataset.id;
        renderList(type);
        renderEditor(type);
      });
    });
  };

  const escapeHtml = (value = '') => value.replace(/[&<>"']/g, char => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[char]));

  const field = (label, key, value, wide = false, textarea = false) => `
    <div class="admin-field ${wide ? 'admin-field--wide' : ''}">
      <label>${label}</label>
      ${textarea
        ? `<textarea name="${key}">${escapeHtml(value || '')}</textarea>`
        : `<input name="${key}" value="${escapeHtml(value || '')}">`}
    </div>
  `;

  const renderEditor = (type) => {
    const root = $('[data-editor-' + type + ']');
    const item = state[type].find(entry => entry.id === state.selected[type]);
    if (!root || !item) return;

    const currentFields = type === 'current'
      ? [
          field('카테고리', 'category', item.category),
          field('상태', 'status', item.status),
          field('제목', 'title', item.title, true),
          field('보조 제목', 'subtitle', item.subtitle, true),
          field('설명', 'description', item.description, true, true),
          field('업무 범위', 'tags', item.tags),
          field('연도', 'year', item.year)
        ].join('')
      : [
          field('카테고리', 'category', item.category),
          field('상단 상태', 'statusTop', item.statusTop),
          field('사업체명', 'title', item.title, true),
          field('영문/설명 제목', 'subtitle', item.subtitle, true),
          field('설명', 'description', item.description, true, true),
          field('운영 상태', 'state', item.state),
          field('하단 문구', 'footer', item.footer),
          field('외부 URL', 'url', item.url, true)
        ].join('');

    root.innerHTML = `
      <div class="admin-editor-head">
        <div><span>${type === 'current' ? 'CURRENT WORK' : 'BUSINESS'} / EDIT</span><h2>${escapeHtml(item.title || '새 항목')}</h2></div>
        <div class="admin-editor-actions">
          <button class="admin-button admin-button--ghost" type="button" data-move-up>위로</button>
          <button class="admin-button admin-button--ghost" type="button" data-move-down>아래로</button>
        </div>
      </div>
      <form class="admin-form" data-editor-form>
        ${currentFields}
        <div class="admin-form__foot">
          <span class="admin-form__hint">수정 내용은 먼저 브라우저에 임시저장됩니다.</span>
          <div class="admin-form__buttons">
            <button class="admin-button admin-button--danger" type="button" data-delete>삭제</button>
            <button class="admin-button" type="submit">임시저장</button>
          </div>
        </div>
      </form>
    `;

    const form = $('[data-editor-form]', root);
    form.addEventListener('submit', event => {
      event.preventDefault();
      const data = new FormData(form);
      [...data.entries()].forEach(([key, value]) => item[key] = clean(String(value)));
      state.dirty = true;
      saveDraft();
      renderList(type);
      renderEditor(type);
      toast('임시저장했습니다.');
    });

    $('[data-delete]', root).addEventListener('click', () => {
      const index = state[type].findIndex(entry => entry.id === item.id);
      if (index < 0) return;
      if (!confirm('이 항목을 로컬 초안에서 삭제할까요?')) return;
      state[type].splice(index, 1);
      state.selected[type] = state[type][Math.max(0, index - 1)]?.id || null;
      saveDraft();
      renderAll();
      if (state.selected[type]) renderEditor(type);
      else root.innerHTML = '<div class="admin-empty-state"><span>SELECT ITEM</span><p>왼쪽에서 수정할 항목을 선택하세요.</p></div>';
      toast('항목을 삭제했습니다.');
    });

    $('[data-move-up]', root).addEventListener('click', () => moveItem(type, item.id, -1));
    $('[data-move-down]', root).addEventListener('click', () => moveItem(type, item.id, 1));
  };

  const moveItem = (type, id, direction) => {
    const list = state[type];
    const index = list.findIndex(item => item.id === id);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= list.length) return;
    [list[index], list[next]] = [list[next], list[index]];
    saveDraft();
    renderList(type);
    renderEditor(type);
    toast('정렬 순서를 변경했습니다.');
  };

  const saveDraft = () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      current: state.current,
      business: state.business,
      savedAt: new Date().toISOString()
    }));
  };

  const addItem = (type) => {
    const id = type + '-' + Date.now();
    const item = type === 'current'
      ? { id, category:'NEW', status:'DRAFT', title:'새 프로젝트', subtitle:'', description:'', tags:'', year:String(new Date().getFullYear()) }
      : { id, category:'NEW', statusTop:'DRAFT', title:'새 사업체', subtitle:'', description:'', state:'준비 중', footer:'', url:'' };
    state[type].push(item);
    state.selected[type] = id;
    saveDraft();
    renderAll();
    renderEditor(type);
    toast('새 항목을 추가했습니다.');
  };

  const switchView = (view) => {
    $$('.admin-nav__item').forEach(button => button.classList.toggle('is-active', button.dataset.view === view));
    $$('.admin-view').forEach(panel => panel.classList.toggle('is-active', panel.dataset.panel === view));
    const active = $('.admin-nav__item[data-view="' + view + '"] span');
    $('[data-page-title]').textContent = active?.textContent || '관리';
    history.replaceState(null, '', '#'+view);
  };

  $$('.admin-nav__item').forEach(button => button.addEventListener('click', () => switchView(button.dataset.view)));
  $$('[data-jump]').forEach(button => button.addEventListener('click', () => switchView(button.dataset.jump)));
  $$('[data-add]').forEach(button => button.addEventListener('click', () => addItem(button.dataset.add)));

  $('[data-export]').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({
      current: state.current,
      business: state.business,
      exportedAt: new Date().toISOString()
    }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parkjaeyoung-admin-draft.json';
    a.click();
    URL.revokeObjectURL(url);
    toast('JSON 파일을 내보냈습니다.');
  });

  const hashView = location.hash.replace('#', '');
  if (['dashboard','inquiries','current','business','portfolio','research','profile'].includes(hashView)) switchView(hashView);

  loadPublicData().catch(error => {
    console.error(error);
    toast('사이트 데이터를 불러오지 못했습니다.');
  });
})();