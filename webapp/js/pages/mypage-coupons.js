// 마이컬리 > 쿠폰 — 상태별 탭 (쿠폰 코드 등록은 삭제: U-47, 쿠폰은 관리자만 발급)
requireLogin();
let status = 'AVAILABLE';

async function load() {
  const res = await api.getCoupons(status);
  if (res.code !== 'ok') return;
  document.getElementById('coupon-list').innerHTML = res.coupons.length ? res.coupons.map((c) => `
    <li class="coupon ${c.status !== 'AVAILABLE' ? 'disabled' : ''}">
      <b class="coupon-value">${c.discount_type === 'AMOUNT' ? won(c.discount_value) : c.discount_value + '%'}</b>
      <div>
        <p class="coupon-name">${c.coupon_name}</p>
        <p class="hint">${c.min_order_amount ? won(c.min_order_amount) + ' 이상 구매 시' : '조건 없음'} · ${c.valid_from} ~ ${c.valid_to}</p>
      </div>
      <span class="coupon-status">${LABEL.couponStatus[c.status] || c.status}</span>
    </li>`).join('') : '<li class="empty">쿠폰이 없습니다.</li>';
}

renderTabs(document.getElementById('coupon-tabs'), LABEL.couponStatus, status, (v) => { status = v; load(); });
load();
