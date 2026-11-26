// 상품 목록 — list.jsp?type=BEST|NEW|SALE|BENEFIT  /  ?type=CATEGORY&category_id=907
const listType = (qs('type') || 'BEST').toUpperCase();
const categoryId = qs('category_id');
let page = 1;

const titleEl = document.getElementById('list-title');
if (listType === 'CATEGORY') {
  const c = CATEGORIES.find((x) => x.id === Number(categoryId));
  titleEl.textContent = c ? c.name : '카테고리';
} else {
  titleEl.textContent = LABEL.listType[listType] || '상품 목록';
}

async function load() {
  const res = await api.getProducts({
    list_type: listType, category_id: categoryId,
    sort: document.getElementById('sort').value, page,
  });
  if (res.code !== 'ok') return;
  document.getElementById('total').textContent = `총 ${res.num}건`;
  renderProductGrid(document.getElementById('product-list'), res.products);
  renderPagination(document.getElementById('pagination'), page, res.num, (p) => { page = p; load(); });
}

document.getElementById('sort').onchange = () => { page = 1; load(); };
load();
