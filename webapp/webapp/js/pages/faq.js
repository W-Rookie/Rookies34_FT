// 자주하는 질문 — 분류 탭 + 질문 클릭하면 답변 펼치기
let category = '';
let page = 1;

async function load() {
  const res = await api.getFaqs(category, page);
  if (res.code !== 'ok') return;
  document.getElementById('faq-list').innerHTML = res.faqs.length ? res.faqs.map((f) => `
    <li class="faq-item">
      <button type="button" class="faq-q"><span class="badge">${LABEL.faqCategory[f.faq_category] || f.faq_category}</span>${f.title}</button>
      <div class="faq-a pre-wrap" hidden>${f.content}</div>
    </li>`).join('') : '<li class="empty">등록된 질문이 없습니다.</li>';
  renderPagination(document.getElementById('pagination'), page, res.num, (p) => { page = p; load(); });
}

// 질문 누르면 답변 열고 닫기
document.getElementById('faq-list').onclick = (e) => {
  const q = e.target.closest('.faq-q');
  if (q) q.nextElementSibling.hidden = !q.nextElementSibling.hidden;
};

renderTabs(document.getElementById('faq-tabs'), { '': '전체', ...LABEL.faqCategory }, category, (v) => {
  category = v; page = 1; load();
});
load();
