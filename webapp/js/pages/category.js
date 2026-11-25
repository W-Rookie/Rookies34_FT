// 카테고리 목록 — [협의 필요] 카테고리 조회 API가 없어 common.js의 CATEGORIES 사용
document.getElementById('category-list').innerHTML = CATEGORIES
  .map((c) => `<a class="category-item" href="list.jsp?type=CATEGORY&category_id=${c.id}">${c.name}</a>`)
  .join('');
