// 카테고리 목록 — U-27 GET /api/categories
// API가 실패하거나 비어 있으면 common.js의 CATEGORIES(기본값) 사용 → 추후 DB 연결
(async () => {
  let list = CATEGORIES;
  try {
    const res = await api.getCategories();
    if (res.code === 'ok' && res.categories && res.categories.length) {
      list = res.categories.map((c) => ({ id: c.category_id, name: c.name }));
    }
  } catch (e) {
    console.error(e);
  }
  document.getElementById('category-list').innerHTML = list
    .map((c) => `<a class="category-item" href="list.jsp?type=CATEGORY&category_id=${c.id}">${c.name}</a>`)
    .join('');
})();
