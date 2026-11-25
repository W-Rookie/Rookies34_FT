// 검색 결과 — search.jsp?keyword=우유
const keyword = (qs('keyword') || '').trim();
let page = 1;

async function load() {
  if (!keyword) return;
  const res = await api.searchProducts({ keyword, sort: document.getElementById('sort').value, page });
  if (res.code !== 'ok') return;
  document.getElementById('total').textContent = `총 ${res.num}건`;
  renderProductGrid(document.getElementById('product-list'), res.products);
  renderPagination(document.getElementById('pagination'), page, res.num, (p) => { page = p; load(); });
}

document.getElementById('sort').onchange = () => { page = 1; load(); };
load();
