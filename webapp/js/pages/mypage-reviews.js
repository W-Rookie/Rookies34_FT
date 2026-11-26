// 마이컬리 > 후기 — 탭 2개 (후기는 작성만 가능, 수정·삭제 없음: U-51·U-52 삭제)
//   작성 가능한 후기: U-65 GET /api/me/reviews/writable (배송완료 주문 상품 중 아직 안 쓴 것)
//   작성한 후기:     U-64 GET /api/me/reviews
// 주문 상세에서 "후기 쓰기"로 오면 mypage-reviews.jsp?order_item_id=1&product=상품명
// 같은 주문 상품에는 1번만 작성 가능 (다시 구매하면 새 주문 상품으로 다시 작성)
requireLogin();
let tab = 'writable';
let page = 1;

const listEl = document.getElementById('review-list');
const form = document.getElementById('review-form');

async function loadWritable() {
  const res = await api.getWritableReviews(page);
  if (res.code !== 'ok') return;
  listEl.innerHTML = res.items.length ? res.items.map((i) => `
    <li class="order-card">
      <p class="order-date">${i.ordered_at.slice(0, 10)} · 주문번호 ${i.order_id}</p>
      <p class="order-name">${i.name}</p>
      <button type="button" class="btn btn-small" data-item="${i.order_item_id}" data-name="${i.name}">후기 쓰기</button>
    </li>`).join('') : '<li class="empty">작성 가능한 후기가 없습니다.</li>';
  renderPagination(document.getElementById('pagination'), page, res.num, (p) => { page = p; load(); }, SMALL_PAGE_SIZE);
}

async function loadWritten() {
  const res = await api.getMyReviews(page);
  if (res.code !== 'ok') return;
  listEl.innerHTML = res.reviews.length ? res.reviews.map((r) => `
    <li class="review">
      <p class="review-head"><span class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
        <a href="product.jsp?id=${r.product_id}">${r.product_name}</a> · ${r.created_at}</p>
      <p>${r.content}</p>
      <div class="review-imgs">${(r.images || []).map((src) => imgTag(src, '후기 사진')).join('')}</div>
    </li>`).join('') : '<li class="empty">작성한 후기가 없습니다.</li>';
  renderPagination(document.getElementById('pagination'), page, res.num, (p) => { page = p; load(); }, SMALL_PAGE_SIZE);
}

function load() {
  form.hidden = true;
  return tab === 'writable' ? loadWritable() : loadWritten();
}

// 작성 폼 열기
function openWrite(orderItemId, productName) {
  form.reset();
  form.elements.order_item_id.value = orderItemId;
  document.getElementById('review-target').innerHTML = productName;
  form.hidden = false;
  form.scrollIntoView({ behavior: 'smooth' });
}

listEl.onclick = (e) => {
  const d = e.target.dataset;
  if (d.item) openWrite(d.item, d.name);
};

document.getElementById('cancel-btn').onclick = () => { form.hidden = true; };

form.onsubmit = async (e) => {
  e.preventDefault();
  const rating = form.querySelector('input[name="rating"]:checked');
  const content = form.elements.content.value.trim();
  if (!rating) return alert('별점을 선택해 주세요.');
  if (content.length < 10) return alert('후기는 10자 이상 작성해 주세요.');
  if (form.elements.images.files.length > 5) return alert('사진은 최대 5장까지 올릴 수 있습니다.');

  const fd = new FormData(form);
  if (!form.elements.images.files.length) fd.delete('images');
  const res = await api.createReview(fd);
  if (!assertOk(res, '후기를 저장하지 못했습니다. 이미 후기를 작성한 상품일 수 있습니다.')) return;
  alert('후기가 등록되었습니다. 등록한 후기는 수정·삭제할 수 없습니다.');
  history.replaceState(null, '', 'mypage-reviews.jsp'); // 주소의 order_item_id 제거
  load();
};

renderTabs(document.getElementById('review-tabs'), { writable: '작성 가능한 후기', written: '작성한 후기' }, tab, (v) => { tab = v; page = 1; load(); });

load().then(() => {
  // 주문 상세에서 바로 넘어온 경우 작성 폼 자동으로 열기
  if (qs('order_item_id')) openWrite(qs('order_item_id'), qs('product') || '');
});
