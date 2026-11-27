// 주문 완료(order-complete.jsp) / 주문 상세(order-detail.jsp) 공용
// 규격서: U-37, U-41 모두 GET /api/orders/{orderId}
// 상태는 두 단계로 본다 (11/27 백엔드 협의)
//   - 주문 전체: 최상위 status
//   - 상품별:   items[].status → 상품마다 취소 / 반품·교환 / 후기 버튼을 따로 표시
requireLogin();

// 최상위 status가 아직 안 내려오면(백엔드 반영 전) 상품 상태로 대신 판단
function orderStatusOf(res) {
  if (res.status) return normStatus(res.status);
  const set = [...new Set((res.items || []).map((i) => normStatus(i.status)))];
  return set.length === 1 ? set[0] : 'PARTIAL';
}
const statusLabel = (s) => (s === 'PARTIAL' ? '부분 처리' : LABEL.orderStatus[s] || s || '-');

// 상품 한 줄의 버튼들 (가능한 신청 종류는 common.js CLAIMABLE 기준)
function itemActions(orderId, i) {
  const can = CLAIMABLE[i.status] || [];
  const url = `claim.jsp?order_id=${encodeURIComponent(orderId)}&order_item_id=${encodeURIComponent(i.order_item_id)}`;
  return [
    can.includes('CANCEL') ? `<a class="btn btn-small" href="${url}&type=CANCEL">취소 신청</a>` : '',
    can.includes('RETURN') ? `<a class="btn btn-small" href="${url}&type=RETURN">반품·교환 신청</a>` : '',
    i.status === 'DELIVERED' ? `<a class="btn btn-small" href="mypage-reviews.jsp?order_item_id=${i.order_item_id}&product=${encodeURIComponent(i.name)}">후기 쓰기</a>` : '',
  ].join('');
}

(async () => {
  const res = await api.getOrder(qs('order_id'));
  const box = document.getElementById('order-detail');
  if (res.code !== 'ok') { box.innerHTML = '<p class="empty">주문 정보를 찾을 수 없습니다.</p>'; return; }

  const status = orderStatusOf(res);
  // 상품 상태가 비어 있으면 주문 전체 상태를 따라감
  res.items.forEach((i) => { i.status = normStatus(i.status) || status; });
  const anyClaimable = res.items.some((i) => (CLAIMABLE[i.status] || []).length);

  box.innerHTML = `
    <table class="info-table">
      <tr><th>주문번호</th><td>${res.order_id}</td></tr>
      <tr><th>주문일시</th><td>${res.ordered_at}</td></tr>
      <tr><th>주문상태</th><td>${statusLabel(status)}</td></tr>
      <tr><th>결제수단</th><td>${LABEL.payment[res.payment_method] || res.payment_method}</td></tr>
      <tr><th>결제금액</th><td><b>${won(res.total_amount)}</b></td></tr>
      <tr><th>받는 분</th><td>${res.recipient_name} / ${res.recipient_phone}</td></tr>
      <tr><th>배송지</th><td>[${res.zipcode}] ${res.address} ${res.address_detail}</td></tr>
      <tr><th>요청사항</th><td>${res.delivery_request || '-'}</td></tr>
    </table>
    <h3 class="sub-title">주문 상품</h3>
    <ul class="order-items">
      ${res.items.map((i) => `<li><a href="product.jsp?id=${encodeURIComponent(i.product_id)}">${i.name}</a>
        <span class="badge">${statusLabel(i.status)}</span>
        <span>${Number(i.quantity)}개</span><b>${won(i.price * i.quantity)}</b>
        <span class="item-actions">${itemActions(res.order_id, i)}</span></li>`).join('')}
    </ul>
    <p class="hint">결제완료 상품은 취소, 배송완료 상품은 반품·교환을 상품별로 신청할 수 있습니다. 배송중인 상품은 배송완료 후, 신청 처리중인 상품은 처리가 끝난 뒤 다시 신청할 수 있습니다.</p>
    ${anyClaimable ? `<div class="btn-row"><a class="btn" href="claim.jsp?order_id=${encodeURIComponent(res.order_id)}">여러 상품 한 번에 신청</a></div>` : ''}`;
})();
