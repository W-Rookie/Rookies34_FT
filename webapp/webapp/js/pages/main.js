// 메인(홈) — 섹션마다 data-type(list_type)으로 상품 4개씩
(async () => {
  for (const section of document.querySelectorAll('.product-section')) {
    const grid = section.querySelector('.product-list');
    const res = await api.getProducts({ list_type: section.dataset.type, sort: 'RECOMMEND', page: 1 });
    if (res.code !== 'ok') { grid.innerHTML = '<p class="empty">상품을 불러오지 못했습니다.</p>'; continue; }
    renderProductGrid(grid, res.products.slice(0, 4));
  }
})();
