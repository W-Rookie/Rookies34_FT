// 주문서 — 장바구니에서 선택한 cart_item_ids를 sessionStorage로 받음
requireLogin();

const ids = JSON.parse(sessionStorage.getItem('checkout_ids') || '[]');
let data = null;

function couponDiscount(coupon, amount) {
  if (!coupon || amount < (coupon.min_order_amount || 0)) return 0;
  return coupon.discount_type === 'AMOUNT'
    ? coupon.discount_value
    : Math.floor(amount * coupon.discount_value / 100);
}

// 화면 표시용 예상 금액 — 규격서: 최종 금액은 POST /api/orders에서 서버가 다시 계산
function updateAmount() {
  const base = data.expected_amount;
  const coupon = data.coupons.find((c) => c.coupon_id === Number(document.getElementById('coupon').value));
  const cDisc = couponDiscount(coupon, base);
  const pointsInput = document.getElementById('use-points');
  const usePoints = Math.min(Math.max(0, Number(pointsInput.value) || 0), data.points, base - cDisc);
  pointsInput.value = usePoints;

  document.getElementById('amt-base').textContent = won(base);
  document.getElementById('amt-coupon').textContent = '-' + won(cDisc);
  document.getElementById('amt-points').textContent = '-' + won(usePoints);
  document.getElementById('amt-total').textContent = won(base - cDisc - usePoints);
}

function fillRecipient(addressId) {
  const a = data.addresses.find((x) => x.address_id === addressId);
  if (!a) return;
  document.getElementById('recipient_name').value = a.recipient_name;
  document.getElementById('recipient_phone').value = a.recipient_phone;
}

async function load() {
  if (!ids.length) {
    alert('주문할 상품이 없습니다.');
    location.href = 'cart.jsp';
    return;
  }
  const res = await api.checkout(ids);
  if (!assertOk(res, '주문서를 불러오지 못했습니다.')) return;
  data = res;

  document.getElementById('order-items').innerHTML = res.items.map((i) => `
    <li>${i.name} <span>${Number(i.quantity)}개</span>
      <b>${won(salePrice(i.price, i.discount_rate) * i.quantity)}</b></li>`).join('');

  document.getElementById('address-list').innerHTML = res.addresses.length
    ? res.addresses.map((a) => `
      <label class="address-item">
        <input type="radio" name="address_id" value="${Number(a.address_id)}" ${a.is_default ? 'checked' : ''}>
        ${a.is_default ? '<span class="badge">기본배송지</span>' : ''}
        [${a.zipcode}] ${a.address} ${a.address_detail}
      </label>`).join('')
    : '<p class="empty">등록된 배송지가 없습니다. <a href="mypage-addresses.jsp">배송지 추가</a></p>';

  const def = res.addresses.find((a) => a.is_default) || res.addresses[0];
  if (def) fillRecipient(def.address_id);

  document.getElementById('coupon').innerHTML = '<option value="">쿠폰 선택 안 함</option>' + res.coupons.map((c) => {
    const usable = res.expected_amount >= (c.min_order_amount || 0);
    const value = c.discount_type === 'AMOUNT' ? won(c.discount_value) : `${c.discount_value}%`;
    return `<option value="${Number(c.coupon_id)}" ${usable ? '' : 'disabled'}>${c.coupon_name} (${value}, ~${c.valid_to})${usable ? '' : ' - 최소주문금액 미달'}</option>`;
  }).join('');

  document.getElementById('my-points').textContent = won(res.points);
  updateAmount();
}

document.getElementById('address-list').onchange = (e) => fillRecipient(Number(e.target.value));
document.getElementById('coupon').onchange = updateAmount;
document.getElementById('use-points').onchange = updateAmount;
document.getElementById('use-all-points').onclick = () => {
  document.getElementById('use-points').value = data.points;
  updateAmount();
};

document.getElementById('checkout-form').onsubmit = async (e) => {
  e.preventDefault();
  const f = e.target;
  const addressId = f.querySelector('input[name="address_id"]:checked');
  if (!addressId) return alert('배송지를 선택해 주세요.');
  if (!f.agree_payment.checked) return alert('결제 진행에 동의해 주세요.');


  const res = await api.createOrder({
    cart_item_ids: ids,
    address_id: Number(addressId.value),
    recipient_name: f.recipient_name.value.trim(),
    recipient_phone: f.recipient_phone.value.replace(/\D/g, ''),
    delivery_request: f.delivery_request.value.trim(),
    coupon_id: f.coupon.value ? Number(f.coupon.value) : undefined,
    use_points: Number(f.use_points.value) || 0,
    payment_method: f.payment_method.value,
    agree_payment: true,
  });
  if (!assertOk(res, '결제에 실패했습니다.')) return;

  sessionStorage.removeItem('checkout_ids');
  location.href = `order-complete.jsp?order_id=${encodeURIComponent(res.order_id)}`;
};

load();
