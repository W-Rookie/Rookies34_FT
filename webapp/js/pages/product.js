// 상품 상세 — product.jsp?id=5063110
const productId = qs('id');
let product = null;
let qty = 1;
let reviewPage = 1;

async function loadProduct() {
  const res = await api.getProduct(productId);
  if (res.code !== 'ok') {
    document.getElementById('product').innerHTML = '<p class="empty">존재하지 않는 상품입니다.</p>';
    return;
  }
  product = res;
  const rate = Number(res.discount_rate) || 0;
  const soldOut = Number(res.stock) <= 0;

  document.getElementById('product').innerHTML = `
    <div class="detail-img">${imgTag(res.thumbnail, res.name)}</div>
    <div class="detail-info">
      <h2>${res.name}</h2>
      <p class="detail-price">
        ${rate > 0 ? `<span class="rate">${rate}%</span>` : ''}
        <b>${won(salePrice(res.price, rate))}</b>
        ${rate > 0 ? `<del>${won(res.price)}</del>` : ''}
      </p>
      <dl class="detail-meta">
        <dt>포장타입</dt><dd>${LABEL.storage[res.storage_type] || res.storage_type}</dd>
        <dt>원산지</dt><dd>${res.origin}</dd>
        <dt>배송</dt><dd>판매자 직접 배송</dd>
      </dl>
      <div class="qty-box">
        <button type="button" id="qty-minus">-</button>
        <span id="qty">1</span>
        <button type="button" id="qty-plus">+</button>
        <span class="total">합계 <b id="qty-total">${won(salePrice(res.price, rate))}</b></span>
      </div>
      <button class="btn btn-primary btn-block" id="add-cart" ${soldOut ? 'disabled' : ''}>
        ${soldOut ? '품절' : '장바구니 담기'}
      </button>
    </div>`;

  // 상품 설명은 판매자가 HTML로 작성 (굵게, 이미지 등)
  document.getElementById('description').innerHTML = res.description;
  document.getElementById('detail-images').innerHTML = (res.detail_images || []).map((src) => imgTag(src, '상세 이미지')).join('');

  const updateQty = (d) => {
    qty = Math.min(99, Math.max(1, qty + d));
    document.getElementById('qty').textContent = qty;
    document.getElementById('qty-total').textContent = won(salePrice(res.price, rate) * qty);
  };
  document.getElementById('qty-minus').onclick = () => updateQty(-1);
  document.getElementById('qty-plus').onclick = () => updateQty(1);
  document.getElementById('add-cart').onclick = addToCart;
}

async function addToCart() {
  // [협의 필요] 규격서에 option_id가 있지만 상품 상세 응답에 옵션 목록이 없음
  const res = await api.addCartItem(Number(productId), qty);
  if (!assertOk(res, '장바구니에 담지 못했습니다.')) return;
  if (confirm('장바구니에 담았습니다. 장바구니로 이동할까요?')) location.href = 'cart.jsp';
  else renderHeader(); // 헤더 개수 갱신
}

async function loadReviews() {
  const res = await api.getReviews(productId, reviewPage);
  if (res.code !== 'ok') return;
  document.getElementById('review-count').textContent = res.num;
  const list = document.getElementById('review-list');
  list.innerHTML = res.reviews.length ? res.reviews.map((r) => `
    <li class="review">
      <p class="review-head"><span class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
        ${r.writer} · ${r.created_at}</p>
      <p>${r.content}</p>
      <div class="review-imgs">${(r.images || []).map((src) => imgTag(src, '후기 사진')).join('')}</div>
    </li>`).join('') : '<li class="empty">아직 후기가 없습니다.</li>';
  renderPagination(document.getElementById('review-pagination'), reviewPage, res.num, (p) => { reviewPage = p; loadReviews(); });
}

// 상품 문의 작성 — [협의 필요] 상품별 문의 "목록" 조회 API가 없음
document.getElementById('inquiry-form').onsubmit = async (e) => {
  e.preventDefault();
  if (!auth.isLoggedIn()) { requireLogin(); return; }
  const f = e.target;
  const res = await api.createProductInquiry(productId, {
    title: f.elements.title.value.trim(), content: f.elements.content.value.trim(), is_secret: f.elements.is_secret.checked,
  });
  if (!assertOk(res, '문의를 등록하지 못했습니다.')) return;
  alert('문의가 등록되었습니다.');
  f.reset();
};

loadProduct();
loadReviews();
