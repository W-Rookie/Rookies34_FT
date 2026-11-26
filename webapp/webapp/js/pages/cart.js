// 장바구니 — 로그인 필수 (U-30~U-33)
requireLogin();
let items = [];

async function load() {
  const res = await api.getCart();
  if (res.code !== 'ok') return;
  items = res.items;
  const list = document.getElementById('cart-list');

  if (!items.length) {
    list.innerHTML = '<p class="empty">장바구니에 담긴 상품이 없습니다.</p>';
    updateSummary();
    return;
  }

  list.innerHTML = items.map((i) => `
    <div class="cart-row" data-id="${Number(i.cart_item_id)}">
      <input type="checkbox" class="item-check" checked>
      <div class="cart-thumb">${imgTag(i.thumbnail, i.name)}</div>
      <a class="cart-name" href="product.jsp?id=${encodeURIComponent(i.product_id)}">${i.name}</a>
      <div class="qty-box small">
        <button type="button" data-act="minus">-</button>
        <span>${Number(i.quantity)}</span>
        <button type="button" data-act="plus">+</button>
      </div>
      <b class="cart-price">${won(salePrice(i.price, i.discount_rate) * i.quantity)}</b>
      <button type="button" class="link-btn" data-act="delete">삭제</button>
    </div>`).join('');
  updateSummary();
}

function checkedIds() {
  return [...document.querySelectorAll('.cart-row')]
    .filter((row) => row.querySelector('.item-check').checked)
    .map((row) => Number(row.dataset.id));
}

function updateSummary() {
  const ids = checkedIds();
  const selected = items.filter((i) => ids.includes(i.cart_item_id));
  const origin = selected.reduce((s, i) => s + i.price * i.quantity, 0);
  const pay = selected.reduce((s, i) => s + salePrice(i.price, i.discount_rate) * i.quantity, 0);
  document.getElementById('sum-origin').textContent = won(origin);
  document.getElementById('sum-discount').textContent = '-' + won(origin - pay);
  document.getElementById('sum-pay').textContent = won(pay);
  document.getElementById('check-all').checked = items.length > 0 && ids.length === items.length;
}

// 수량 변경 / 개별 삭제 (이벤트 위임)
document.getElementById('cart-list').onclick = async (e) => {
  const act = e.target.dataset.act;
  if (!act) return;
  const row = e.target.closest('.cart-row');
  const id = Number(row.dataset.id);
  const item = items.find((i) => i.cart_item_id === id);

  if (act === 'delete') {
    if (!confirm('삭제하시겠습니까?')) return;
    if (assertOk(await api.deleteCartItems([id]))) { load(); renderHeader(); }
    return;
  }
  const next = item.quantity + (act === 'plus' ? 1 : -1);
  if (next < 1 || next > 99) return;
  if (assertOk(await api.updateCartItem(id, next), '수량을 변경하지 못했습니다.')) load();
};

document.getElementById('cart-list').onchange = updateSummary;

document.getElementById('check-all').onchange = (e) => {
  document.querySelectorAll('.item-check').forEach((c) => { c.checked = e.target.checked; });
  updateSummary();
};

document.getElementById('delete-selected').onclick = async () => {
  const ids = checkedIds();
  if (!ids.length) return alert('삭제할 상품을 선택해 주세요.');
  if (!confirm(`${ids.length}개 상품을 삭제하시겠습니까?`)) return;
  if (assertOk(await api.deleteCartItems(ids))) { load(); renderHeader(); }
};

document.getElementById('order-btn').onclick = () => {
  const ids = checkedIds();
  if (!ids.length) return alert('주문할 상품을 선택해 주세요.');
  sessionStorage.setItem('checkout_ids', JSON.stringify(ids)); // 주문서 페이지로 전달
  location.href = 'checkout.jsp';
};

load();
