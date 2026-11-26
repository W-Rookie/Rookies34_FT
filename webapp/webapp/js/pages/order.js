// 주문 완료(order-complete.jsp) / 주문 상세(order-detail.jsp) 공용
// 규격서: U-37, U-41 모두 GET /api/orders/{orderId}
requireLogin();

(async () => {
  const res = await api.getOrder(qs('order_id'));
  const box = document.getElementById('order-detail');
  if (res.code !== 'ok') { box.innerHTML = '<p class="empty">주문 정보를 찾을 수 없습니다.</p>'; return; }

  box.innerHTML = `
    <table class="info-table">
      <tr><th>주문번호</th><td>${res.order_id}</td></tr>
      <tr><th>주문일시</th><td>${res.ordered_at}</td></tr>
      <tr><th>주문상태</th><td>${LABEL.orderStatus[res.status] || res.status}</td></tr>
      <tr><th>결제수단</th><td>${LABEL.payment[res.payment_method] || res.payment_method}</td></tr>
      <tr><th>결제금액</th><td><b>${won(res.total_amount)}</b></td></tr>
      <tr><th>받는 분</th><td>${res.recipient_name} / ${res.recipient_phone}</td></tr>
      <tr><th>배송지</th><td>[${res.zipcode}] ${res.address} ${res.address_detail}</td></tr>
      <tr><th>요청사항</th><td>${res.delivery_request || '-'}</td></tr>
    </table>
    <h3 class="sub-title">주문 상품</h3>
    <ul class="order-items">
      ${res.items.map((i) => `<li><a href="product.jsp?id=${encodeURIComponent(i.product_id)}">${i.name}</a>
        <span>${Number(i.quantity)}개</span><b>${won(i.price * i.quantity)}</b>
        ${res.status === 'DELIVERED' ? `<a class="btn btn-small" href="mypage-reviews.jsp?order_item_id=${i.order_item_id}&product=${encodeURIComponent(i.name)}">후기 쓰기</a>` : ''}</li>`).join('')}
    </ul>
    ${res.status !== 'CANCELED' ? `<div class="btn-row"><a class="btn" href="claim.jsp?order_id=${encodeURIComponent(res.order_id)}">취소·반품·교환 신청</a></div>` : ''}`;
})();
