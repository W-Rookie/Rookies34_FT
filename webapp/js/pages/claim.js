// 취소·반품·교환 접수
//   claim.jsp                → 주문 선택
//   claim.jsp?order_id=ORD.. → 신청서 (상품 선택, 사유, 사진, 환불 계좌)
requireLogin();
const orderId = qs('order_id');
const box = document.getElementById('claim-box');

async function showOrderPicker() {
  const res = await api.getOrders({ period: '3M', page: 1 });
  box.innerHTML = `
    <p class="hint">신청할 주문을 선택해 주세요.</p>
    <ul>${(res.orders || []).map((o) => `
      <li class="order-card">
        <p class="order-date">${o.ordered_at.slice(0, 10)} · 주문번호 ${o.order_id}</p>
        <p class="order-name">${o.product_name}${o.item_count > 1 ? ` 외 ${o.item_count - 1}건` : ''}</p>
        <p>${won(o.total_amount)} · <b>${LABEL.orderStatus[o.status] || o.status}</b></p>
        <a class="btn btn-small" href="claim.jsp?order_id=${o.order_id}">선택</a>
      </li>`).join('') || '<li class="empty">최근 3개월 주문이 없습니다.</li>'}
    </ul>`;
}

async function showForm() {
  const order = await api.getOrder(orderId);
  if (order.code !== 'ok') { box.innerHTML = '<p class="empty">주문 정보를 찾을 수 없습니다.</p>'; return; }
  const isCash = order.payment_method !== 'CARD'; // 카드 결제가 아니면 환불 계좌 필요

  box.innerHTML = `
    <form id="claim-form" class="form">
      <p class="hint">주문번호 ${order.order_id} · ${LABEL.payment[order.payment_method] || order.payment_method}</p>
      <h3 class="sub-title">대상 상품</h3>
      ${order.items.map((i) => `
        <label class="check"><input type="checkbox" name="order_item_ids" value="${i.order_item_id}">
          ${i.name} (${i.quantity}개, ${won(i.price * i.quantity)})</label>`).join('')}

      <h3 class="sub-title">신청 내용</h3>
      <div class="radio-group">${Object.entries(LABEL.requestType).map(([v, l], idx) =>
        `<label><input type="radio" name="request_type" value="${v}" ${idx === 0 ? 'checked' : ''}> ${l}</label>`).join('')}</div>
      <label>사유<select name="reason_type">${optionsHtml(LABEL.reasonType)}</select></label>
      <label>상세 사유<textarea name="reason_detail" rows="4" maxlength="500"></textarea></label>
      <label>사진 (jpg, png / 최대 3장)<input type="file" name="photo_files" accept=".jpg,.jpeg,.png" multiple></label>

      <div id="refund-box" ${isCash ? '' : 'hidden'}>
        <h3 class="sub-title">환불 계좌</h3>
        <label>은행<select name="refund_bank">
          <option value="KB">국민</option><option value="SHINHAN">신한</option><option value="WOORI">우리</option>
          <option value="HANA">하나</option><option value="NH">농협</option></select></label>
        <label>계좌번호<input name="refund_account_no" inputmode="numeric" placeholder="숫자만 (테스트 계좌만 사용)"></label>
        <label>예금주<input name="refund_account_holder"></label>
      </div>
      <div class="btn-row"><a class="btn" href="order-detail.jsp?order_id=${order.order_id}">취소</a>
        <button class="btn btn-primary" type="submit">신청하기</button></div>
    </form>`;
  // [협의 필요] 은행 코드값이 규격서에 정의되어 있지 않음 (refund_bank enum)

  document.getElementById('claim-form').onsubmit = async (e) => {
    e.preventDefault();
    const f = e.target;
    if (!f.querySelectorAll('input[name="order_item_ids"]:checked').length) return alert('대상 상품을 선택해 주세요.');
    if (f.photo_files.files.length > 3) return alert('사진은 최대 3장까지 올릴 수 있습니다.');

    const fd = new FormData(f);
    if (!isCash) ['refund_bank', 'refund_account_no', 'refund_account_holder'].forEach((k) => fd.delete(k));
    if (!f.photo_files.files.length) fd.delete('photo_files');
    if (!assertOk(await api.createClaim(order.order_id, fd), '신청하지 못했습니다.')) return;
    alert('신청이 접수되었습니다.');
    location.href = 'mypage-claims.jsp';
  };
}

orderId ? showForm() : showOrderPicker();
