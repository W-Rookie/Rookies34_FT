// 마이컬리 > 자주 구매 — 상품 카드 그대로 재사용
requireLogin();
let page = 1;

async function load() {
  const res = await api.getFrequentProducts(page);
  if (res.code !== 'ok') return;
  renderProductGrid(document.getElementById('product-list'), res.products);
  renderPagination(document.getElementById('pagination'), page, res.num, (p) => { page = p; load(); });
}
load();
