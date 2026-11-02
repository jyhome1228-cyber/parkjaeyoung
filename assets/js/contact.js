(() => {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const value = (key) => String(data.get(key) || '').trim();

    const subject = '[parkjaeyoung.me 문의] ' + value('type') + ' · ' + value('name');
    const body = [
      '안녕하세요. parkjaeyoung.me 문의드립니다.',
      '',
      '■ 문의 유형',
      value('type'),
      '',
      '■ 이름 / 담당자',
      value('name'),
      '',
      '■ 회사 / 브랜드',
      value('company') || '-',
      '',
      '■ 이메일',
      value('email'),
      '',
      '■ 연락처',
      value('phone') || '-',
      '',
      '■ 예상 예산',
      value('budget') || '미정 / 상담 후 결정',
      '',
      '■ 희망 일정',
      value('timeline') || '-',
      '',
      '■ 문의 내용',
      value('message'),
      '',
      '■ 참고 링크',
      value('link') || '-'
    ].join('\n');

    window.location.href = 'mailto:info@9works.kr?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });
})();