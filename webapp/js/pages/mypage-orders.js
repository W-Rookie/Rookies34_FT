// 마이컬리 > 주문 내역 — 마이페이지 "목록형" 화면의 기본 패턴
// 다른 목록형 메뉴(쿠폰, 적립금, 상품 문의, 취소·반품 내역 등)도 이 구조 복사해서 API만 바꾸면 됨
requireLogin();
let page = 1;

async function load() {
  const f = document.getElementById('filter-form');
  const res = await api.getOrders({ period: f.period.value, keyword: f.keyword.value.trim(), page });
  if (res.code !== 'ok') return;

  document.getElementById('order-list').innerHTML = res.orders.length ? res.orders.map((o) => `
    <li class="order-card">
      <p class="order-date">${o.ordered_at.slice(0, 10)} · 주문번호 ${o.order_id}</p>
      <p class="order-name">${o.product_name}${o.item_count > 1 ? ` 외 ${o.item_count - 1}건` : ''}</p>
      <p>${won(o.total_amount)} · <b>${LABEL.orderStatus[normStatus(o.status)] || o.status}</b></p>
      <a class="btn btn-small" href="order-detail.jsp?order_id=${encodeURIComponent(o.order_id)}">주문 상세</a>
    </li>`).join('') : '<li class="empty">주문 내역이 없습니다.</li>';

  renderPagination(document.getElementById('pagination'), page, res.num, (p) => { page = p; load(); });
}

document.getElementById('filter-form').onsubmit = (e) => { e.preventDefault(); page = 1; load(); };
load();
