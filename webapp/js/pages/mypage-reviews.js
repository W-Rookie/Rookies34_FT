// 마이컬리 > 후기 — 탭 2개
//   작성 가능한 후기: 배송완료 주문의 상품 (주문 목록 + 주문 상세 API로 계산)
//   작성한 후기: [규격서 없음] GET /api/me/reviews 가정
// 주문 상세에서 "후기 쓰기"로 오면 mypage-reviews.jsp?order_item_id=1&product=상품명
requireLogin();
let tab = 'writable';
let myReviews = [];
let editingReviewId = null;

const listEl = document.getElementById('review-list');
const form = document.getElementById('review-form');

async function loadWritable() {
  // [협의 필요] 작성 가능 후기 전용 API가 있으면 호출 1번으로 끝남. 지금은 주문 수만큼 상세 조회 반복
  const orders = await api.getOrders({ period: '6M', page: 1 });
  const delivered = (orders.orders || []).filter((o) => o.status === 'DELIVERED');
  const details = await Promise.all(delivered.map((o) => api.getOrder(o.order_id)));
  const written = (await api.getMyReviews(1)).reviews || [];
  const writtenIds = written.map((r) => r.order_item_id);

  const items = details.flatMap((d) => (d.items || []).map((i) => ({ ...i, order_id: d.order_id, ordered_at: d.ordered_at })))
    .filter((i) => !writtenIds.includes(i.order_item_id));

  listEl.innerHTML = items.length ? items.map((i) => `
    <li class="order-card">
      <p class="order-date">${i.ordered_at.slice(0, 10)} · 주문번호 ${i.order_id}</p>
      <p class="order-name">${i.name}</p>
      <button type="button" class="btn btn-small" data-item="${i.order_item_id}" data-name="${i.name}">후기 쓰기</button>
    </li>`).join('') : '<li class="empty">작성 가능한 후기가 없습니다.</li>';
}

async function loadWritten() {
  const res = await api.getMyReviews(1);
  if (res.code !== 'ok') return;
  myReviews = res.reviews;
  listEl.innerHTML = myReviews.length ? myReviews.map((r) => `
    <li class="review">
      <p class="review-head"><span class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
        <a href="product.jsp?id=${r.product_id}">${r.product_name}</a> · ${r.created_at}</p>
      <p>${r.content}</p>
      <div class="card-actions">
        <button type="button" class="link-btn" data-edit="${r.review_id}">수정</button>
        <button type="button" class="link-btn" data-delete="${r.review_id}">삭제</button>
      </div>
    </li>`).join('') : '<li class="empty">작성한 후기가 없습니다.</li>';
}

function load() {
  form.hidden = true;
  return tab === 'writable' ? loadWritable() : loadWritten();
}

// 작성 폼 열기 (새 후기)
function openWrite(orderItemId, productName) {
  editingReviewId = null;
  form.reset();
  form.elements.order_item_id.value = orderItemId;
  document.getElementById('review-target').innerHTML = productName;
  document.getElementById('image-row').hidden = false;
  form.hidden = false;
  form.scrollIntoView({ behavior: 'smooth' });
}

// 수정 폼 열기 (규격서상 수정은 별점·내용만, 사진 수정 없음)
function openEdit(review) {
  editingReviewId = review.review_id;
  form.reset();
  document.getElementById('review-target').innerHTML = review.product_name;
  form.elements.content.value = review.content;
  form.querySelector(`input[name="rating"][value="${review.rating}"]`).checked = true;
  document.getElementById('image-row').hidden = true;
  form.hidden = false;
  form.scrollIntoView({ behavior: 'smooth' });
}

listEl.onclick = async (e) => {
  const d = e.target.dataset;
  if (d.item) openWrite(d.item, d.name);
  if (d.edit) openEdit(myReviews.find((r) => r.review_id === Number(d.edit)));
  if (d.delete && confirm('후기를 삭제하시겠습니까?')) {
    if (assertOk(await api.deleteReview(d.delete), '삭제하지 못했습니다.')) load();
  }
};

document.getElementById('cancel-btn').onclick = () => { form.hidden = true; };

form.onsubmit = async (e) => {
  e.preventDefault();
  const rating = form.querySelector('input[name="rating"]:checked');
  const content = form.elements.content.value.trim();
  if (!rating) return alert('별점을 선택해 주세요.');
  if (content.length < 10) return alert('후기는 10자 이상 작성해 주세요.');

  let res;
  if (editingReviewId) {
    res = await api.updateReview(editingReviewId, Number(rating.value), content);
  } else {
    if (form.elements.images.files.length > 5) return alert('사진은 최대 5장까지 올릴 수 있습니다.');
    const fd = new FormData(form);
    if (!form.elements.images.files.length) fd.delete('images');
    res = await api.createReview(fd);
  }
  if (!assertOk(res, '후기를 저장하지 못했습니다.')) return;
  alert('후기가 저장되었습니다.');
  history.replaceState(null, '', 'mypage-reviews.jsp'); // 주소의 order_item_id 제거
  load();
};

renderTabs(document.getElementById('review-tabs'), { writable: '작성 가능한 후기', written: '작성한 후기' }, tab, (v) => { tab = v; load(); });

load().then(() => {
  // 주문 상세에서 바로 넘어온 경우 작성 폼 자동으로 열기
  if (qs('order_item_id')) openWrite(qs('order_item_id'), qs('product') || '');
});
